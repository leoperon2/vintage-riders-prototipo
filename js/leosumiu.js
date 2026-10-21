// Página "Léo sumiu": dois caminhos para o cliente nunca ficar na mão.
//  1) "Léo sumiu"  -> registra o pedido e abre WhatsApp + e-mail já escritos.
//  2) "Tchau"      -> registra e entrega o guia de passagem para outro profissional.
(function () {
  const C = window.CONFIG, L = C.LEO;
  const $ = (id) => document.getElementById(id);
  const GUIA = C.SITE_URL + "guia-profissional.html";
  const configurado = /^\d{12,13}$/.test(L.WHATSAPP) && !/exemplo/.test(L.EMAIL);

  function limitar() {
    try {
      const t = +localStorage.getItem("leo_ultimo") || 0;
      if (Date.now() - t < 30000) return true;
      localStorage.setItem("leo_ultimo", Date.now());
    } catch (e) {}
    return false;
  }

  async function registrar(tipo, dados) {
    try {
      const r = await fetch(`${C.SUPABASE_URL}/rest/v1/chamados_leo`, {
        method: "POST",
        headers: { apikey: C.SUPABASE_KEY, "Content-Type": "application/json", Prefer: "return=minimal" },
        body: JSON.stringify({ tipo, ...dados }),
      });
      return r.ok;
    } catch (e) { return false; }
  }

  const val = (form, n) => (form.elements[n]?.value || "").trim();
  const so = (t) => t.replace(/\D/g, "");

  function abrir(dlg) {
    dlg.querySelectorAll("[data-passo]").forEach((p) => (p.hidden = p.dataset.passo !== "1"));
    dlg.showModal();
  }
  function passo2(dlg) {
    dlg.querySelectorAll("[data-passo]").forEach((p) => (p.hidden = p.dataset.passo !== "2"));
  }
  document.querySelectorAll("dialog.sw").forEach((dlg) =>
    dlg.addEventListener("click", (e) => { if (e.target.closest("[data-fechar]") || e.target === dlg) dlg.close(); })
  );

  // ---------- 1) Léo sumiu ----------
  const dSumiu = $("dlg-sumiu"), fSumiu = $("form-sumiu");
  $("btn-sumiu").addEventListener("click", () => abrir(dSumiu));
  fSumiu.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (val(fSumiu, "site")) return; // armadilha para robôs
    const nome = val(fSumiu, "nome"), contato = val(fSumiu, "contato");
    const msg = val(fSumiu, "mensagem") || "Preciso falar com você sobre o site.";
    const botao = fSumiu.querySelector("[type=submit]");
    botao.disabled = true; botao.textContent = "Enviando…";
    const repetido = limitar();
    const ok = repetido ? true : await registrar("leosumiu", { nome, contato, mensagem: msg });
    const texto = `Oi, ${L.NOME}! Aqui é ${nome} (${contato}), do Classificado Vintage Riders. ${msg}`;
    $("sumiu-zap").href = `https://wa.me/${L.WHATSAPP}?text=${encodeURIComponent(texto)}`;
    $("sumiu-email").href = `mailto:${L.EMAIL}?subject=${encodeURIComponent("Preciso falar com você (site Vintage Riders)")}&body=${encodeURIComponent(texto)}`;
    $("sumiu-status").textContent = !ok
      ? "Não conseguimos registrar o pedido, então o aviso automático NÃO foi enviado. Avise o Léo agora mesmo por aqui:"
      : repetido
        ? "Seu aviso já foi enviado há instantes. Se quiser reforçar, use a mensagem pronta:"
        : "Pronto: o Léo foi avisado automaticamente. Se quiser reforçar, use a mensagem pronta:";
    $("sumiu-aviso").hidden = configurado;
    botao.disabled = false; botao.textContent = "Avisar o Léo";
    passo2(dSumiu);
  });

  // ---------- 2) Tchau ----------
  const dTchau = $("dlg-tchau"), fTchau = $("form-tchau");
  $("btn-tchau").addEventListener("click", () => abrir(dTchau));
  fTchau.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (val(fTchau, "site")) return;
    const nome = val(fTchau, "nome"), prof = val(fTchau, "profissional"), motivo = val(fTchau, "mensagem");
    const botao = fTchau.querySelector("[type=submit]");
    botao.disabled = true; botao.textContent = "Preparando…";
    const repetido = limitar();
    const ok = repetido ? true : await registrar("tchau", { nome, profissional: prof, mensagem: motivo });
    const texto =
      `Olá! Sou ${nome}, do Classificado Vintage Riders (motos clássicas). Preciso de ajuda para assumir a manutenção do nosso site.\n\n` +
      `Todas as informações técnicas estão neste guia: ${GUIA}\nCódigo-fonte: ${C.REPO_URL}\n\nPodemos conversar?`;
    const email = prof.includes("@") ? prof : "";
    const fone = prof.includes("@") ? "" : so(prof);
    $("tchau-email").href = `mailto:${email}?subject=${encodeURIComponent("Manutenção do site Vintage Riders — guia de passagem")}&body=${encodeURIComponent(texto)}`;
    $("tchau-zap").href = `https://wa.me/${fone.length >= 10 ? (fone.startsWith("55") ? fone : "55" + fone) : ""}?text=${encodeURIComponent(texto)}`;
    $("tchau-status").textContent = !ok
      ? "Não conseguimos registrar o pedido, então o aviso automático ao Léo NÃO foi enviado. O guia está pronto para entregar ao novo profissional:"
      : repetido
        ? "Seu pedido já foi registrado há instantes. O guia está pronto para entregar ao novo profissional:"
        : "Tudo certo, sem rancor. O Léo foi avisado automaticamente e o guia está pronto para entregar ao novo profissional:";
    botao.disabled = false; botao.textContent = "Gerar guia de passagem";
    passo2(dTchau);
  });
})();
