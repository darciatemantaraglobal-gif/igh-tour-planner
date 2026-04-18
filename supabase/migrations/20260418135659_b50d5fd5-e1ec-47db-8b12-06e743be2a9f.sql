
-- ============================================
-- IGH TOUR - Initial Schema
-- ============================================

-- 1. Roles enum & user_roles table (security best practice)
CREATE TYPE public.app_role AS ENUM ('admin', 'staff');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check role (avoids recursive RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- 2. Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- 3. Update timestamp trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. Auto-create profile + assign first user as admin
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_count INT;
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email),
    NEW.email
  );

  -- First registered user automatically becomes admin
  SELECT COUNT(*) INTO user_count FROM auth.users;
  IF user_count = 1 THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Groups (monthly trip groups)
CREATE TABLE public.groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  departure_month DATE NOT NULL,
  pax_target INT NOT NULL DEFAULT 0,
  hotel_makkah TEXT,
  hotel_madinah TEXT,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can do everything on groups"
  ON public.groups FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_groups_updated_at
  BEFORE UPDATE ON public.groups
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 6. Jamaah (participants)
CREATE TYPE public.jamaah_status AS ENUM (
  'registered', 'document_uploaded', 'visa_processing', 'visa_approved', 'ready_for_departure', 'departed'
);

CREATE TYPE public.room_type AS ENUM ('quad', 'triple', 'double');

CREATE TABLE public.jamaah (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  passport_number TEXT,
  passport_expiry DATE,
  date_of_birth DATE,
  gender TEXT,
  phone TEXT,
  room_type public.room_type DEFAULT 'quad',
  status public.jamaah_status NOT NULL DEFAULT 'registered',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.jamaah ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can do everything on jamaah"
  ON public.jamaah FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_jamaah_updated_at
  BEFORE UPDATE ON public.jamaah
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_jamaah_group_id ON public.jamaah(group_id);

-- 7. Documents
CREATE TYPE public.document_type AS ENUM ('passport', 'photo', 'visa', 'ticket', 'other');

CREATE TABLE public.jamaah_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  jamaah_id UUID NOT NULL REFERENCES public.jamaah(id) ON DELETE CASCADE,
  document_type public.document_type NOT NULL,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  mime_type TEXT,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.jamaah_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can do everything on documents"
  ON public.jamaah_documents FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_jamaah_documents_jamaah_id ON public.jamaah_documents(jamaah_id);

-- 8. Quotations (saved quotes)
CREATE TABLE public.quotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES public.groups(id) ON DELETE SET NULL,
  client_name TEXT NOT NULL,
  pax INT NOT NULL,
  hotel_makkah TEXT,
  hotel_madinah TEXT,
  quad_price NUMERIC(10,2),
  triple_price NUMERIC(10,2),
  double_price NUMERIC(10,2),
  currency TEXT NOT NULL DEFAULT 'USD',
  fx_rate NUMERIC(12,4) DEFAULT 1,
  inclusions JSONB DEFAULT '[]'::jsonb,
  exclusions JSONB DEFAULT '[]'::jsonb,
  additional_services JSONB DEFAULT '{}'::jsonb,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can do everything on quotations"
  ON public.quotations FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- 9. Storage bucket for jamaah documents (private)
INSERT INTO storage.buckets (id, name, public)
VALUES ('jamaah-docs', 'jamaah-docs', false);

CREATE POLICY "Admins can view all jamaah docs"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'jamaah-docs' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can upload jamaah docs"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'jamaah-docs' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update jamaah docs"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'jamaah-docs' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete jamaah docs"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'jamaah-docs' AND public.has_role(auth.uid(), 'admin'));
