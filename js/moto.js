(async function () {
  const { buscarAnuncios, foto, preco, esc, zapLink } = window.API;
  const slug = new URLSearchParams(location.search).get("s");
  const alvo = document.getElementById("conteudo");

  const todos = await buscarAnuncios();
  const m = todos.find((x) => x.slug === slug);
  if (!m) {
    alvo.innerHTML = `<div class="vazio" style="padding:80px 0">Anúncio não encontrado ou já vendido.<br><br><a class="btn" href="./">Ver todas as motos</a></div>`;
    return;
  }

  const titulo = `${m.marca} ${m.modelo}${m.ano ? " " + m.ano : ""}`;
  document.title = `${titulo} — Classificado Vintage Riders`;
  const fotos = m.fotos?.length ? m.fotos : [m.capa];
  let atual = 0;

  const spec = (rot, v) => (v ? `<div><dt>${rot}</dt><dd>${esc(v)}</dd></div>` : "");
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
        <dl class="specs">
          ${spec("Ano", m.ano)}${spec("Quilometragem", m.km && m.km + " km")}${spec("Cidade", m.cidade)}${spec("Marca", m.marca)}
        </dl>
        <a class="btn zap" target="_blank" rel="noopener" href="${zapLink(m)}">Tenho interesse — WhatsApp</a>
        ${m.fonte_url ? `<a class="btn sec" target="_blank" rel="noopener" href="${esc(m.fonte_url)}">Ver anúncio no Instagram</a>` : ""}
        ${m.obs ? `<div><label>Observações do anunciante</label><div class="obs">${esc(m.obs)}</div></div>` : ""}
        <p class="aviso">Anúncio sob responsabilidade do anunciante. O Vintage Riders faz a ligação entre vendedor e comprador.</p>
      </aside>
    </div>`;

  const img = document.getElementById("img-p");
  const lb = document.getElementById("lb");
  const lbImg = document.getElementById("lb-img");
  function ir(i) {
    atual = (i + fotos.length) % fotos.length;
    img.src = lbImg.src = foto(fotos[atual]);
    document.querySelectorAll("#mini button").forEach((b, k) => b.classList.toggle("on", k === atual));
    document.querySelector("#mini button.on")?.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
  }
  document.getElementById("mini")?.addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (b) ir(+b.dataset.i);
  });
  document.getElementById("principal").addEventListener("click", () => { lbImg.src = foto(fotos[atual]); lb.classList.add("on"); });
  lb.querySelector(".lb-x").onclick = () => lb.classList.remove("on");
  lb.querySelector(".lb-p").onclick = () => ir(atual - 1);
  lb.querySelector(".lb-n").onclick = () => ir(atual + 1);
  lb.addEventListener("click", (e) => { if (e.target === lb) lb.classList.remove("on"); });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") lb.classList.remove("on");
    if (e.key === "ArrowLeft") ir(atual - 1);
    if (e.key === "ArrowRight") ir(atual + 1);
  });
})();
