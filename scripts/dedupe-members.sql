-- One-time cleanup of duplicate team_member rows created by the OLD accept-invite
-- flow (it inserted a fresh profile instead of linking the invited member by
-- email). Guarded by app_setting flag dedupe_members_v1 in migrate-prod.

-- 1) Link each real member (has code + email) to its accepted auth user.
UPDATE moteteam.team_member tm
SET auth_user_id = u.id, updated_at = now()
FROM moteteam."user" u
WHERE lower(tm.email) = lower(u.email)
  AND tm.code IS NOT NULL
  AND tm.auth_user_id IS NULL;

-- 2) Delete the orphan duplicates: accept-created rows (no code, no email) that
--    only carry an auth_user_id. The real member now owns that account.
DELETE FROM moteteam.team_member
WHERE code IS NULL AND email IS NULL AND auth_user_id IS NOT NULL;
