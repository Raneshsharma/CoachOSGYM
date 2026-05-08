create table if not exists coach_credentials (
  coach_id    text primary key references coaches(id) on delete cascade,
  password_hash text not null,
  salt          text not null,
  created_at    timestamptz not null default now()
);

alter table coach_credentials enable row level security;

create policy service_role_all_on_coach_credentials on coach_credentials
  for all to service_role using (true) with check (true);
