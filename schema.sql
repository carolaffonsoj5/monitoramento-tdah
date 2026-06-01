-- ============================================================
--  BANCO DE DADOS — Monitoramento TDAH (Carol)
--  Cole TODO este conteúdo no "SQL Editor" do Supabase e clique RUN.
--  (Veja o PASSO 2 do README.md)
-- ============================================================

-- Tabela onde ficam todos os registros diários (de todo mundo)
create table if not exists public.entries (
  id          uuid primary key default gen_random_uuid(),
  author_id   uuid not null references auth.users(id) on delete cascade,
  author_name text not null,
  role        text not null,          -- carol | observador | chefe | namorado
  relation    text,                   -- relação com a paciente (observadores)
  entry_date  date not null,
  data        jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Um registro por pessoa por dia (deixa salvar/atualizar sem duplicar)
create unique index if not exists entries_unique_day
  on public.entries (author_id, role, entry_date);

create index if not exists entries_date_idx on public.entries (entry_date);

-- Liga a "segurança por linha" (Row Level Security)
alter table public.entries enable row level security;

-- Como é UM paciente só (a Carol), todos os logados podem LER tudo
-- (é assim que o relatório do médico junta os dados de todos).
drop policy if exists "ler todos os registros" on public.entries;
create policy "ler todos os registros"
  on public.entries for select
  to authenticated
  using (true);

-- Cada pessoa só pode CRIAR/EDITAR/APAGAR os próprios registros.
drop policy if exists "inserir proprios" on public.entries;
create policy "inserir proprios"
  on public.entries for insert
  to authenticated
  with check (author_id = auth.uid());

drop policy if exists "editar proprios" on public.entries;
create policy "editar proprios"
  on public.entries for update
  to authenticated
  using (author_id = auth.uid())
  with check (author_id = auth.uid());

drop policy if exists "apagar proprios" on public.entries;
create policy "apagar proprios"
  on public.entries for delete
  to authenticated
  using (author_id = auth.uid());

-- Atualiza o updated_at automaticamente
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

drop trigger if exists trg_touch on public.entries;
create trigger trg_touch before update on public.entries
  for each row execute function public.touch_updated_at();
