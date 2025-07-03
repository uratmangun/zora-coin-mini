-- Create the 'images' bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true);

-- Create the 'metadata' bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('metadata', 'metadata', true);

-- Set up RLS policies for the 'images' bucket
CREATE POLICY "Allow public read access to images"
ON storage.objects FOR SELECT
USING ( bucket_id = 'images' );

CREATE POLICY "Allow public insert access to images"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'images' );

-- Set up RLS policies for the 'metadata' bucket
CREATE POLICY "Allow public read access to metadata"
ON storage.objects FOR SELECT
USING ( bucket_id = 'metadata' );

CREATE POLICY "Allow public insert access to metadata"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'metadata' );
