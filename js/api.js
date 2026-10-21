// Dados públicos: anúncios do banco (Supabase) e acervo histórico (data/acervo.json).
(function () {
  const C = window.CONFIG;
  const BASE = document.documentElement.dataset.base || "";

  // Anúncios do painel: status "ativo" (à venda) e "vendido". Cai para a cópia local se o banco falhar.
  async function buscarAnuncios() {
    try {
      const url = `${C.SUPABASE_URL}/rest/v1/motos?select=*&status=in.(ativo,vendido)&order=publicado_em.desc`;
      const r = await fetch(url, { headers: { apikey: C.SUPABASE_KEY } });
      if (!r.ok) throw new Error(r.status);
      return await r.json();
    } catch (e) {
      console.warn("Banco indisponível, usando cópia local.", e);
      const r = await fetch(BASE + "data/motos.json");
      return await r.json();
    }
  }

  let _acervo;
  function acervo() {
    _acervo = _acervo || fetch(BASE + "data/acervo.json").then((r) => r.json()).catch(() => []);
    return _acervo;
  }

  // Fotos podem ser caminhos do site (img/...) ou URLs completas (Supabase Storage).
  function foto(caminho) {
    if (!caminho) return BASE + "img/sem-foto.svg";
    return /^https?:/.test(caminho) ? caminho : BASE + caminho;
  }

  const reais = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
  const preco = (v) => (v ? reais.format(v) : "Consulte");

  function esc(s) {
    return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  const zap = (texto, numero = C.WHATSAPP) => `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`;

  function zapMoto(m) {
    const fone = (m.contato || "").replace(/\D/g, "");
    const numero = m.origem !== "site" && fone.length >= 10 ? (fone.startsWith("55") ? fone : "55" + fone) : C.WHATSAPP;
    const nome = `${m.marca} ${m.modelo}${m.ano ? " " + m.ano : ""}`;
    const txt =
      m.status === "acervo"
        ? `Olá! Vi a ${nome} no site do Classificado Vintage Riders. Ainda está disponível?`
        : `Olá! Tenho interesse na ${nome} anunciada no Classificado Vintage Riders.`;
    return zap(txt, numero);
  }

  const norm = (s) => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  const uf = (m) => ((m.cidade || "").match(/-\s*([A-Za-z]{2})\s*$/) || [])[1]?.toUpperCase() || "";
  const anoNum = (m) => parseInt(m.ano, 10) || 0;

  // Card de moto (usado na home, no catálogo e nas "parecidas")
  function card(m, eager = false) {
    const etiqueta =
      m.status === "vendido" ? `<span class="tag tag-vendida">Vendida</span>` :
      m.status === "acervo" ? `<span class="tag tag-acervo">Acervo</span>` : "";
    return `
      <a class="card" href="${BASE}moto.html?s=${encodeURIComponent(m.slug)}">
        <div class="card-foto">
          <img src="${foto(m.capa || m.fotos?.[0])}" alt="${esc(m.marca)} ${esc(m.modelo)} ${esc(m.ano)}" loading="${eager === true ? "eager" : "lazy"}" decoding="async">
          ${m.ano ? `<span class="card-ano">${esc(m.ano)}</span>` : ""}${etiqueta}
        </div>
        <div class="card-corpo">
          <span class="card-marca">${esc(m.marca)}</span>
          <span class="card-modelo">${esc(m.modelo)}</span>
          <span class="card-info">${[m.km && m.km + " km", m.cidade].filter(Boolean).map(esc).join(" · ") || "&nbsp;"}</span>
          <span class="card-preco">${preco(m.valor)}</span>
        </div>
      </a>`;
  }

  window.API = { buscarAnuncios, acervo, foto, preco, esc, zap, zapMoto, norm, uf, anoNum, card, BASE };
})();
