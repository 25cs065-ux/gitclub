-- Supabase Schema for Git Club BuildSpace

-- 1. Create profiles table (for admin role information linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  role text NOT NULL DEFAULT 'admin',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create projects table
CREATE TABLE IF NOT EXISTS public.projects (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text NOT NULL,
  problem text NOT NULL,
  solution text NOT NULL,
  category text NOT NULL,
  technologies text[] DEFAULT '{}',
  thumbnail_url text,
  github_url text,
  demo_url text,
  status text DEFAULT 'draft',
  is_featured boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create members table
CREATE TABLE IF NOT EXISTS public.members (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  branch text,
  year text,
  role text,
  github_url text,
  linkedin_url text,
  avatar_url text
);

-- 4. Create project_members table
CREATE TABLE IF NOT EXISTS public.project_members (
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE,
  member_id uuid REFERENCES public.members(id) ON DELETE CASCADE,
  PRIMARY KEY (project_id, member_id)
);

-- Set up Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;

-- Helper Function for Admin Role Verification
-- This executes with SECURITY DEFINER to bypass RLS when checking profiles
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles: Users can view own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING ( auth.uid() = id );

-- Members: Publicly viewable (Approved public information)
CREATE POLICY "Public members are viewable by everyone."
  ON public.members FOR SELECT
  USING ( true );

-- Projects: Published projects are viewable by everyone
CREATE POLICY "Published projects are viewable by everyone."
  ON public.projects FOR SELECT
  USING ( status = 'published' );

-- Project Members: Viewable for published projects
CREATE POLICY "Project members are viewable by everyone for published projects."
  ON public.project_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = project_members.project_id
      AND projects.status = 'published'
    )
  );

-- Secure Admin CRUD Policies (Verified by database policy)
CREATE POLICY "Admins can insert projects."
  ON public.projects FOR INSERT WITH CHECK ( public.is_admin() );

CREATE POLICY "Admins can update projects."
  ON public.projects FOR UPDATE USING ( public.is_admin() );

CREATE POLICY "Admins can delete projects."
  ON public.projects FOR DELETE USING ( public.is_admin() );
  
-- Admins can also SELECT draft projects
CREATE POLICY "Admins can view all projects."
  ON public.projects FOR SELECT USING ( public.is_admin() );

CREATE POLICY "Admins can manage members."
  ON public.members FOR ALL USING ( public.is_admin() );

CREATE POLICY "Admins can manage project_members."
  ON public.project_members FOR ALL USING ( public.is_admin() );

-- Storage bucket setup
INSERT INTO storage.buckets (id, name, public) 
VALUES ('projects', 'projects', true)
ON CONFLICT (id) DO NOTHING;

-- Secure Storage Policies
CREATE POLICY "Public Access Storage"
  ON storage.objects FOR SELECT
  USING ( bucket_id = 'projects' );

CREATE POLICY "Admin Insert Storage"
  ON storage.objects FOR INSERT
  WITH CHECK ( bucket_id = 'projects' AND public.is_admin() );

CREATE POLICY "Admin Update Storage"
  ON storage.objects FOR UPDATE
  USING ( bucket_id = 'projects' AND public.is_admin() );

CREATE POLICY "Admin Delete Storage"
  ON storage.objects FOR DELETE
  USING ( bucket_id = 'projects' AND public.is_admin() );

-- Secure trigger to automatically create a profile when a new user signs up.
-- Only the VERY FIRST user gets the 'admin' role. All subsequent users get 'user'.
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
DECLARE
  is_first_user boolean;
BEGIN
  -- Check if this is the first profile ever created
  SELECT NOT EXISTS (SELECT 1 FROM public.profiles) INTO is_first_user;

  INSERT INTO public.profiles (id, role)
  VALUES (new.id, CASE WHEN is_first_user THEN 'admin' ELSE 'user' END);
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
