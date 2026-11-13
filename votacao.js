(() => {
  "use strict";

  const dialog = document.getElementById("demoday-voting-dialog");
  const link = document.getElementById("demoday-voting-link");
  const unavailable = document.getElementById("demoday-voting-unavailable");
  const qrArea = document.getElementById("demoday-voting-qr-area");
  const qrImage = document.getElementById("demoday-voting-qr");
  const reopen = document.getElementById("demoday-voting-reopen");
  if (!dialog || !link || !reopen || typeof dialog.showModal !== "function") return;

  const settings = window.VISIONMOVE_VOTACAO || {};
  const preview = new URLSearchParams(window.location.search).get("preview-votacao") === "1";

  function externalHttpsAddress(candidate) {
    if (typeof candidate !== "string" || !candidate.trim()) return null;
    try {
      const parsed = new URL(candidate.trim());
      return parsed.protocol === "https:" ? parsed.href : null;
    } catch {
      return null;
    }
  }

  function safeImageAddress(candidate) {
    if (typeof candidate !== "string" || !candidate.trim()) return null;
    const value = candidate.trim();
    if (/^data:image\/(png|jpeg|webp);base64,[a-z0-9+/=]+$/i.test(value)) return value;
    const https = externalHttpsAddress(value);
    if (https) return https;
    // Arquivos hospedados neste mesmo domínio, sem caminhos de navegação ou query.
    return /^(?:\/)?assets\/[a-z0-9_./-]+\.(?:png|jpg|jpeg|webp)$/i.test(value) && !value.includes("..")
      ? value : null;
  }

  const url = externalHttpsAddress(settings.url);
  const visible = settings.enabled === true;
  const active = visible && !!url;
  if (!visible && !preview) return;
  reopen.hidden = false;

  if (active) {
    link.href = url;
    link.hidden = false;
    unavailable.hidden = true;
    const qr = safeImageAddress(settings.qrImage);
    if (qr && qrArea && qrImage) {
      qrImage.src = qr;
      qrArea.hidden = false;
    }
  } else {
    link.removeAttribute("href");
    link.hidden = true;
    unavailable.hidden = false;
  }

  // Ao receber o link, quem já viu o convite poderá receber o aviso de votação ativa.
  const storageKey = active ? "visionmove-demoday-voting-link-live-v1" : "visionmove-demoday-voting-coming-soon-v1";
  const seen = () => {
    try { return window.sessionStorage.getItem(storageKey) === "1"; }
    catch { return false; }
  };
  const markSeen = () => {
    try { window.sessionStorage.setItem(storageKey, "1"); }
    catch { /* Continua funcionando mesmo sem acesso a sessionStorage. */ }
  };

  let openFromButton = false;
  function openVoting(fromButton = false) {
    if (dialog.open) return;
    openFromButton = fromButton;
    dialog.showModal();
    document.body.classList.add("demoday-voting-open");
    reopen.hidden = true;
    if (!preview) markSeen();
    dialog.querySelector("[data-close-demoday-voting]")?.focus();
  }

  dialog.querySelectorAll("[data-close-demoday-voting]").forEach(button => {
    button.addEventListener("click", () => dialog.close());
  });
  dialog.addEventListener("click", (event) => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    const outside = event.clientX < bounds.left || event.clientX > bounds.right ||
      event.clientY < bounds.top || event.clientY > bounds.bottom;
    if (outside) dialog.close();
  });
  dialog.addEventListener("close", () => {
    document.body.classList.remove("demoday-voting-open");
    if (visible || preview) reopen.hidden = false;
    if (openFromButton) reopen.focus({ preventScroll: true });
    openFromButton = false;
  });
  reopen.addEventListener("click", () => openVoting(true));

  // A prévia é sempre aberta quando solicitada via parâmetro.
  // Abre uma vez por sessão, mesmo sem link, e permite reabrir a qualquer momento.
  if (preview || !seen()) openVoting(false);
})();
