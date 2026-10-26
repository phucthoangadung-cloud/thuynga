-- Public read-only timetable view for /tkb.
-- Exposes only fields needed by the public timetable; does not grant anon
-- direct SELECT access to the underlying classes, teachers, rooms, schedules tables.
-- Run this in Supabase Dashboard > SQL Editor on the correct project.

CREATE OR REPLACE VIEW public.public_timetable AS
SELECT
  s.id,
  s.weekday,
  s.start_time,
  s.end_time,
  s.active,
  s.note,
  s.class_id,
  c.name AS class_name,
  c.level AS class_level,
  c.class_code,
  t.full_name AS teacher_name,
  r.name AS room_name
FROM public.schedules AS s
LEFT JOIN public.classes AS c ON c.id = s.class_id
LEFT JOIN public.teachers AS t ON t.id = s.teacher_id
LEFT JOIN public.rooms AS r ON r.id = s.room_id;

GRANT SELECT ON public.public_timetable TO anon, authenticated;

-- If your Supabase project has not exposed the public schema API yet,
-- check Project Settings > API > Exposed schemas and ensure public is listed.
