(() => {
  "use strict";
  const button = document.querySelector(".menu-button");
  const menu = document.getElementById("mobile-nav");
  const glyph = button?.querySelector(".menu-glyph");
  function setMenu(open, restoreFocus = false) {
    if (!button || !menu) return;
    menu.hidden = !open;
    button.setAttribute("aria-expanded", String(open));
    button.setAttribute("aria-label", open ? "Fechar menu de navegação" : "Abrir menu de navegação");
    if (glyph) glyph.textContent = open ? "✕" : "☰";
    if (!open && restoreFocus) button.focus();
  }
  if (button && menu) {
    button.addEventListener("click", () => setMenu(menu.hidden));
    menu.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
      const destination = new URL(link.href, window.location.href);
      const samePage = destination.origin === window.location.origin && destination.pathname === window.location.pathname;
      const target = samePage && destination.hash ? document.getElementById(decodeURIComponent(destination.hash.slice(1))) : null;
      setMenu(false);
      if (target) requestAnimationFrame(() => target.focus({ preventScroll: true }));
    }));
    document.addEventListener("keydown", event => {
      if (event.key === "Escape" && !menu.hidden) {
        event.preventDefault();
        setMenu(false, true);
      }
    });
    document.addEventListener("pointerdown", event => {
      if (!menu.hidden && !button.contains(event.target) && !menu.contains(event.target)) setMenu(false);
    });
    document.addEventListener("focusin", event => {
      if (!menu.hidden && !button.contains(event.target) && !menu.contains(event.target)) setMenu(false);
    });
    const desktop = window.matchMedia("(min-width: 881px)");
    desktop.addEventListener("change", event => { if (event.matches) setMenu(false); });
  }
  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

})();
