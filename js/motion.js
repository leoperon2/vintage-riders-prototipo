// Movimento ao rolar: leve (IntersectionObserver + 1 rAF), sem bibliotecas.
// Nada é escondido se o usuário pede menos movimento ou se o JS falhar.
(function () {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const raiz = document.documentElement;
  raiz.classList.add("motion");

  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // ---------- 1. Revelar ao entrar na tela (com escalonamento) ----------
  const ALVOS = [
    ".hero-foto .wrap > *", ".diferenciais .dif", ".sec-topo", ".numero", ".servico", ".marcas",
    ".texto", ".video-lite", ".faixa-cta", ".bloco", ".contato-grade > *", "details.faq",
    ".pagina-topo .wrap > *", ".detalhe > *", ".card", ".passos li", ".rodape-grade > *",
  ].join(",");
  const IMGS = ".duas > img";

  const io = new IntersectionObserver((entradas) => {
    const vis = entradas.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top || a.boundingClientRect.left - b.boundingClientRect.left);
    vis.forEach((e, k) => {
      const el = e.target;
      el.style.transitionDelay = `${Math.min(k, 7) * 70}ms`;
      el.classList.add("in");
      io.unobserve(el);
      // devolve o controle ao CSS normal (hover etc.) depois da entrada
      setTimeout(() => { el.classList.remove("rv", "rv-img", "in"); el.style.transitionDelay = ""; }, 1500 + k * 70);
      if (el.matches(".numero")) contar(el.querySelector("b"));
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -5% 0px" });

  function marcar(raizBusca) {
    $$(ALVOS, raizBusca).concat(raizBusca.matches?.(ALVOS) ? [raizBusca] : []).forEach((el) => {
      if (el.dataset.mv) return;
      el.dataset.mv = "1"; el.classList.add("rv"); io.observe(el);
    });
    $$(IMGS, raizBusca).forEach((el) => {
      if (el.dataset.mv) return;
      el.dataset.mv = "1"; el.classList.add("rv-img"); io.observe(el);
    });
  }
  marcar(document);

  // conteúdo que chega depois (cards vindos do banco, "mostrar mais", detalhe da moto)
  new MutationObserver((muts) => {
    for (const m of muts) m.addedNodes.forEach((n) => n.nodeType === 1 && marcar(n));
  }).observe(document.body, { childList: true, subtree: true });

  // ---------- 2. Números que contam ----------
  function contar(el) {
    if (!el || el.dataset.cont) return;
    el.dataset.cont = "1";
    const m = el.textContent.trim().match(/^(\D*)(\d[\d.,]*)(.*)$/);
    if (!m) return;
    const alvo = parseFloat(m[2].replace(/\./g, "").replace(",", "."));
    const t0 = performance.now(), dur = 1500;
    const passo = (t) => {
      const p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 4);
      el.textContent = `${m[1]}${Math.round(alvo * e).toLocaleString("pt-BR")}${m[3]}`;
      if (p < 1) requestAnimationFrame(passo);
    };
    requestAnimationFrame(passo);
  }

  // ---------- 3. Barra de progresso, cabeçalho e parallax (um único rAF) ----------
  const barra = document.createElement("div");
  barra.className = "progresso"; barra.setAttribute("aria-hidden", "true");
  document.body.prepend(barra);

  const topo = document.getElementById("topo");
  const hero = document.querySelector(".hero-foto");
  const slides = hero?.querySelector(".slides");
  const heroTxt = hero?.querySelector(".wrap");
  const faixas = $$(".faixa-track");
  let ultimoY = 0, agendado = false;

  function quadro() {
    agendado = false;
    const y = scrollY, h = document.documentElement.scrollHeight - innerHeight;
    barra.style.transform = `scaleX(${h > 0 ? Math.min(1, y / h) : 0})`;

    if (topo) {
      topo.classList.toggle("rolou", y > 8);
      if (y > ultimoY + 6 && y > 140 && !topo.classList.contains("menu-aberto")) topo.classList.add("oculto");
      else if (y < ultimoY - 6 || y < 100) topo.classList.remove("oculto");
    }
    ultimoY = y;

    if (hero && y < hero.offsetHeight + 40) {
      slides.style.transform = `translate3d(0, ${y * 0.28}px, 0) scale(1.08)`;
      heroTxt.style.transform = `translate3d(0, ${y * -0.12}px, 0)`;
      heroTxt.style.opacity = Math.max(0, 1 - y / (hero.offsetHeight * 0.75));
    }

    faixas.forEach((f) => {
      const r = f.parentElement.getBoundingClientRect();
      if (r.bottom < 0 || r.top > innerHeight) return;
      const dir = f.dataset.dir === "inverso" ? -1 : 1;
      const x = (innerHeight - r.top) * 0.45 * dir;
      f.style.transform = `translate3d(${dir === 1 ? -x : x - f.scrollWidth / 2}px, 0, 0)`;
    });
  }
  const pedir = () => { if (!agendado) { agendado = true; requestAnimationFrame(quadro); } };
  addEventListener("scroll", pedir, { passive: true });
  addEventListener("resize", pedir, { passive: true });
  quadro();
})();
