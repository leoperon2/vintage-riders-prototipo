-- Esquema completo do banco (Supabase / Postgres) do Classificado Vintage Riders.
-- Rode no SQL Editor de um projeto novo para recriar a estrutura. Depois:
--   1) Authentication > Users > "Add user" (e-mail e senha do administrador)
--   2) insert into public.admins (email) values ('email-do-admin@exemplo.com');
-- Os dados dos anúncios estão em supabase/seed.sql (e as fotos em img/motos/).

-- ---------- administradores ----------
create table if not exists public.admins (email text primary key);
alter table public.admins enable row level security;

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins where lower(email) = lower(coalesce(auth.jwt() ->> 'email','')));
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

create policy "admin le admins" on public.admins for select to authenticated using (public.is_admin());

-- ---------- anúncios ----------
create table if not exists public.motos (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  shortcode text unique,                    -- código do post no Instagram (evita duplicar na importação)
  marca text not null,
  modelo text not null,
  ano text,
  km text,
  valor integer,
  cidade text,
  contato text,
  obs text,
  fonte_url text,
  capa text,                                -- caminho relativo (img/...) ou URL do Storage
  fotos jsonb not null default '[]'::jsonb, -- lista de caminhos/URLs, a 1ª é a capa
  status text not null default 'ativo' check (status in ('ativo','vendido','oculto')),
  origem text not null default 'painel',    -- 'painel' ou 'instagram'
  publicado_em timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists motos_status_publicado on public.motos (status, publicado_em desc);

create or replace function public.touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;
create trigger motos_touch before update on public.motos for each row execute function public.touch_updated_at();

alter table public.motos enable row level security;
-- (o nome é antigo, mas a regra libera "ativo" e "vendido" ao público)
create policy "publico ve anuncios ativos" on public.motos for select to anon, authenticated using (status in ('ativo','vendido'));
create policy "admin ve tudo" on public.motos for select to authenticated using (public.is_admin());
create policy "admin insere" on public.motos for insert to authenticated with check (public.is_admin());
create policy "admin edita" on public.motos for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin exclui" on public.motos for delete to authenticated using (public.is_admin());

-- ---------- fotos enviadas pelo painel (Storage) ----------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('fotos','fotos', true, 8388608, array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;
create policy "admin envia fotos" on storage.objects for insert to authenticated with check (bucket_id = 'fotos' and public.is_admin());
create policy "admin altera fotos" on storage.objects for update to authenticated using (bucket_id = 'fotos' and public.is_admin());
create policy "admin apaga fotos" on storage.objects for delete to authenticated using (bucket_id = 'fotos' and public.is_admin());

-- ---------- pedidos da página "Léo sumiu" / "Tchau" ----------
create table if not exists public.chamados_leo (
  id uuid primary key default gen_random_uuid(),
  tipo text not null check (tipo in ('leosumiu','tchau')),
  nome text,
  contato text,
  mensagem text,
  profissional text,
  created_at timestamptz not null default now()
);
alter table public.chamados_leo enable row level security;
-- qualquer visitante pode registrar (só inserir; ninguém lê pela API pública)
create policy "qualquer pessoa registra pedido" on public.chamados_leo for insert to anon, authenticated
with check (
  char_length(coalesce(nome,'')) <= 120 and char_length(coalesce(contato,'')) <= 160
  and char_length(coalesce(mensagem,'')) <= 1000 and char_length(coalesce(profissional,'')) <= 300
);
-- para ver os pedidos: Supabase > Table Editor > chamados_leo

-- ---------- aviso automático de novos pedidos (Telegram + e-mail) ----------
create extension if not exists pg_net with schema extensions;

-- configuração PRIVADA: RLS ligado e nenhuma policy = a API pública não lê nem escreve.
create table if not exists public.config_notificacao (chave text primary key, valor text not null);
alter table public.config_notificacao enable row level security;
revoke all on public.config_notificacao from anon, authenticated;
-- chaves usadas (preencha no SQL Editor, NUNCA no repositório):
--   telegram_token, telegram_chat_id, email_aviso

create or replace function public.notificar_chamado() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  v_tok text; v_chat text; v_email text; v_fone text; v_wa text; v_titulo text; v_corpo text;
begin
  select valor into v_tok   from public.config_notificacao where chave = 'telegram_token';
  select valor into v_chat  from public.config_notificacao where chave = 'telegram_chat_id';
  select valor into v_email from public.config_notificacao where chave = 'email_aviso';

  v_fone := regexp_replace(coalesce(new.contato, ''), '\D', '', 'g');
  v_wa := case when length(v_fone) >= 10 then 'https://wa.me/' || case when left(v_fone,2) = '55' then v_fone else '55' || v_fone end end;
  if new.tipo = 'tchau' then
    v_titulo := 'TCHAU: ' || coalesce(nullif(new.nome,''),'um cliente') || ' pediu o guia de passagem';
  else
    v_titulo := 'LÉO SUMIU: ' || coalesce(nullif(new.nome,''),'um cliente') || ' quer falar com você';
  end if;
  v_corpo := concat_ws(E'\n',
    case when coalesce(new.contato,'') <> '' then 'Contato: ' || new.contato end,
    case when coalesce(new.profissional,'') <> '' then 'Novo profissional: ' || new.profissional end,
    case when coalesce(new.mensagem,'') <> '' then 'Recado: ' || new.mensagem end,
    case when v_wa is not null then 'Responder: ' || v_wa end,
    'Origem: página Plano B do site Vintage Riders');

  if v_tok is not null and v_chat is not null then          -- Telegram
    begin
      perform net.http_post(
        url := 'https://api.telegram.org/bot' || v_tok || '/sendMessage',
        body := jsonb_build_object('chat_id', v_chat, 'text', v_titulo || E'\n\n' || v_corpo, 'disable_web_page_preview', true),
        headers := '{"Content-Type":"application/json"}'::jsonb, timeout_milliseconds := 15000);
    exception when others then null; end;
  end if;

  if v_email is not null and v_email <> '' then              -- e-mail (FormSubmit: confirmar o endereço 1x)
    begin
      perform net.http_post(
        url := 'https://formsubmit.co/ajax/' || v_email,
        body := jsonb_build_object('_subject', v_titulo, '_template', 'box', '_captcha', 'false',
                                   'tipo', new.tipo, 'nome', new.nome, 'contato', new.contato,
                                   'novo_profissional', new.profissional, 'recado', new.mensagem, 'responder_no_whatsapp', v_wa),
        headers := '{"Content-Type":"application/json","Accept":"application/json","Origin":"https://leoperon2.github.io","Referer":"https://leoperon2.github.io/vintage-riders-prototipo/leosumiu.html"}'::jsonb,
        timeout_milliseconds := 15000);
    exception when others then null; end;
  end if;
  return new;   -- falha no aviso nunca impede o registro do pedido
end $$;
revoke all on function public.notificar_chamado() from public, anon, authenticated;

create trigger chamados_leo_avisa after insert on public.chamados_leo for each row execute function public.notificar_chamado();
