-- Add translations JSONB column to listings table
-- Stores auto-translated name and description in both languages
-- Format: { "name": { "en": "...", "it": "..." }, "description": { "en": "...", "it": "..." } }
alter table public.listings add column if not exists translations jsonb default null;
