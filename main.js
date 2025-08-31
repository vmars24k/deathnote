/* jshint esversion: 6 */

document.addEventListener('DOMContentLoaded', function() {
    // Set the PIN (in a real app, this would be hashed and stored securely)
    const correctPin = '919393';
    
    // Store notes data
    let notesData = {};
    
    // Store zoom state
    let currentZoom = 1;
    
    // Load any saved notes from localStorage
    loadNotes();
    
    // PIN input handling
    const pinDigits = document.querySelectorAll('.pin-digit');
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
    
    // Setup PIN input fields for better UX
    pinDigits.forEach((input, index) => {
        input.addEventListener('keyup', (e) => {
            // Move to next input after typing a digit
            if (e.key >= '0' && e.key <= '9') {
                input.value = e.key;
                if (index < pinDigits.length - 1) {
                    pinDigits[index + 1].focus();
                } else {
                    input.blur();
                }
            }
            // Handle backspace
            else if (e.key === 'Backspace') {
                input.value = '';
                if (index > 0) {
                    pinDigits[index - 1].focus();
                }
            }
        });

        // Prevent non-numeric input
        input.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/[^0-9]/g, '');
        });
    });

    // Unlock button to show PIN modal
    unlockBtn.addEventListener('click', function() {
        // Clear previous PIN inputs
        pinDigits.forEach(input => input.value = '');
        pinError.textContent = '';
        pinDigits[0].focus();
        pinModal.style.display = 'flex';
    });

    // Submit PIN button
    submitPinBtn.addEventListener('click', validatePin);

    // PIN validation function
    function validatePin() {
        let enteredPin = '';
        pinDigits.forEach(input => {
            enteredPin += input.value;
        });

        if (enteredPin.length !== 6) {
            pinError.textContent = 'Please enter all 6 digits';
            return;
        }

        if (enteredPin === correctPin) {
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
            pinError.textContent = 'Incorrect PIN. Please try again.';
            pinDigits.forEach(input => input.value = '');
            pinDigits[0].focus();
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
        // Clear previous PIN inputs
        pinDigits.forEach(input => input.value = '');
        pinError.textContent = '';
        pinDigits[0].focus();
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

    // Handle Enter key in PIN input
    pinDigits.forEach(input => {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                validatePin();
            }
        });
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
        this.querySelector('.icon').textContent = isSoundOn ? '🔊' : '🔇';
        
        // Toggle active class
        this.classList.toggle('active', isSoundOn);
    });

    // Play/Pause background music
    playPauseBtn.addEventListener('click', function() {
        isPlaying = !isPlaying;
        
        if (isPlaying) {
            backgroundMusic.play();
            this.querySelector('.icon').textContent = '⏸';
        } else {
            backgroundMusic.pause();
            this.querySelector('.icon').textContent = '▶';
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
            this.querySelector('.icon').textContent = '⤓';
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
                this.querySelector('.icon').textContent = '⛶';
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