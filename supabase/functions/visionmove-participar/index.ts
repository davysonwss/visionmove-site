
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const json = (status: number, obj: Record<string, unknown>) =>
  new Response(JSON.stringify(obj), {status,headers:{"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store","X-Content-Type-Options":"nosniff"}});
const clean = (s: unknown, limit: number): string => typeof s === "string" ? s.trim().slice(0,limit+1) : "";
const emailOk = (s: string): boolean => s.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
const call = (path: string, payload: Record<string,unknown>, prefer?: string) =>
  fetch(SUPABASE_URL + "/rest/v1/" + path, {
    method:"POST",
    headers:{"Content-Type":"application/json","apikey":SERVICE_KEY,"Authorization":"Bearer "+SERVICE_KEY,"Prefer":prefer||"return=minimal"},
    body:JSON.stringify(payload),
    signal:AbortSignal.timeout(7000)
  });
Deno.serve(async (req: Request) => {
  if (req.method !== "POST") return json(405,{message:"Método não permitido."});
  if (!req.headers.get("content-type")?.startsWith("application/json")) return json(415,{message:"Formato não aceito."});
  const size = Number(req.headers.get("content-length") || "0");
  if (size > 7000) return json(413,{message:"Mensagem muito grande."});
  if (!SUPABASE_URL || !SERVICE_KEY) return json(503,{message:"Serviço indisponível."});
  let b: Record<string, unknown>;
  try {
    const raw=await req.text();
    if(raw.length>7000) return json(413,{message:"Mensagem muito grande."});
    b=JSON.parse(raw);
    if(!b || typeof b!=="object" || Array.isArray(b)) throw Error();
  } catch { return json(400,{message:"Dados inválidos."}); }
  if(b.website) return json(200,{ok:true});
  const tipo=b.tipo;
  const nome=clean(b.nome||"",100);
  const email=clean(b.email||"",254).toLowerCase();
  if(nome.length>100 || email.length>254) return json(400,{message:"Revise nome ou e-mail."});
  let table: string, payload: Record<string,unknown>, prefer="return=minimal", suffix="";
  if(tipo==="feedback"){
    const mensagem=clean(b.mensagem,2000);
    if(mensagem.length<10 || mensagem.length>2000 || (email!=="" && !emailOk(email)))
      return json(400,{message:"Informe uma mensagem de 10 a 2.000 caracteres e verifique o e-mail."});
    table="visionmove_feedbacks";
    payload={nome:nome||null,email:email||null,mensagem};
  } else if(tipo==="interessados"){
    if(!emailOk(email) || b.consentimento!=="sim")
      return json(400,{message:"Informe um e-mail válido e autorize o recebimento."});
    table="visionmove_interessados";
    payload={nome:nome||null,email,consentimento_versao:"2026-11-11-v1",consentido_em:new Date().toISOString(),cancelado_em:null};
    prefer="resolution=merge-duplicates,return=minimal";
    suffix="?on_conflict=email";
  } else return json(400,{message:"Tipo inválido."});
  try {
    const ip=(req.headers.get("x-forwarded-for") || req.headers.get("cf-connecting-ip") || "unknown").split(",")[0].trim().slice(0,80);
    const encoder=new TextEncoder();
    const digest=await crypto.subtle.digest("SHA-256",encoder.encode(SERVICE_KEY.slice(0,40)+":"+ip+":"+tipo));
    const hash=Array.from(new Uint8Array(digest),x=>x.toString(16).padStart(2,"0")).join("");
    const limit=await call("rpc/visionmove_conferir_limite",{p_chave:hash,p_maximo:tipo==="feedback"?100:180},"return=representation");
    if(!limit.ok){
      console.error("Rate limit service failed",limit.status);
      return json(503,{message:"Não foi possível enviar agora. Tente novamente mais tarde."});
    }
    const accepted=await limit.json();
    if(accepted!==true) return json(429,{message:"Muitas tentativas. Tente novamente mais tarde."});
    const saved=await call(table+suffix,payload,prefer);
    if(!saved.ok){
      console.error("VisionMove persistence failed",saved.status);
      return json(503,{message:"Não foi possível salvar agora. Tente novamente mais tarde."});
    }
    return json(200,{ok:true});
  } catch(e){
    console.error("VisionMove forms error",(e as Error).name||"erro");
    return json(503,{message:"Serviço indisponível. Tente novamente."});
  }
});
