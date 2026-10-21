(async function () {
  const { buscarAnuncios, acervo, card, esc, norm } = window.API;
  const $ = (id) => document.getElementById(id);

  // ---- banners (troca sozinha; pausa se o usuário pede menos movimento)
  const slides = [...document.querySelectorAll(".slide")];
  const pontos = $("pontos");
  let atual = 0, timer;
  slides.forEach((_, i) => {
    const b = document.createElement("button");
    b.type = "button"; b.setAttribute("aria-label", `Imagem ${i + 1}`);
    b.onclick = () => { ir(i); iniciar(); };
    pontos.append(b);
  });
  function ir(i) {
    atual = (i + slides.length) % slides.length;
    slides.forEach((s, k) => s.classList.toggle("on", k === atual));
    [...pontos.children].forEach((p, k) => p.classList.toggle("on", k === atual));
  }
  function iniciar() {
    clearInterval(timer);
    if (!matchMedia("(prefers-reduced-motion: reduce)").matches) timer = setInterval(() => ir(atual + 1), 6000);
  }
  ir(0); iniciar();

  // ---- vídeo: só carrega o player do YouTube depois do clique
  const v = $("video");
  v.addEventListener("click", () => {
    v.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${v.dataset.id}?autoplay=1&rel=0" title="Honda 750" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>`;
  }, { once: true });

  // ---- novidades, marcas e acervo
  const [anuncios, arq] = await Promise.all([buscarAnuncios(), acervo()]);
  const aVenda = anuncios.filter((m) => m.status === "ativo");

  $("novidades").innerHTML = aVenda.slice(0, 10).map((m, i) => card(m, i < 6)).join("") || `<div class="vazio">Nenhum anúncio no momento.</div>`;

  const cont = {};
  [...aVenda, ...arq].forEach((m) => { if (m.marca) cont[m.marca] = (cont[m.marca] || 0) + 1; });
  $("marcas").innerHTML = Object.keys(cont)
    .sort((a, b) => cont[b] - cont[a]).slice(0, 16)
    .map((m) => `<a href="motos.html?marca=${encodeURIComponent(m)}&aba=${aVenda.some((x) => x.marca === m) ? "venda" : "acervo"}">${esc(m)} <small>${cont[m]}</small></a>`)
    .join("");

  const destaque = arq.filter((m) => m.capa && m.valor).sort((a, b) => b.valor - a.valor).slice(0, 10);
  $("acervo").innerHTML = destaque.map((m, i) => card(m, i < 6)).join("");
})();
