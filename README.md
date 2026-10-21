# Classificado Vintage Riders — protótipo

Site completo + painel de administração, feito a partir do site antigo (Bagy) e do Instagram da empresa.

## Páginas
- `index.html` — home (banners do showroom, novidades, marcas, serviços, sobre, showroom).
- `motos.html` — catálogo com abas **À venda** e **Acervo**, busca e filtros.
- `moto.html?s=<slug>` — detalhe com galeria, ficha e WhatsApp.
- `servicos.html` — anúncio (com simulador de custo), intermediação, assessoria 360º e frete.
- `sobre.html` (com dúvidas frequentes), `contato.html`, `privacidade.html`.
- `admin/` — painel: login, criar, editar, ocultar, marcar como vendida e excluir anúncios, com upload de fotos.

## Dados
- **Anúncios ao vivo:** tabela `motos` no Supabase (RLS: público lê `ativo`/`vendido`; só admin escreve).
- **Acervo:** `data/acervo.json` + `img/acervo/` (1.198 motos do site antigo; status "acervo": disponibilidade a confirmar).
- **Cópia local:** `data/motos.json` é usada se o banco estiver indisponível.
- A chave em `js/config.js` é a chave *pública* do Supabase. Nunca coloque a `service_role` no repositório.

## Scripts
- `scripts/processar_posts.py` — JSON do Apify (Instagram) → anúncios + fotos otimizadas.
- `scripts/processar_acervo.py` — coleta do site antigo → `data/acervo.json` + capas.
- `supabase/seed.sql` — carga inicial dos anúncios do Instagram.

Protótipo de demonstração. Anúncios e fotos pertencem aos respectivos anunciantes.
