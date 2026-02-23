
-- The "Anyone can post comments" policy with WITH CHECK (true) is intentional
-- since anonymous readers need to post comments without authentication.
-- We'll add a check that content is not empty to add some validation.
DROP POLICY "Anyone can post comments" ON public.comments;
CREATE POLICY "Anyone can post comments" ON public.comments
  FOR INSERT WITH CHECK (content IS NOT NULL AND length(content) > 0);
