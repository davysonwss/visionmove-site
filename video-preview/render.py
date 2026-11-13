import json
import math
import struct
import subprocess
import urllib.request
import wave
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
DST = ROOT / "video-preview"
TMP = DST / "render-tmp"
TMP.mkdir(parents=True, exist_ok=True)
VIDEO_URL = "https://resource2.heygen.ai/videos/d02d4c5c666a4996b3d450720da4bf75/d02d4c5c666a4996b3d450720da4bf75/01a1d2b7-8f53-7936-ac21-5a685b38d669.mp4"
AUDIO_URL = "https://resource2.heygen.ai/text_to_speech/d02d4c5c666a4996b3d450720da4bf75/e808da2329754929803c8bd98dc36857/id=b6fe8a0b37ec43499aa6b789684c5932.mp3"
OUTPUT = DST / "visionmove_demonstracao_conceitual_20s.mp4"
LOGO = ROOT / "assets" / "logo-visionmove.png"

def run(args):
    print("RUN", " ".join(str(x) for x in args[:12]), flush=True)
    subprocess.run(list(map(str, args)), check=True)

def get(url, file):
    request = urllib.request.Request(url, headers={"User-Agent":"Mozilla/5.0"})
    with urllib.request.urlopen(request, timeout=150) as resp, open(file, "wb") as f:
        while True:
            chunk=resp.read(1024*1024)
            if not chunk: break
            f.write(chunk)
    assert Path(file).stat().st_size > 1000, "Download empty"

video = TMP / "source.mp4"
voice = TMP / "voice.mp3"
get(VIDEO_URL, video)
get(AUDIO_URL, voice)
probe = subprocess.check_output(["ffprobe","-v","error","-show_entries","stream=codec_type,width,height","-of","json",str(video)],text=True)
streams=json.loads(probe).get("streams",[])
assert any(x.get("codec_type")=="video" for x in streams), "No video track"
has_audio=any(x.get("codec_type")=="audio" for x in streams)
print("Source streams",streams,flush=True)

W,H=1920,1080
overlay=Image.new("RGBA",(W,H),(0,0,0,0))
shadow=Image.new("RGBA",(W,H),(0,0,0,0))
dr=ImageDraw.Draw(shadow)
box=(1190,680,1874,968)
dr.rounded_rectangle((box[0]+4,box[1]+9,box[2]+4,box[3]+9),radius=24,fill=(0,0,0,180))
shadow=shadow.filter(ImageFilter.GaussianBlur(23))
overlay.alpha_composite(shadow)
d=ImageDraw.Draw(overlay)
d.rounded_rectangle(box,radius=24,fill=(6,25,45,244),outline=(0,203,244,235),width=3)
d.rounded_rectangle((1210,713,1218,941),radius=4,fill=(0,203,244,255))
fontbase="/usr/share/fonts/truetype/dejavu/"
font_sm=ImageFont.truetype(fontbase+"DejaVuSans.ttf",28)
font_tiny=ImageFont.truetype(fontbase+"DejaVuSans.ttf",21)
font_title=ImageFont.truetype(fontbase+"DejaVuSans-Bold.ttf",36)
font_kicker=ImageFont.truetype(fontbase+"DejaVuSans-Bold.ttf",22)
logo=Image.open(LOGO).convert("RGBA")
logo.thumbnail((240,45),Image.Resampling.LANCZOS)
overlay.alpha_composite(logo, (1250,722))
d=ImageDraw.Draw(overlay)
d.text((1560,741),"ALERTA DE PERCURSO",font=font_kicker,fill=(87,214,248,255))
d.line([(1246,791),(1828,791)],fill=(58,112,143,255),width=2)
d.ellipse((1248,815,1306,873),outline=(0,203,244,255),width=4)
d.text((1270,819),"!",font=font_title,fill=(0,203,244,255))
d.text((1324,811),"Obstáculo à frente",font=font_title,fill=(255,255,255,255))
d.text((1325,873),"Siga pela esquerda",font=font_sm,fill=(205,227,239,255))
d.text((1252,928),"Aviso por áudio • demonstração conceitual",font=font_tiny,fill=(154,192,215,255))
ovpath=TMP/"overlay.png"
overlay.save(ovpath)

beep=TMP/"beep.wav"
sr=44100
with wave.open(str(beep),"wb") as wf:
    wf.setnchannels(1); wf.setsampwidth(2); wf.setframerate(sr)
    raw=bytearray()
    for i in range(int(sr*.43)):
        t=i/sr
        if t<.15: freq=784.0; tt=t
        elif t<.22: freq=0.0; tt=0
        else: freq=1046.5; tt=t-.22
        local_duration=.15 if t<.15 else .21
        env= min(1,tt/.025) * min(1,(local_duration-tt)/.04) if freq else 0
        env=max(0,min(1,env))
        a=int(11000*env*math.sin(2*math.pi*freq*tt)) if freq else 0
        raw.extend(struct.pack("<h",a))
    wf.writeframes(raw)

base=["ffmpeg","-hide_banner","-loglevel","error","-y","-i",video,"-loop","1","-framerate","30","-i",ovpath,"-i",voice,"-i",beep]
offset=4
if not has_audio:
    base += ["-f","lavfi","-t","20","-i","anullsrc=channel_layout=stereo:sample_rate=44100"]
    ambient="[4:a]volume=0[ambient];"
else:
    ambient="[0:a]volume=0.23[ambient];"
fx=( "[1:v]format=rgba,fade=t=in:st=8.8:d=0.38:alpha=1,"
     "fade=t=out:st=13.7:d=0.35:alpha=1[graphic];"
     "[0:v][graphic]overlay=x=0:y=0:format=auto:enable='between(t,8.8,14.05)'[picture];"
     +ambient
     + "[2:a]adelay=9550:all=1,volume=1.28[spoken];"
     + "[3:a]adelay=9050:all=1,volume=0.32[notification];"
     + "[ambient][spoken][notification]amix=inputs=3:duration=longest:dropout_transition=0,"
     "atrim=duration=20,afade=t=out:st=19.3:d=0.65[mix]")
run(base+["-filter_complex",fx,"-map","[picture]","-map","[mix]","-t","20","-c:v","libx264","-preset","fast","-crf","24","-pix_fmt","yuv420p","-r","30","-c:a","aac","-b:a","160k","-movflags","+faststart",OUTPUT])

frames=[]
for n,t in enumerate((2.0,5.0,8.5,10.5,14.5,18.0)):
    path=TMP/f"frame{n}.jpg"
    run(["ffmpeg","-hide_banner","-loglevel","error","-y","-ss",str(t),"-i",OUTPUT,"-frames:v","1","-vf","scale=640:360","-q:v","4",path])
    im=Image.open(path).convert("RGB")
    frames.append(im)
sheet=Image.new("RGB",(1920,720),(10,26,45))
for i,frame in enumerate(frames):
    sheet.paste(frame,((i%3)*640,(i//3)*360))
sheet.save(DST/"preview_contact_sheet.jpg",quality=72,optimize=True)
print("DONE",str(OUTPUT),OUTPUT.stat().st_size,flush=True)
