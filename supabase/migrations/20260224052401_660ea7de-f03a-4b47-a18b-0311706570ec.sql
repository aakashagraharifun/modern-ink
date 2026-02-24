
-- Add is_archived column to comments for admin archiving
ALTER TABLE public.comments ADD COLUMN is_archived boolean NOT NULL DEFAULT false;

-- Allow admin to update comments (for archiving)
CREATE POLICY "Admin can update comments"
ON public.comments
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));
