-- Seed Data for Git Club BuildSpace MVP
-- Using demonstration records clearly identified as seeds

INSERT INTO public.members (id, name, role, avatar_url, github_url)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'Demo User 1', 'Frontend Developer', 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo1', 'https://github.com/demo1'),
  ('22222222-2222-2222-2222-222222222222', 'Demo User 2', 'Backend Developer', 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo2', 'https://github.com/demo2')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.projects (
  id, title, slug, description, problem, solution, 
  thumbnail_url, github_url, demo_url, 
  category, technologies, is_featured, status
)
VALUES 
  (
    '33333333-3333-3333-3333-333333333333', 
    'Demo Project Alpha', 
    'demo-project-alpha', 
    'A demonstration project for the Git Club BuildSpace MVP.', 
    'Many clubs lack a central place to showcase their members'' projects.', 
    'BuildSpace provides an elegant, highly performant directory for student projects with comprehensive search and filtering.', 
    'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80', 
    'https://github.com/example/demo-alpha', 
    'https://demo-alpha.example.com', 
    'Web App', 
    ARRAY['React', 'TypeScript', 'Tailwind CSS', 'Supabase'], 
    true, 
    'published'
  ),
  (
    '44444444-4444-4444-4444-444444444444', 
    'Demo Mobile Beta', 
    'demo-mobile-beta', 
    'A cross-platform mobile application demonstration.', 
    'Students need a way to track their study habits effectively.', 
    'A gamified mobile application that rewards students for consistent study sessions.', 
    'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=800&q=80', 
    'https://github.com/example/demo-beta', 
    'https://demo-beta.example.com', 
    'Mobile', 
    ARRAY['React Native', 'Firebase', 'Expo'], 
    false, 
    'published'
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.project_members (project_id, member_id)
VALUES 
  ('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111'),
  ('33333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222'),
  ('44444444-4444-4444-4444-444444444444', '22222222-2222-2222-2222-222222222222')
ON CONFLICT DO NOTHING;
