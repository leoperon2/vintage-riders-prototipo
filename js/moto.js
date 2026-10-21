(async function () {
  const { buscarAnuncios, acervo, foto, preco, esc, zap, zapMoto, card } = window.API;
  const $ = (id) => document.getElementById(id);
  const slug = new URLSearchParams(location.search).get("s");
  const alvo = $("conteudo");

  const anuncios = await buscarAnuncios();
  let m = anuncios.find((x) => x.slug === slug);
  let arq = null;
  if (!m) {
    arq = await acervo();
    m = arq.find((x) => x.slug === slug);
  }
  if (!m) {
    alvo.innerHTML = `<div class="vazio" style="padding:70px 0">Anúncio não encontrado.<br><br><a class="btn" href="motos.html">Ver todas as motos</a></div>`;
    return;
  }

  const titulo = `${m.marca} ${m.modelo}${m.ano ? " " + m.ano : ""}`;
  document.title = `${titulo} — Classificado Vintage Riders`;
  const fotos = m.fotos?.length ? m.fotos : [m.capa];
  let atual = 0;

  const spec = (rot, v) => (v ? `<div><dt>${rot}</dt><dd>${esc(v)}</dd></div>` : "");
  const situacao =
    m.status === "vendido" ? `<div class="situacao vendida"><strong>Moto vendida.</strong> Quer uma parecida? Nós ajudamos a encontrar.</div>` :
    m.status === "acervo" ? `<div class="situacao acervo">Anúncio do acervo. <strong>Confirme a disponibilidade</strong> pelo WhatsApp.</div>` : "";
  const botao =
    m.status === "vendido"
      ? `<a class="btn" target="_blank" rel="noopener" href="${zap(`Olá! Vi que a ${titulo} foi vendida. Vocês podem me ajudar a encontrar uma parecida?`)}">Quero uma moto parecida</a>`
      : `<a class="btn zap" target="_blank" rel="noopener" href="${zapMoto(m)}">${m.status === "acervo" ? "Consultar disponibilidade" : "Tenho interesse — WhatsApp"}</a>`;

  alvo.innerHTML = `
    <div class="detalhe">
      <div>
        <div class="galeria-principal" id="principal"><img id="img-p" src="${foto(fotos[0])}" alt="${esc(titulo)}"></div>
        ${fotos.length > 1 ? `<div class="miniaturas" id="mini">${fotos.map((f, i) =>
          `<button class="${i ? "" : "on"}" data-i="${i}" aria-label="Foto ${i + 1}"><img src="${foto(f)}" alt="" loading="lazy"></button>`).join("")}</div>` : ""}
      </div>
      <aside class="painel">
        <div><span class="card-marca">${esc(m.marca)}</span><h1>${esc(m.modelo)}</h1></div>
        <div class="preco">${preco(m.valor)}</div>
        ${situacao}
        <dl class="specs">${spec("Ano", m.ano)}${spec("Quilometragem", m.km && m.km + " km")}${spec("Cidade", m.cidade)}${spec("Marca", m.marca)}</dl>
        ${botao}
        ${m.fonte_url ? `<a class="btn sec" target="_blank" rel="noopener" href="${esc(m.fonte_url)}">Ver anúncio no Instagram</a>` : ""}
        ${m.obs ? `<div><label>Observações do anunciante</label><div class="obs">${esc(m.obs)}</div></div>` : ""}
        <p class="aviso">Anúncio sob responsabilidade do anunciante. O Vintage Riders faz a ligação entre vendedor e comprador.</p>
      </aside>
    </div>`;

  const img = $("img-p"), lb = $("lb"), lbImg = $("lb-img");
  function ir(i) {
    atual = (i + fotos.length) % fotos.length;
    img.src = lbImg.src = foto(fotos[atual]);
    img.style.animation = "none"; void img.offsetWidth; img.style.animation = "";
    document.querySelectorAll("#mini button").forEach((b, k) => b.classList.toggle("on", k === atual));
    document.querySelector("#mini button.on")?.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
  }
  $("mini")?.addEventListener("click", (e) => { const b = e.target.closest("button"); if (b) ir(+b.dataset.i); });
  $("principal").addEventListener("click", () => { lbImg.src = foto(fotos[atual]); lb.classList.add("on"); });
  lb.querySelector(".lb-x").onclick = () => lb.classList.remove("on");
  lb.querySelector(".lb-p").onclick = () => ir(atual - 1);
  lb.querySelector(".lb-n").onclick = () => ir(atual + 1);
  lb.addEventListener("click", (e) => { if (e.target === lb) lb.classList.remove("on"); });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") lb.classList.remove("on");
    if (e.key === "ArrowLeft") ir(atual - 1);
    if (e.key === "ArrowRight") ir(atual + 1);
  });

  // outras motos da mesma marca (à venda)
  const parecidas = anuncios.filter((x) => x.status === "ativo" && x.slug !== m.slug && x.marca === m.marca).slice(0, 8);
  const extra = parecidas.length >= 4 ? parecidas : [...parecidas, ...anuncios.filter((x) => x.status === "ativo" && x.slug !== m.slug && x.marca !== m.marca).slice(0, 8 - parecidas.length)];
  if (extra.length) {
    $("parecidas-lista").innerHTML = extra.map(card).join("");
    $("parecidas").hidden = false;
  }
})();
