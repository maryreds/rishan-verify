-- Settings columns: notify_on_view boolean for the new Notifications section
-- in dashboard/settings.

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS notify_on_view boolean DEFAULT true;
