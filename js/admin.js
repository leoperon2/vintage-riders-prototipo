(function () {
  const { foto, preco, esc } = window.API;
  const C = window.CONFIG;
  const db = window.supabase.createClient(C.SUPABASE_URL, C.SUPABASE_KEY);
  const $ = (id) => document.getElementById(id);
  const mostrar = (id, on) => $(id).classList.toggle("oculto-js", !on);
  const BASE = "../";
  const PUBLICO = `${C.SUPABASE_URL}/storage/v1/object/public/fotos/`;

  let anuncios = [];
  let editando = null; // objeto em edição (null = novo)
  let fotos = []; // caminhos/URLs na ordem

  function aviso(txt) {
    const t = document.createElement("div");
    t.className = "toast";
    t.textContent = txt;
    document.body.append(t);
    setTimeout(() => t.remove(), 2600);
  }
  const slugify = (t) => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  // ---------- sessão ----------
  async function iniciar() {
    const { data } = await db.auth.getSession();
    if (data.session) await entrar(); else mostrarLogin();
  }
  function mostrarLogin() {
    mostrar("form-login", true); mostrar("painel", false); mostrar("sair", false); mostrar("link-suporte", false);
  }
  async function entrar() {
    const { data, error } = await db.from("admins").select("email").limit(1);
    if (error || !data?.length) {
      await db.auth.signOut();
      mostrarLogin();
      const e = $("login-erro");
      e.textContent = "Este usuário não tem permissão de administrador.";
      e.classList.remove("oculto-js");
      return;
    }
    mostrar("form-login", false); mostrar("painel", true); mostrar("sair", true); mostrar("link-suporte", true);
    await carregar();
  }
  $("form-login").addEventListener("submit", async (ev) => {
    ev.preventDefault();
    const err = $("login-erro");
    err.classList.add("oculto-js");
    const { error } = await db.auth.signInWithPassword({ email: $("email").value.trim(), password: $("senha").value });
    if (error) {
      err.textContent = "E-mail ou senha incorretos.";
      err.classList.remove("oculto-js");
      return;
    }
    await entrar();
  });
  $("sair").addEventListener("click", async () => { await db.auth.signOut(); location.reload(); });

  // ---------- lista ----------
  async function carregar() {
    const { data, error } = await db.from("motos").select("*").order("publicado_em", { ascending: false });
    if (error) { aviso("Erro ao carregar: " + error.message); return; }
    anuncios = data;
    desenharLista();
  }
  function desenharLista() {
    const q = $("filtro").value.trim().toLowerCase();
    const st = $("filtro-status").value;
    const l = anuncios.filter((m) => (!q || `${m.marca} ${m.modelo} ${m.ano} ${m.cidade}`.toLowerCase().includes(q)) && (!st || m.status === st));
    const n = (s) => anuncios.filter((m) => m.status === s).length;
    $("contagem").textContent = `${l.length} exibido(s) · ${n("ativo")} à venda · ${n("vendido")} vendida(s) · ${n("oculto")} oculta(s)`;
    $("lista").innerHTML = l.map((m) => `
      <div class="item ${m.status === "oculto" ? "oculta" : ""}" data-id="${m.id}">
        <img src="${foto(m.capa || m.fotos?.[0], BASE)}" alt="" loading="lazy">
        <div>
          <div class="item-t">${esc(m.marca)} ${esc(m.modelo)} ${esc(m.ano)}
            <span class="selo ${m.status}">${{ ativo: "À venda", vendido: "Vendida", oculto: "Oculto" }[m.status]}</span></div>
          <div class="item-s">${preco(m.valor)} · ${esc(m.cidade || "")}</div>
        </div>
        <div class="acoes">
          <button class="btn sec peq" data-a="editar">Editar</button>
          <button class="btn sec peq" data-a="vendida">${m.status === "vendido" ? "Voltar à venda" : "Marcar vendida"}</button>
          <button class="btn sec peq" data-a="alternar">${m.status === "oculto" ? "Mostrar" : "Ocultar"}</button>
          <button class="btn perigo peq" data-a="excluir">Excluir</button>
        </div>
      </div>`).join("") || `<div class="vazio">Nenhum anúncio.</div>`;
  }
  $("filtro").addEventListener("input", desenharLista);
  $("filtro-status").addEventListener("change", desenharLista);
  $("lista").addEventListener("click", async (ev) => {
    const b = ev.target.closest("button[data-a]");
    if (!b) return;
    const m = anuncios.find((x) => x.id === b.closest(".item").dataset.id);
    if (b.dataset.a === "editar") abrirForm(m);
    if (b.dataset.a === "alternar" || b.dataset.a === "vendida") {
      const novo = b.dataset.a === "vendida" ? (m.status === "vendido" ? "ativo" : "vendido") : (m.status === "oculto" ? "ativo" : "oculto");
      const { error } = await db.from("motos").update({ status: novo }).eq("id", m.id);
      if (error) return aviso("Erro: " + error.message);
      aviso({ oculto: "Anúncio oculto do site", vendido: "Anúncio marcado como vendido", ativo: "Anúncio à venda no site" }[novo]);
      await carregar();
    }
    if (b.dataset.a === "excluir") {
      if (!confirm(`Excluir "${m.marca} ${m.modelo} ${m.ano || ""}" para sempre?\nEsta ação não pode ser desfeita. Para só tirar do site, use "Ocultar".`)) return;
      const doStorage = (m.fotos || []).filter((f) => f.startsWith(PUBLICO)).map((f) => f.slice(PUBLICO.length));
      const { error } = await db.from("motos").delete().eq("id", m.id);
      if (error) return aviso("Erro: " + error.message);
      if (doStorage.length) await db.storage.from("fotos").remove(doStorage);
      aviso("Anúncio excluído");
      await carregar();
    }
  });

  // ---------- formulário ----------
  const campos = ["marca", "modelo", "ano", "km", "valor", "cidade", "contato", "obs", "status"];
  function abrirForm(m) {
    editando = m || null;
    $("form-titulo").textContent = m ? `Editar: ${m.marca} ${m.modelo}` : "Novo anúncio";
    campos.forEach((c) => ($(c).value = m?.[c] ?? (c === "status" ? "ativo" : "")));
    fotos = [...(m?.fotos || [])];
    $("legenda").value = "";
    $("arquivos").value = "";
    $("form-erro").classList.add("oculto-js");
    desenharFotos();
    mostrar("form-anuncio", true);
    $("form-anuncio").scrollIntoView({ behavior: "smooth" });
  }
  function fecharForm() { mostrar("form-anuncio", false); editando = null; }
  $("novo").addEventListener("click", () => abrirForm(null));
  $("cancelar").addEventListener("click", fecharForm);

  function desenharFotos() {
    $("fotos-edit").innerHTML = fotos.map((f, i) => `
      <div class="foto-ed" data-i="${i}">
        ${i === 0 ? '<span class="capa-tag">CAPA</span>' : ""}
        <img src="${foto(f, BASE)}" alt="">
        <div class="ctl">
          <button type="button" data-f="esq" aria-label="Mover para trás">←</button>
          <button type="button" data-f="del" aria-label="Remover foto">🗑</button>
          <button type="button" data-f="dir" aria-label="Mover para frente">→</button>
        </div>
      </div>`).join("");
  }
  $("fotos-edit").addEventListener("click", (ev) => {
    const b = ev.target.closest("button[data-f]");
    if (!b) return;
    const i = +b.closest(".foto-ed").dataset.i;
    if (b.dataset.f === "del") fotos.splice(i, 1);
    if (b.dataset.f === "esq" && i > 0) [fotos[i - 1], fotos[i]] = [fotos[i], fotos[i - 1]];
    if (b.dataset.f === "dir" && i < fotos.length - 1) [fotos[i + 1], fotos[i]] = [fotos[i], fotos[i + 1]];
    desenharFotos();
  });

  // reduz a foto no navegador antes de enviar (celular → ~200 KB)
  function reduzir(arquivo, lado = 1600) {
    return new Promise((ok, falha) => {
      const url = URL.createObjectURL(arquivo);
      const img = new Image();
      img.onload = () => {
        const k = Math.min(1, lado / Math.max(img.width, img.height));
        const c = document.createElement("canvas");
        c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
        c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url);
        c.toBlob((b) => (b ? ok(b) : falha(new Error("conversão"))), "image/webp", 0.82);
      };
      img.onerror = () => falha(new Error("Imagem inválida"));
      img.src = url;
    });
  }
  $("arquivos").addEventListener("change", async (ev) => {
    const lista = [...ev.target.files];
    if (!lista.length) return;
    const pasta = editando?.id || crypto.randomUUID();
    $("salvar").disabled = true;
    let n = 0;
    for (const f of lista) {
      aviso(`Enviando foto ${++n} de ${lista.length}…`);
      try {
        const blob = await reduzir(f);
        const caminho = `${pasta}/${Date.now()}-${n}.webp`;
        const { error } = await db.storage.from("fotos").upload(caminho, blob, { contentType: "image/webp" });
        if (error) throw error;
        fotos.push(PUBLICO + caminho);
        desenharFotos();
      } catch (e) {
        aviso("Falha na foto: " + (e.message || e));
      }
    }
    $("salvar").disabled = false;
    ev.target.value = "";
  });

  // preenche os campos a partir da legenda do Instagram
  $("preencher").addEventListener("click", () => {
    const t = $("legenda").value;
    const g = (n) => (t.match(new RegExp(`^${n}:[ \\t]*(.*)$`, "mi")) || [, ""])[1].trim();
    const ob = (t.match(/^Obs:[ \t]*([\s\S]*?)(?:\nO conte[úu]do|\n#|(?![\s\S]))/im) || [, ""])[1]
      .split("\n").map((l) => l.replace(/[•⁠]/g, "").trim()).filter(Boolean).join("\n");
    $("marca").value = g("Marca"); $("modelo").value = g("Modelo"); $("ano").value = g("Ano");
    $("km").value = g("Km"); $("cidade").value = g("Cidade").replace(/\s*-\s*/g, "-");
    $("contato").value = g("Contato"); $("obs").value = ob;
    $("valor").value = (g("Valor").replace(/[^\d,]/g, "").split(",")[0]) || "";
    aviso("Campos preenchidos. Confira e adicione as fotos.");
  });

  $("form-anuncio").addEventListener("submit", async (ev) => {
    ev.preventDefault();
    const err = $("form-erro");
    err.classList.add("oculto-js");
    const v = (c) => $(c).value.trim() || null;
    const dados = {
      marca: v("marca"), modelo: v("modelo"), ano: v("ano"), km: v("km"),
      valor: parseInt(($("valor").value || "").replace(/\D/g, ""), 10) || null,
      cidade: v("cidade"), contato: v("contato"), obs: v("obs"), status: $("status").value,
      fotos, capa: fotos[0] || null,
    };
    $("salvar").disabled = true;
    let res;
    if (editando) {
      res = await db.from("motos").update(dados).eq("id", editando.id);
    } else {
      dados.slug = `${slugify(`${dados.marca} ${dados.modelo} ${dados.ano || ""}`)}-${Math.random().toString(36).slice(2, 6)}`;
      res = await db.from("motos").insert(dados);
    }
    $("salvar").disabled = false;
    if (res.error) {
      err.textContent = "Não foi possível salvar: " + res.error.message;
      err.classList.remove("oculto-js");
      return;
    }
    aviso("Anúncio salvo!");
    fecharForm();
    await carregar();
  });

  // ---------- aviso estilo software (importação ainda não contratada) ----------
  const aviso_sw = $("aviso-sw");
  $("importar").addEventListener("click", () => aviso_sw.showModal());
  aviso_sw.addEventListener("click", (e) => {
    if (e.target.closest("[data-fechar]") || e.target === aviso_sw) aviso_sw.close();
  });

  iniciar();
})();
