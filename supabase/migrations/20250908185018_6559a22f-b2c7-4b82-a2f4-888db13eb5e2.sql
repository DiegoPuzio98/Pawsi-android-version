-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create veterinarians table
CREATE TABLE public.veterinarians (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  description TEXT,
  address TEXT NOT NULL,
  location_lat DOUBLE PRECISION,
  location_lng DOUBLE PRECISION,
  phone TEXT,
  whatsapp TEXT,
  email TEXT,
  website TEXT,
  services TEXT[],
  images TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.veterinarians ENABLE ROW LEVEL SECURITY;

-- Create policies for veterinarians
CREATE POLICY "Public can read active veterinarians"
ON public.veterinarians
FOR SELECT
USING (status = 'active');

CREATE POLICY "Authenticated users can insert veterinarians"
ON public.veterinarians
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own veterinarians"
ON public.veterinarians
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own veterinarians"
ON public.veterinarians
FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_veterinarians_updated_at
BEFORE UPDATE ON public.veterinarians
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();