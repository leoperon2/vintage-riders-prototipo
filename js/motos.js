(async function () {
  const { buscarAnuncios, acervo, card, norm, uf, anoNum, esc } = window.API;
  const $ = (id) => document.getElementById(id);
  const PAGINA = 24;
  const params = new URLSearchParams(location.search);
  const estado = {
    aba: params.get("aba") === "acervo" ? "acervo" : "venda",
    marca: params.get("marca") || "", q: params.get("q") || "",
    cidade: "", preco: "", ano: "", ordem: "recentes", mostrar: PAGINA,
  };

  const [anuncios, arq] = await Promise.all([buscarAnuncios(), acervo()]);
  const base = {
    venda: anuncios.filter((m) => m.status === "ativo"),
    // acervo: histórico do site antigo + anúncios do painel marcados como vendidos
    acervo: [...anuncios.filter((m) => m.status === "vendido"), ...arq],
  };

  $("q").value = estado.q;
  const abas = [...document.querySelectorAll(".abas button")];

  function lista() {
    return base[estado.aba];
  }

  function montarOpcoes() {
    const l = lista();
    const cont = {};
    l.forEach((m) => (cont[m.marca] = (cont[m.marca] || 0) + 1));
    const marcas = Object.keys(cont).filter(Boolean).sort((a, b) => cont[b] - cont[a]);
    $("chips").innerHTML =
      `<button class="chip${estado.marca ? "" : " on"}" data-marca="">Todas · ${l.length}</button>` +
      marcas.slice(0, 40).map((m) => `<button class="chip${estado.marca === m ? " on" : ""}" data-marca="${esc(m)}">${esc(m)} · ${cont[m]}</button>`).join("");
    const ufs = [...new Set(l.map(uf).filter(Boolean))].sort();
    $("f-cidade").innerHTML = `<option value="">Todos os estados</option>` + ufs.map((u) => `<option value="${u}">${u}</option>`).join("");
    $("f-cidade").value = estado.cidade;
  }

  function filtrar() {
    const q = norm(estado.q);
    const l = lista().filter((m) => {
      if (estado.marca && m.marca !== estado.marca) return false;
      if (estado.cidade && uf(m) !== estado.cidade) return false;
      if (q && !norm(`${m.marca} ${m.modelo} ${m.ano} ${m.cidade}`).includes(q)) return false;
      if (estado.preco) {
        const lim = +estado.preco;
        if (lim === 999999999 ? !(m.valor > 80000) : !(m.valor && m.valor <= lim)) return false;
      }
      if (estado.ano) {
        const a = anoNum(m), lim = +estado.ano;
        if (lim === 2000 ? a < 2000 : lim === 1979 ? !(a && a <= 1979) : !(a >= lim - 9 && a <= lim)) return false;
      }
      return true;
    });
    const ord = {
      recentes: (a, b) => new Date(b.publicado_em || 0) - new Date(a.publicado_em || 0),
      menor: (a, b) => (a.valor || 1e12) - (b.valor || 1e12),
      maior: (a, b) => (b.valor || 0) - (a.valor || 0),
      antigas: (a, b) => (anoNum(a) || 9999) - (anoNum(b) || 9999),
    }[estado.ordem];
    return l.slice().sort(ord);
  }

  function desenhar() {
    const l = filtrar();
    const filtrando = estado.marca || estado.q || estado.cidade || estado.preco || estado.ano;
    $("contagem").textContent = `${l.length.toLocaleString("pt-BR")} ${l.length === 1 ? "moto encontrada" : "motos encontradas"}`;
    $("limpar").hidden = !filtrando;
    $("aviso-acervo").hidden = estado.aba !== "acervo";
    $("grade").innerHTML = l.length
      ? l.slice(0, estado.mostrar).map(card).join("")
      : `<div class="vazio">Nenhuma moto com esses filtros.<br>Tente limpar os filtros ou buscar outro modelo.</div>`;
    const resto = l.length - estado.mostrar;
    $("mais").hidden = resto <= 0;
    $("mais").textContent = `Mostrar mais motos (${Math.min(resto, PAGINA)} de ${resto.toLocaleString("pt-BR")} restantes)`;
  }

  function trocarAba(aba) {
    estado.aba = aba;
    Object.assign(estado, { marca: "", cidade: "", preco: "", ano: "", mostrar: PAGINA });
    ["f-preco", "f-ano"].forEach((id) => ($(id).value = ""));
    abas.forEach((b) => { b.classList.toggle("on", b.dataset.aba === aba); b.setAttribute("aria-selected", b.dataset.aba === aba); });
    montarOpcoes();
    desenhar();
  }

  abas.forEach((b) => b.addEventListener("click", () => trocarAba(b.dataset.aba)));
  $("chips").addEventListener("click", (e) => {
    const b = e.target.closest(".chip");
    if (!b) return;
    estado.marca = b.dataset.marca; estado.mostrar = PAGINA;
    document.querySelectorAll("#chips .chip").forEach((c) => c.classList.toggle("on", c === b));
    desenhar();
  });
  $("form-busca").addEventListener("submit", (e) => { e.preventDefault(); estado.q = $("q").value; estado.mostrar = PAGINA; desenhar(); });
  $("q").addEventListener("input", (e) => { estado.q = e.target.value; estado.mostrar = PAGINA; desenhar(); });
  [["f-cidade", "cidade"], ["f-preco", "preco"], ["f-ano", "ano"], ["f-ordem", "ordem"]].forEach(([id, k]) =>
    $(id).addEventListener("change", (e) => { estado[k] = e.target.value; estado.mostrar = PAGINA; desenhar(); })
  );
  $("limpar").addEventListener("click", () => {
    Object.assign(estado, { marca: "", q: "", cidade: "", preco: "", ano: "", mostrar: PAGINA });
    $("q").value = ""; ["f-preco", "f-ano"].forEach((id) => ($(id).value = ""));
    montarOpcoes(); desenhar();
  });
  $("mais").addEventListener("click", () => { estado.mostrar += PAGINA; desenhar(); });

  // abre direto na aba certa quando a marca só existe no acervo
  abas.forEach((b) => b.classList.toggle("on", b.dataset.aba === estado.aba));
  montarOpcoes();
  desenhar();
})();
