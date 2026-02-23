
-- Create enum for content types
CREATE TYPE public.content_type AS ENUM ('novel', 'story', 'poem');

-- Create enum for content format
CREATE TYPE public.content_format AS ENUM ('pdf', 'text');

-- Create enum for app roles
CREATE TYPE public.app_role AS ENUM ('admin');

-- User roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Works table (novels, stories, poems)
CREATE TABLE public.works (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  type public.content_type NOT NULL,
  format public.content_format NOT NULL DEFAULT 'text',
  content TEXT, -- for text format
  pdf_url TEXT, -- for pdf format
  cover_image_url TEXT,
  description TEXT,
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  word_count INTEGER DEFAULT 0,
  view_count INTEGER NOT NULL DEFAULT 0,
  like_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.works ENABLE ROW LEVEL SECURITY;

-- Chapters table (for novels)
CREATE TABLE public.chapters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  work_id UUID REFERENCES public.works(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  chapter_number INTEGER NOT NULL,
  pdf_url TEXT,
  content TEXT,
  format public.content_format NOT NULL DEFAULT 'pdf',
  word_count INTEGER DEFAULT 0,
  view_count INTEGER NOT NULL DEFAULT 0,
  like_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (work_id, chapter_number)
);
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;

-- Comments table (anonymous, admin-eyes-only)
CREATE TABLE public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  work_id UUID REFERENCES public.works(id) ON DELETE CASCADE,
  chapter_id UUID REFERENCES public.chapters(id) ON DELETE CASCADE,
  author_name TEXT DEFAULT 'Anonymous',
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (work_id IS NOT NULL OR chapter_id IS NOT NULL)
);
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Author profile table (singleton)
CREATE TABLE public.author_profile (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL DEFAULT '',
  bio TEXT DEFAULT '',
  photo_url TEXT,
  writing_journey JSONB DEFAULT '[]'::jsonb, -- array of {year, milestone}
  instagram_handle TEXT DEFAULT '',
  social_links JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.author_profile ENABLE ROW LEVEL SECURITY;

-- Site settings table (singleton)
CREATE TABLE public.site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_title TEXT NOT NULL DEFAULT 'Modern Paper',
  tagline TEXT DEFAULT 'A Literary Portfolio',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- ========== RLS POLICIES ==========

-- user_roles: only admin can read
CREATE POLICY "Admin can read roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- works: public read, admin write
CREATE POLICY "Anyone can view works" ON public.works
  FOR SELECT USING (true);
CREATE POLICY "Admin can insert works" ON public.works
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin can update works" ON public.works
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin can delete works" ON public.works
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- chapters: public read, admin write
CREATE POLICY "Anyone can view chapters" ON public.chapters
  FOR SELECT USING (true);
CREATE POLICY "Admin can insert chapters" ON public.chapters
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin can update chapters" ON public.chapters
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin can delete chapters" ON public.chapters
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- comments: anyone can insert, only admin can read
CREATE POLICY "Anyone can post comments" ON public.comments
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin can read comments" ON public.comments
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin can delete comments" ON public.comments
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- author_profile: public read, admin write
CREATE POLICY "Anyone can view author profile" ON public.author_profile
  FOR SELECT USING (true);
CREATE POLICY "Admin can update author profile" ON public.author_profile
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin can insert author profile" ON public.author_profile
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- site_settings: public read, admin write
CREATE POLICY "Anyone can view site settings" ON public.site_settings
  FOR SELECT USING (true);
CREATE POLICY "Admin can update site settings" ON public.site_settings
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin can insert site settings" ON public.site_settings
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ========== TRIGGERS ==========

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_works_updated_at BEFORE UPDATE ON public.works
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_chapters_updated_at BEFORE UPDATE ON public.chapters
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_author_profile_updated_at BEFORE UPDATE ON public.author_profile
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_site_settings_updated_at BEFORE UPDATE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ========== STORAGE BUCKETS ==========

INSERT INTO storage.buckets (id, name, public) VALUES ('covers', 'covers', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('pdfs', 'pdfs', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('author', 'author', true);

-- Storage policies
CREATE POLICY "Public can view covers" ON storage.objects FOR SELECT USING (bucket_id = 'covers');
CREATE POLICY "Admin can upload covers" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'covers' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin can update covers" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'covers' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin can delete covers" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'covers' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Public can view pdfs" ON storage.objects FOR SELECT USING (bucket_id = 'pdfs');
CREATE POLICY "Admin can upload pdfs" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'pdfs' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin can update pdfs" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'pdfs' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin can delete pdfs" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'pdfs' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Public can view author photos" ON storage.objects FOR SELECT USING (bucket_id = 'author');
CREATE POLICY "Admin can upload author photos" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'author' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin can update author photos" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'author' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin can delete author photos" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'author' AND public.has_role(auth.uid(), 'admin'));

-- ========== SEED DATA ==========

-- Seed author profile
INSERT INTO public.author_profile (name, bio, instagram_handle)
VALUES ('Aakash', 'A novelist, poet, and storyteller.', '');

-- Seed site settings
INSERT INTO public.site_settings (site_title, tagline)
VALUES ('Modern Paper', 'A Literary Portfolio');
