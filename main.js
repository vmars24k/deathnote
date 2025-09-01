/* jshint esversion: 6 */

document.addEventListener('DOMContentLoaded', function() {
    // Set the password (in a real app, this would be hashed and stored securely)
    const correctPassword = 'iamjustice';
    
    // Store notes data
    let notesData = {};
    
    // Store zoom state
    let currentZoom = 1;
    
    // Load any saved notes from localStorage
    loadNotes();
    
    // Password input handling
    const passwordInput = document.getElementById('password-input');
    const pinModal = document.getElementById('pin-modal');
    const submitPinBtn = document.getElementById('submit-pin');
    const pinError = document.getElementById('pin-error');
    const unlockBtn = document.getElementById('unlock-notes');
    
    // Sound elements
    const backgroundMusic = document.getElementById('background-music');
    const pageFlipSound = document.getElementById('page-flip-sound');
    const soundToggleBtn = document.getElementById('sound-toggle');
    const playPauseBtn = document.getElementById('play-pause');
    
    // Sound state
    let isSoundOn = false;
    let isPlaying = false;
    
    // Setup Password input for better UX
    passwordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            validatePassword();
        }
    });

    // Unlock button to show password modal
    unlockBtn.addEventListener('click', function() {
        // Clear previous password input
        passwordInput.value = '';
        pinError.textContent = '';
        passwordInput.focus();
        pinModal.style.display = 'flex';
    });

    // Submit password button
    submitPinBtn.addEventListener('click', validatePassword);

    // Password validation function
    function validatePassword() {
        let enteredPassword = passwordInput.value;

        if (!enteredPassword) {
            pinError.textContent = 'Please enter a password';
            return;
        }

        if (enteredPassword === correctPassword) {
            // Unlock all notes for editing
            document.querySelectorAll('.note-content').forEach(note => {
                note.contentEditable = 'true';
                note.classList.add('editable');
            });
            
            // Hide modal
            pinModal.style.display = 'none';
            
            // Change unlock button to save button
            unlockBtn.textContent = 'Save Notes';
            unlockBtn.removeEventListener('click', unlockNotesHandler);
            unlockBtn.addEventListener('click', saveNotesHandler);
        } else {
            pinError.textContent = 'Incorrect password. Please try again.';
            passwordInput.value = '';
            passwordInput.focus();
        }
    }

    // Save notes handler
    function saveNotesHandler() {
        // Save the content of all notes
        document.querySelectorAll('.note-content').forEach(note => {
            const pageNum = note.dataset.page;
            notesData[pageNum] = note.innerHTML;
            
            // Make non-editable again
            note.contentEditable = 'false';
            note.classList.remove('editable');
        });
        
        // Save to localStorage
        localStorage.setItem('pokemonNotes', JSON.stringify(notesData));
        
        // Change button back
        unlockBtn.textContent = 'Unlock Notes';
        unlockBtn.removeEventListener('click', saveNotesHandler);
        unlockBtn.addEventListener('click', unlockNotesHandler);
    }

    // Function to load notes from localStorage
    function loadNotes() {
        const savedNotes = localStorage.getItem('pokemonNotes');
        if (savedNotes) {
            notesData = JSON.parse(savedNotes);
            
            // Apply saved notes to pages
            document.querySelectorAll('.note-content').forEach(note => {
                const pageNum = note.dataset.page;
                if (notesData[pageNum]) {
                    note.innerHTML = notesData[pageNum];
                }
            });
        }
    }

    // Unlock notes handler (reference for event listener)
    function unlockNotesHandler() {
        // Clear previous password input
        passwordInput.value = '';
        pinError.textContent = '';
        passwordInput.focus();
        pinModal.style.display = 'flex';
    }

    // Initial event listener setup
    unlockBtn.addEventListener('click', unlockNotesHandler);

    // Allow closing modal by clicking outside
    pinModal.addEventListener('click', function(e) {
        if (e.target === pinModal) {
            pinModal.style.display = 'none';
        }
    });

    // Button Bar Functionality
    const zoomInBtn = document.getElementById('zoom-in');
    const zoomOutBtn = document.getElementById('zoom-out');
    const fullscreenBtn = document.getElementById('fullscreen');

    // Initial state
    let isDragging = false;
    let dragStartX, dragStartY;

    // Zoom functionality
    zoomInBtn.addEventListener('click', function() {
        if (currentZoom < 1.5) {
            currentZoom += 0.1;
            applyZoom();
        }
    });

    zoomOutBtn.addEventListener('click', function() {
        if (currentZoom > 0.7) {
            currentZoom -= 0.1;
            applyZoom();
        }
    });

    function applyZoom() {
        document.querySelector('.flipbook').style.transform = `scale(${currentZoom})`;
    }

    // Enable dragging when zoomed
    document.querySelector('.flipbook').addEventListener('mousedown', function(e) {
        if (currentZoom > 1) {
            isDragging = true;
            dragStartX = e.clientX;
            dragStartY = e.clientY;
            this.style.cursor = 'grabbing';
        }
    });

    document.addEventListener('mousemove', function(e) {
        if (isDragging) {
            const flipbook = document.querySelector('.flipbook');
            const dx = e.clientX - dragStartX;
            const dy = e.clientY - dragStartY;
            
            // Calculate current position and apply movement
            const currentTransform = window.getComputedStyle(flipbook).getPropertyValue('transform');
            const matrix = new DOMMatrix(currentTransform);
            
            flipbook.style.transform = `translate(${dx}px, ${dy}px) scale(${currentZoom})`;
            
            dragStartX = e.clientX;
            dragStartY = e.clientY;
        }
    });

    document.addEventListener('mouseup', function() {
        if (isDragging) {
            isDragging = false;
            document.querySelector('.flipbook').style.cursor = 'grab';
        }
    });

    // Sound toggle
    soundToggleBtn.addEventListener('click', function() {
        isSoundOn = !isSoundOn;
        backgroundMusic.muted = !isSoundOn;
        pageFlipSound.muted = !isSoundOn;
        
        // Update icon
        this.querySelector('i').className = isSoundOn ? 'fa-solid fa-volume-high' : 'fa-solid fa-volume-xmark';
        
        // Toggle active class
        this.classList.toggle('active', isSoundOn);
    });

    // Play/Pause background music
    playPauseBtn.addEventListener('click', function() {
        isPlaying = !isPlaying;
        
        if (isPlaying) {
            backgroundMusic.play();
            this.querySelector('i').className = 'fa-solid fa-pause';
        } else {
            backgroundMusic.pause();
            this.querySelector('i').className = 'fa-solid fa-play';
        }
        
        // Toggle active class
        this.classList.toggle('active', isPlaying);
    });

    // Fullscreen toggle
    fullscreenBtn.addEventListener('click', function() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.log(`Error attempting to enable fullscreen: ${err.message}`);
            });
            this.querySelector('i').className = 'fa-solid fa-compress';
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
                this.querySelector('i').className = 'fa-solid fa-expand';
            }
        }
    });

    // Handle fullscreen change
    document.addEventListener('fullscreenchange', function() {
        document.body.classList.toggle('fullscreen-enabled', !!document.fullscreenElement);
    });
    
    // Turn.js page-flip sound integration
    $('.flipbook').on('turning', function() {
        if (pageFlipSound && !pageFlipSound.muted) {
            // Reset the sound to beginning for rapid page turns
            try {
                pageFlipSound.currentTime = 0;
            } catch (e) {
                // Ignore any errors with setting currentTime
            }
            pageFlipSound.play().catch(() => {});
        }
    });
    
    // Handle resize events better
    window.addEventListener('resize', function() {
        // Reset zoom when window is resized
        currentZoom = 1;
        applyZoom();
        
        // Update book dimensions responsively
        updateBookDimensions();
    });

    // Function to update book dimensions based on screen size
    function updateBookDimensions() {
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        let bookWidth, bookHeight;
        
        if (windowWidth > 1200) {
            bookWidth = 1000;
            bookHeight = 600;
        } else if (windowWidth > 900) {
            bookWidth = 800;
            bookHeight = 480;
        } else if (windowWidth > 650) {
            bookWidth = 600;
            bookHeight = 360;
        } else if (windowWidth > 450) {
            bookWidth = 400;
            bookHeight = 300;
        } else {
            bookWidth = 300;
            bookHeight = 225;
        }
        
        // Apply new dimensions and refresh turn.js
        $('.flipbook').turn('size', bookWidth, bookHeight);
    }

    // Update meta viewport to prevent unwanted scaling
    function updateViewport() {
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        if (isMobile) {
            const viewportMeta = document.querySelector('meta[name="viewport"]');
            viewportMeta.content = 'width=device-width, initial-scale=1.0';
        }
    }

    updateViewport();

    // Handle device orientation changes
    window.addEventListener('orientationchange', function() {
        setTimeout(updateBookDimensions, 200); // Give browser time to adjust
    });
    
    // Custom cursor (for desktop)
    if (window.matchMedia("(pointer: fine)").matches) {
        const customCursor = document.getElementById('custom-cursor');
        const cursorDot = document.querySelector('.cursor-dot');
        const cursorRing = document.querySelector('.cursor-ring');
        
        document.addEventListener('mousemove', (e) => {
            cursorDot.style.left = e.clientX + 'px';
            cursorDot.style.top = e.clientY + 'px';
            
            // Add slight delay to the outer ring for a trailing effect
            setTimeout(() => {
                cursorRing.style.left = e.clientX + 'px';
                cursorRing.style.top = e.clientY + 'px';
            }, 50);
        });
    }
    
    // Touch event handling for mobile
    if ('ontouchstart' in window) {
        // Add touch-specific classes to body
        document.body.classList.add('touch-device');
        
        // Improve touch behavior for page turning
        const touchThreshold = 20; // pixels
        let touchStartX = 0;
        
        document.querySelector('.flipbook').addEventListener('touchstart', function(e) {
            touchStartX = e.touches[0].clientX;
        });
        
        document.querySelector('.flipbook').addEventListener('touchend', function(e) {
            const touchEndX = e.changedTouches[0].clientX;
            const diffX = touchEndX - touchStartX;
            
            if (Math.abs(diffX) > touchThreshold) {
                if (diffX > 0) {
                    // Swiped right, go to previous page
                    $('.flipbook').turn('previous');
                } else {
                    // Swiped left, go to next page
                    $('.flipbook').turn('next');
                }
            }
        });
    }
    
    // Initial responsive adjustment
    updateBookDimensions();
});