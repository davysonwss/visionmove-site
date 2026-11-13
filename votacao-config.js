/*
 * Votação pública do Demoday — VisionMove
 *
 * Quando receber o endereço oficial:
 * 1. Substitua url: "" pelo link HTTPS da votação.
 * 2. Mude enabled: false para enabled: true.
 * 3. Opcional: informe em qrImage a URL HTTPS da imagem do QR Code
 *    ou o caminho da imagem no próprio site (ex.: "assets/qr-votacao.png").
 *
 * O modal fica desativado no site público até enabled=true E uma URL válida.
 * A prévia de layout pode ser aberta usando /?preview-votacao=1.
 */
window.VISIONMOVE_VOTACAO = Object.freeze({
  enabled: false,
  url: "",
  qrImage: ""
});
