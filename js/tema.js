// Tema claro/escuro: segue o sistema na 1ª visita e lembra a escolha do usuário.
(function () {
  const raiz = document.documentElement;
  let guardado = null;
  try { guardado = localStorage.getItem("tema"); } catch (e) {}
  const sistema = window.matchMedia && matchMedia("(prefers-color-scheme: light)").matches ? "claro" : "escuro";

  function aplicar(t) {
    raiz.setAttribute("data-tema", t);
    const m = document.querySelector('meta[name="theme-color"]');
    if (m) m.content = t === "claro" ? "#f6f1e7" : "#14110e";
    document.querySelectorAll(".btn-tema").forEach((b) => {
      const alvo = t === "claro" ? "escuro" : "claro";
      b.setAttribute("aria-label", `Mudar para o tema ${alvo}`);
      b.title = `Tema ${alvo}`;
    });
  }
  aplicar(guardado === "claro" || guardado === "escuro" ? guardado : sistema);

  document.addEventListener("DOMContentLoaded", () => {
    aplicar(raiz.getAttribute("data-tema"));
    document.querySelectorAll(".btn-tema").forEach((b) =>
      b.addEventListener("click", () => {
        const novo = raiz.getAttribute("data-tema") === "claro" ? "escuro" : "claro";
        aplicar(novo);
        try { localStorage.setItem("tema", novo); } catch (e) {}
      })
    );
  });
})();
