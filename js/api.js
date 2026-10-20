// Leitura pública dos anúncios (PostgREST). Se o banco não responder, usa data/motos.json.
(function () {
  const C = window.CONFIG;

  async function buscarAnuncios() {
    try {
      const url = `${C.SUPABASE_URL}/rest/v1/motos?select=*&status=eq.ativo&order=publicado_em.desc`;
      const r = await fetch(url, { headers: { apikey: C.SUPABASE_KEY } });
      if (!r.ok) throw new Error(r.status);
      return await r.json();
    } catch (e) {
      console.warn("Banco indisponível, usando cópia local.", e);
      const r = await fetch("data/motos.json");
      return (await r.json()).filter((m) => m.status === "ativo");
    }
  }

  // Fotos podem ser caminhos do site (img/...) ou URLs completas (Supabase Storage).
  function foto(caminho, base = "") {
    if (!caminho) return base + "img/sem-foto.svg";
    return /^https?:/.test(caminho) ? caminho : base + caminho;
  }

  const reais = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
  const preco = (v) => (v ? reais.format(v) : "Consulte");

  function esc(s) {
    return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  function zapLink(m) {
    const fone = (m.contato || "").replace(/\D/g, "");
    const numero = fone.length >= 10 ? (fone.startsWith("55") ? fone : "55" + fone) : C.WHATSAPP;
    const txt = `Olá! Tenho interesse na ${m.marca} ${m.modelo} ${m.ano || ""} anunciada no Classificado Vintage Riders.`;
    return `https://wa.me/${numero}?text=${encodeURIComponent(txt)}`;
  }

  window.API = { buscarAnuncios, foto, preco, esc, zapLink };
})();
