# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
