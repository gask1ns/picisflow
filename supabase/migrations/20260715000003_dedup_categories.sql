-- Hapus duplikat default categories (user_id IS NULL)
delete from categories
where user_id is null
  and ctid not in (
    select min(ctid) from categories
    where user_id is null
    group by name, type
  );

-- Partial unique index: cegah duplikat default categories
create unique index if not exists categories_default_unique
  on categories (name, type) where user_id is null;
