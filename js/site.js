(async function () {
  const { buscarAnuncios, foto, preco, esc } = window.API;
  const $ = (id) => document.getElementById(id);
  const estado = { marca: "", q: "", cidade: "", preco: "", ano: "", ordem: "recentes" };

  $("zap-topo").href = `https://wa.me/${CONFIG.WHATSAPP}`;
  $("ig-link").href = CONFIG.INSTAGRAM;

  const todos = await buscarAnuncios();
  const uf = (m) => ((m.cidade || "").match(/-\s*([A-Za-z]{2})\s*$/) || [])[1]?.toUpperCase() || "";
  const anoNum = (m) => parseInt(m.ano, 10) || 0;
  const norm = (s) => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

  // chips de marca (mais anúncios primeiro) e estados
  const contaMarcas = {};
  todos.forEach((m) => (contaMarcas[m.marca] = (contaMarcas[m.marca] || 0) + 1));
  const marcas = Object.keys(contaMarcas).sort((a, b) => contaMarcas[b] - contaMarcas[a]);
  $("chips").innerHTML =
    `<button class="chip on" data-marca="">Todas</button>` +
    marcas.map((m) => `<button class="chip" data-marca="${esc(m)}">${esc(m)} · ${contaMarcas[m]}</button>`).join("");
  const ufs = [...new Set(todos.map(uf).filter(Boolean))].sort();
  $("f-cidade").innerHTML += ufs.map((u) => `<option value="${u}">${u}</option>`).join("");

  function filtrar() {
    const q = norm(estado.q);
    let l = todos.filter((m) => {
      if (estado.marca && m.marca !== estado.marca) return false;
      if (estado.cidade && uf(m) !== estado.cidade) return false;
      if (q && !norm(`${m.marca} ${m.modelo} ${m.ano} ${m.cidade}`).includes(q)) return false;
      if (estado.preco) {
        const lim = +estado.preco;
        if (lim === 999999999 ? !(m.valor > 80000) : !(m.valor && m.valor <= lim)) return false;
      }
      if (estado.ano) {
        const a = anoNum(m);
        const lim = +estado.ano;
        if (lim === 2000 ? a < 2000 : lim === 1979 ? a > 1979 : !(a >= lim - 9 && a <= lim)) return false;
      }
      return true;
    });
    const ord = {
      recentes: (a, b) => new Date(b.publicado_em) - new Date(a.publicado_em),
      menor: (a, b) => (a.valor || 1e12) - (b.valor || 1e12),
      maior: (a, b) => (b.valor || 0) - (a.valor || 0),
      antigas: (a, b) => (anoNum(a) || 9999) - (anoNum(b) || 9999),
    }[estado.ordem];
    return l.sort(ord);
  }

  function desenhar() {
    const l = filtrar();
    const filtrando = estado.marca || estado.q || estado.cidade || estado.preco || estado.ano;
    $("contagem").textContent = `${l.length} ${l.length === 1 ? "moto encontrada" : "motos encontradas"}`;
    $("limpar").hidden = !filtrando;
    $("grade").innerHTML = l.length
      ? l.map((m) => `
        <a class="card" href="moto.html?s=${encodeURIComponent(m.slug)}">
          <div class="card-foto">
            <img src="${foto(m.capa || m.fotos?.[0])}" alt="${esc(m.marca)} ${esc(m.modelo)} ${esc(m.ano)}" loading="lazy">
            ${m.ano ? `<span class="card-ano">${esc(m.ano)}</span>` : ""}
          </div>
          <div class="card-corpo">
            <span class="card-marca">${esc(m.marca)}</span>
            <span class="card-modelo">${esc(m.modelo)}</span>
            <span class="card-info">${[m.km && m.km + " km", m.cidade].filter(Boolean).map(esc).join(" · ")}</span>
            <span class="card-preco">${preco(m.valor)}</span>
          </div>
        </a>`).join("")
      : `<div class="vazio">Nenhuma moto com esses filtros. <br>Tente limpar os filtros ou buscar outro modelo.</div>`;
  }

  $("chips").addEventListener("click", (e) => {
    const b = e.target.closest(".chip");
    if (!b) return;
    estado.marca = b.dataset.marca;
    document.querySelectorAll("#chips .chip").forEach((c) => c.classList.toggle("on", c === b));
    desenhar();
  });
  $("form-busca").addEventListener("submit", (e) => {
    e.preventDefault();
    estado.q = $("q").value;
    desenhar();
    $("anuncios").scrollIntoView();
  });
  $("q").addEventListener("input", (e) => { estado.q = e.target.value; desenhar(); });
  [["f-cidade", "cidade"], ["f-preco", "preco"], ["f-ano", "ano"], ["f-ordem", "ordem"]].forEach(([id, k]) =>
    $(id).addEventListener("change", (e) => { estado[k] = e.target.value; desenhar(); })
  );
  $("limpar").addEventListener("click", () => {
    Object.assign(estado, { marca: "", q: "", cidade: "", preco: "", ano: "" });
    $("q").value = ""; $("f-cidade").value = ""; $("f-preco").value = ""; $("f-ano").value = "";
    document.querySelectorAll("#chips .chip").forEach((c, i) => c.classList.toggle("on", i === 0));
    desenhar();
  });

  desenhar();
})();
