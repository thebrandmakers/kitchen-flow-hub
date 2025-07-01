
-- First migration: Add new enum values one by one
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'manager';
