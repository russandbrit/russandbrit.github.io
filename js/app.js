/* ============================================================
   RUSS & BRIT — WEDDING WEBSITE
   Firebase-powered photo/video gallery & virtual guestbook
   ============================================================ */

// ==================== FIREBASE INIT ====================
let db, storage;
try {
    const firebaseConfig = {
        apiKey: "AIzaSyACrrUssACgqffdk3a4nRV49o-uTSrkvQc",
        authDomain: "russandbrit.firebaseapp.com",
        projectId: "russandbrit",
        storageBucket: "russandbrit.firebasestorage.app",
        messagingSenderId: "1005152811656",
        appId: "1:1005152811656:web:d25b7ae5d4f6d8b5a7bd3d",
        measurementId: "G-YCTXV9Q4RS"
    };

    firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    storage = firebase.storage();

    // Try analytics (may fail on some browsers)
    try { firebase.analytics(); } catch (e) { /* noop */ }
} catch (e) {
    console.error('Firebase init failed:', e);
}

// ==================== UTILITY FUNCTIONS ====================

function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const icons = { success: '✓', error: '✕', warning: '⚠' };
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <span class="toast-icon">${icons[type] || '✓'}</span>
        <span class="toast-message">${message}</span>
    `;
    container.appendChild(toast);
    setTimeout(() => {
        toast.classList.add('toast-out');
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

function formatTimeAgo(date) {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60)    return 'Just now';
    if (seconds < 3600)  return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getInitials(name) {
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

/**
 * Convert any image File/Blob to a JPEG Blob using the Canvas API.
 * Preserves original dimensions. Quality defaults to 0.85 (85%).
 * Returns a Promise that resolves with the JPEG Blob.
 */
function convertToJpg(file, quality = 0.85) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;

            const ctx = canvas.getContext('2d');
            // Fill white background (for PNGs with transparency)
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);

            canvas.toBlob(
                (blob) => {
                    if (blob) {
                        resolve(blob);
                    } else {
                        reject(new Error('Canvas toBlob failed'));
                    }
                },
                'image/jpeg',
                quality
            );

            // Clean up the object URL
            URL.revokeObjectURL(img.src);
        };
        img.onerror = () => {
            URL.revokeObjectURL(img.src);
            reject(new Error('Failed to load image for conversion'));
        };
        img.src = URL.createObjectURL(file);
    });
}

/**
 * Check if a file is a video type
 */
function isVideoFile(file) {
    return file.type.startsWith('video/');
}

/**
 * Check if a URL/string represents a video file
 */
function isVideoUrl(url) {
    if (!url) return false;
    const lower = url.toLowerCase();
    return lower.includes('.mp4') || lower.includes('.mov') || lower.includes('.webm') ||
           lower.includes('.m4v') || lower.includes('video%2F') || lower.includes('video/');
}

// ==================== PRELOADER ====================

// Dismiss preloader helper (safe to call multiple times)
let preloaderDismissed = false;
function dismissPreloader() {
    if (preloaderDismissed) return;
    preloaderDismissed = true;
    const preloader = document.getElementById('preloader');
    if (preloader) {
        preloader.classList.add('hidden');
    }
}

// Normal path: dismiss after page fully loads
window.addEventListener('load', () => {
    setTimeout(dismissPreloader, 1200);
});

// Failsafe: always dismiss after 5 seconds, even if load event never fires
// (e.g. external CDN fails on mobile, slow connections, etc.)
setTimeout(dismissPreloader, 5000);

// ==================== NAVIGATION ====================

const nav = document.getElementById('main-nav');
const navToggle = document.getElementById('nav-toggle');
const navMenu = document.getElementById('nav-menu');
const navLinks = document.querySelectorAll('.nav-link');

// Scroll detection for nav background
let lastScroll = 0;
window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    nav.classList.toggle('scrolled', scrollY > 50);
    lastScroll = scrollY;
});

// Mobile menu toggle
navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('open');
    navMenu.classList.toggle('open');
});

// Active section tracking
const sections = document.querySelectorAll('section[id]');
const observerOptions = { root: null, rootMargin: '-30% 0px -70% 0px', threshold: 0 };

const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            navLinks.forEach(link => {
                link.classList.toggle('active', link.dataset.section === entry.target.id);
            });
        }
    });
}, observerOptions);

sections.forEach(section => sectionObserver.observe(section));

// Close menu on link click (mobile)
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navToggle.classList.remove('open');
        navMenu.classList.remove('open');
    });
});

// ==================== FLOATING PETALS ====================

function createPetals() {
    const container = document.getElementById('petals-container');
    const colors = [
        'radial-gradient(ellipse, #e8d48b, #c9a84c)',
        'radial-gradient(ellipse, #f0e0c0, #d4b06a)',
        'radial-gradient(ellipse, #eee4cc, #c5a55a)',
    ];

    for (let i = 0; i < 15; i++) {
        setTimeout(() => {
            const petal = document.createElement('div');
            petal.className = 'petal';
            petal.style.left = Math.random() * 100 + '%';
            petal.style.width = (6 + Math.random() * 10) + 'px';
            petal.style.height = petal.style.width;
            petal.style.background = colors[Math.floor(Math.random() * colors.length)];
            petal.style.animationDuration = (6 + Math.random() * 8) + 's';
            petal.style.animationDelay = (Math.random() * 5) + 's';
            container.appendChild(petal);

            // Remove after animation
            setTimeout(() => petal.remove(), 20000);
        }, i * 600);
    }
}

createPetals();
// Repeat petals
setInterval(createPetals, 20000);

// ==================== SCROLL REVEAL ====================

const revealElements = document.querySelectorAll('.section-header, .gallery-controls, .upload-container, .guestbook-form-container');
revealElements.forEach(el => el.classList.add('reveal'));

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, { threshold: 0.1 });

revealElements.forEach(el => revealObserver.observe(el));

// ==================== PHOTO GALLERY ====================

let allPhotos = [];
let currentFilter = 'all';
let lightboxIndex = 0;
let filteredPhotos = [];

const galleryGrid = document.getElementById('gallery-grid');
const galleryLoading = document.getElementById('gallery-loading');
const galleryEmpty = document.getElementById('gallery-empty');
const filterBtns = document.querySelectorAll('.filter-btn');
const lightbox = document.getElementById('lightbox');

// Load photos from Firestore
async function loadPhotos() {
    galleryLoading.style.display = 'block';
    galleryEmpty.style.display = 'none';

    try {
        // Include the main wedding photo as "official"
        // Try to load its data from Firestore
        let mainData = {};
        try {
            const mainDoc = await db.collection('photos').doc('main').get();
            if (mainDoc.exists) mainData = mainDoc.data();
        } catch (e) { /* first time — doc doesn't exist yet */ }

        const officialPhotos = [{
            id: 'main',
            url: 'photos/main.png',
            name: 'Russ & Brit',
            caption: 'Our wedding day',
            type: 'official',
            likes: mainData.likes || 0,
            commentCount: mainData.commentCount || 0,
            order: mainData.order,
            gallery: mainData.gallery || null,
            timestamp: new Date('2025-01-01')
        }];

        // Fetch guest-uploaded photos from Firestore (only approved)
        const snapshot = await db.collection('photos')
            .where('status', '==', 'approved')
            .orderBy('timestamp', 'desc')
            .get();

        const guestPhotos = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            type: doc.data().type || 'guest',
            timestamp: doc.data().timestamp?.toDate() || new Date()
        }));

        allPhotos = [...officialPhotos, ...guestPhotos];

        // Sort by order field (lower = first), fallback to timestamp
        allPhotos.sort((a, b) => {
            const orderA = a.order !== undefined ? a.order : Infinity;
            const orderB = b.order !== undefined ? b.order : Infinity;
            if (orderA !== orderB) return orderA - orderB;
            return (a.timestamp || 0) - (b.timestamp || 0);
        });
        renderGallery();
        updateHeroSlideshow();
    } catch (error) {
        console.error('Error loading photos:', error);
        // Still show the main photo if Firestore fails
        allPhotos = [{
            id: 'main',
            url: 'photos/main.png',
            name: 'Russ & Brit',
            caption: 'Our wedding day',
            type: 'official',
            timestamp: new Date('2025-01-01')
        }];
        renderGallery();
    } finally {
        galleryLoading.style.display = 'none';
    }
}

// Hero slideshow — rotate first 10 official photos
let heroSlideInterval = null;
let heroSlideIndex = 0;
let heroPhotos = [];

function updateHeroSlideshow() {
    const officials = allPhotos.filter(p => p.type === 'official');
    heroPhotos = officials.slice(0, 10).map(p => p.url);
    // Always include main.png at position 0 if not already there
    if (heroPhotos.length === 0 || heroPhotos[0] !== 'photos/main.png') {
        heroPhotos.unshift('photos/main.png');
    }
    // Only start slideshow if we have more than 1 photo
    if (heroPhotos.length > 1 && !heroSlideInterval) {
        heroSlideIndex = 0;
        heroSlideInterval = setInterval(advanceHeroSlide, 6000);
    } else if (heroPhotos.length <= 1 && heroSlideInterval) {
        clearInterval(heroSlideInterval);
        heroSlideInterval = null;
    }
}

function advanceHeroSlide() {
    heroSlideIndex = (heroSlideIndex + 1) % heroPhotos.length;
    const imgA = document.getElementById('hero-img-a');
    const imgB = document.getElementById('hero-img-b');
    const isAActive = imgA.classList.contains('hero-img-active');
    const incoming = isAActive ? imgB : imgA;
    const outgoing = isAActive ? imgA : imgB;

    incoming.src = heroPhotos[heroSlideIndex];
    // Wait for image to load before fading
    incoming.onload = () => {
        incoming.classList.add('hero-img-active');
        outgoing.classList.remove('hero-img-active');
    };
    // Fallback if already cached
    if (incoming.complete) {
        incoming.classList.add('hero-img-active');
        outgoing.classList.remove('hero-img-active');
    }
}

function renderGallery() {
    if (currentFilter === 'all') {
        filteredPhotos = allPhotos;
    } else if (currentFilter === 'official' || currentFilter === 'guest') {
        filteredPhotos = allPhotos.filter(p => p.type === currentFilter);
    } else {
        // Custom gallery filter
        filteredPhotos = allPhotos.filter(p => p.gallery === currentFilter);
    }

    galleryGrid.innerHTML = '';
    galleryEmpty.style.display = filteredPhotos.length === 0 ? 'flex' : 'none';

    filteredPhotos.forEach((photo, index) => {
        const item = document.createElement('div');
        item.className = 'gallery-item';
        item.dataset.index = index;
        const likes = photo.likes || 0;
        const commentCount = photo.commentCount || 0;
        const isLiked = localStorage.getItem(`liked_${photo.id}`) === '1';
        const isGuest = photo.type === 'guest';
        const isVideo = photo.mediaType === 'video' || isVideoUrl(photo.url);
        item.innerHTML = `
            ${isVideo ? `
                <div class="gallery-video-wrap">
                    <video src="${photo.url}" preload="metadata" muted playsinline class="gallery-video-thumb"></video>
                    <div class="gallery-video-play">
                        <svg width="36" height="36" viewBox="0 0 24 24" fill="white" stroke="none">
                            <polygon points="5 3 19 12 5 21 5 3"/>
                        </svg>
                    </div>
                    <span class="gallery-video-badge">VIDEO</span>
                </div>
            ` : `
                <img src="${photo.url}" alt="${photo.caption || 'Wedding photo'}" loading="lazy">
            `}
            <div class="gallery-item-overlay">
                <p class="gallery-item-name">${escapeHtml(photo.name)}</p>
                ${photo.caption ? `<p class="gallery-item-caption">${escapeHtml(photo.caption)}</p>` : ''}
            </div>
            <button class="gallery-item-like ${isLiked ? 'liked' : ''}" data-photo-id="${photo.id}" title="Like">
                <svg class="heart-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
                <span>${likes}</span>
            </button>
            ${commentCount > 0 ? `<span class="gallery-item-comments">💬 ${commentCount}</span>` : ''}
            ${photo.id !== 'main' ? `
                <button class="gallery-item-delete" data-photo-id="${photo.id}" title="Delete photo">&times;</button>
                ${!(photo.mediaType === 'video' || isVideoUrl(photo.url)) ? `<button class="gallery-item-edit" data-photo-id="${photo.id}" title="Edit photo">✎</button>` : ''}
            ` : ''}
            <div class="gallery-item-move">
                <button class="move-btn move-left" title="Move left">◄</button>
                <button class="move-btn move-right" title="Move right">►</button>
            </div>
        `;
        // Click to open photo detail (but not if clicking buttons)
        item.addEventListener('click', (e) => {
            if (!e.target.closest('.gallery-item-delete') &&
                !e.target.closest('.gallery-item-edit') &&
                !e.target.closest('.gallery-item-like') &&
                !e.target.closest('.gallery-item-move')) {
                openPhotoDetail(photo, 'gallery', index);
            }
        });
        // Like handler on gallery card
        const likeBtn = item.querySelector('.gallery-item-like');
        likeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleLike(photo.id);
        });
        // Delete handler
        const deleteBtn = item.querySelector('.gallery-item-delete');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                confirmDelete('photo', photo.id, photo.url, photo.name);
            });
        }
        // Edit handler (everyone, name required)
        const editBtn = item.querySelector('.gallery-item-edit');
        if (editBtn) {
            editBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                requestEditorName(photo);
            });
        }
        // Move handlers (admin only)
        item.querySelector('.move-left').addEventListener('click', (e) => {
            e.stopPropagation();
            movePhoto(index, -1);
        });
        item.querySelector('.move-right').addEventListener('click', (e) => {
            e.stopPropagation();
            movePhoto(index, 1);
        });
        galleryGrid.appendChild(item);
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Admin: move photo left/right in gallery
async function movePhoto(currentIndex, direction) {
    if (!isAdminMode) return;
    const targetIndex = currentIndex + direction;
    if (targetIndex < 0 || targetIndex >= filteredPhotos.length) return;

    const photoA = filteredPhotos[currentIndex];
    const photoB = filteredPhotos[targetIndex];

    // Assign order values if they don't exist
    const orderA = photoA.order !== undefined ? photoA.order : currentIndex;
    const orderB = photoB.order !== undefined ? photoB.order : targetIndex;

    try {
        // Swap order values
        const refA = db.collection('photos').doc(photoA.id);
        const refB = db.collection('photos').doc(photoB.id);
        await refA.set({ order: orderB }, { merge: true });
        await refB.set({ order: orderA }, { merge: true });

        await loadPhotos();
        showToast('Photo moved', 'success');
    } catch (e) {
        console.error('Move photo error:', e);
        showToast('Failed to move photo', 'error');
    }
}

// Filter buttons (static ones)
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        renderGallery();
    });
});

// ==================== GALLERIES ====================

let allGalleries = [];
let editingGalleryId = null;

async function loadGalleries() {
    try {
        const snapshot = await db.collection('galleries')
            .orderBy('order', 'asc')
            .get();
        allGalleries = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderGalleryTabs();
    } catch (e) {
        console.log('No galleries yet');
        allGalleries = [];
    }
}

function renderGalleryTabs() {
    const container = document.getElementById('custom-gallery-tabs');
    const divider = document.querySelector('.gallery-tab-divider');
    container.innerHTML = '';

    if (allGalleries.length > 0) {
        divider.classList.add('has-tabs');
    } else {
        divider.classList.remove('has-tabs');
    }

    allGalleries.forEach(g => {
        const wrap = document.createElement('div');
        wrap.className = 'gallery-tab-wrap';
        const btn = document.createElement('button');
        btn.className = 'filter-btn';
        btn.dataset.filter = g.id;
        btn.textContent = g.name;
        if (currentFilter === g.id) btn.classList.add('active');
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = g.id;
            renderGallery();
        });
        wrap.appendChild(btn);

        // Admin edit icon
        const editIcon = document.createElement('button');
        editIcon.className = 'gallery-tab-edit';
        editIcon.innerHTML = '\u270e';
        editIcon.title = 'Edit gallery';
        editIcon.addEventListener('click', (e) => {
            e.stopPropagation();
            openGalleryModal(g);
        });
        wrap.appendChild(editIcon);

        container.appendChild(wrap);
    });
}

// Gallery create/edit modal
const galleryModal = document.getElementById('gallery-modal');
const galleryNameInput = document.getElementById('gallery-name-input');

document.getElementById('gallery-create-btn').addEventListener('click', () => {
    openGalleryModal(null);
});

function openGalleryModal(gallery) {
    editingGalleryId = gallery ? gallery.id : null;
    document.getElementById('gallery-modal-title').textContent = gallery ? 'Edit Gallery' : 'Create Gallery';
    document.getElementById('gallery-modal-submit').textContent = gallery ? 'Save' : 'Create';
    document.getElementById('gallery-modal-delete').style.display = gallery ? 'inline-block' : 'none';
    galleryNameInput.value = gallery ? gallery.name : '';
    galleryModal.style.display = 'flex';
    setTimeout(() => galleryNameInput.focus(), 100);
}

document.getElementById('gallery-modal-cancel').addEventListener('click', () => {
    galleryModal.style.display = 'none';
});

document.getElementById('gallery-modal-submit').addEventListener('click', async () => {
    const name = galleryNameInput.value.trim();
    if (!name) { showToast('Please enter a gallery name', 'error'); return; }

    try {
        if (editingGalleryId) {
            await db.collection('galleries').doc(editingGalleryId).update({ name });
            showToast('Gallery renamed', 'success');
        } else {
            await db.collection('galleries').add({
                name,
                order: allGalleries.length,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
            showToast('Gallery created! \ud83c\udf89', 'success');
        }
        galleryModal.style.display = 'none';
        await loadGalleries();
    } catch (e) {
        console.error('Gallery save error:', e);
        showToast('Failed to save gallery', 'error');
    }
});

document.getElementById('gallery-modal-delete').addEventListener('click', async () => {
    if (!editingGalleryId) return;
    if (!confirm('Delete this gallery? Photos will be unassigned but not deleted.')) return;

    try {
        // Unassign all photos from this gallery
        const photos = await db.collection('photos')
            .where('gallery', '==', editingGalleryId)
            .get();
        const batch = db.batch();
        photos.forEach(doc => {
            batch.update(doc.ref, { gallery: firebase.firestore.FieldValue.delete() });
        });
        await batch.commit();

        await db.collection('galleries').doc(editingGalleryId).delete();
        galleryModal.style.display = 'none';
        currentFilter = 'all';
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        document.getElementById('filter-all').classList.add('active');
        await loadGalleries();
        await loadPhotos();
        showToast('Gallery deleted', 'success');
    } catch (e) {
        console.error('Gallery delete error:', e);
        showToast('Failed to delete gallery', 'error');
    }
});

// Gallery assign on photo detail
const galleryAssignSelect = document.getElementById('gallery-assign-select');

function populateGalleryAssign(currentGalleryId) {
    galleryAssignSelect.innerHTML = '<option value="">None</option>';
    allGalleries.forEach(g => {
        const opt = document.createElement('option');
        opt.value = g.id;
        opt.textContent = g.name;
        if (g.id === currentGalleryId) opt.selected = true;
        galleryAssignSelect.appendChild(opt);
    });
}

galleryAssignSelect.addEventListener('change', async () => {
    if (!currentDetailPhoto) return;
    const galleryId = galleryAssignSelect.value;
    try {
        if (galleryId) {
            await db.collection('photos').doc(currentDetailPhoto.id)
                .set({ gallery: galleryId }, { merge: true });
        } else {
            await db.collection('photos').doc(currentDetailPhoto.id)
                .update({ gallery: firebase.firestore.FieldValue.delete() });
        }
        currentDetailPhoto.gallery = galleryId || null;
        await loadPhotos();
        const galleryName = allGalleries.find(g => g.id === galleryId)?.name || 'None';
        showToast(`Assigned to: ${galleryName}`, 'success');
    } catch (e) {
        console.error('Gallery assign error:', e);
        showToast('Failed to assign gallery', 'error');
    }
});

// Load galleries on init
loadGalleries();

// ==================== LIKES & COMMENTS ====================

let currentDetailPhoto = null;
let detailSource = 'gallery'; // 'gallery' or 'staging'
let detailIndex = 0;
const photoDetailModal = document.getElementById('photo-detail-modal');

// Toggle like on a photo
async function toggleLike(photoId) {
    const key = `liked_${photoId}`;
    const alreadyLiked = localStorage.getItem(key) === '1';

    try {
        const ref = db.collection('photos').doc(photoId);
        if (alreadyLiked) {
            await ref.set({ likes: firebase.firestore.FieldValue.increment(-1) }, { merge: true });
            localStorage.removeItem(key);
        } else {
            await ref.set({ likes: firebase.firestore.FieldValue.increment(1) }, { merge: true });
            localStorage.setItem(key, '1');
        }
        await loadPhotos();
        if (currentDetailPhoto && currentDetailPhoto.id === photoId) {
            const doc = await ref.get();
            updateDetailLike(doc.data().likes || 0, !alreadyLiked);
        }
    } catch (e) {
        console.error('Like error:', e);
    }
}

function updateDetailLike(count, liked) {
    const btn = document.getElementById('photo-detail-like-btn');
    document.getElementById('photo-detail-like-count').textContent = count;
    btn.classList.toggle('liked', liked);
}

// Get the photo list for the current detail source
function getDetailList() {
    return detailSource === 'staging' ? stagingPhotos : filteredPhotos;
}

// Open photo detail modal
function openPhotoDetail(photo, source, index) {
    if (source !== undefined) detailSource = source;
    if (index !== undefined) detailIndex = index;
    currentDetailPhoto = photo;

    const isVideo = photo.mediaType === 'video' || isVideoUrl(photo.url);
    const imgEl = document.getElementById('photo-detail-img');
    const videoEl = document.getElementById('photo-detail-video');

    if (isVideo) {
        imgEl.style.display = 'none';
        videoEl.style.display = 'block';
        videoEl.src = photo.url;
        videoEl.load();
    } else {
        videoEl.style.display = 'none';
        videoEl.src = '';
        imgEl.style.display = 'block';
        imgEl.src = photo.url;
    }

    document.getElementById('photo-detail-name').textContent = photo.name || 'Unknown';
    document.getElementById('photo-detail-caption').textContent = photo.caption || '';

    document.querySelector('.photo-detail-like-row').style.display = 'block';
    document.querySelector('.comment-form').style.display = 'flex';

    const liked = localStorage.getItem(`liked_${photo.id}`) === '1';
    updateDetailLike(photo.likes || 0, liked);
    loadComments(photo.id);

    // Admin: show promote/demote button
    const promoteBtn = document.getElementById('admin-promote-btn');
    if (promoteBtn) {
        if (isAdminMode && photo.id !== 'main') {
            promoteBtn.style.display = 'inline-block';
            const isOfficial = photo.type === 'official';
            promoteBtn.textContent = isOfficial ? '↓ Demote to Guest' : '★ Promote to Official';
            promoteBtn.className = isOfficial ? 'admin-promote-btn demote' : 'admin-promote-btn';
        } else {
            promoteBtn.style.display = 'none';
        }
    }

    // Admin: show send-to-pending button (for approved photos only)
    const pendingBtn = document.getElementById('admin-pending-btn');
    if (pendingBtn) {
        if (isAdminMode && photo.id !== 'main' && detailSource === 'gallery' && photo.status !== 'pending') {
            pendingBtn.style.display = 'inline-block';
        } else {
            pendingBtn.style.display = 'none';
        }
    }

    // Admin: show gallery assign dropdown (not for main photo)
    const galleryAssignDiv = document.getElementById('admin-gallery-assign');
    if (galleryAssignDiv) {
        if (isAdminMode && photo.id !== 'main') {
            galleryAssignDiv.style.display = 'flex';
            populateGalleryAssign(photo.gallery || '');
        } else {
            galleryAssignDiv.style.display = 'none';
        }
    }

    // Show/hide staging actions
    const stagingActionsDiv = document.getElementById('photo-detail-staging-actions');
    stagingActionsDiv.style.display = (detailSource === 'staging') ? 'flex' : 'none';
    // Hide edit button in staging actions for videos
    const detailEditBtn = document.getElementById('detail-staging-edit');
    const isDetailVideo = photo.mediaType === 'video' || isVideoUrl(photo.url);
    if (detailEditBtn) detailEditBtn.style.display = isDetailVideo ? 'none' : 'inline-block';

    // Show/hide prev/next (hide if only 1 photo in list)
    const list = getDetailList();
    const showNav = list.length > 1;
    document.getElementById('photo-detail-prev').style.display = showNav ? 'flex' : 'none';
    document.getElementById('photo-detail-next').style.display = showNav ? 'flex' : 'none';

    photoDetailModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

// Navigate to prev/next photo in the detail modal
function navigateDetail(direction) {
    const list = getDetailList();
    if (list.length <= 1) return;
    detailIndex = (detailIndex + direction + list.length) % list.length;
    openPhotoDetail(list[detailIndex]);
}

function closePhotoDetail() {
    photoDetailModal.style.display = 'none';
    document.body.style.overflow = '';
    currentDetailPhoto = null;
    // Stop video playback
    const videoEl = document.getElementById('photo-detail-video');
    if (videoEl) { videoEl.pause(); videoEl.src = ''; }
}

document.getElementById('photo-detail-close').addEventListener('click', closePhotoDetail);
photoDetailModal.addEventListener('click', (e) => {
    if (e.target === photoDetailModal) closePhotoDetail();
});

// Prev/next buttons
document.getElementById('photo-detail-prev').addEventListener('click', () => navigateDetail(-1));
document.getElementById('photo-detail-next').addEventListener('click', () => navigateDetail(1));

document.getElementById('photo-detail-like-btn').addEventListener('click', () => {
    if (currentDetailPhoto) toggleLike(currentDetailPhoto.id);
});

// Staging actions inside detail modal
document.getElementById('detail-staging-approve').addEventListener('click', async () => {
    if (!currentDetailPhoto) return;
    const photoId = currentDetailPhoto.id;
    await approvePhoto(photoId);
    // Close the modal after approval
    closePhotoDetail();
});
});

document.getElementById('detail-staging-edit').addEventListener('click', () => {
    if (!currentDetailPhoto) return;
    closePhotoDetail();
    openGalleryPhotoEditor(currentDetailPhoto);
});

document.getElementById('detail-staging-reject').addEventListener('click', () => {
    if (!currentDetailPhoto) return;
    confirmDelete('photo', currentDetailPhoto.id, currentDetailPhoto.url, currentDetailPhoto.name);
});

// Load comments
async function loadComments(photoId) {
    const list = document.getElementById('comments-list');
    list.innerHTML = '<p class="comments-empty">Loading...</p>';

    try {
        const snapshot = await db.collection('photos').doc(photoId)
            .collection('comments')
            .orderBy('timestamp', 'asc')
            .get();

        if (snapshot.empty) {
            list.innerHTML = '<p class="comments-empty">No comments yet — be the first!</p>';
            return;
        }

        list.innerHTML = '';
        snapshot.forEach(doc => {
            const c = doc.data();
            const time = c.timestamp?.toDate();
            const timeStr = time ? time.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : '';
            const item = document.createElement('div');
            item.className = 'comment-item';
            item.innerHTML = `
                <p class="comment-author">${escapeHtml(c.name)}</p>
                <p class="comment-text">${escapeHtml(c.text)}</p>
                <p class="comment-time">${timeStr}</p>
                ${isAdminMode ? `<button class="comment-delete-btn" data-comment-id="${doc.id}" title="Delete comment">✕</button>` : ''}
            `;
            // Admin delete comment
            const delBtn = item.querySelector('.comment-delete-btn');
            if (delBtn) {
                delBtn.addEventListener('click', () => deleteComment(photoId, doc.id));
            }
            list.appendChild(item);
        });

        const commentsDiv = document.getElementById('photo-detail-comments');
        commentsDiv.scrollTop = commentsDiv.scrollHeight;
    } catch (e) {
        console.error('Load comments error:', e);
        list.innerHTML = '<p class="comments-empty">Could not load comments</p>';
    }
}

// Post comment
document.getElementById('comment-submit').addEventListener('click', async () => {
    if (!currentDetailPhoto) return;
    const nameInput = document.getElementById('comment-name');
    const textInput = document.getElementById('comment-text');
    const name = nameInput.value.trim();
    const text = textInput.value.trim();

    if (!name) { showToast('Please enter your name', 'error'); nameInput.focus(); return; }
    if (!text) { showToast('Please enter a comment', 'error'); textInput.focus(); return; }

    const btn = document.getElementById('comment-submit');
    btn.disabled = true;
    btn.textContent = '...';

    try {
        await db.collection('photos').doc(currentDetailPhoto.id)
            .collection('comments').add({
                name: name,
                text: text,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });

        // Update comment count
        await db.collection('photos').doc(currentDetailPhoto.id)
            .set({ commentCount: firebase.firestore.FieldValue.increment(1) }, { merge: true });

        textInput.value = '';
        loadComments(currentDetailPhoto.id);
        loadPhotos();
        showToast('Comment posted! 💬', 'success');
    } catch (e) {
        console.error('Post comment error:', e);
        showToast('Failed to post comment', 'error');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Post';
    }
});

document.getElementById('comment-text').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') document.getElementById('comment-submit').click();
});

document.addEventListener('keydown', (e) => {
    if (photoDetailModal.style.display !== 'none') {
        if (e.key === 'Escape') closePhotoDetail();
        if (e.key === 'ArrowLeft') navigateDetail(-1);
        if (e.key === 'ArrowRight') navigateDetail(1);
    }
});

// Admin: delete a comment
async function deleteComment(photoId, commentId) {
    try {
        await db.collection('photos').doc(photoId)
            .collection('comments').doc(commentId).delete();
        await db.collection('photos').doc(photoId)
            .set({ commentCount: firebase.firestore.FieldValue.increment(-1) }, { merge: true });
        showToast('Comment deleted', 'success');
        loadComments(photoId);
        loadPhotos();
    } catch (e) {
        console.error('Delete comment error:', e);
        showToast('Failed to delete comment', 'error');
    }
}

// Admin: reset likes on current photo
async function resetPhotoLikes() {
    if (!currentDetailPhoto) return;
    try {
        await db.collection('photos').doc(currentDetailPhoto.id)
            .set({ likes: 0 }, { merge: true });
        localStorage.removeItem(`liked_${currentDetailPhoto.id}`);
        updateDetailLike(0, false);
        await loadPhotos();
        showToast('Likes reset to 0', 'success');
    } catch (e) {
        console.error('Reset likes error:', e);
        showToast('Failed to reset likes', 'error');
    }
}

// Admin: promote/demote photo type
async function togglePhotoType() {
    if (!currentDetailPhoto || currentDetailPhoto.id === 'main') return;
    const newType = currentDetailPhoto.type === 'official' ? 'guest' : 'official';
    try {
        await db.collection('photos').doc(currentDetailPhoto.id)
            .update({ type: newType });
        currentDetailPhoto.type = newType;
        const promoteBtn = document.getElementById('admin-promote-btn');
        const isOfficial = newType === 'official';
        promoteBtn.textContent = isOfficial ? '↓ Demote to Guest' : '★ Promote to Official';
        promoteBtn.className = isOfficial ? 'admin-promote-btn demote' : 'admin-promote-btn';
        await loadPhotos();
        showToast(isOfficial ? 'Photo promoted to Official! ⭐' : 'Photo moved back to Guest', 'success');
    } catch (e) {
        console.error('Promote error:', e);
        showToast('Failed to change photo type', 'error');
    }
}

// Admin: send approved photo back to pending
async function sendToPending() {
    if (!currentDetailPhoto || currentDetailPhoto.id === 'main') return;
    try {
        await db.collection('photos').doc(currentDetailPhoto.id)
            .update({ status: 'pending' });
        showToast('Sent back to Pending Approval', 'success');
        closePhotoDetail();
        await loadPhotos();
        await loadStagingPhotos();
    } catch (e) {
        console.error('Send to pending error:', e);
        showToast('Failed to send to pending', 'error');
    }
}

// Lightbox
function openLightbox(index) {
    lightboxIndex = index;
    updateLightbox();
    lightbox.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    lightbox.style.display = 'none';
    document.body.style.overflow = '';
    // Stop video playback
    const videoEl = document.getElementById('lightbox-video');
    if (videoEl) { videoEl.pause(); videoEl.src = ''; }
}

function updateLightbox() {
    const photo = filteredPhotos[lightboxIndex];
    if (!photo) return;
    const isVideo = photo.mediaType === 'video' || isVideoUrl(photo.url);
    const imgEl = document.getElementById('lightbox-img');
    const videoEl = document.getElementById('lightbox-video');

    if (isVideo) {
        imgEl.style.display = 'none';
        videoEl.style.display = 'block';
        videoEl.src = photo.url;
        videoEl.load();
    } else {
        videoEl.style.display = 'none';
        videoEl.src = '';
        imgEl.style.display = 'block';
        imgEl.src = photo.url;
    }

    document.getElementById('lightbox-caption').textContent = photo.caption || '';
    document.getElementById('lightbox-credit').textContent = `Photo by ${photo.name}`;
}

document.getElementById('lightbox-close').addEventListener('click', closeLightbox);
document.getElementById('lightbox-prev').addEventListener('click', () => {
    lightboxIndex = (lightboxIndex - 1 + filteredPhotos.length) % filteredPhotos.length;
    updateLightbox();
});
document.getElementById('lightbox-next').addEventListener('click', () => {
    lightboxIndex = (lightboxIndex + 1) % filteredPhotos.length;
    updateLightbox();
});

// Keyboard nav for lightbox
document.addEventListener('keydown', (e) => {
    if (lightbox.style.display === 'none') return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') {
        lightboxIndex = (lightboxIndex - 1 + filteredPhotos.length) % filteredPhotos.length;
        updateLightbox();
    }
    if (e.key === 'ArrowRight') {
        lightboxIndex = (lightboxIndex + 1) % filteredPhotos.length;
        updateLightbox();
    }
});

// Lightbox backdrop click
lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
});

// Initial load
loadPhotos();

// ==================== PHOTO UPLOAD ====================

const dropzone = document.getElementById('upload-dropzone');
const photoInput = document.getElementById('photo-input');
const uploadPreviews = document.getElementById('upload-previews');
const uploadForm = document.getElementById('upload-form');
const uploadSubmit = document.getElementById('upload-submit');
const uploadProgress = document.getElementById('upload-progress');
const progressFill = document.getElementById('progress-fill');
const progressText = document.getElementById('progress-text');

let selectedFiles = [];

// Drag & drop
dropzone.addEventListener('click', () => photoInput.click());

dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.classList.add('dragover');
});

dropzone.addEventListener('dragleave', () => {
    dropzone.classList.remove('dragover');
});

dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('dragover');
    handleFiles(e.dataTransfer.files);
});

photoInput.addEventListener('change', () => {
    handleFiles(photoInput.files);
});

function handleFiles(fileList) {
    const validImageTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const validVideoTypes = ['video/mp4', 'video/quicktime', 'video/webm', 'video/x-m4v'];
    const maxImageSize = 10 * 1024 * 1024; // 10MB
    const maxVideoSize = 100 * 1024 * 1024; // 100MB

    Array.from(fileList).forEach(file => {
        const isImage = validImageTypes.includes(file.type);
        const isVideo = validVideoTypes.includes(file.type);

        if (!isImage && !isVideo) {
            showToast(`${file.name} is not a supported format`, 'error');
            return;
        }
        if (isImage && file.size > maxImageSize) {
            showToast(`${file.name} exceeds 10MB limit`, 'error');
            return;
        }
        if (isVideo && file.size > maxVideoSize) {
            showToast(`${file.name} exceeds 100MB limit`, 'error');
            return;
        }
        if (selectedFiles.length >= 150) {
            showToast('Maximum 150 files at a time', 'warning');
            return;
        }
        selectedFiles.push(file);
    });

    renderPreviews();
    uploadSubmit.disabled = selectedFiles.length === 0;
}

function renderPreviews() {
    uploadPreviews.innerHTML = '';
    selectedFiles.forEach((file, index) => {
        const item = document.createElement('div');
        item.className = 'upload-preview-item';
        const isVideo = isVideoFile(file);

        if (isVideo) {
            const vid = document.createElement('video');
            vid.src = URL.createObjectURL(file);
            vid.muted = true;
            vid.preload = 'metadata';
            vid.className = 'upload-preview-video';
            const badge = document.createElement('span');
            badge.className = 'upload-preview-video-badge';
            badge.textContent = '▶ VIDEO';
            item.appendChild(vid);
            item.appendChild(badge);
        } else {
            const img = document.createElement('img');
            img.src = URL.createObjectURL(file);
            img.alt = file.name;
            item.appendChild(img);
            // Edit button (only for images)
            const editBtn = document.createElement('button');
            editBtn.className = 'upload-preview-edit';
            editBtn.innerHTML = '✎';
            editBtn.title = 'Edit photo';
            editBtn.addEventListener('click', () => {
                openPhotoEditor(index);
            });
            item.appendChild(editBtn);
        }

        const removeBtn = document.createElement('button');
        removeBtn.className = 'upload-preview-remove';
        removeBtn.innerHTML = '&times;';
        removeBtn.addEventListener('click', () => {
            selectedFiles.splice(index, 1);
            renderPreviews();
            uploadSubmit.disabled = selectedFiles.length === 0;
        });
        item.appendChild(removeBtn);
        uploadPreviews.appendChild(item);
    });
}

// Upload form submission
uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('uploader-name').value.trim();
    const caption = document.getElementById('photo-caption').value.trim();
    const makeZip = document.getElementById('make-zip-file').checked;

    if (!name) {
        showToast('Please enter your name', 'error');
        return;
    }

    if (selectedFiles.length === 0) {
        showToast('Please select photos or videos to upload', 'error');
        return;
    }

    // Show progress
    uploadSubmit.querySelector('.btn-text').style.display = 'none';
    uploadSubmit.querySelector('.btn-loader').style.display = 'inline-flex';
    uploadSubmit.disabled = true;
    uploadProgress.style.display = 'block';

    let uploaded = 0;
    const total = selectedFiles.length;
    try {
        if (makeZip) {
            // === ZIP-ONLY MODE: no individual uploads, just create zip ===
            const zipBlobs = [];
            const zipNames = [];

            for (const file of selectedFiles) {
                const fileId = generateId();
                const fileIsVideo = isVideoFile(file);

                let blob;
                let ext;

                if (fileIsVideo) {
                    blob = file;
                    ext = file.name.split('.').pop().toLowerCase() || 'mp4';
                    progressText.textContent = `Preparing video ${uploaded + 1} of ${total}...`;
                } else {
                    progressText.textContent = `Converting ${uploaded + 1} of ${total} to JPG...`;
                    blob = await convertToJpg(file);
                    ext = 'jpg';
                }

                zipBlobs.push(blob);
                zipNames.push(`${fileId}.${ext}`);

                uploaded++;
                const pct = Math.round((uploaded / total) * 50); // first 50% for prep
                progressFill.style.width = pct + '%';
            }

            // Create zip
            progressText.textContent = 'Creating zip file...';
            const zip = new JSZip();
            for (let i = 0; i < zipBlobs.length; i++) {
                zip.file(zipNames[i], zipBlobs[i]);
            }

            const zipBlob = await zip.generateAsync({ type: 'blob' }, (meta) => {
                const pct = 50 + Math.round(meta.percent * 0.3); // 50-80%
                progressFill.style.width = pct + '%';
                progressText.textContent = `Compressing zip: ${Math.round(meta.percent)}%...`;
            });

            // Generate zip filename: name-MMDDYY-random.zip
            const now = new Date();
            const pad = (n) => String(n).padStart(2, '0');
            const dateStr = pad(now.getMonth() + 1) +
                           pad(now.getDate()) +
                           pad(now.getFullYear() % 100);
            const safeName = name.replace(/[^a-zA-Z0-9]/g, '');
            const rand = Math.floor(Math.random() * 100) + 1;
            const zipFilename = `${safeName}-${dateStr}-${rand}.zip`;

            // Upload zip to Firebase Storage under downloads/
            const zipRef = storage.ref(`downloads/${zipFilename}`);
            progressText.textContent = 'Uploading zip file...';
            progressFill.style.width = '80%';
            const zipUpload = await zipRef.put(zipBlob, {
                contentType: 'application/zip'
            });
            const zipUrl = await zipUpload.ref.getDownloadURL();
            progressFill.style.width = '95%';

            // Save zip metadata to Firestore
            await db.collection('downloads').add({
                filename: zipFilename,
                url: zipUrl,
                uploaderName: name,
                fileCount: zipBlobs.length,
                size: zipBlob.size,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });

            progressFill.style.width = '100%';
            showToast(`Zip created with ${uploaded} file${uploaded > 1 ? 's' : ''}! 📦 Available on Downloads page.`, 'success');

        } else {
            // === NORMAL MODE: individual uploads with pending approval ===
            const safeName = name.replace(/[^a-zA-Z0-9]/g, '') || 'Unknown';
            const safeCaption = caption.replace(/[^a-zA-Z0-9]/g, '').substring(0, 30);
            const uploadSession = `${safeName}_${safeCaption ? safeCaption + '_' : ''}${generateId()}`;
            for (const file of selectedFiles) {
                const fileId = generateId();
                const fileIsVideo = isVideoFile(file);

                let uploadBlob;
                let storagePath;
                let contentType;

                if (fileIsVideo) {
                    const ext = file.name.split('.').pop().toLowerCase() || 'mp4';
                    storagePath = `photos/${fileId}.${ext}`;
                    contentType = file.type;
                    uploadBlob = file;
                    progressText.textContent = `Uploading video ${uploaded + 1} of ${total}...`;
                } else {
                    progressText.textContent = `Converting ${uploaded + 1} of ${total} to JPG...`;
                    uploadBlob = await convertToJpg(file);
                    storagePath = `photos/${fileId}.jpg`;
                    contentType = 'image/jpeg';
                }

                const storageRef = storage.ref(storagePath);
                const uploadTask = await storageRef.put(uploadBlob, {
                    contentType: contentType
                });
                const url = await uploadTask.ref.getDownloadURL();

                // Save metadata to Firestore (pending approval)
                await db.collection('photos').add({
                    url: url,
                    originalUrl: url,
                    name: name,
                    caption: caption,
                    type: 'guest',
                    mediaType: fileIsVideo ? 'video' : 'image',
                    status: 'pending',
                    uploadSession: uploadSession,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp()
                });

                uploaded++;
                const pct = Math.round((uploaded / total) * 100);
                progressFill.style.width = pct + '%';
                progressText.textContent = `Uploading ${uploaded} of ${total}...`;
            }

            showToast(`${uploaded} file${uploaded > 1 ? 's' : ''} uploaded! Pending admin approval.`, 'success');
        }

        // Reset form
        selectedFiles = [];
        renderPreviews();
        document.getElementById('uploader-name').value = '';
        document.getElementById('photo-caption').value = '';
        document.getElementById('make-zip-file').checked = false;
        photoInput.value = '';

        // Reload gallery
        loadPhotos();

    } catch (error) {
        console.error('Upload error:', error);
        showToast('Upload failed. Please try again.', 'error');
    } finally {
        uploadSubmit.querySelector('.btn-text').style.display = 'inline';
        uploadSubmit.querySelector('.btn-loader').style.display = 'none';
        uploadSubmit.disabled = selectedFiles.length === 0;
        uploadProgress.style.display = 'none';
        progressFill.style.width = '0%';
    }
});

// ==================== GUESTBOOK ====================

const guestbookForm = document.getElementById('guestbook-form');
const guestbookEntries = document.getElementById('guestbook-entries');
const guestbookLoading = document.getElementById('guestbook-loading');
const guestbookSubmit = document.getElementById('guestbook-submit');
const typeBtns = document.querySelectorAll('.type-btn');
const messageInputs = document.querySelectorAll('.message-input');

let currentMessageType = 'text';
let audioBlob = null;
let videoBlob = null;
let mediaRecorder = null;
let mediaStream = null;
let audioChunks = [];
let videoChunks = [];

// Message type switching
typeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        typeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentMessageType = btn.dataset.type;

        messageInputs.forEach(input => {
            input.style.display = input.id === `input-${currentMessageType}` ? 'block' : 'none';
        });

        // Initialize camera if video selected
        if (currentMessageType === 'video') {
            initVideoStream();
        } else {
            stopMediaStream();
        }
    });
});

// ---- Audio Recording ----
const audioRecordBtn = document.getElementById('audio-record-btn');
const audioStopBtn = document.getElementById('audio-stop-btn');
const audioPlayback = document.getElementById('audio-playback');
const audioPreview = document.getElementById('audio-preview');
const audioDiscard = document.getElementById('audio-discard');
const audioCanvas = document.getElementById('audio-canvas');

let audioCtx, audioAnalyser, audioAnimId;

audioRecordBtn.addEventListener('click', async () => {
    try {
        mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(mediaStream);
        audioChunks = [];

        mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) audioChunks.push(e.data);
        };

        mediaRecorder.onstop = () => {
            audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
            audioPreview.src = URL.createObjectURL(audioBlob);
            audioPlayback.style.display = 'flex';
            audioRecordBtn.style.display = 'flex';
            audioStopBtn.style.display = 'none';
            audioRecordBtn.classList.remove('recording');
            stopAudioVisualization();
            stopMediaStream();
        };

        mediaRecorder.start();
        audioRecordBtn.style.display = 'none';
        audioStopBtn.style.display = 'flex';
        audioRecordBtn.classList.add('recording');

        // Start visualizer
        startAudioVisualization(mediaStream);

        // Auto-stop after 60 seconds
        setTimeout(() => {
            if (mediaRecorder && mediaRecorder.state === 'recording') {
                mediaRecorder.stop();
            }
        }, 60000);

    } catch (err) {
        console.error('Audio error:', err);
        showToast('Could not access microphone. Please check permissions.', 'error');
    }
});

audioStopBtn.addEventListener('click', () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
    }
});

audioDiscard.addEventListener('click', () => {
    audioBlob = null;
    audioPreview.src = '';
    audioPlayback.style.display = 'none';
});

function startAudioVisualization(stream) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    audioAnalyser = audioCtx.createAnalyser();
    const source = audioCtx.createMediaStreamSource(stream);
    source.connect(audioAnalyser);
    audioAnalyser.fftSize = 256;

    const canvas = audioCanvas;
    const ctx = canvas.getContext('2d');
    const bufferLength = audioAnalyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    function draw() {
        audioAnimId = requestAnimationFrame(draw);
        audioAnalyser.getByteFrequencyData(dataArray);

        ctx.fillStyle = 'rgba(26, 26, 46, 0.3)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const barWidth = (canvas.width / bufferLength) * 2.5;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
            const barHeight = (dataArray[i] / 255) * canvas.height;

            const gradient = ctx.createLinearGradient(0, canvas.height, 0, canvas.height - barHeight);
            gradient.addColorStop(0, '#8a6d2b');
            gradient.addColorStop(1, '#e8d48b');

            ctx.fillStyle = gradient;
            ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
            x += barWidth + 1;
        }
    }

    draw();
}

function stopAudioVisualization() {
    if (audioAnimId) cancelAnimationFrame(audioAnimId);
    if (audioCtx) audioCtx.close();
}

// ---- Video Recording ----
const videoRecordBtn = document.getElementById('video-record-btn');
const videoStopBtn = document.getElementById('video-stop-btn');
const videoLive = document.getElementById('video-live');
const videoPreviewEl = document.getElementById('video-preview');
const videoPlaybackControls = document.getElementById('video-playback-controls');
const videoDiscard = document.getElementById('video-discard');
const videoFileBtn = document.getElementById('video-file-btn');
const videoFileInput = document.getElementById('video-file-input');

async function initVideoStream() {
    try {
        if (mediaStream) stopMediaStream();
        mediaStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
            audio: true
        });
        videoLive.srcObject = mediaStream;
        videoLive.style.display = 'block';
        videoPreviewEl.style.display = 'none';
    } catch (err) {
        console.error('Video error:', err);
        showToast('Could not access camera. You can upload a video file instead.', 'warning');
    }
}

videoRecordBtn.addEventListener('click', () => {
    if (!mediaStream) {
        showToast('Camera not available. Try uploading a video file.', 'error');
        return;
    }

    mediaRecorder = new MediaRecorder(mediaStream);
    videoChunks = [];

    mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) videoChunks.push(e.data);
    };

    mediaRecorder.onstop = () => {
        videoBlob = new Blob(videoChunks, { type: 'video/webm' });
        videoPreviewEl.src = URL.createObjectURL(videoBlob);
        videoLive.style.display = 'none';
        videoPreviewEl.style.display = 'block';
        videoPlaybackControls.style.display = 'flex';
        videoRecordBtn.style.display = 'flex';
        videoStopBtn.style.display = 'none';
        videoRecordBtn.classList.remove('recording');
        stopMediaStream();
    };

    mediaRecorder.start();
    videoRecordBtn.style.display = 'none';
    videoStopBtn.style.display = 'flex';
    videoRecordBtn.classList.add('recording');

    // Auto-stop at 30 seconds
    setTimeout(() => {
        if (mediaRecorder && mediaRecorder.state === 'recording') {
            mediaRecorder.stop();
        }
    }, 30000);
});

videoStopBtn.addEventListener('click', () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
    }
});

videoDiscard.addEventListener('click', () => {
    videoBlob = null;
    videoPreviewEl.src = '';
    videoPreviewEl.style.display = 'none';
    videoPlaybackControls.style.display = 'none';
    initVideoStream();
});

// Video file upload
videoFileBtn.addEventListener('click', () => videoFileInput.click());

videoFileInput.addEventListener('change', () => {
    const file = videoFileInput.files[0];
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) {
        showToast('Video must be under 50MB', 'error');
        return;
    }
    videoBlob = file;
    videoPreviewEl.src = URL.createObjectURL(file);
    videoLive.style.display = 'none';
    videoPreviewEl.style.display = 'block';
    videoPlaybackControls.style.display = 'flex';
    stopMediaStream();
});

function stopMediaStream() {
    if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
        mediaStream = null;
    }
}

// ---- Guestbook Form Submit ----
guestbookForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('guest-name').value.trim();
    if (!name) {
        showToast('Please enter your name', 'error');
        return;
    }

    guestbookSubmit.querySelector('.btn-text').style.display = 'none';
    guestbookSubmit.querySelector('.btn-loader').style.display = 'inline-flex';
    guestbookSubmit.disabled = true;

    try {
        const entry = {
            name: name,
            type: currentMessageType,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        };

        if (currentMessageType === 'text') {
            const message = document.getElementById('guest-message').value.trim();
            if (!message) {
                showToast('Please write a message', 'error');
                throw new Error('Empty message');
            }
            entry.message = message;

        } else if (currentMessageType === 'audio') {
            if (!audioBlob) {
                showToast('Please record an audio message', 'error');
                throw new Error('No audio');
            }
            const audioId = generateId();
            const ref = storage.ref(`guestbook/audio_${audioId}.webm`);
            await ref.put(audioBlob);
            entry.mediaUrl = await ref.getDownloadURL();

        } else if (currentMessageType === 'video') {
            if (!videoBlob) {
                showToast('Please record or upload a video', 'error');
                throw new Error('No video');
            }
            const videoId = generateId();
            const ext = videoBlob.name ? videoBlob.name.split('.').pop() : 'webm';
            const ref = storage.ref(`guestbook/video_${videoId}.${ext}`);
            await ref.put(videoBlob);
            entry.mediaUrl = await ref.getDownloadURL();
        }

        await db.collection('guestbook').add(entry);

        showToast('Thank you for signing our guestbook! 💛', 'success');

        // Reset form
        document.getElementById('guest-name').value = '';
        document.getElementById('guest-message').value = '';
        audioBlob = null;
        videoBlob = null;
        if (audioPlayback) audioPlayback.style.display = 'none';
        if (audioPreview) audioPreview.src = '';
        if (videoPreviewEl) {
            videoPreviewEl.style.display = 'none';
            videoPreviewEl.src = '';
        }
        if (videoPlaybackControls) videoPlaybackControls.style.display = 'none';

        // Switch back to text
        typeBtns.forEach(b => b.classList.remove('active'));
        document.getElementById('type-text').classList.add('active');
        currentMessageType = 'text';
        messageInputs.forEach(input => {
            input.style.display = input.id === 'input-text' ? 'block' : 'none';
        });
        stopMediaStream();

        // Reload entries
        loadGuestbookEntries();

    } catch (error) {
        if (error.message !== 'Empty message' && error.message !== 'No audio' && error.message !== 'No video') {
            console.error('Guestbook error:', error);
            showToast('Something went wrong. Please try again.', 'error');
        }
    } finally {
        guestbookSubmit.querySelector('.btn-text').style.display = 'inline';
        guestbookSubmit.querySelector('.btn-loader').style.display = 'none';
        guestbookSubmit.disabled = false;
    }
});

// ---- Load Guestbook Entries ----
async function loadGuestbookEntries() {
    guestbookLoading.style.display = 'block';

    try {
        const snapshot = await db.collection('guestbook')
            .orderBy('timestamp', 'desc')
            .limit(50)
            .get();

        guestbookEntries.innerHTML = '';

        if (snapshot.empty) {
            guestbookEntries.innerHTML = `
                <div class="gallery-empty" style="display:flex;">
                    <div class="empty-icon">💌</div>
                    <p>No messages yet — be the first to leave one!</p>
                </div>
            `;
        } else {
            snapshot.docs.forEach(doc => {
                const data = doc.data();
                const date = data.timestamp?.toDate() || new Date();
                const entryEl = createEntryElement(data, date, doc.id);
                guestbookEntries.appendChild(entryEl);
            });
        }
    } catch (error) {
        console.error('Error loading guestbook:', error);
        guestbookEntries.innerHTML = `
            <div class="gallery-empty" style="display:flex;">
                <div class="empty-icon">💌</div>
                <p>Be the first to sign the guestbook!</p>
            </div>
        `;
    } finally {
        guestbookLoading.style.display = 'none';
    }
}

function createEntryElement(data, date, docId) {
    const div = document.createElement('div');
    div.className = 'guestbook-entry';

    const typeIcons = { text: '💬', audio: '🎙', video: '🎥' };
    const typeLabels = { text: 'Text', audio: 'Audio', video: 'Video' };

    let bodyContent = '';
    if (data.type === 'text') {
        bodyContent = `<p>${escapeHtml(data.message || '')}</p>`;
    } else if (data.type === 'audio') {
        bodyContent = `<audio controls src="${data.mediaUrl}" preload="none"></audio>`;
    } else if (data.type === 'video') {
        bodyContent = `<video controls src="${data.mediaUrl}" preload="none" playsinline></video>`;
    }

    div.innerHTML = `
        <div class="entry-header">
            <div class="entry-avatar">${getInitials(data.name || 'A')}</div>
            <div class="entry-meta">
                <p class="entry-name">${escapeHtml(data.name || 'Anonymous')}</p>
                <p class="entry-time">${formatTimeAgo(date)}</p>
            </div>
            <span class="entry-type-badge">${typeIcons[data.type] || '💬'} ${typeLabels[data.type] || 'Text'}</span>
            ${docId ? `<button class="guestbook-entry-delete" data-entry-id="${docId}">✕ Delete</button>` : ''}
        </div>
        <div class="entry-body">${bodyContent}</div>
    `;

    // Delete handler
    const deleteBtn = div.querySelector('.guestbook-entry-delete');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', () => {
            confirmDelete('guestbook', docId, data.mediaUrl || null, data.name);
        });
    }

    return div;
}

// Initial load
loadGuestbookEntries();

// ==================== REAL-TIME LISTENER (OPTIONAL) ====================
// Listen for new guestbook entries in real-time
try {
    db.collection('guestbook')
        .orderBy('timestamp', 'desc')
        .limit(50)
        .onSnapshot((snapshot) => {
            if (!snapshot.metadata.hasPendingWrites) {
                guestbookEntries.innerHTML = '';
                snapshot.docs.forEach(doc => {
                    const data = doc.data();
                    const date = data.timestamp?.toDate() || new Date();
                    const entryEl = createEntryElement(data, date, doc.id);
                    guestbookEntries.appendChild(entryEl);
                });

                if (snapshot.empty) {
                    guestbookEntries.innerHTML = `
                        <div class="gallery-empty" style="display:flex;">
                            <div class="empty-icon">💌</div>
                            <p>No messages yet — be the first to leave one!</p>
                        </div>
                    `;
                }
            }
        }, (error) => {
            console.log('Real-time listener error (non-critical):', error);
        });
} catch (e) {
    console.log('Real-time listener not available:', e);
}

// ==================== PHOTO EDITOR ====================

const photoEditorModal = document.getElementById('photo-editor');
const editorCanvas = document.getElementById('editor-canvas');
const editorCtx = editorCanvas.getContext('2d');

// Editor state
let editorState = {
    mode: 'upload',        // 'upload' or 'gallery'
    fileIndex: -1,
    galleryPhoto: null,    // photo object when editing gallery photos
    trueOriginal: null,    // unmodified image saved on editor open (for Reset)
    originalImage: null,   // HTMLImageElement with current base pixels (changes after crop)
    rotation: 0,           // 0, 90, 180, 270
    brightness: 100,
    contrast: 100,
    saturation: 100,
    filter: 'none'
};

// Filter presets — each returns a CSS filter string to layer on top of the sliders
const filterPresets = {
    none:    { brightness: 100, contrast: 100, saturation: 100, extra: '' },
    warm:    { brightness: 105, contrast: 102, saturation: 115, extra: 'sepia(15%)' },
    cool:    { brightness: 100, contrast: 105, saturation: 90,  extra: 'hue-rotate(15deg)' },
    bw:      { brightness: 105, contrast: 115, saturation: 0,   extra: '' },
    vintage: { brightness: 95,  contrast: 90,  saturation: 80,  extra: 'sepia(30%)' },
    soft:    { brightness: 108, contrast: 92,  saturation: 95,  extra: 'blur(0.4px)' }
};

function openPhotoEditor(fileIndex) {
    editorState.mode = 'upload';
    editorState.fileIndex = fileIndex;
    editorState.galleryPhoto = null;
    resetEditorControls();

    // Load the image
    const file = selectedFiles[fileIndex];
    const img = new Image();
    img.onload = () => {
        editorState.originalImage = img;
        editorState.trueOriginal = img;
        renderEditor();
        photoEditorModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    };
    img.src = URL.createObjectURL(file);
}

async function openGalleryPhotoEditor(photo) {
    editorState.mode = 'gallery';
    editorState.fileIndex = -1;
    editorState.galleryPhoto = photo;
    resetEditorControls();

    try {
        // Fetch image as blob to avoid CORS canvas tainting
        const response = await fetch(photo.url);
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);

        const img = new Image();
        img.onload = () => {
            editorState.originalImage = img;
            editorState.trueOriginal = img;
            renderEditor();
            photoEditorModal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        };
        img.onerror = () => {
            showToast('Could not load image for editing.', 'error');
        };
        img.src = blobUrl;
    } catch (e) {
        console.error('Failed to fetch image for editing:', e);
        showToast('Could not load image for editing.', 'error');
    }
}

function resetEditorControls() {
    editorState.rotation = 0;
    editorState.brightness = 100;
    editorState.contrast = 100;
    editorState.saturation = 100;
    editorState.filter = 'none';

    document.getElementById('editor-brightness').value = 100;
    document.getElementById('editor-contrast').value = 100;
    document.getElementById('editor-saturation').value = 100;
    document.getElementById('brightness-value').textContent = '100%';
    document.getElementById('contrast-value').textContent = '100%';
    document.getElementById('saturation-value').textContent = '100%';
    document.querySelectorAll('.editor-filter-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.filter === 'none');
    });
}

function closePhotoEditor() {
    photoEditorModal.style.display = 'none';
    document.body.style.overflow = '';
    editorState.originalImage = null;
    // Clean up crop mode if active
    try { if (isCropping) cancelCrop(); } catch(e) {}
}

function renderEditor() {
    const img = editorState.originalImage;
    if (!img) return;

    const rot = editorState.rotation;
    const isRotated = rot === 90 || rot === 270;

    // Set canvas dimensions based on rotation
    const cw = isRotated ? img.naturalHeight : img.naturalWidth;
    const ch = isRotated ? img.naturalWidth : img.naturalHeight;
    editorCanvas.width = cw;
    editorCanvas.height = ch;

    // Build the CSS filter string
    const preset = filterPresets[editorState.filter] || filterPresets.none;
    const b = editorState.filter === 'none' ? editorState.brightness : preset.brightness;
    const c = editorState.filter === 'none' ? editorState.contrast : preset.contrast;
    const s = editorState.filter === 'none' ? editorState.saturation : preset.saturation;
    let filterStr = `brightness(${b}%) contrast(${c}%) saturate(${s}%)`;
    if (preset.extra) filterStr += ` ${preset.extra}`;

    editorCtx.clearRect(0, 0, cw, ch);
    editorCtx.save();

    // Apply rotation
    editorCtx.translate(cw / 2, ch / 2);
    editorCtx.rotate((rot * Math.PI) / 180);
    editorCtx.translate(-img.naturalWidth / 2, -img.naturalHeight / 2);

    // Apply filter
    editorCtx.filter = filterStr;

    // Draw
    editorCtx.drawImage(img, 0, 0);
    editorCtx.restore();
}

// --- Editor Controls ---

// Rotate
document.getElementById('editor-rotate-left').addEventListener('click', () => {
    editorState.rotation = (editorState.rotation - 90 + 360) % 360;
    renderEditor();
});

document.getElementById('editor-rotate-right').addEventListener('click', () => {
    editorState.rotation = (editorState.rotation + 90) % 360;
    renderEditor();
});

// Sliders
const sliderIds = ['brightness', 'contrast', 'saturation'];
sliderIds.forEach(name => {
    const slider = document.getElementById(`editor-${name}`);
    const valueLabel = document.getElementById(`${name}-value`);

    slider.addEventListener('input', () => {
        editorState[name] = parseInt(slider.value);
        valueLabel.textContent = slider.value + '%';

        // If a preset filter is active and user adjusts sliders, switch to "Original" mode
        // so the sliders take effect directly
        if (editorState.filter !== 'none') {
            editorState.filter = 'none';
            document.querySelectorAll('.editor-filter-btn').forEach(b => {
                b.classList.toggle('active', b.dataset.filter === 'none');
            });
        }

        renderEditor();
    });
});

// Filter presets
document.querySelectorAll('.editor-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.editor-filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        editorState.filter = btn.dataset.filter;

        // Update slider UI to show preset values (visual feedback)
        const preset = filterPresets[editorState.filter];
        if (editorState.filter !== 'none') {
            document.getElementById('editor-brightness').value = preset.brightness;
            document.getElementById('editor-contrast').value = preset.contrast;
            document.getElementById('editor-saturation').value = preset.saturation;
            document.getElementById('brightness-value').textContent = preset.brightness + '%';
            document.getElementById('contrast-value').textContent = preset.contrast + '%';
            document.getElementById('saturation-value').textContent = preset.saturation + '%';
        }

        renderEditor();
    });
});

// Reset — restore to true original image (undo crop + all edits)
document.getElementById('editor-reset').addEventListener('click', async () => {
    // In gallery mode, try to fetch the permanent original from Firestore
    if (editorState.mode === 'gallery' && editorState.galleryPhoto) {
        const photo = editorState.galleryPhoto;
        try {
            const docSnap = await db.collection('photos').doc(photo.id).get();
            const origUrl = docSnap.data().originalUrl;
            if (origUrl) {
                const response = await fetch(origUrl);
                const blob = await response.blob();
                const blobUrl = URL.createObjectURL(blob);
                const img = new Image();
                img.onload = () => {
                    editorState.originalImage = img;
                    editorState.trueOriginal = img;
                    editorState.rotation = 0;
                    editorState.brightness = 100;
                    editorState.contrast = 100;
                    editorState.saturation = 100;
                    editorState.filter = 'none';
                    resetEditorControls();
                    renderEditor();
                    // Auto-apply to save original back to Firebase
                    document.getElementById('editor-apply').click();
                };
                img.src = blobUrl;
                return;
            }
        } catch (e) {
            console.log('Could not fetch original, using in-memory fallback:', e);
        }
    }

    // Fallback: use in-memory trueOriginal
    if (editorState.trueOriginal) {
        editorState.originalImage = editorState.trueOriginal;
    }
    editorState.rotation = 0;
    editorState.brightness = 100;
    editorState.contrast = 100;
    editorState.saturation = 100;
    editorState.filter = 'none';

    document.getElementById('editor-brightness').value = 100;
    document.getElementById('editor-contrast').value = 100;
    document.getElementById('editor-saturation').value = 100;
    document.getElementById('brightness-value').textContent = '100%';
    document.getElementById('contrast-value').textContent = '100%';
    document.getElementById('saturation-value').textContent = '100%';
    document.querySelectorAll('.editor-filter-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.filter === 'none');
    });

    renderEditor();

    // In gallery mode, auto-apply the reset to save original back to Firebase
    if (editorState.mode === 'gallery') {
        document.getElementById('editor-apply').click();
    }
});

// Cancel
document.getElementById('editor-cancel').addEventListener('click', closePhotoEditor);

// Apply — handle both upload preview and gallery modes
document.getElementById('editor-apply').addEventListener('click', async () => {
    if (editorState.mode === 'upload') {
        // Upload preview mode — replace file in selectedFiles
        editorCanvas.toBlob((blob) => {
            if (blob) {
                const originalName = selectedFiles[editorState.fileIndex].name || 'photo';
                const baseName = originalName.replace(/\.[^.]+$/, '');
                const editedFile = new File([blob], `${baseName}_edited.jpg`, {
                    type: 'image/jpeg'
                });
                selectedFiles[editorState.fileIndex] = editedFile;
                renderPreviews();
                showToast('Photo edits applied! ✨', 'success');
            }
            closePhotoEditor();
        }, 'image/jpeg', 0.92);
    } else if (editorState.mode === 'gallery') {
        // Gallery mode — re-upload to Firebase
        const photo = editorState.galleryPhoto;
        if (!photo) return;

        const applyBtn = document.getElementById('editor-apply');
        applyBtn.disabled = true;
        applyBtn.textContent = 'Saving...';

        try {
            const blob = await new Promise(resolve => {
                editorCanvas.toBlob(resolve, 'image/jpeg', 0.92);
            });

            if (blob) {
                // Upload to new path
                const fileId = generateId();
                const storageRef = storage.ref(`photos/${fileId}.jpg`);
                const uploadTask = await storageRef.put(blob, { contentType: 'image/jpeg' });
                const newUrl = await uploadTask.ref.getDownloadURL();

                // Update Firestore document with new URL (preserve originalUrl)
                const updateData = { url: newUrl };
                // Set originalUrl only if it doesn't already exist
                const docSnap = await db.collection('photos').doc(photo.id).get();
                if (!docSnap.data().originalUrl) {
                    updateData.originalUrl = photo.url;
                }
                await db.collection('photos').doc(photo.id).update(updateData);

                // Delete old edited file (but NEVER the original)
                const origUrl = docSnap.data().originalUrl || null;
                if (photo.url && photo.url.includes('firebasestorage') && photo.url !== origUrl) {
                    try {
                        const oldRef = storage.refFromURL(photo.url);
                        await oldRef.delete();
                    } catch (e) {
                        console.log('Old file cleanup skipped:', e);
                    }
                }

                showToast('Photo updated! ✨', 'success');
                // Wait for grids to fully reload with new URLs before closing
                await loadPhotos();
                if (isAdminMode) await loadStagingPhotos();
            }
        } catch (error) {
            console.error('Gallery edit save error:', error);
            showToast('Failed to save edits. Please try again.', 'error');
        } finally {
            applyBtn.disabled = false;
            applyBtn.textContent = 'Apply';
            closePhotoEditor();
        }
    }
});

// Close on Escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && photoEditorModal.style.display !== 'none') {
        if (isCropping) {
            cancelCrop();
        } else {
            closePhotoEditor();
        }
    }
});

// ==================== CROP TOOL ====================

let isCropping = false;
let cropDragging = false;
let cropAction = null;  // 'draw', 'move', 'nw', 'ne', 'sw', 'se'
let cropStart = { x: 0, y: 0 };
let cropBox = { x: 0, y: 0, w: 0, h: 0 }; // in overlay-relative pixels

const cropOverlay = document.getElementById('crop-overlay');
const cropSelection = document.getElementById('crop-selection');
const cropActionsDiv = document.getElementById('crop-actions');
const cropStartBtn = document.getElementById('editor-crop-start');

// Get the canvas bounding rect relative to the overlay
function getCanvasRect() {
    const canvas = editorCanvas;
    const wrap = canvas.parentElement;
    const canvasRect = canvas.getBoundingClientRect();
    const wrapRect = wrap.getBoundingClientRect();
    return {
        left: canvasRect.left - wrapRect.left,
        top: canvasRect.top - wrapRect.top,
        width: canvasRect.width,
        height: canvasRect.height
    };
}

function startCropMode() {
    isCropping = true;
    cropOverlay.style.display = 'block';
    cropActionsDiv.style.display = 'flex';
    cropStartBtn.classList.add('active');

    // Default crop selection to center 80%
    const rect = getCanvasRect();
    const margin = 0.1;
    cropBox = {
        x: rect.left + rect.width * margin,
        y: rect.top + rect.height * margin,
        w: rect.width * (1 - 2 * margin),
        h: rect.height * (1 - 2 * margin)
    };
    updateCropSelection();
}

function cancelCrop() {
    isCropping = false;
    cropOverlay.style.display = 'none';
    cropActionsDiv.style.display = 'none';
    cropStartBtn.classList.remove('active');
}

function updateCropSelection() {
    cropSelection.style.left = cropBox.x + 'px';
    cropSelection.style.top = cropBox.y + 'px';
    cropSelection.style.width = cropBox.w + 'px';
    cropSelection.style.height = cropBox.h + 'px';
}

// Clamp crop box to canvas bounds
function clampCropBox() {
    const rect = getCanvasRect();
    const minSize = 20;

    cropBox.w = Math.max(minSize, cropBox.w);
    cropBox.h = Math.max(minSize, cropBox.h);
    cropBox.x = Math.max(rect.left, Math.min(cropBox.x, rect.left + rect.width - cropBox.w));
    cropBox.y = Math.max(rect.top, Math.min(cropBox.y, rect.top + rect.height - cropBox.h));
    cropBox.w = Math.min(cropBox.w, rect.left + rect.width - cropBox.x);
    cropBox.h = Math.min(cropBox.h, rect.top + rect.height - cropBox.y);
}

// Mouse/Touch event handlers for crop
function getCropPointer(e) {
    const wrapRect = cropOverlay.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
        x: clientX - wrapRect.left,
        y: clientY - wrapRect.top
    };
}

cropOverlay.addEventListener('mousedown', cropPointerDown);
cropOverlay.addEventListener('touchstart', cropPointerDown, { passive: false });

function cropPointerDown(e) {
    e.preventDefault();
    const p = getCropPointer(e);
    cropDragging = true;

    // Check if clicking a handle
    const target = e.target;
    if (target.dataset && target.dataset.handle) {
        cropAction = target.dataset.handle;
        cropStart = { x: p.x, y: p.y };
        return;
    }

    // Check if inside selection (move)
    if (p.x >= cropBox.x && p.x <= cropBox.x + cropBox.w &&
        p.y >= cropBox.y && p.y <= cropBox.y + cropBox.h) {
        cropAction = 'move';
        cropStart = { x: p.x - cropBox.x, y: p.y - cropBox.y };
        return;
    }

    // Draw new selection
    cropAction = 'draw';
    cropStart = { x: p.x, y: p.y };
    cropBox = { x: p.x, y: p.y, w: 0, h: 0 };
    updateCropSelection();
}

document.addEventListener('mousemove', cropPointerMove);
document.addEventListener('touchmove', cropPointerMove, { passive: false });

function cropPointerMove(e) {
    if (!cropDragging || !isCropping) return;
    e.preventDefault();
    const p = getCropPointer(e);

    if (cropAction === 'draw') {
        cropBox.x = Math.min(p.x, cropStart.x);
        cropBox.y = Math.min(p.y, cropStart.y);
        cropBox.w = Math.abs(p.x - cropStart.x);
        cropBox.h = Math.abs(p.y - cropStart.y);
    } else if (cropAction === 'move') {
        cropBox.x = p.x - cropStart.x;
        cropBox.y = p.y - cropStart.y;
    } else if (cropAction === 'se') {
        cropBox.w = p.x - cropBox.x;
        cropBox.h = p.y - cropBox.y;
    } else if (cropAction === 'sw') {
        cropBox.w += cropBox.x - p.x;
        cropBox.x = p.x;
        cropBox.h = p.y - cropBox.y;
    } else if (cropAction === 'ne') {
        cropBox.w = p.x - cropBox.x;
        cropBox.h += cropBox.y - p.y;
        cropBox.y = p.y;
    } else if (cropAction === 'nw') {
        cropBox.w += cropBox.x - p.x;
        cropBox.h += cropBox.y - p.y;
        cropBox.x = p.x;
        cropBox.y = p.y;
    }

    clampCropBox();
    updateCropSelection();
}

document.addEventListener('mouseup', cropPointerUp);
document.addEventListener('touchend', cropPointerUp);

function cropPointerUp() {
    cropDragging = false;
    cropAction = null;
}

// Crop Start button
cropStartBtn.addEventListener('click', () => {
    if (isCropping) {
        cancelCrop();
    } else {
        startCropMode();
    }
});

// Crop Cancel
document.getElementById('crop-cancel-btn').addEventListener('click', cancelCrop);

// Crop Confirm - apply crop to the editor's source image
document.getElementById('crop-confirm').addEventListener('click', () => {
    const rect = getCanvasRect();
    if (cropBox.w < 10 || cropBox.h < 10) {
        showToast('Selection too small', 'error');
        return;
    }

    // Convert overlay-relative crop coords to canvas pixel coords
    const scaleX = editorCanvas.width / rect.width;
    const scaleY = editorCanvas.height / rect.height;
    const sx = (cropBox.x - rect.left) * scaleX;
    const sy = (cropBox.y - rect.top) * scaleY;
    const sw = cropBox.w * scaleX;
    const sh = cropBox.h * scaleY;

    // Create a temp canvas with just the cropped region from the current render
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = Math.round(sw);
    tempCanvas.height = Math.round(sh);
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.drawImage(editorCanvas, sx, sy, sw, sh, 0, 0, tempCanvas.width, tempCanvas.height);

    // Replace the original image with the cropped result
    const croppedImg = new Image();
    croppedImg.onload = () => {
        editorState.originalImage = croppedImg;
        editorState.rotation = 0;
        editorState.brightness = 100;
        editorState.contrast = 100;
        editorState.saturation = 100;
        editorState.filter = 'none';
        resetEditorControls();
        renderEditor();
        cancelCrop();
        showToast('Cropped!', 'success');
    };
    croppedImg.src = tempCanvas.toDataURL('image/jpeg', 0.95);
});

// ==================== ADMIN MODE ====================

let adminPasscode = null;
let isAdminMode = false;
let pendingDelete = null; // { type, id, mediaUrl, name }

// Load admin passcode from config
async function loadAdminConfig() {
    try {
        const response = await fetch('config.json');
        const config = await response.json();
        adminPasscode = config.adminPasscode || null;
    } catch (e) {
        console.log('Admin config not available');
    }
}
loadAdminConfig();

// Admin toggle button
const adminToggleBtn = document.getElementById('admin-toggle');
const adminModal = document.getElementById('admin-modal');
const adminPasscodeInput = document.getElementById('admin-passcode-input');
const confirmModal = document.getElementById('confirm-modal');

adminToggleBtn.addEventListener('click', () => {
    if (isAdminMode) {
        // Exit admin mode
        isAdminMode = false;
        document.body.classList.remove('admin-mode');
        adminToggleBtn.classList.remove('active');
        document.getElementById('staging').style.display = 'none';
        sessionStorage.removeItem('adminActive');
        showToast('Admin mode deactivated', 'success');
    } else {
        // Show passcode modal
        adminPasscodeInput.value = '';
        adminModal.style.display = 'flex';
        setTimeout(() => adminPasscodeInput.focus(), 100);
    }
});

// Admin modal submit
document.getElementById('admin-modal-submit').addEventListener('click', () => {
    const entered = adminPasscodeInput.value.trim();
    if (!entered) {
        showToast('Please enter the passcode', 'error');
        return;
    }
    if (adminPasscode && entered !== adminPasscode) {
        showToast('Incorrect passcode', 'error');
        adminPasscodeInput.value = '';
        adminPasscodeInput.focus();
        return;
    }
    // Success
    isAdminMode = true;
    document.body.classList.add('admin-mode');
    adminToggleBtn.classList.add('active');
    adminModal.style.display = 'none';
    document.getElementById('staging').style.display = 'block';
    sessionStorage.setItem('adminActive', '1');
    loadStagingPhotos();
    showToast('Admin mode activated — review pending photos above the gallery', 'success');
});

// Restore admin session on page load
if (sessionStorage.getItem('adminActive') === '1') {
    isAdminMode = true;
    document.body.classList.add('admin-mode');
    adminToggleBtn.classList.add('active');
    document.getElementById('staging').style.display = 'block';
    loadStagingPhotos();
}

// Admin modal cancel
document.getElementById('admin-modal-cancel').addEventListener('click', () => {
    adminModal.style.display = 'none';
});

// Enter key in passcode input
adminPasscodeInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        document.getElementById('admin-modal-submit').click();
    }
});

// ==================== STAGING / MODERATION ====================

const stagingEmpty = document.getElementById('staging-empty');
const stagingCount = document.getElementById('staging-count');
let stagingPhotos = [];
let selectedStagingIds = new Set();

async function loadStagingPhotos() {
    try {
        const snapshot = await db.collection('photos')
            .where('status', '==', 'pending')
            .orderBy('timestamp', 'desc')
            .get();

        stagingPhotos = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            timestamp: doc.data().timestamp?.toDate() || new Date()
        }));

        selectedStagingIds.clear();
        renderStaging();
    } catch (error) {
        console.error('Error loading staging photos:', error);
    }
}

function updateStagingSelection() {
    // No-op: global actions removed; each group manages its own selection
}

function renderStaging() {
    const stagingGroups = document.getElementById('staging-groups');
    stagingGroups.innerHTML = '';
    stagingCount.textContent = `${stagingPhotos.length} pending`;
    stagingEmpty.style.display = stagingPhotos.length === 0 ? 'flex' : 'none';

    if (stagingPhotos.length === 0) return;

    // Group photos by upload session (each upload batch gets its own group)
    const groups = {};
    stagingPhotos.forEach((photo, globalIndex) => {
        // Use uploadSession if available, otherwise fall back to name-based key
        const key = photo.uploadSession || `legacy_${photo.name || 'Unknown'}`;
        if (!groups[key]) {
            groups[key] = [];
        }
        groups[key].push({ ...photo, globalIndex });
    });

    // Sort groups by earliest timestamp (newest first)
    const sortedKeys = Object.keys(groups).sort((a, b) => {
        const aTime = groups[a].reduce((min, p) => p.timestamp < min ? p.timestamp : min, groups[a][0].timestamp);
        const bTime = groups[b].reduce((min, p) => p.timestamp < min ? p.timestamp : min, groups[b][0].timestamp);
        return bTime - aTime;
    });

    sortedKeys.forEach(groupKey => {
        const groupPhotos = groups[groupKey];
        const uploaderName = groupPhotos[0].name || 'Unknown';
        const groupIds = groupPhotos.map(p => p.id);

        // Group container — collapsed by default
        const groupDiv = document.createElement('div');
        groupDiv.className = 'staging-group staging-group-collapsed';

        // Get earliest timestamp in group for display
        const earliest = groupPhotos.reduce((min, p) => p.timestamp < min ? p.timestamp : min, groupPhotos[0].timestamp);
        const timeStr = earliest.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });

        // Group header (clickable to toggle)
        const header = document.createElement('div');
        header.className = 'staging-group-header';
        const groupCaption = groupPhotos.find(p => p.caption)?.caption || '';
        header.innerHTML = `
            <div class="staging-group-info">
                <h3 class="staging-group-name">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    ${escapeHtml(uploaderName)}
                    ${groupCaption ? `<span class="staging-group-caption">— ${escapeHtml(groupCaption)}</span>` : ''}
                </h3>
                <span class="staging-group-meta">${groupPhotos.length} file${groupPhotos.length !== 1 ? 's' : ''} · ${timeStr}</span>
            </div>
            <svg class="staging-group-chevron" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
        `;

        header.addEventListener('click', () => {
            groupDiv.classList.toggle('staging-group-collapsed');
        });

        // Collapsible body
        const groupBody = document.createElement('div');
        groupBody.className = 'staging-group-body';

        // Group actions bar
        const actionsBar = document.createElement('div');
        actionsBar.className = 'staging-group-actions';

        const selectAllLabel = document.createElement('label');
        selectAllLabel.className = 'staging-select-all-wrap staging-group-select-wrap';
        const selectAllCb = document.createElement('input');
        selectAllCb.type = 'checkbox';
        selectAllCb.className = 'staging-group-select-all';
        const allSelected = groupIds.every(id => selectedStagingIds.has(id));
        selectAllCb.checked = allSelected;
        selectAllLabel.appendChild(selectAllCb);
        selectAllLabel.appendChild(document.createTextNode(' Select All'));

        selectAllCb.addEventListener('change', (e) => {
            groupIds.forEach(id => {
                if (e.target.checked) selectedStagingIds.add(id);
                else selectedStagingIds.delete(id);
            });
            renderStaging();
        });

        const approveGroupBtn = document.createElement('button');
        approveGroupBtn.className = 'btn btn-primary staging-group-btn';
        approveGroupBtn.textContent = `✓ Approve All (${groupPhotos.length})`;
        approveGroupBtn.addEventListener('click', async () => {
            approveGroupBtn.disabled = true;
            approveGroupBtn.textContent = 'Approving...';
            try {
                const batch = db.batch();
                groupIds.forEach(id => batch.update(db.collection('photos').doc(id), { status: 'approved' }));
                await batch.commit();
                showToast(`${groupPhotos.length} photos from ${uploaderName} approved! ✨`, 'success');
                await loadStagingPhotos();
                await loadPhotos();
            } catch (e) {
                console.error('Group approve error:', e);
                showToast('Failed to approve group', 'error');
                approveGroupBtn.disabled = false;
            }
        });

        const rejectGroupBtn = document.createElement('button');
        rejectGroupBtn.className = 'btn btn-danger staging-group-btn';
        rejectGroupBtn.textContent = `✕ Reject All (${groupPhotos.length})`;
        rejectGroupBtn.addEventListener('click', async () => {
            if (!confirm(`Reject and delete all ${groupPhotos.length} photos from ${uploaderName}?`)) return;
            rejectGroupBtn.disabled = true;
            rejectGroupBtn.textContent = 'Rejecting...';
            try {
                for (const photo of groupPhotos) {
                    if (photo.url) {
                        try { await storage.refFromURL(photo.url).delete(); } catch (e) { /* ignore */ }
                    }
                    await db.collection('photos').doc(photo.id).delete();
                }
                showToast(`${groupPhotos.length} photos from ${uploaderName} rejected`, 'success');
                await loadStagingPhotos();
                await loadPhotos();
            } catch (e) {
                console.error('Group reject error:', e);
                showToast('Failed to reject group', 'error');
                rejectGroupBtn.disabled = false;
            }
        });

        actionsBar.appendChild(selectAllLabel);
        actionsBar.appendChild(approveGroupBtn);
        actionsBar.appendChild(rejectGroupBtn);

        // Group grid
        const grid = document.createElement('div');
        grid.className = 'gallery-grid staging-grid';

        groupPhotos.forEach((photo) => {
            const item = document.createElement('div');
            item.className = 'gallery-item';
            const isSelected = selectedStagingIds.has(photo.id);
            if (isSelected) item.classList.add('staging-selected');
            const isVideo = photo.mediaType === 'video' || isVideoUrl(photo.url);
            item.innerHTML = `
                ${isVideo ? `
                    <div class="gallery-video-wrap">
                        <video src="${photo.url}" preload="metadata" muted playsinline class="gallery-video-thumb"></video>
                        <div class="gallery-video-play">
                            <svg width="36" height="36" viewBox="0 0 24 24" fill="white" stroke="none">
                                <polygon points="5 3 19 12 5 21 5 3"/>
                            </svg>
                        </div>
                        <span class="gallery-video-badge">VIDEO</span>
                    </div>
                ` : `
                    <img src="${photo.url}" alt="${photo.caption || 'Pending photo'}" loading="lazy">
                `}
                <div class="gallery-item-overlay">
                    <p class="gallery-item-name">${escapeHtml(photo.name || 'Unknown')}</p>
                    ${photo.caption ? `<p class="gallery-item-caption">${escapeHtml(photo.caption)}</p>` : ''}
                </div>
                <label class="staging-checkbox-wrap">
                    <input type="checkbox" class="staging-checkbox" data-photo-id="${photo.id}" ${isSelected ? 'checked' : ''}>
                </label>
                <div class="staging-item-actions">
                    <button class="staging-btn staging-btn-approve" title="Approve">✓ Approve</button>
                    ${!isVideo ? `<button class="staging-btn staging-btn-edit" title="Edit">✎ Edit</button>` : ''}
                    <button class="staging-btn staging-btn-reject" title="Reject">✕ Reject</button>
                </div>
            `;

            // Click to open detail
            item.addEventListener('click', (e) => {
                if (!e.target.closest('.staging-item-actions') &&
                    !e.target.closest('.staging-checkbox-wrap')) {
                    openPhotoDetail(photo, 'staging', photo.globalIndex);
                }
            });

            // Checkbox toggle
            item.querySelector('.staging-checkbox').addEventListener('change', (e) => {
                if (e.target.checked) {
                    selectedStagingIds.add(photo.id);
                    item.classList.add('staging-selected');
                } else {
                    selectedStagingIds.delete(photo.id);
                    item.classList.remove('staging-selected');
                }
                updateStagingSelection();
                // Update group select-all checkbox
                selectAllCb.checked = groupIds.every(id => selectedStagingIds.has(id));
            });

            // Individual actions
            item.querySelector('.staging-btn-approve').addEventListener('click', () => approvePhoto(photo.id));
            const editBtnEl = item.querySelector('.staging-btn-edit');
            if (editBtnEl) editBtnEl.addEventListener('click', () => openGalleryPhotoEditor(photo));
            item.querySelector('.staging-btn-reject').addEventListener('click', () => {
                confirmDelete('photo', photo.id, photo.url, photo.name);
            });

            grid.appendChild(item);
        });

        groupDiv.appendChild(header);
        groupBody.appendChild(actionsBar);
        groupBody.appendChild(grid);
        groupDiv.appendChild(groupBody);
        stagingGroups.appendChild(groupDiv);
    });
}

async function approvePhoto(docId) {
    try {
        await db.collection('photos').doc(docId).update({ status: 'approved' });
        showToast('Photo approved! ✨', 'success');
        loadStagingPhotos();
        loadPhotos();
    } catch (error) {
        console.error('Approve error:', error);
        showToast('Failed to approve photo.', 'error');
    }
}

// Confirm delete flow
function confirmDelete(type, id, mediaUrl, name) {
    pendingDelete = { type, id, mediaUrl, name };
    const typeLabel = type === 'photo' ? 'photo' : 'guestbook entry';
    document.getElementById('confirm-modal-message').textContent =
        `Delete this ${typeLabel} from ${name || 'unknown'}? This cannot be undone.`;
    confirmModal.style.display = 'flex';
}

document.getElementById('confirm-cancel').addEventListener('click', () => {
    pendingDelete = null;
    confirmModal.style.display = 'none';
});

document.getElementById('confirm-delete').addEventListener('click', async () => {
    if (!pendingDelete) return;
    const { type, id, mediaUrl } = pendingDelete;
    confirmModal.style.display = 'none';

    try {
        if (type === 'photo') {
            // Delete from Firestore
            await db.collection('photos').doc(id).delete();
            // Try to delete from Storage
            if (mediaUrl && mediaUrl.includes('firebasestorage')) {
                try {
                    const storageRef = storage.refFromURL(mediaUrl);
                    await storageRef.delete();
                } catch (e) {
                    console.log('Storage delete skipped:', e);
                }
            }
            showToast('Photo deleted', 'success');
            await loadPhotos();
            if (isAdminMode) await loadStagingPhotos();
        } else if (type === 'guestbook') {
            // Delete from Firestore
            await db.collection('guestbook').doc(id).delete();
            // Try to delete media from Storage
            if (mediaUrl && mediaUrl.includes('firebasestorage')) {
                try {
                    const storageRef = storage.refFromURL(mediaUrl);
                    await storageRef.delete();
                } catch (e) {
                    console.log('Storage delete skipped:', e);
                }
            }
            showToast('Guestbook entry deleted', 'success');
            loadGuestbookEntries();
        }
    } catch (error) {
        console.error('Delete error:', error);
        showToast('Failed to delete. Please try again.', 'error');
    }

    pendingDelete = null;
});

// Close modals on Escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (adminModal.style.display !== 'none') adminModal.style.display = 'none';
        if (confirmModal.style.display !== 'none') {
            confirmModal.style.display = 'none';
            pendingDelete = null;
        }
        const nameModal = document.getElementById('editor-name-modal');
        if (nameModal && nameModal.style.display !== 'none') nameModal.style.display = 'none';
    }
});

// ==================== EDITOR NAME GATE ====================

let pendingEditPhoto = null;
const editorNameModal = document.getElementById('editor-name-modal');
const editorNameInput = document.getElementById('editor-name-input');

function requestEditorName(photo) {
    // Admin skips name prompt
    if (isAdminMode) {
        openGalleryPhotoEditor(photo);
        return;
    }

    // Check if name already provided this session
    const savedName = sessionStorage.getItem('editorName');
    if (savedName) {
        openGalleryPhotoEditor(photo);
        return;
    }

    // Show name prompt
    pendingEditPhoto = photo;
    editorNameInput.value = '';
    editorNameModal.style.display = 'flex';
    setTimeout(() => editorNameInput.focus(), 100);
}

document.getElementById('editor-name-submit').addEventListener('click', () => {
    const name = editorNameInput.value.trim();
    if (!name) {
        showToast('Please enter your full name', 'error');
        editorNameInput.focus();
        return;
    }
    if (name.split(/\s+/).length < 2) {
        showToast('Please enter your first and last name', 'error');
        editorNameInput.focus();
        return;
    }
    // Save name for the session
    sessionStorage.setItem('editorName', name);
    editorNameModal.style.display = 'none';

    if (pendingEditPhoto) {
        openGalleryPhotoEditor(pendingEditPhoto);
        pendingEditPhoto = null;
    }
});

document.getElementById('editor-name-cancel').addEventListener('click', () => {
    editorNameModal.style.display = 'none';
    pendingEditPhoto = null;
});

editorNameInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        document.getElementById('editor-name-submit').click();
    }
});
