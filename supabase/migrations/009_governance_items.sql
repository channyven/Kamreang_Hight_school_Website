-- ============================================================
-- Governance Page: manageable list items for the "School
-- Governance" and "Teaching & Learning Culture" sections
-- (previously hardcoded in the public governance page).
-- ============================================================

CREATE TABLE IF NOT EXISTS governance_items (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  section    TEXT NOT NULL CHECK (section IN ('governance', 'culture')),
  icon       TEXT NOT NULL DEFAULT 'ClipboardCheck',
  text_km    TEXT NOT NULL,
  text_en    TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active  BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_governance_items_section ON governance_items (section, sort_order);
CREATE INDEX IF NOT EXISTS idx_governance_items_active ON governance_items (is_active) WHERE is_active = true;

DROP TRIGGER IF EXISTS trg_governance_items_updated_at ON governance_items;
CREATE TRIGGER trg_governance_items_updated_at BEFORE UPDATE ON governance_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE governance_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read active governance items" ON governance_items;
CREATE POLICY "Public can read active governance items" ON governance_items
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Service role full access governance_items" ON governance_items;
CREATE POLICY "Service role full access governance_items" ON governance_items
  USING (auth.role() = 'service_role');

-- Seed with the items currently hardcoded on the public governance page
INSERT INTO governance_items (section, icon, text_km, text_en, sort_order) VALUES
  ('governance', 'ClipboardCheck', 'តេស្តស្តង់ដារ តាមលំនាំប្រឡងបាក់ឌុប', 'Standardized tests aligned with the national Baccalaureate exam format', 1),
  ('governance', 'NotebookPen', 'ផែនការសិក្សាសិស្ស ផែនការបង្រៀន និងផែនការកែលម្អសាលារៀន', 'Student learning plans, teaching plans, and school improvement plans', 2),
  ('governance', 'Users2', 'គណៈកម្មការគ្រប់គ្រងថ្នាក់រៀន និងសាលារៀន', 'Classroom and school management committees', 3),
  ('governance', 'FileSignature', 'កិច្ចព្រមព្រៀងលទ្ធផលការងារប្រចាំឆ្នាំ', 'Annual work performance agreements', 4),
  ('governance', 'Vote', 'ក្រុមប្រឹក្សាសិស្ស', 'Student council', 5),
  ('governance', 'LineChart', 'ប្រព័ន្ធតាមដានសិស្សប្រចាំខែ និងត្រីមាស', 'Monthly and quarterly student monitoring system', 6),
  ('culture', 'CalendarDays', 'សិស្សមានកាលវិភាគរៀន និងបំពេញកិច្ចការផ្សេងៗប្រចាំថ្ងៃ ក្នុងមួយសប្តាហ៍ៗ', 'Students follow a weekly class schedule and complete daily tasks', 1),
  ('culture', 'Smartphone', 'សិស្សសិក្សាតាមរយៈ GEIP EdTech App មុនពេលរៀនជាមួយគ្នា', 'Students study through the GEIP EdTech App before learning together', 2),
  ('culture', 'Handshake', 'សិស្សរៀនផ្ទាល់ជាមួយគ្នា', 'Students engage in direct peer-to-peer learning', 3),
  ('culture', 'MessageCircleQuestion', 'សិស្សហ្វឹកហាត់បង្ហាញសំណួរ លំហាត់ និងចំណេះដឹងថ្មីៗ', 'Students practice presenting questions, exercises, and new knowledge', 4),
  ('culture', 'FlaskConical', 'សិស្សរៀនជាគម្រោងស្រាវជ្រាវ ដើម្បីពង្រឹងការយល់ដឹងខ្លឹមសារមេរៀន', 'Students undertake research projects to deepen their understanding of lessons', 5),
  ('culture', 'Presentation', 'សិស្សផ្សព្វផ្សាយគម្រោងស្រាវជ្រាវ ដើម្បីអភិវឌ្ឍជំនាញ និងបទពិសោធន៍ជាក់ស្តែង', 'Students present research projects to build practical skills and experience', 6)
ON CONFLICT DO NOTHING;
