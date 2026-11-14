(() => {
  "use strict";

  const dialogs = new Map([
    ["feedback", document.getElementById("feedback-dialog")],
    ["interessados", document.getElementById("interessados-dialog")]
  ]);
  const lastTrigger = new WeakMap();
  document.querySelectorAll("[data-open-participation]").forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const dialog = dialogs.get(trigger.dataset.openParticipation);
      if (!dialog || typeof dialog.showModal !== "function") return;
      lastTrigger.set(dialog, trigger);
      const status = dialog.querySelector("[data-form-status]");
      if (status) {
        status.textContent = "";
        delete status.dataset.state;
      }
      dialog.showModal();
      document.body.classList.add("participation-modal-open");
      dialog.querySelector("form input:not([type='hidden']):not([tabindex='-1'])")?.focus();
    });
  });
  dialogs.forEach((dialog) => {
    if (!dialog) return;
    dialog.querySelector("[data-close-participation]")?.addEventListener("click", () => dialog.close());
    dialog.addEventListener("click", (event) => {
      if (event.target !== dialog) return;
      const rect = dialog.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right ||
          event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
    });
    dialog.addEventListener("close", () => {
      document.body.classList.remove("participation-modal-open");
      lastTrigger.get(dialog)?.focus({ preventScroll: true });
    });
  });
  for (const form of document.querySelectorAll("[data-visionmove-form]")) {
    const status = form.querySelector("[data-form-status]");
    const button = form.querySelector('[type="submit"]');
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      status.textContent = "";
      delete status.dataset.state;
      if (!form.reportValidity()) return;
      const data = Object.fromEntries(new FormData(form));
      const tipo = form.dataset.visionmoveForm;
      if (tipo === "interessados" && data.consentimento !== "sim") {
        status.textContent = "Autorize o recebimento das novidades para continuar.";
        status.dataset.state = "error";
        return;
      }
      data.tipo = tipo;
      button.disabled = true;
      button.setAttribute("aria-busy", "true");
      try {
        const response = await fetch("/api/participar", {
          method: "POST",
          credentials: "same-origin",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data)
        });
        let result = {};
        try { result = await response.json(); } catch {}
        if (!response.ok) throw new Error(result.message || "Não foi possível enviar. Tente novamente.");
        status.dataset.state = "success";
        status.textContent = tipo === "feedback"
          ? "Mensagem recebida! Obrigado por entrar em contato com o VisionMove."
          : "Inscrição registrada! Obrigado por acompanhar o VisionMove.";
        form.reset();
      } catch (error) {
        status.dataset.state = "error";
        status.textContent = error.message || "Não foi possível enviar. Tente novamente.";
      } finally {
        button.disabled = false;
        button.removeAttribute("aria-busy");
      }
    });
  }
})();
