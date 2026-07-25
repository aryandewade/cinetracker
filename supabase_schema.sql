-- ============================================================
-- Cinetracker Supabase Database Schema & RLS Policies
-- ============================================================

-- 1. Create Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT,
  name TEXT,
  avatar TEXT DEFAULT '🍿',
  avatar_bg TEXT DEFAULT 'from-red-500 to-amber-500 text-white',
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create Media Items Table
CREATE TABLE IF NOT EXISTS public.media_items (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  poster TEXT,
  type TEXT,
  status TEXT,
  rating NUMERIC DEFAULT 0,
  review TEXT,
  watched_on TEXT,
  seasons JSONB,
  episodes_watched INTEGER DEFAULT 0,
  total_episodes INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_items ENABLE ROW LEVEL SECURITY;

-- 4. Profiles RLS Policies
-- Allow anyone to read profiles for community features
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

-- Allow users to insert/update their own profile
CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- 5. Media Items RLS Policies
-- Allow anyone to read media items (public watchlist & reviews)
CREATE POLICY "Public media items are viewable by everyone" ON public.media_items
  FOR SELECT USING (true);

-- Allow users to manage their own media items
CREATE POLICY "Users can insert their own media items" ON public.media_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own media items" ON public.media_items
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own media items" ON public.media_items
  FOR DELETE USING (auth.uid() = user_id);

-- 6. Automatic Profile Trigger on Auth Signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, email, name, avatar, avatar_bg, bio)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'avatar', '🍿'),
    COALESCE(NEW.raw_user_meta_data->>'avatar_bg', 'from-red-500 to-amber-500 text-white'),
    COALESCE(NEW.raw_user_meta_data->>'bio', 'Movie & TV enthusiast tracking favorites on Cinetracker.')
  )
  ON CONFLICT (id) DO UPDATE SET
    username = EXCLUDED.username,
    name = EXCLUDED.name,
    avatar = EXCLUDED.avatar,
    avatar_bg = EXCLUDED.avatar_bg,
    bio = EXCLUDED.bio;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
