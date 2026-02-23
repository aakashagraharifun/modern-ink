
# Literary Portfolio Website — "Modern Paper"

## Overview
A minimalist, high-end literary portfolio for showcasing novels, stories, and poems. Features a secure PDF reader for novels, an admin dashboard for full content management, and anonymous reader engagement tools.

---

## 1. Design & Theme
- **"Modern Paper" aesthetic**: Clean white backgrounds, generous whitespace, elegant serif typography for reading content, sans-serif for UI elements
- **Dark mode toggle**: High-contrast dark theme accessible from the navigation bar
- **Mobile-first responsive design**: All layouts optimized for phone screens first, scaling up to desktop

---

## 2. Public Pages

### Homepage
- Hero section with site branding and a brief tagline
- **Pinned/Featured works** section at the top (controlled by admin)
- Sections for **Novels**, **Stories**, and **Poems** with cover art thumbnails
- Each piece shows: title, cover image, estimated reading time ("X min read"), and a heart/like button
- Navigation bar with links to Novels, Stories, Poems, About Author, and a subtle "Admin Login" link

### Novel Reader (Core Feature)
- **Chapter list**: Sleek vertical sidebar (collapses to hamburger menu on mobile)
- **Secure PDF viewer**: Clicking a chapter opens a distraction-free modal with an embedded PDF viewer configured to:
  - Disable right-click context menu
  - Hide download/print toolbar buttons
  - Prevent text selection
- **Reading progress**: Remembers the reader's last chapter using localStorage, with a "Resume Reading" button
- **Anonymous comment box** at the end of each chapter (no account needed)
- **Heart/like button** per chapter

### Poems & Stories Reader
- **Mixed format support**: Admin can upload as PDF or paste formatted text
- Text content displays beautifully styled on the page; PDFs open in the secure viewer
- Estimated reading time displayed
- Heart/like button and anonymous comment box on each piece

### About Author Page
- Author photo (uploadable by admin)
- Written biography
- Writing journey / timeline of milestones
- Social links (Instagram and others, editable by admin)

---

## 3. Admin Dashboard (Login Required)

### Authentication
- **Single admin account** — no sign-up page, login only
- Secure server-side authentication via Supabase with role-based access
- Login accessible via the subtle "Admin Login" link in the nav bar

### Content Management
- **Upload interface** for novels (with chapter-wise PDF uploads), poems, and stories
- Support for uploading cover art images and titles
- **Pin/Feature toggle** to keep specific works at the top of the homepage
- **Author profile editor**: Update bio, photo, writing journey, and social handles (Instagram etc.)

### Analytics Dashboard
- **Overview cards**: Total views, total likes, total comments across all content
- **Table layout** showing per-piece analytics: title, type (novel/poem/story), views, likes, comment count, trending indicator
- **Novel drill-down**: Per-chapter views, likes, and pending anonymous comments
- Filter and sort to quickly find trending content or chapters with the most reader feedback

### Comment Moderation
- View all anonymous comments (admin-eyes-only)
- Organized by content piece and chapter
- Ability to review reader sentiment at a glance

---

## 4. Backend (Supabase)
- **Database** for novels, chapters, poems, stories, comments, likes, view tracking, author profile, and site settings
- **Storage buckets** for PDFs, cover art, and author photo
- **Authentication** with admin-only role enforcement
- **Row-Level Security** to protect all data, with admin-only access to comments and analytics
- **Edge functions** for view counting and any server-side logic

---

## 5. SEO & Polish
- Auto-generated SEO meta tags for each novel/poem/story title
- Open Graph tags for social sharing
- Clean URL structure for discoverability
- Smooth page transitions and loading states
