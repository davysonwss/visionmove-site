/*
 * Votação do Demoday — VisionMove
 * O convite fica visível automaticamente e abre o formulário oficial no botão VOTAR NO VISIONMOVE.
 * A URL deve apontar ao formulário de votação publicado pelo evento.
 * Opcional: informe qrImage com uma URL HTTPS ou assets/qr-votacao.png.
 * Para ocultar o convite após o evento, altere enabled para false.
 */
window.VISIONMOVE_VOTACAO = Object.freeze({
  enabled: true,
  url: "https://docs.google.com/forms/d/1efX12ffe9BxBFlIvGytHHOTaGBgvjlUTo_QaCPg6hKc/viewform?ts=6af20b87&edit_requested=true",
  qrImage: ""
});
