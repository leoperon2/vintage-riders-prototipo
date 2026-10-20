# Classificado Vintage Riders — protótipo

Site de catálogo de motos clássicas + painel de administração.

- **Site público:** `index.html` (catálogo com busca e filtros) e `moto.html` (detalhe).
- **Painel:** `admin/` — login, criar, editar, ocultar e excluir anúncios, com upload de fotos.
- **Banco e login:** Supabase (tabela `motos`, bucket `fotos`, acesso por RLS). A chave em `js/config.js` é a chave *pública*.
- **Cópia local:** `data/motos.json` é usada se o banco estiver indisponível.
- **Importação do Instagram:** `scripts/processar_posts.py` transforma o JSON do Apify em anúncios e fotos otimizadas.

Protótipo de demonstração. Anúncios e fotos pertencem aos respectivos anunciantes.
