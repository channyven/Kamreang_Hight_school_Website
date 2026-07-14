-- ============================================================
-- Seed default admin user
-- ============================================================

-- IMPORTANT: Replace 'FIREBASE_UID_HERE' with the actual Firebase UID
-- of the user admin@school.edu.kh from the Firebase Console.
--
-- To get the Firebase UID:
-- 1. Go to https://console.firebase.google.com/project/kamreang-hightschool/authentication/users
-- 2. Find admin@school.edu.kh in the user list
-- 3. Copy the "User UID" value
-- 4. Replace FIREBASE_UID_HERE below with that UID

INSERT INTO admin_users (firebase_uid, email, full_name, role, is_active)
VALUES (
  'FIREBASE_UID_HERE',
  'admin@school.edu.kh',
  'School Administrator',
  'administrator',
  true
)
ON CONFLICT (email) DO NOTHING;
