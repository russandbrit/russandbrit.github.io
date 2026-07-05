# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.5.0] - 2026-07-05

### Added
- **Custom Galleries** — Admin can create named galleries (e.g. Ceremony, Reception, Getting Ready)
- **Gallery Tabs** — Dynamic filter tabs appear alongside built-in filters (All / Official / Guest)
- **Gallery Assign** — Admin assigns photos to galleries via dropdown in the detail modal
- **Gallery Edit/Delete** — Admin pencil icon on each tab to rename or delete galleries
- Photos unassigned from deleted galleries remain in the gallery (not deleted)

### Changed
- Filter system now supports both type-based and custom gallery filtering
- Firestore `galleries` collection stores gallery metadata

## [2.4.0] - 2026-07-05

### Added
- **Photo Reordering** — Admin can move photos left/right with ◄ ► arrows on each gallery item
- `order` field in Firestore for persistent photo positioning
- Gallery sorts by custom order first, then falls back to timestamp

### Changed
- Move arrows only visible in admin mode (gold highlight on hover)
- Photo order persists across page reloads via Firestore
- **Admin session persists** via sessionStorage — stays active across page reloads until explicit logout

## [2.3.0] - 2026-07-05

### Added
- **Promote to Official** — Admin can promote any guest photo to "official" from the detail modal
- **Demote to Guest** — Toggle official photos back to guest
- Admin **Delete Comment** button (✕) on each comment when in admin mode
- Admin **Reset Likes** button to zero out likes on any photo
- Likes and comments now work on **all photos** including the official wedding photo

### Changed
- Photos now store `type` field in Firestore (`'guest'` or `'official'`) for gallery filtering
- All Firestore writes use `set({merge: true})` to auto-create documents (fixes official photo errors)
- Upload now saves `type: 'guest'` to Firestore

### Fixed
- "No document to update: photos/main" error when liking/commenting on official photo

## [2.2.0] - 2026-07-05

### Added
- **Likes** — Heart button on every gallery photo, stored in Firestore with localStorage dedup
- **Comments** — Click any photo to open detail view with scrollable comment thread
- **Photo Detail Modal** — Full-size image with sidebar showing uploader name, caption, like button, and comments
- Comment form with name + text inputs, Enter key to post
- Comment count badge (💬) on gallery items with comments
- Likes toggle (click again to unlike)

## [2.1.0] - 2026-07-04

### Added
- Permanent `originalUrl` stored in Firestore — the first uploaded version is always preserved
- Reset All now fetches the true original from Firestore, even after multiple edit sessions
- Reset All auto-saves the restored original back to Firebase

### Changed
- Gallery edits no longer delete the original file from Storage — only intermediate edits are cleaned up
- Edits update `url` but never modify `originalUrl`, ensuring the original is always recoverable

### Fixed
- Crop now renders immediately after applying
- Staging grid reloads after photo delete
- Reset now fully works after crop (restores unmodified image)

## [2.0.2] - 2026-07-04

### Fixed
- 404 error when editing a staging photo a second time — staging grid now reloads after each edit to reflect the new image URL

## [2.0.1] - 2026-07-04

### Changed
- Increased max simultaneous photo uploads from 50 to 150

## [2.0.0] - 2026-07-04

### Added
- Photo staging/moderation system — all uploads now go to "pending" status
- Admin-only "Pending Approval" section appears above gallery when admin mode is active
- Per-photo actions in staging: Approve (✓), Edit (✎), Reject (✕)
- "Approve All" batch action for quick bulk approval
- Pending count badge in staging header

### Changed
- Gallery now only displays photos with `status: 'approved'`
- Upload success message now says "Pending admin approval" instead of immediate confirmation
- Firestore photo documents now include a `status` field (`'pending'` or `'approved'`)

## [1.5.2] - 2026-07-04

### Added
- SVG favicon with gold "R & B" initials on dark background matching site theme

## [1.5.1] - 2026-07-04

### Fixed
- Gallery photo editor CORS error — now fetches images as blobs to bypass cross-origin restrictions

### Changed
- Increased max simultaneous photo uploads from 10 to 50

### Added
- `cors.json` — Firebase Storage CORS config for the bucket (one-time setup via `gsutil`)

## [1.5.0] - 2026-07-04

### Added
- All users can now edit gallery photos (edit button appears on hover)
- Full name prompt required before editing — validates first and last name
- Name saved in sessionStorage so users only enter it once per visit
- Admins bypass the name prompt when in admin mode

### Changed
- Gallery edit button moved from admin-only to always visible on hover
- In admin mode, edit button shifts below delete button for clear separation

## [1.4.0] - 2026-07-04

### Added
- Crop tool in photo editor — drag to select, resize from corners, move selection, Apply/Cancel
- Admin can edit gallery photos (gold ✎ button) — opens editor, re-uploads to Firebase on save
- R & B nav brand is now clickable to reload the page

## [1.3.0] - 2026-07-04

### Added
- Admin mode with passcode protection (lock icon in nav bar)
- Delete buttons on gallery photos and guestbook entries (visible only in admin mode)
- Confirm-delete modal to prevent accidental deletions
- Firebase Storage cleanup when deleting photos or media entries
- Admin passcode stored in `config.json` for easy management
- Larger upload preview thumbnails (100px) with more visible edit button

## [1.2.0] - 2026-07-04

### Added
- Photo editor for uploads — rotate, brightness/contrast/saturation sliders, and 6 preset filters (Original, Warm, Cool, B&W, Vintage, Soft) with live canvas preview
- Edit button (✎) on each upload preview thumbnail to open the editor
- Ruth 1:16–17 scripture quote section between hero and gallery with decorative gold ornament styling

### Changed
- Gallery subtitle reworded to thank family and friends who made the day special

## [1.1.0] - 2026-07-04

### Added
- Client-side image-to-JPG conversion on upload using Canvas API (85% quality, white background fill for PNGs with transparency)

### Removed
- Upload passcode requirement — removed config.json, passcode input field, and validation logic to reduce friction for less tech-savvy family members

### Fixed
- Updated copyright year in footer from 2025 to 2026

## [1.0.0] - 2026-07-04

### Added
- Initial release of the Russ & Brit wedding website
- Hero section with full-screen background photo, animated floating petals, and scroll indicator
- Photo gallery with masonry grid layout, filter controls (All / Official / Guest Uploads), and lightbox viewer with keyboard navigation
- Photo upload section with drag-and-drop dropzone, multi-file preview thumbnails, uploader name & caption fields, and upload progress bar
- Virtual guestbook supporting text messages, audio recording (60s max with waveform visualizer), and video recording/upload (30s max)
- Responsive navigation with hamburger menu toggle and active-section highlighting on scroll
- Animated preloader with interlocking wedding rings
- Toast notification system for user feedback
- Firebase integration (Firestore for data, Storage for media, Analytics)
- Full responsive design for mobile, tablet, and desktop viewports
- Google Fonts (Cormorant Garamond & Outfit) typography system
- Dark elegant theme with glassmorphism effects and smooth CSS transitions
- SEO metadata including title, description, and theme color
