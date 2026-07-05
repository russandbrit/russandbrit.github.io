# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
