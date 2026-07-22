-- ============================================================
-- Migration 023: Add Khmer parent name columns to students
--
-- Adds father_name_km and mother_name_km columns so that
-- parent names can be stored in both English and Khmer.
-- ============================================================

ALTER TABLE students
    ADD COLUMN IF NOT EXISTS father_name_km TEXT,
    ADD COLUMN IF NOT EXISTS mother_name_km TEXT;
