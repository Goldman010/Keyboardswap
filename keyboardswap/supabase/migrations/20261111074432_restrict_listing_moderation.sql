-- Use server-managed app metadata for the administrator role.
DROP POLICY IF EXISTS "Anyone can view pending listings" ON public.listings;
DROP POLICY IF EXISTS "Anyone can moderate pending listings" ON public.listings;

CREATE POLICY "Admins can view listings"
  ON public.listings FOR SELECT TO authenticated
  USING ((SELECT auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin');

CREATE POLICY "Admins can moderate pending listings"
  ON public.listings FOR UPDATE TO authenticated
  USING (
    status = 'pending'
    AND (SELECT auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin'
  )
  WITH CHECK (
    status IN ('approved', 'rejected')
    AND (SELECT auth.jwt()) -> 'app_metadata' ->> 'role' = 'admin'
  );

-- Seller edits go back to review. Once an approved auction starts, edits close.
DROP POLICY IF EXISTS "Users can update own listings" ON public.listings;

CREATE POLICY "Users can update own listings"
  ON public.listings FOR UPDATE TO authenticated
  USING (
    seller_id = (SELECT auth.uid())
    AND (
      status IN ('pending', 'rejected')
      OR (
        status = 'approved'
        AND (scheduled_start_time IS NULL OR scheduled_start_time > now())
      )
    )
  )
  WITH CHECK (seller_id = (SELECT auth.uid()) AND status = 'pending');
