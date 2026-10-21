// Cabeçalho e rodapé compartilhados por todas as páginas públicas.
(function () {
  const C = window.CONFIG;
  const B = document.documentElement.dataset.base || "";
  const pagina = location.pathname.split("/").pop() || "index.html";
  const link = (href, txt, ativo) => `<a href="${B}${href}"${ativo ? ' aria-current="page"' : ""}>${txt}</a>`;
  const ativo = (...p) => p.includes(pagina) || (p.includes("index.html") && pagina === "");

  const iconeTema =
    '<svg class="lua" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>' +
    '<svg class="sol" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';

  const menu = [
    link("index.html", "Início", ativo("index.html")),
    link("motos.html", "Motos", ativo("motos.html", "moto.html")),
    link("servicos.html", "Serviços", ativo("servicos.html")),
    link("sobre.html", "Sobre", ativo("sobre.html")),
    link("contato.html", "Contato", ativo("contato.html")),
  ].join("");

  const topo = document.getElementById("topo");
  if (topo) {
    topo.className = "topo";
    topo.innerHTML = `
      <div class="wrap">
        <a class="logo" href="${B}index.html" aria-label="Classificado Vintage Riders — início">
          <img src="${B}img/logo.png" alt="" width="40" height="40">
          <span class="logo-txt">Vintage Riders<small>Classificado</small></span>
        </a>
        <nav class="menu" id="menu" aria-label="Principal">${menu}</nav>
        <div class="nav">
          <a class="btn zap peq nav-zap" href="https://wa.me/${C.WHATSAPP}" target="_blank" rel="noopener">WhatsApp</a>
          <button class="btn-tema" type="button" aria-label="Mudar tema">${iconeTema}</button>
          <button class="btn-menu" type="button" aria-label="Abrir menu" aria-expanded="false" aria-controls="menu"><span></span><span></span><span></span></button>
        </div>
      </div>`;
    const bm = topo.querySelector(".btn-menu");
    bm.addEventListener("click", () => {
      const on = topo.classList.toggle("menu-aberto");
      bm.setAttribute("aria-expanded", on);
    });
    topo.querySelector("#menu").addEventListener("click", (e) => e.target.closest("a") && topo.classList.remove("menu-aberto"));
  }

  const rodape = document.getElementById("rodape");
  if (rodape) {
    rodape.className = "rodape";
    rodape.innerHTML = `
      <div class="wrap rodape-grade">
        <div>
          <img class="rodape-logo" src="${B}img/site/logo-branco.png" alt="Classificado Vintage Riders" width="150" height="102" loading="lazy">
          <p>O maior classificado de motos clássicas e antigas do Brasil.</p>
        </div>
        <div>
          <strong>Navegue</strong>
          <a href="${B}motos.html">Motos à venda</a>
          <a href="${B}motos.html?aba=acervo">Acervo</a>
          <a href="${B}servicos.html">Serviços</a>
          <a href="${B}sobre.html">Sobre e dúvidas</a>
          <a href="${B}privacidade.html">Política de privacidade</a>
        </div>
        <div>
          <strong>Atendimento</strong>
          <a href="https://wa.me/${C.WHATSAPP}" target="_blank" rel="noopener">${C.WHATSAPP_TXT}</a>
          <a href="https://wa.me/${C.WHATSAPP2}" target="_blank" rel="noopener">${C.WHATSAPP2_TXT}</a>
          <a href="mailto:${C.EMAIL}">${C.EMAIL}</a>
          <span>${C.HORARIO}</span>
        </div>
        <div>
          <strong>Showroom</strong>
          <span>${C.ENDERECO}</span>
          <a href="${C.MAPA}" target="_blank" rel="noopener">Como chegar</a>
          <a href="${C.INSTAGRAM}" target="_blank" rel="noopener">Instagram @classificadovintageriders</a>
        </div>
      </div>
      <div class="wrap rodape-fim">
        <span>Os veículos são de responsabilidade do anunciante. O Vintage Riders reserva-se ao direito de fazer a ligação entre vendedor e comprador.</span>
        <span>Vintage Riders · CNPJ ${C.CNPJ} · <a href="${B}admin/">Área do anunciante</a> · <a href="${B}leosumiu.html">Suporte do site</a></span>
        <span class="proto">Protótipo de demonstração. Anúncios e fotos pertencem aos respectivos anunciantes.</span>
      </div>`;
  }

  // botão flutuante de WhatsApp
  const f = document.createElement("a");
  f.className = "zap-flutuante";
  f.href = `https://wa.me/${C.WHATSAPP}?text=${encodeURIComponent("Olá! Vim pelo site do Classificado Vintage Riders.")}`;
  f.target = "_blank"; f.rel = "noopener"; f.setAttribute("aria-label", "Falar no WhatsApp");
  f.innerHTML = '<svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true"><path d="M12 3a9 9 0 0 0-7.7 13.6L3 21l4.500-1.200A9 9 0 1 0 12 3z" fill="none" stroke="#fff" stroke-width="1.800" stroke-linejoin="round"/><path d="M9 8c0 3.500 3 6.500 6.500 6.500l1-1.500-2-1-1 .8a4.500 4.500 0 0 1-2-2l.8-1-1-2z" fill="#fff"/></svg>';
  document.body.append(f);
})();
