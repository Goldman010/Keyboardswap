-- Add category, known_flaws, and included_items fields to listings.
ALTER TABLE listings
  ADD COLUMN IF NOT EXISTS category TEXT
    CHECK (
      category IS NULL
      OR category IN ('full_build', 'keycaps', 'components', 'accessories')
    );

ALTER TABLE listings
  ADD COLUMN IF NOT EXISTS known_flaws TEXT;

ALTER TABLE listings
  ADD COLUMN IF NOT EXISTS included_items TEXT;

NOTIFY pgrst, 'reload schema';
