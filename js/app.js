/* ============================================================
   RUSS & BRIT — WEDDING WEBSITE
   Firebase-powered photo gallery & virtual guestbook
   ============================================================ */

// ==================== FIREBASE INIT ====================
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
const db = firebase.firestore();
const storage = firebase.storage();

// Try analytics (may fail on some browsers)
try { firebase.analytics(); } catch (e) { /* noop */ }

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

// ==================== PRELOADER ====================

window.addEventListener('load', () => {
    const preloader = document.getElementById('preloader');
    setTimeout(() => {
        preloader.classList.add('hidden');
    }, 1200);
});

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
        const officialPhotos = [{
            id: 'main',
            url: 'photos/main.png',
            name: 'Russ & Brit',
            caption: 'Our wedding day',
            type: 'official',
            timestamp: new Date('2025-01-01')
        }];

        // Fetch guest-uploaded photos from Firestore
        const snapshot = await db.collection('photos')
            .orderBy('timestamp', 'desc')
            .get();

        const guestPhotos = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            type: 'guest',
            timestamp: doc.data().timestamp?.toDate() || new Date()
        }));

        allPhotos = [...officialPhotos, ...guestPhotos];
        renderGallery();
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

function renderGallery() {
    filteredPhotos = currentFilter === 'all'
        ? allPhotos
        : allPhotos.filter(p => p.type === currentFilter);

    galleryGrid.innerHTML = '';
    galleryEmpty.style.display = filteredPhotos.length === 0 ? 'flex' : 'none';

    filteredPhotos.forEach((photo, index) => {
        const item = document.createElement('div');
        item.className = 'gallery-item';
        item.dataset.index = index;
        item.innerHTML = `
            <img src="${photo.url}" alt="${photo.caption || 'Wedding photo'}" loading="lazy">
            <div class="gallery-item-overlay">
                <p class="gallery-item-name">${escapeHtml(photo.name)}</p>
                ${photo.caption ? `<p class="gallery-item-caption">${escapeHtml(photo.caption)}</p>` : ''}
            </div>
            ${photo.type === 'guest' ? `
                <button class="gallery-item-delete" data-photo-id="${photo.id}" title="Delete photo">&times;</button>
                <button class="gallery-item-edit" data-photo-id="${photo.id}" title="Edit photo">✎</button>
            ` : ''}
        `;
        // Click to open lightbox (but not if clicking admin buttons)
        item.addEventListener('click', (e) => {
            if (!e.target.classList.contains('gallery-item-delete') &&
                !e.target.classList.contains('gallery-item-edit')) {
                openLightbox(index);
            }
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
        galleryGrid.appendChild(item);
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Filter buttons
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        renderGallery();
    });
});

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
}

function updateLightbox() {
    const photo = filteredPhotos[lightboxIndex];
    if (!photo) return;
    document.getElementById('lightbox-img').src = photo.url;
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
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    Array.from(fileList).forEach(file => {
        if (!validTypes.includes(file.type)) {
            showToast(`${file.name} is not a supported image format`, 'error');
            return;
        }
        if (file.size > maxSize) {
            showToast(`${file.name} exceeds 10MB limit`, 'error');
            return;
        }
        if (selectedFiles.length >= 10) {
            showToast('Maximum 10 photos at a time', 'warning');
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
        const img = document.createElement('img');
        img.src = URL.createObjectURL(file);
        img.alt = file.name;
        const removeBtn = document.createElement('button');
        removeBtn.className = 'upload-preview-remove';
        removeBtn.innerHTML = '&times;';
        removeBtn.addEventListener('click', () => {
            selectedFiles.splice(index, 1);
            renderPreviews();
            uploadSubmit.disabled = selectedFiles.length === 0;
        });
        // Edit button
        const editBtn = document.createElement('button');
        editBtn.className = 'upload-preview-edit';
        editBtn.innerHTML = '✎';
        editBtn.title = 'Edit photo';
        editBtn.addEventListener('click', () => {
            openPhotoEditor(index);
        });
        item.appendChild(img);
        item.appendChild(removeBtn);
        item.appendChild(editBtn);
        uploadPreviews.appendChild(item);
    });
}

// Upload form submission
uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('uploader-name').value.trim();
    const caption = document.getElementById('photo-caption').value.trim();

    if (!name) {
        showToast('Please enter your name', 'error');
        return;
    }

    if (selectedFiles.length === 0) {
        showToast('Please select photos to upload', 'error');
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
        for (const file of selectedFiles) {
            const fileId = generateId();

            // Convert image to JPG before upload
            progressText.textContent = `Converting ${uploaded + 1} of ${total} to JPG...`;
            const jpgBlob = await convertToJpg(file);

            const storageRef = storage.ref(`photos/${fileId}.jpg`);

            // Upload converted JPG to Firebase Storage
            const uploadTask = await storageRef.put(jpgBlob, {
                contentType: 'image/jpeg'
            });
            const url = await uploadTask.ref.getDownloadURL();

            // Save metadata to Firestore
            await db.collection('photos').add({
                url: url,
                name: name,
                caption: caption,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });

            uploaded++;
            const pct = Math.round((uploaded / total) * 100);
            progressFill.style.width = pct + '%';
            progressText.textContent = `Uploading ${uploaded} of ${total}...`;
        }

        showToast(`${uploaded} photo${uploaded > 1 ? 's' : ''} uploaded successfully! 🎉`, 'success');

        // Reset form
        selectedFiles = [];
        renderPreviews();
        document.getElementById('uploader-name').value = '';
        document.getElementById('photo-caption').value = '';
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
    originalImage: null,   // HTMLImageElement with original pixels
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

// Reset
document.getElementById('editor-reset').addEventListener('click', () => {
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

                // Update Firestore document with new URL
                await db.collection('photos').doc(photo.id).update({ url: newUrl });

                // Try to delete old file from Storage
                if (photo.url && photo.url.includes('firebasestorage')) {
                    try {
                        const oldRef = storage.refFromURL(photo.url);
                        await oldRef.delete();
                    } catch (e) {
                        console.log('Old file cleanup skipped:', e);
                    }
                }

                showToast('Photo updated! ✨', 'success');
                loadPhotos();
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
    showToast('Admin mode activated — you can now delete items', 'success');
});

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
            loadPhotos();
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
