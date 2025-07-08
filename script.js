// script.js
document.addEventListener('DOMContentLoaded', () => {
    const desktopArea = document.querySelector('.desktop-area');
    const icons = document.querySelectorAll('.desktop-icon');
    const windows = document.querySelectorAll('.window');
    const modalOverlay = document.getElementById('modal-overlay');
    
    // Startup sequence elements
    const startupScreen = document.getElementById('startup-screen');
    const startupVideo = document.getElementById('startup-video');
    const progressFill = document.querySelector('.startup-progress-fill');
    const statusText = document.querySelector('.startup-status');
    const menubar = document.querySelector('.menubar');
    const startupWelcomeWindow = document.getElementById('window-welcome');
    
    // Startup sound function
    function playStartupSound() {
        try {
            const startupSound = new Audio('./startup sound.mp3');
            startupSound.volume = 0.6;
            startupSound.preload = 'auto';
            
            const playPromise = startupSound.play();
            if (playPromise !== undefined) {
                playPromise
                    .then(() => {
                        console.log('Startup sound playing');
                    })
                    .catch(error => {
                        console.warn("Startup sound failed:", error);
                    });
            }
        } catch (error) {
            console.warn("Error creating startup sound:", error);
        }
    }

    // Startup sequence
    function runStartupSequence() {
        if (!startupScreen || !progressFill || !statusText) return;
        
        // Startup phases with timing
        const phases = [
            { progress: 20, status: 'Initializing systems...', duration: 1000 },
            { progress: 45, status: 'Loading vibes...', duration: 1500 },
            { progress: 70, status: 'Starting services...', duration: 1500 },
            { progress: 90, status: 'Preparing desktop...', duration: 1500 },
            { progress: 100, status: '', duration: 500 } // Empty status, show button instead
        ];
        
        let currentPhase = 0;
        
        function nextPhase() {
            if (currentPhase >= phases.length) {
                showEnterButton();
                return;
            }
            
            const phase = phases[currentPhase];
            progressFill.style.width = phase.progress + '%';
            statusText.textContent = phase.status;
            
            currentPhase++;
            setTimeout(nextPhase, phase.duration);
        }
        
        function showEnterButton() {
            // Hide status text
            statusText.style.display = 'none';
            
            // Transform progress bar into ENTER button
            const progressContainer = document.querySelector('.startup-progress-container');
            if (progressContainer) {
                progressContainer.className = 'startup-enter-button-container';
                progressContainer.innerHTML = '<button class="startup-enter-button">ENTER</button>';
                
                const enterButton = progressContainer.querySelector('.startup-enter-button');
                enterButton.addEventListener('click', () => {
                    playStartupSound();
                    completeStartup();
                });
            }
        }
        
        function completeStartup() {
            // Fade out startup screen
            startupScreen.style.transition = 'opacity 0.8s ease';
            startupScreen.style.opacity = '0';
            
            setTimeout(() => {
                // Hide startup screen
                startupScreen.style.display = 'none';
                
                // Show desktop elements
                if (menubar) {
                    menubar.style.display = 'flex';
                    menubar.style.opacity = '0';
                    menubar.style.transition = 'opacity 0.5s ease';
                    setTimeout(() => menubar.style.opacity = '1', 100);
                }
                
                if (desktopArea) {
                    desktopArea.style.display = 'block';
                    desktopArea.style.opacity = '0';
                    desktopArea.style.transition = 'opacity 0.5s ease';
                    setTimeout(() => desktopArea.style.opacity = '1', 200);
                }
                
                // Switch to Bliss background
                switchToBlissBackground();
                
                        // Show welcome window after a brief delay
        setTimeout(() => {
            if (startupWelcomeWindow) {
                startupWelcomeWindow.style.display = 'flex';
                startupWelcomeWindow.style.opacity = '0';
                startupWelcomeWindow.style.transition = 'opacity 0.3s ease';
                setTimeout(() => startupWelcomeWindow.style.opacity = '1', 100);
                bringToFront(startupWelcomeWindow);
                
                // Trigger Y2K popup after welcome window is fully shown and user has time to get oriented
                setTimeout(() => {
                    showY2KPopup();
                }, 3000); // 3 seconds after welcome window appears
            }
        }, 500);
                
            }, 800);
        }
        
        function switchToBlissBackground() {
            const backgroundVideo = document.querySelector('#background-video');
            const backgroundImage = document.getElementById('background-image');
            
            if (backgroundVideo) backgroundVideo.style.display = 'none';
            if (backgroundImage) {
                backgroundImage.style.display = 'block';
                backgroundImage.src = 'assets/wallpaper/bliss.jpg';
            }
        }
        
        // Start the sequence
        nextPhase();
    }
    
    // Initialize startup sequence
    if (startupVideo) {
        startupVideo.playbackRate = 0.65; // Match babybean speed
        startupVideo.addEventListener('loadeddata', () => {
            setTimeout(runStartupSequence, 500); // Small delay for smooth start
        });
        
        // Fallback in case video doesn't load
        setTimeout(runStartupSequence, 1000);
    }
    
    // --- Wallpaper and Bean Menu Dropdown Logic ---
    const wallpaperMenu = document.getElementById('wallpaper-menu-item');
    const wallpaperDropdown = document.getElementById('wallpaper-dropdown');
    const beanMenu = document.getElementById('bean-menu-item');
    const beanDropdown = document.getElementById('bean-dropdown');
    const aboutBeanLink = document.getElementById('about-this-bean');
    const aboutBeanWindow = document.getElementById('window-about-bean');
    const backgroundVideo = document.querySelector('#background-video');
    const backgroundImage = document.getElementById('background-image');
    
    let highestZIndex = 3000; // Start z-index stack above all CSS fixed elements
    
    if (backgroundVideo) {
        backgroundVideo.playbackRate = 0.65;
        backgroundVideo.addEventListener('ended', () => {
            backgroundVideo.play();
        });
    }
    
    const wallpapers = [
        { name: 'BabyBean', type: 'video', path: 'background-video.mp4' },
        { name: 'Default', type: 'image', path: 'assets/wallpaper/default.webp' },
        { name: 'Bliss', type: 'image', path: 'assets/wallpaper/bliss.jpg' },
        { name: 'Cyber World', type: 'image', path: 'assets/wallpaper/cyber-world.avif' },
        { name: 'Free Palestine', type: 'image', path: 'assets/wallpaper/free palestine.png' },
        { name: 'upload', type: 'upload', path: 'UPLOAD' }
    ];

    function populateWallpaperMenu() {
        if (!wallpaperDropdown) return;
        wallpaperDropdown.innerHTML = '';
        wallpapers.forEach(wp => {
            const link = document.createElement('a');
            link.href = '#';
            link.textContent = wp.name;
            link.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (clickSound) {
                    clickSound.currentTime = 0;
                    clickSound.play().catch(error => console.warn("Click sound failed:", error));
                }
                if (wp.type === 'upload') {
                    const fileInput = document.createElement('input');
                    fileInput.type = 'file';
                    fileInput.accept = 'image/*';
                    fileInput.style.display = 'none';

                    fileInput.addEventListener('change', (event) => {
                        const file = event.target.files[0];
                        if (file) {
                            const reader = new FileReader();
                            reader.onload = (loadEvent) => {
                                if (backgroundVideo) backgroundVideo.style.display = 'none';
                                if (backgroundImage) {
                                    backgroundImage.style.display = 'block';
                                    backgroundImage.src = loadEvent.target.result;
                                }
                            };
                            reader.readAsDataURL(file);
                        }
                        document.body.removeChild(fileInput); // Clean up
                    });

                    document.body.appendChild(fileInput);
                    fileInput.click();
                } else if (wp.type === 'video') {
                    if (backgroundImage) backgroundImage.style.display = 'none';
                    if (backgroundVideo) {
                        backgroundVideo.style.display = 'block';
                        const source = backgroundVideo.querySelector('source');
                        if (source && source.src !== wp.path) {
                            source.src = wp.path;
                            backgroundVideo.load();
                        }
                        if (wp.name === 'BabyBean') {
                            backgroundVideo.playbackRate = 0.65;
                        } else {
                            backgroundVideo.playbackRate = 1.0;
                        }
                    }
                } else if (wp.type === 'image') {
                    if (backgroundVideo) backgroundVideo.style.display = 'none';
                    if (backgroundImage) {
                        backgroundImage.style.display = 'block';
                        backgroundImage.src = wp.path;
                    }
                }
                if (wallpaperDropdown) wallpaperDropdown.style.display = 'none';
            });
            wallpaperDropdown.appendChild(link);
        });
    }

    if (wallpaperMenu) {
        wallpaperMenu.addEventListener('mouseenter', () => {
            if (wallpaperDropdown) wallpaperDropdown.style.display = 'block';
        });
        wallpaperMenu.addEventListener('mouseleave', () => {
            if (wallpaperDropdown) wallpaperDropdown.style.display = 'none';
        });
    }

    if (aboutBeanLink) {
        aboutBeanLink.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (clickSound) {
                clickSound.currentTime = 0;
                clickSound.play().catch(error => console.warn("Click sound failed:", error));
            }
            if (aboutBeanWindow) {
                openWindow(aboutBeanWindow);
                if (modalOverlay) {
                    modalOverlay.style.display = 'block';
                }
            }
            if (beanDropdown) {
                beanDropdown.style.display = 'none';
            }
        });
    }

    if (beanMenu) {
        beanMenu.addEventListener('mouseenter', () => {
            if (beanDropdown) beanDropdown.style.display = 'block';
        });
        beanMenu.addEventListener('mouseleave', () => {
            if (beanDropdown) beanDropdown.style.display = 'none';
        });
    }

    let nextSlotIndex = 0;
    let photobookInitialized = false;

    const windowSlots = [
        { x: 50, y: 70 },
        { x: 450, y: 90 },
        { x: 70, y: 280 },
        { x: 500, y: 300 },
        { x: 250, y: 180 }
    ];

    function bringToFront(windowElement) {
        if (!windowElement) return;
        highestZIndex++;
        windowElement.style.zIndex = highestZIndex;
        
        // Ensure proper positioning for all windows
        if (!windowElement.style.position || windowElement.style.position === 'static') {
            windowElement.style.position = 'absolute';
        }
        
        // Special handling for case studies window with iframe
        if (windowElement.id === 'window-case-studies') {
            // Add isolation to prevent iframe stacking context issues
            windowElement.style.isolation = 'isolate';
            const windowContent = windowElement.querySelector('.window-content');
            if (windowContent) {
                windowContent.style.isolation = 'isolate';
            }
        }
        
        // Force reflow to ensure z-index change takes effect
        windowElement.offsetHeight;
    }

    function openWindow(win) {
        if (!win) return;
    
        const isAlreadyOpen = win.style.display === 'flex';
        
        // Always bring to front, whether opening new or focusing
        bringToFront(win);
    
        // If it's not open, display it and set its position
        if (!isAlreadyOpen) {
            win.style.display = 'flex';
    
            // Special initialization for certain windows
            const windowId = win.id;
            if (windowId === 'window-photobook' && !photobookInitialized) {
                initializePhotobook();
                photobookInitialized = true;
            }
            if (windowId === 'window-trivia') {
                initializeTriviaGame();
            }
            if (windowId === 'window-projects') {
                initializeWorkExplorer();
            }
    
            // Position the window
            if (window.innerWidth <= 768) {
                // On mobile, center the window
                win.style.left = '50%';
                win.style.top = '50%';
                win.style.transform = 'translate(-50%, -50%)';
                win.style.position = 'absolute'; 
            } else {
                // On desktop, use the slot positioning if not already positioned
                if (win.id !== 'window-about-bean') {
                    const currentPos = win.getBoundingClientRect();
                    if (currentPos.left < 0 || currentPos.top < 0 || (win.style.left === '' && win.style.top === '')) {
                        const slot = windowSlots[nextSlotIndex % windowSlots.length];
                        win.style.left = `${slot.x}px`;
                        win.style.top = `${slot.y}px`;
                        nextSlotIndex++;
                    }
                }
            }
        }
    
        // Special logic for chat window opening away message window
        if (win.id === 'window-chat' && !isAlreadyOpen) {
            const awayWindow = document.getElementById('window-vacation');
            if (awayWindow) {
                openWindow(awayWindow); // This will handle z-index via bringToFront()
                
                // Check if we're on mobile
                const isMobile = window.innerWidth <= 768;
                
                if (isMobile) {
                    // Mobile positioning: place away message slightly offset from chat center
                    awayWindow.style.left = '50%';
                    awayWindow.style.top = '45%';
                    awayWindow.style.transform = 'translate(-50%, -50%)';
                } else {
                    // Desktop positioning: place to the right of chat window
                    const chatRect = win.getBoundingClientRect();
                    awayWindow.style.left = `${chatRect.right + 10}px`;
                    awayWindow.style.top = `${chatRect.top}px`;
                    awayWindow.style.transform = 'none';
                }
                
                // Ensure away window is on top after positioning
                bringToFront(awayWindow);
            }
        }
    }

    windows.forEach(win => {
        // Bring window to front on any click or interaction
        win.addEventListener('mousedown', () => bringToFront(win));
        win.addEventListener('click', () => bringToFront(win));
        
        // Also ensure window content brings window to front
        const windowContent = win.querySelector('.window-content');
        if (windowContent) {
            windowContent.addEventListener('click', () => bringToFront(win));
        }

        const titleBar = win.querySelector('.title-bar');
        const closeButton = win.querySelector('.title-bar-buttons .close');

        if (closeButton) {
            closeButton.addEventListener('click', (e) => {
                e.stopPropagation();
                if (win.id === 'window-about-bean' && modalOverlay) {
                    modalOverlay.style.display = 'none';
                }
                win.style.display = 'none';
                playCloseSound();
            });
        }

        if (titleBar) {
            titleBar.addEventListener('mousedown', (e) => {
                bringToFront(win);
                const nonDraggableTags = ['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA'];
                if (nonDraggableTags.includes(e.target.tagName) || e.target.closest('button, a, input, select, textarea')) {
                    return;
                }

                const computedStyle = window.getComputedStyle(win);
                if (computedStyle.transform && computedStyle.transform !== 'none') {
                    const rect = win.getBoundingClientRect();
                    win.style.left = rect.left + 'px';
                    win.style.top = rect.top + 'px';
                    win.style.transform = 'none';
                }
                win.isDragging = true;
                win.offsetX = e.clientX - win.getBoundingClientRect().left;
                win.offsetY = e.clientY - win.getBoundingClientRect().top;
                win.style.cursor = 'grab';
            });
        }
    });

    document.addEventListener('mousemove', (e) => {
        windows.forEach(win => {
            if (win.isDragging) {
                let newX = e.clientX - win.offsetX;
                let newY = e.clientY - win.offsetY;
                if(desktopArea) {
                    const desktopRect = desktopArea.getBoundingClientRect();
                    const menubar = document.querySelector('.menubar');
                    const menubarHeight = menubar ? menubar.offsetHeight : 0;
                    const shadowBuffer = 10;
                    newX = Math.max(0, Math.min(newX, desktopRect.width - win.offsetWidth - shadowBuffer));
                    newY = Math.max(0, Math.min(newY, desktopRect.height - win.offsetHeight));
                }
                win.style.left = newX + 'px';
                win.style.top = newY + 'px';
            }
        });
    });

    document.addEventListener('mouseup', () => {
        windows.forEach(win => {
            if (win.isDragging) {
                win.isDragging = false;
                win.style.cursor = 'grab';
            }
        });
    });

    document.querySelectorAll('.resize-handle').forEach(handle => {
        handle.addEventListener('mousedown', initResize, false);
    });

    function initResize(e) {
        e.stopPropagation(); 
        const window = e.target.parentElement;
        const startX = e.clientX;
        const startY = e.clientY;
        const startWidth = parseInt(document.defaultView.getComputedStyle(window).width, 10);
        const startHeight = parseInt(document.defaultView.getComputedStyle(window).height, 10);

        function doResize(e) {
            window.style.width = (startWidth + e.clientX - startX) + 'px';
            window.style.height = (startHeight + e.clientY - startY) + 'px';
        }

        function stopResize(e) {
            document.documentElement.removeEventListener('mousemove', doResize, false);
            document.documentElement.removeEventListener('mouseup', stopResize, false);
        }

        document.documentElement.addEventListener('mousemove', doResize, false);
        document.documentElement.addEventListener('mouseup', stopResize, false);
    }

    const clickSound = new Audio('input click.mp3');
    const closeSound = new Audio('click-sound.mp3');

    function playClickSound() {
        clickSound.currentTime = 0;
        clickSound.play().catch(error => console.warn("Click sound failed:", error));
    }

    function playCloseSound() {
        closeSound.currentTime = 0;
        closeSound.play().catch(error => console.warn("Click sound failed:", error));
    }

    icons.forEach(icon => {
        icon.addEventListener('click', () => {
            playClickSound();
            let windowId;
            if (icon.id && icon.id.startsWith('icon-')) {
                const identifier = icon.id.substring('icon-'.length);
                windowId = 'window-' + identifier;
            }
            const win = document.getElementById(windowId);
            if (win) {
                openWindow(win);
            }
        });
    });

    function updateClock() {
        const now = new Date();
        const dateOptions = { weekday: 'short', month: 'short', day: 'numeric' };
        const timeOptions = { hour: 'numeric', minute: '2-digit', hour12: true };
        const dateString = now.toLocaleDateString('en-US', dateOptions);
        const timeString = now.toLocaleTimeString('en-US', timeOptions);
        const menuDate = document.getElementById('menu-date');
        const menuClock = document.getElementById('menu-clock');
        if (menuDate) menuDate.textContent = dateString;
        if (menuClock) menuClock.textContent = timeString;
    }

    // All other function definitions will go here...

    function initializePhotobook() {
        const photobookWindow = document.getElementById('window-photobook');
        if (!photobookWindow) return;
        const prevButton = photobookWindow.querySelector('.prev-photo');
        const nextButton = photobookWindow.querySelector('.next-photo');
        const carousel = photobookWindow.querySelector('.photobook-carousel');
        if(!carousel) return;
        const imageData = Array.from(carousel.querySelectorAll('.carousel-image')).map(img => ({ src: img.src, alt: img.alt }));
        carousel.innerHTML = '';
        const polaroids = imageData.map(data => {
            const polaroid = document.createElement('div');
            polaroid.className = 'polaroid';
            const image = document.createElement('img');
            image.src = data.src;
            image.alt = data.alt;
            image.className = 'carousel-image';
            const caption = document.createElement('div');
            caption.className = 'polaroid-caption';
            caption.textContent = data.alt;
            const rotation = Math.random() * 12 - 6;
            const topJitter = Math.random() * 10 - 5;
            const leftJitter = Math.random() * 10 - 5;
            polaroid.style.top = `${50 + topJitter}%`;
            polaroid.style.left = `${50 + leftJitter}%`;
            polaroid.style.transform = `translate(-50%, -50%) rotate(${rotation}deg)`;
            polaroid.appendChild(image);
            polaroid.appendChild(caption);
            carousel.appendChild(polaroid);
            return polaroid;
        });
        let currentImageIndex = 0;
        function showImage(index) {
            polaroids.forEach((p, i) => p.classList.toggle('active', i === index));
            currentImageIndex = index;
        }
        if (prevButton && nextButton && polaroids.length > 0) {
            prevButton.addEventListener('click', () => {
                playClickSound();
                showImage((currentImageIndex - 1 + polaroids.length) % polaroids.length);
            });
            nextButton.addEventListener('click', () => {
                playClickSound();
                showImage((currentImageIndex + 1) % polaroids.length);
            });
            showImage(0);
        }
    }

    const affirmations = [
        { card: "Strength", text: "I am a strong, capable person.", image: "assets/tarot card images/strength.png" },
        { card: "Ten of Wands", text: "I have done difficult things in the past, and I can do them again.", image: "assets/tarot card images/ten of wands.png" },
        { card: "The Sun", text: "I am in charge of how I feel and I choose to feel happy.", image: "assets/tarot card images/sun.png" },
        { card: "The Chariot", text: "I can handle whatever comes at me.", image: "assets/tarot card images/chariot.png" },
        { card: "The Fool", text: "I am learning, growing, and becoming better every moment.", image: "assets/tarot card images/fool.png" },
        { card: "Five of Pentacles", text: "I am allowed to ask for what I want and what I need.", image: "assets/tarot card images/five pent.png" },
        { card: "Eight of Wands", text: "I am proud of myself for daring to try; most people don't even do that.", image: "assets/tarot card images/eight wands.png" },
        { card: "Temperance", text: "I am not my mistakes; I forgive myself for those.", image: "assets/tarot card images/temper.png" },
        { card: "Seven of Pentacles", text: "I am doing the best I can with what I have.", image: "assets/tarot card images/seven pent.png" },
        { card: "Three of Cups", text: "I am allowed to feel good.", image: "assets/tarot card images/three cups.png" },
        { card: "The High Priestess", text: "I trust my intuition and inner wisdom to guide my decisions.", image: "assets/tarot card images/high.png" },
        { card: "The Ace", text: "I am open to receiving new opportunities and blessings.", image: "assets/tarot card images/ace.png" }
    ];
    const affirmationsWindow = document.getElementById('window-affirmations');
    if (affirmationsWindow) {
        const cardArt = affirmationsWindow.querySelector('.tarot-card-art');
        const cardTitle = affirmationsWindow.querySelector('.tarot-card-title');
        const cardText = affirmationsWindow.querySelector('.affirmation-text');
        const nextButton = affirmationsWindow.querySelector('.next-affirmation');
        let currentAffirmationIndex = Math.floor(Math.random() * affirmations.length);
        function displayAffirmation(index) {
            const affirmation = affirmations[index];
            if (cardArt) cardArt.style.backgroundImage = `url('${affirmation.image}')`;
            if (cardTitle) cardTitle.textContent = affirmation.card;
            if (cardText) cardText.textContent = affirmation.text;
        }
        if (nextButton) {
            nextButton.addEventListener('click', () => {
                let lastIndex = currentAffirmationIndex;
                do {
                    currentAffirmationIndex = Math.floor(Math.random() * affirmations.length);
                } while (affirmations.length > 1 && currentAffirmationIndex === lastIndex);
                playClickSound();
                displayAffirmation(currentAffirmationIndex);
            });
        }
        displayAffirmation(currentAffirmationIndex);
    }
    
    const triviaQuestions = [
        {
            question: "In which field did Amy start her career?",
            options: ["Graphic Design", "Communications", "Architecture", "Music Industry"],
            answer: "Music Industry",
            response: "I worked in live event production and artist management. So much fun!"
        },
        {
            question: "Where are Amy's parents immigrants from?",
            options: ["Chile", "Greece", "Brazil", "Turkey"],
            answer: "Brazil",
            response: "Brazil is overlooked in Latinx narratives due to its linguistic, cultural, racial, and geopolitical distinctiveness; a tension that's deeply shaped me."
        },
        {
            question: "Which of these does Amy find most terrifying?",
            options: ["Open Water", "Heights", "Clowns", "Spiders"],
            answer: "Open Water",
            response: "What's happening in and around the deep blue sea is simply none of my business."
        },
        {
            question: "How many siblings does Amy have?",
            options: ["0", "1", "2", "4"],
            answer: "0",
            response: "Being a first-generation only child with extended family abroad carried a unique and emotionally complex set of challenges that shape my world and my work."
        },
        {
            question: "How many indoor plants does Amy have at home?",
            options: ["12", "43", "58", "74"],
            answer: "43",
            response: "Still not enough, if you ask me."
        },
        {
            question: "On any given day, where is Amy most likely?",
            options: ["at the park", "in a cozy cafe", "in another country", "on a rooftop"],
            answer: "in another country",
            response: "I don't fly domestic."
        },
        {
            question: "Which of these sports did Amy compete in?",
            options: ["Distance running", "Crossfit", "Powerlifting", "Kickboxing"],
            answer: "Powerlifting",
            response: "Since I know you're thinking it, my squat PR is 150kg (330lbs)."
        }
    ];
    let currentTriviaQuestionIndex = 0;
    let triviaScore = 0;
    let questionsOrder = [];
    const triviaWindow = document.getElementById('window-trivia');
    function initializeTriviaGame() {
        if (!triviaWindow) return;
        questionsOrder = shuffleArray([...Array(triviaQuestions.length).keys()]);
        currentTriviaQuestionIndex = 0;
        triviaScore = 0;
        const triviaContent = triviaWindow.querySelector('#trivia-content');
        if (triviaContent) {
            triviaContent.style.display = 'block';
            triviaContent.innerHTML = `<div class="trivia-question-container"><p class="trivia-question"></p></div><div class="trivia-options"></div><div class="trivia-feedback-container"><p class="trivia-feedback"></p><button id="next-trivia-question" class="control-button" style="display: none;">Next</button></div>`;
        }
        const finalScoreContainer = triviaWindow.querySelector('.trivia-final-score');
        if (finalScoreContainer) finalScoreContainer.style.display = 'none';
        const nextBtn = triviaWindow.querySelector('#next-trivia-question');
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                currentTriviaQuestionIndex++;
                playClickSound();
                displayTriviaQuestion();
            });
        }
        displayTriviaQuestion();
    }
    function displayTriviaQuestion() {
        if (!triviaWindow || currentTriviaQuestionIndex >= questionsOrder.length) {
            displayFinalScore();
            return;
        }
        const questionIndex = questionsOrder[currentTriviaQuestionIndex];
        const questionData = triviaQuestions[questionIndex];
        const questionEl = triviaWindow.querySelector('.trivia-question');
        if (questionEl) questionEl.textContent = questionData.question;
        const optionsContainer = triviaWindow.querySelector('.trivia-options');
        if (optionsContainer) {
            optionsContainer.innerHTML = '';
            questionData.options.forEach(optionText => {
                const optionButton = document.createElement('button');
                optionButton.className = 'trivia-option';
                optionButton.textContent = optionText;
                optionButton.addEventListener('click', (e) => {
                    playClickSound();
                    handleTriviaAnswer(e);
                });
                optionsContainer.appendChild(optionButton);
            });
        }
        const feedbackEl = triviaWindow.querySelector('.trivia-feedback');
        if (feedbackEl) feedbackEl.textContent = '';
        const nextButton = triviaWindow.querySelector('#next-trivia-question');
        if (nextButton) nextButton.style.display = 'none';
    }
    function handleTriviaAnswer(e) {
        if (!triviaWindow) return;
        const selectedOption = e.target;
        const questionIndex = questionsOrder[currentTriviaQuestionIndex];
        const questionData = triviaQuestions[questionIndex];
        const feedbackEl = triviaWindow.querySelector('.trivia-feedback');
        const nextButton = triviaWindow.querySelector('#next-trivia-question');
        triviaWindow.querySelectorAll('.trivia-option').forEach(button => button.disabled = true);

        const responseText = questionData.response ? ` ${questionData.response}` : '';

        if (selectedOption.textContent === questionData.answer) {
            if (feedbackEl) {
                feedbackEl.innerHTML = `Correct!${responseText}`;
                feedbackEl.style.color = 'green';
            }
            triviaScore++;
        } else {
            if (feedbackEl) {
                feedbackEl.innerHTML = `Nope! The answer is ${questionData.answer}.${responseText}`;
                feedbackEl.style.color = 'red';
            }
        }
        if (nextButton) nextButton.style.display = 'block';
    }
    function displayFinalScore() {
        if (!triviaWindow) return;
        const triviaContent = triviaWindow.querySelector('#trivia-content');
        if (triviaContent) triviaContent.style.display = 'none';
        
        const finalScoreContainer = triviaWindow.querySelector('.trivia-final-score');
        if (finalScoreContainer) {
            finalScoreContainer.style.display = 'block';
            finalScoreContainer.innerHTML = `<p>Score: ${triviaScore}/${triviaQuestions.length}</p><button id="restart-trivia" class="control-button">Play Again</button>`;
            const restartBtn = finalScoreContainer.querySelector('#restart-trivia');
            if (restartBtn) {
                restartBtn.addEventListener('click', () => {
                    playClickSound();
                    initializeTriviaGame();
                });
            }
        }
    }
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
    
    const chatWindow = document.getElementById('window-chat');
    if (chatWindow) {
        const channelList = chatWindow.querySelector('.chat-sidebar ul');
        const chatHeader = chatWindow.querySelector('#chat-current-channel');
        const chatContentArea = chatWindow.querySelector('#chat-content');
        
        // Mobile dropdown elements
        const mobileDropdown = chatWindow.querySelector('.mobile-channel-dropdown');
        const mobileButton = chatWindow.querySelector('.mobile-channel-button');
        const mobileChannelText = chatWindow.querySelector('.mobile-channel-text');
        const mobileMenu = chatWindow.querySelector('.mobile-channel-menu');
        
        const screenNameInputArea = document.getElementById('screen-name-input-area');
        const messageInputArea = document.getElementById('message-input-area');
        const screenNameInput = document.getElementById('screen-name-input');
        const setScreenNameBtn = document.getElementById('set-screen-name-btn');
        const messageInput = document.getElementById('chat-message-input');
        const sendMessageBtn = document.getElementById('send-chat-message-btn');

        const channels = {
            'design-philosophy': { topic: '#design-philosophy', messages: [{ sender: 'amylimabean', text: "I believe in the transformative power of design, both individually and interpersonally. Product Design is not only the tool I use to create a more connected, delightful, and equitable world, but also the one in which I help people feel more seen, empowered, and joyful.<br><br>At my core, I'm driven by a deep fascination and appreciation for human behavior and expression, and I approach every project with the conviction that we should always build the thing that's going to elevate and empower people, and it should be beautiful.<br><br>My goal is to design products that reflect the richness of the people they serve, push the boundaries of what's possible, and represent a more creative, inclusive, and culture-shifting digital future." }] },
            'life-philosophy': { topic: '#life-philosophy', messages: [{ sender: 'amylimabean', text: "I believe life should be playful, whimsical, and at every interaction, rooted in love.<br><br>For me, that means throwing myself into as many new experiences as possible, and moving with kindness, gratitude, and affection for everyone and everything around me.<br><br>I believe there's no hierarchy for compassionate action, and any act of kindness, service, or love, from holding the door open for a stranger to buying yourself a little treat at the end of the day, makes the world a more joyous, life-affirming place.<br><br>I am not here to solve the universe pr take it too seriously.<br><br>I am here to taste it.<br><br>To walk into the woods and not need to find a way out.<br><br>To kiss someone and not know if it will last.<br><br>To experience the great, ordinary courage of being alive." }] },
            'group-chat': { topic: '#group-chat (guestbook)', messages: [{ sender: 'amylimabean', text: 'Welcome to the group chat! Set your ScreenName below to join the party' }] }
        };
        let guestbookMessages = [];
        let activeChannel = 'design-philosophy';
        let userScreenName = '';
        const guestbookBinId = '667a4e8d363a0405141203b5'; // A unique ID for your guestbook bin
        // IMPORTANT: Replace with your JSONBin Access Key.
        // Create a key with 'Update' permissions for your bin. Do NOT use your master key here.
        const jsonBinAccessKey = "\x242a\x2410\x24F4qldsZCQI4soQho6opOL.Aw/dml2UwtSaCDJ9epYG7t5.dH3HOH2";

        function appendMessage(html, isGuest) {
            const div = document.createElement('div');
            div.className = `chat-message ${isGuest ? 'guest-message' : ''}`;
            div.innerHTML = html;
            if (chatContentArea) {
                chatContentArea.appendChild(div);
                chatContentArea.scrollTop = chatContentArea.scrollHeight;
            }
        }

        function switchChannel(channelName) {
            activeChannel = channelName;
            const channel = channels[channelName];
            if (!channel || !chatContentArea) return;
            
            if (chatHeader) chatHeader.textContent = channel.topic;
            Array.from(channelList.children).forEach(li => li.classList.toggle('active-channel', li.dataset.channel === channelName));
            
            // Update mobile dropdown text and active states
            if (mobileChannelText) {
                mobileChannelText.textContent = channel.topic;
            }
            if (mobileMenu) {
                Array.from(mobileMenu.children).forEach(btn => {
                    btn.classList.toggle('active', btn.dataset.channel === channelName);
                });
            }
            
            chatContentArea.innerHTML = '';
            channel.messages.forEach(msg => {
                const innerHtml = `<span class="username ${msg.sender === 'amylimabean' ? 'admin-username' : ''}">${msg.sender}:</span> <span class="message-text">${msg.text}</span>${msg.timestamp ? `<span class="timestamp">(${msg.timestamp})</span>` : ''}`;
                appendMessage(innerHtml, false);
            });

            if (channelName === 'group-chat') {
                fetch(`https://api.jsonbin.io/v3/b/${guestbookBinId}/latest`)
                    .then(response => response.json())
                    .then(data => {
                        guestbookMessages = data.record;
                        guestbookMessages.forEach(msg => {
                            const innerHtml = `<span class="username ${msg.sender === 'amylimabean' ? 'admin-username' : ''}">${msg.sender}:</span> <span class="message-text">${msg.text}</span><span class="timestamp">(${msg.timestamp})</span>`;
                            appendMessage(innerHtml, true);
                        });
                    })
                    .catch(err => console.error('Error fetching guestbook messages:', err));
            }
            
            chatContentArea.scrollTop = 0;
            updateChatInputVisibility();
        }

        // Mobile dropdown functions
        function populateMobileDropdown() {
            if (!mobileMenu) return;
            
            mobileMenu.innerHTML = '';
            Object.keys(channels).forEach(name => {
                const btn = document.createElement('button');
                btn.dataset.channel = name;
                btn.textContent = `#${name.replace(/-/g, ' ')}`;
                btn.addEventListener('click', () => {
                    switchChannel(name);
                    hideMobileDropdown();
                    playClickSound();
                });
                mobileMenu.appendChild(btn);
            });
        }

        function toggleMobileDropdown() {
            if (mobileMenu) {
                mobileMenu.classList.toggle('show');
            }
        }

        function hideMobileDropdown() {
            if (mobileMenu) {
                mobileMenu.classList.remove('show');
            }
        }

        function updateChatInputVisibility() {
            if (activeChannel === 'group-chat') {
                if (userScreenName) {
                    screenNameInputArea.style.display = 'none';
                    messageInputArea.style.display = 'flex';
                } else {
                    screenNameInputArea.style.display = 'flex';
                    messageInputArea.style.display = 'none';
                }
            } else {
                screenNameInputArea.style.display = 'none';
                messageInputArea.style.display = 'none';
            }
        }

        function setScreenName() {
            const name = screenNameInput.value.trim();
            if (name) {
                userScreenName = name;
                updateChatInputVisibility();
                appendMessage(`<span class="username">amylimabean:</span> <span class="message-text">Welcome, ${userScreenName}!</span>`, false);
                screenNameInput.value = '';
            }
        }

        function handleSendMessage() {
            if (!messageInput || messageInput.value.trim() === '') return;
            const messageText = messageInput.value.trim();
            const newMessage = { sender: userScreenName, text: messageText, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };

            guestbookMessages.push(newMessage);
            appendMessage(`<span class="username ${userScreenName === 'amylimabean' ? 'admin-username' : ''}">${userScreenName}:</span> <span class="message-text">${messageText}</span><span class="timestamp">(${newMessage.timestamp})</span>`, true);
            messageInput.value = '';

            // Save the updated messages to JSONBin
            fetch(`https://api.jsonbin.io/v3/b/${guestbookBinId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Access-Key': jsonBinAccessKey
                },
                body: JSON.stringify(guestbookMessages),
            }).catch(err => {
                console.error('Error saving guestbook message:', err);
                alert('Sorry, your message could not be sent. Please check the console for more details.');
            });
        }

        if (channelList) {
            Object.keys(channels).forEach(name => {
                const li = document.createElement('li');
                li.dataset.channel = name;
                li.textContent = `#${name.replace(/-/g, ' ')}`;
                li.addEventListener('click', () => switchChannel(name));
                channelList.appendChild(li);
            });
        }
        
        // Setup mobile dropdown
        populateMobileDropdown();
        
        // Mobile dropdown event listeners
        if (mobileButton) {
            mobileButton.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleMobileDropdown();
                playClickSound();
            });
        }
        
        // Close mobile dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (mobileDropdown && !mobileDropdown.contains(e.target)) {
                hideMobileDropdown();
            }
        });
        
        setScreenNameBtn.addEventListener('click', () => {
            playClickSound();
            setScreenName();
        });
        screenNameInput.addEventListener('keypress', e => e.key === 'Enter' && setScreenName());
        sendMessageBtn.addEventListener('click', () => {
            playClickSound();
            handleSendMessage();
        });
        messageInput.addEventListener('keypress', e => e.key === 'Enter' && handleSendMessage());
        
        switchChannel('design-philosophy');
    }

    const postSecretWindow = document.getElementById('window-post-secret');
    if (postSecretWindow) {
        let secrets = JSON.parse(localStorage.getItem('secrets')) || [
            { text: "I don't know how to keep it together while the world is falling apart.", timestamp: new Date(2024, 5, 8, 14, 32) },
            { text: "I tell people I've read books when I've only seen the movie.", timestamp: new Date(2024, 5, 15, 9, 47) },
            { text: "Sometimes I pretend I'm in a music video when I'm walking down the street.", timestamp: new Date(2024, 5, 23, 16, 18) },
            { text: "I still think about my high school crush.", timestamp: new Date(2024, 6, 4, 11, 25) }
        ];

        function saveSecrets() {
            localStorage.setItem('secrets', JSON.stringify(secrets));
        }

        const postcardView = postSecretWindow.querySelector('.postcard-view');
        const secretsFeedView = postSecretWindow.querySelector('.secrets-feed-view');
        const messageTextarea = postSecretWindow.querySelector('.postcard-message');
        const sendBtn = postSecretWindow.querySelector('.submit-secret-btn');
        const viewBtn = postSecretWindow.querySelector('#view-secrets-btn');
        const submitNewBtn = postSecretWindow.querySelector('#submit-new-secret-btn');
        const sendingOverlay = document.getElementById('sending-overlay');

        sendBtn.addEventListener('click', () => {
            playClickSound();
            const secretText = messageTextarea.value.trim();
            if (secretText) {
                if (sendingOverlay) sendingOverlay.style.display = 'flex';
                
                setTimeout(() => {
                    secrets.unshift({ text: secretText, timestamp: new Date() });
                    saveSecrets();
                    messageTextarea.value = '';
                    if (sendingOverlay) sendingOverlay.style.display = 'none';
                    viewBtn.click(); // Programmatically click the view button
                }, 1500); // 1.5 second delay for animation
            }
        });

        viewBtn.addEventListener('click', () => {
            playClickSound();
            postcardView.style.display = 'none';
            secretsFeedView.style.display = 'grid';
            sendBtn.style.display = 'none';
            viewBtn.style.display = 'none';
            submitNewBtn.style.display = 'inline-block';

            secretsFeedView.innerHTML = '';
            secrets.forEach(secret => {
                const secretEl = document.createElement('div');
                secretEl.className = 'secret-entry';
                const rotation = Math.random() * 8 - 4; // -4 to 4 degrees
                secretEl.style.transform = `rotate(${rotation}deg)`;
                const formattedDate = new Date(secret.timestamp).toLocaleString();
                secretEl.innerHTML = `<p>${secret.text}</p><span class="secret-timestamp">${formattedDate}</span>`;
                secretsFeedView.appendChild(secretEl);
            });
        });

        submitNewBtn.addEventListener('click', () => {
            playClickSound();
            postcardView.style.display = 'grid';
            secretsFeedView.style.display = 'none';
            sendBtn.style.display = 'inline-block';
            viewBtn.style.display = 'inline-block';
            submitNewBtn.style.display = 'none';
        });
    }

    // --- Y2K Popup Logic ---
    const y2kPopup = document.getElementById('y2k-popup');
    const closePopupButton = document.getElementById('y2k-popup-close');
    const okButton = document.getElementById('y2k-popup-ok');
    const cancelButton = document.getElementById('y2k-popup-cancel');
    const caseStudiesLink = document.getElementById('popup-case-studies-link');
    const caseStudiesIcon = document.getElementById('icon-case-studies');
    const caseStudiesWindow = document.getElementById('window-case-studies');

    if (y2kPopup && closePopupButton && okButton && cancelButton && caseStudiesLink && caseStudiesIcon && caseStudiesWindow) {
        
        function closePopup() {
            y2kPopup.style.display = 'none';
            playClickSound();
        }

        function openCaseStudies(e) {
            e.preventDefault();
            playClickSound();
            openWindow(caseStudiesWindow);
            closePopup();
            
            // Optional: highlight the icon
            const span = caseStudiesIcon.querySelector('span');
            if (span) {
                const originalBg = span.style.backgroundColor;
                span.style.backgroundColor = 'rgba(0, 255, 0, 0.3)';
                setTimeout(() => {
                    span.style.backgroundColor = originalBg;
                }, 2000);
            }
        }

        // Function to show Y2K popup - called after startup completion
        function showY2KPopup() {
            y2kPopup.style.display = 'block';
            okButton.focus();
        }

        // Make showY2KPopup available globally so it can be called from completeStartup()
        window.showY2KPopup = showY2KPopup;

        // Close button functionality
        closePopupButton.addEventListener('click', closePopup);
        cancelButton.addEventListener('click', closePopup);

        // OK button and link functionality
        okButton.addEventListener('click', openCaseStudies);
        caseStudiesLink.addEventListener('click', openCaseStudies);
    }

    const myTunesWindow = document.getElementById('window-earbuds');
    if (myTunesWindow) {
        const audioPlayer = document.getElementById('myTunes-audio-player');
        const playBtn = myTunesWindow.querySelector('.play-btn');
        const prevBtn = myTunesWindow.querySelector('.prev-btn');
        const nextBtn = myTunesWindow.querySelector('.next-btn');
        const songTitleEl = myTunesWindow.querySelector('.song-title');
        const artistNameEl = myTunesWindow.querySelector('.artist-name');
        const timeInfoEl = myTunesWindow.querySelector('.time-info');
        const playlistEl = document.getElementById('myTunes-playlist');
        const visualizerCanvas = document.getElementById('myTunes-visualizer-canvas');
        const canvasCtx = visualizerCanvas.getContext('2d');

        let audioContext;
        let analyser;
        let source;
        let dataArray;
        let bufferLength;

        function initializeAudioVisualizer() {
            if (!audioContext) {
                audioContext = new (window.AudioContext || window.webkitAudioContext)();
                analyser = audioContext.createAnalyser();
                source = audioContext.createMediaElementSource(audioPlayer);
                
                source.connect(analyser);
                analyser.connect(audioContext.destination);

                analyser.fftSize = 256;
                bufferLength = analyser.frequencyBinCount;
                dataArray = new Uint8Array(bufferLength);
            }
        }
        
        const playlist = [
            { src: "assets/songs/01 WWMMD.m4a", title: "WWMMD", artist: "Funk LeBlanc" },
            { src: "assets/songs/03 Free Mind.m4a", title: "Free Mind", artist: "Tems" },
            { src: "assets/songs/01 Lo Vas A Olvidar.m4a", title: "Lo Vas A Olvidar", artist: "Billie Eilish, ROSALÍA" },
            { src: "assets/songs/02 Plays Pretty for Baby.m4a", title: "Plays Pretty for Baby", artist: "The Poni-Tails" },
            { src: "assets/songs/01 Trop beau (feat. Emma Peters).m4a", title: "Trop beau", artist: "L'impératrice, Emma Peters" }
        ];
        let currentTrackIndex = 0;
        let isPlaying = false;
        function loadSong(index) {
            const track = playlist[index];
            if (audioPlayer) audioPlayer.src = track.src;
            if (songTitleEl) songTitleEl.textContent = track.title;
            if (artistNameEl) artistNameEl.textContent = track.artist;
            updatePlaylistUI();
            if (audioPlayer) audioPlayer.load();
        }
        function playSong() {
            if (!audioPlayer) return;
            if (!audioContext) {
                initializeAudioVisualizer();
            }
            if (audioContext.state === 'suspended') {
                audioContext.resume();
            }
            isPlaying = true;
            if (playBtn) playBtn.textContent = '❚❚';
            audioPlayer.play();
            renderFrame();
        }
        function pauseSong() {
            isPlaying = false;
            if (playBtn) playBtn.textContent = '►';
            if (audioPlayer) audioPlayer.pause();
        }
        function prevSong() {
            currentTrackIndex = (currentTrackIndex - 1 + playlist.length) % playlist.length;
            loadSong(currentTrackIndex);
            playSong();
        }
        function nextSong() {
            currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
            loadSong(currentTrackIndex);
            playSong();
        }
        function updateProgress() {
            if (!audioPlayer || !timeInfoEl || !audioPlayer.duration) return;
            timeInfoEl.textContent = `${formatTime(audioPlayer.currentTime)} / ${formatTime(audioPlayer.duration)}`;
        }
        function formatTime(seconds) {
            const mins = Math.floor(seconds / 60);
            const secs = Math.floor(seconds % 60);
            return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
        }
        function updatePlaylistUI() {
            if (!playlistEl) return;
            playlistEl.innerHTML = '';
            for (let i = 1; i < playlist.length; i++) {
                const track = playlist[(currentTrackIndex + i) % playlist.length];
                const li = document.createElement('li');
                li.textContent = `${track.title} - ${track.artist}`;
                playlistEl.appendChild(li);
            }
        }
        function renderFrame() {
            if (!isPlaying) {
                canvasCtx.clearRect(0, 0, visualizerCanvas.width, visualizerCanvas.height);
                return;
            };

            requestAnimationFrame(renderFrame);
            analyser.getByteFrequencyData(dataArray);

            canvasCtx.clearRect(0, 0, visualizerCanvas.width, visualizerCanvas.height);
            
            const barWidth = (visualizerCanvas.width / bufferLength) * 2.5;
            let barHeight;
            let x = 0;

            for(let i = 0; i < bufferLength; i++) {
                barHeight = dataArray[i];
                
                canvasCtx.fillStyle = 'rgb(255, 255, 255)';
                canvasCtx.fillRect(x, visualizerCanvas.height - barHeight / 2, barWidth, barHeight / 2);

                x += barWidth + 1;
            }
        }
        if (playBtn) playBtn.addEventListener('click', () => {
            playClickSound();
            isPlaying ? pauseSong() : playSong();
        });
        if (prevBtn) prevBtn.addEventListener('click', () => {
            playClickSound();
            prevSong();
        });
        if (nextBtn) nextBtn.addEventListener('click', () => {
            playClickSound();
            nextSong();
        });
        if (audioPlayer) {
            audioPlayer.addEventListener('timeupdate', updateProgress);
            audioPlayer.addEventListener('ended', nextSong);
            audioPlayer.addEventListener('loadedmetadata', updateProgress);
        }
        loadSong(currentTrackIndex);
    }
    
    const pinterestHtmlContent = `
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Arial:wght@400;700&family=Verdana:wght@400;700&display=swap');
        
        #window-projects * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        #window-projects .folder-view {
            background: #000 url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><rect width="20" height="20" fill="%23000"/><circle cx="10" cy="10" r="1" fill="%23333"/></svg>') repeat;
            font-family: Verdana, Arial, sans-serif;
            font-size: 11px;
            color: #fff;
            line-height: 1.3;
        }
        
        #window-projects .myspace-header {
            background: linear-gradient(to bottom, #1e3a8a, #1e40af);
            padding: 8px 0;
            border-bottom: 3px solid #fbbf24;
        }
        
        #window-projects .myspace-nav {
            max-width: 1000px;
            margin: 0 auto;
            padding: 0 10px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        #window-projects .myspace-logo {
            color: #fff;
            font-size: 18px;
            font-weight: bold;
            text-decoration: none;
        }
        
        #window-projects .nav-links {
            display: flex;
            gap: 15px;
        }
        
        #window-projects .nav-links a {
            color: #fff;
            text-decoration: none;
            font-size: 11px;
        }
        
        #window-projects .nav-links a:hover {
            text-decoration: underline;
        }
        
        #window-projects .main-container {
            max-width: 1000px;
            margin: 0 auto;
            background: #fff;
        }
        
        #window-projects .profile-header {
            background: linear-gradient(45deg, #e91e63, #ff6b9d, #ffd93d, #ff9800);
            background-size: 400% 400%;
            animation: gradientShift 8s ease-in-out infinite;
            padding: 20px;
            color: #fff;
            text-align: center;
            position: relative;
            overflow: hidden;
        }
        
        @keyframes gradientShift {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
        }
        
        #window-projects .profile-header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><text y="50" font-size="60" fill="%23ffffff20">✨</text></svg>') repeat;
            animation: sparkleMove 10s linear infinite;
        }
        
        @keyframes sparkleMove {
            0% { background-position: 0 0; }
            100% { background-position: 100px 100px; }
        }
        
        #window-projects .profile-name {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 5px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
            position: relative;
            z-index: 2;
        }
        
        #window-projects .profile-tagline {
            font-size: 14px;
            margin-bottom: 10px;
            position: relative;
            z-index: 2;
        }
        
        #window-projects .profile-stats {
            display: flex;
            justify-content: center;
            gap: 20px;
            position: relative;
            z-index: 2;
        }
        
        #window-projects .stat-item {
            text-align: center;
        }
        
        #window-projects .stat-number {
            font-size: 16px;
            font-weight: bold;
        }
        
        #window-projects .stat-label {
            font-size: 10px;
        }
        
        #window-projects .main-content {
            display: grid;
            grid-template-columns: 300px 1fr;
            gap: 0;
            background: #fff;
            height: 100%;
        }
        
        #window-projects .sidebar {
            background: #f0f0f0;
            border-right: 1px solid #ccc;
            padding: 15px;
        }
        
        #window-projects .sidebar-section {
            margin-bottom: 20px;
            background: #fff;
            border: 1px solid #ccc;
            border-radius: 5px;
            overflow: hidden;
        }
        
        #window-projects .sidebar-header {
            background: linear-gradient(to bottom, #4facfe, #00f2fe);
            color: #fff;
            padding: 8px 10px;
            font-weight: bold;
            font-size: 12px;
        }
        
        #window-projects .sidebar-content {
            padding: 10px;
            color: #333;
            font-size: 11px;
            line-height: 1.4;
        }
        
        #window-projects .friend-space {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 5px;
            margin-top: 10px;
        }
        
        #window-projects .friend-pic {
            width: 50px;
            height: 50px;
            background: linear-gradient(45deg, #e91e63, #ff6b9d);
            border: 2px solid #fff;
            border-radius: 3px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #fff;
            font-size: 8px;
            text-align: center;
            cursor: pointer;
            transition: transform 0.2s;
        }
        
        #window-projects .friend-pic:hover {
            transform: scale(1.1);
        }
        
        #window-projects .content-area {
            padding: 15px;
            color: #333;
            overflow-y: auto;
            height: 430px;
        }
        
        #window-projects .blog-section {
            background: #fff;
            border: 1px solid #ccc;
            border-radius: 5px;
            margin-bottom: 20px;
            overflow: hidden;
        }
        
        #window-projects .blog-header {
            background: linear-gradient(to bottom, #ff6b9d, #e91e63);
            color: #fff;
            padding: 10px;
            font-weight: bold;
            font-size: 14px;
        }
        
        #window-projects .blog-content {
            padding: 15px;
            font-size: 12px;
            line-height: 1.5;
        }
        
        #window-projects .blog-post {
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 1px dashed #ccc;
        }
        
        #window-projects .blog-post:last-child {
            border-bottom: none;
            margin-bottom: 0;
        }
        
        #window-projects .blog-date {
            color: #666;
            font-size: 10px;
            margin-bottom: 8px;
        }
        
        #window-projects .blog-text {
            margin-bottom: 10px;
        }
        
        #window-projects .highlight {
            background: #ffff00;
            padding: 1px 3px;
            color: #333;
            font-weight: bold;
        }
        
        #window-projects .mood-icon {
            display: inline-block;
            margin: 0 3px;
        }
        
        #window-projects .comments-section {
            background: #f8f8f8;
            border: 1px solid #ddd;
            border-radius: 5px;
            margin-top: 15px;
        }
        
        #window-projects .comments-header {
            background: linear-gradient(to bottom, #ffd93d, #ff9800);
            color: #333;
            padding: 8px 10px;
            font-weight: bold;
            font-size: 12px;
        }
        
        #window-projects .comment {
            padding: 10px;
            border-bottom: 1px solid #eee;
            font-size: 11px;
        }
        
        #window-projects .comment:last-child {
            border-bottom: none;
        }
        
        #window-projects .comment-author {
            font-weight: bold;
            color: #e91e63;
        }
        
        #window-projects .interests-list {
            display: flex;
            flex-wrap: wrap;
            gap: 5px;
            margin-top: 8px;
        }
        
        #window-projects .interest-tag {
            background: linear-gradient(45deg, #4facfe, #00f2fe);
            color: #fff;
            padding: 2px 6px;
            border-radius: 10px;
            font-size: 9px;
            font-weight: bold;
        }
        
        #window-projects .music-player {
            background: #000;
            color: #00ff00;
            padding: 10px;
            border-radius: 5px;
            font-family: 'Courier New', monospace;
            font-size: 10px;
            margin-top: 10px;
        }
        
        #window-projects .player-controls {
            display: flex;
            gap: 5px;
            margin-top: 5px;
        }
        
        #window-projects .player-btn {
            background: #333;
            color: #fff;
            border: 1px solid #666;
            padding: 2px 6px;
            font-size: 9px;
            cursor: pointer;
        }
        
        #window-projects .player-btn:hover {
            background: #666;
        }
        
        #window-projects .blink {
            animation: blink 1s infinite;
        }
        
        @keyframes blink {
            0%, 50% { opacity: 1; }
            51%, 100% { opacity: 0; }
        }
        
        #window-projects .creator-tools-showcase {
            background: linear-gradient(135deg, #e91e63, #ff6b9d);
            color: #fff;
            padding: 15px;
            border-radius: 10px;
            margin: 15px 0;
            text-align: center;
            position: relative;
            overflow: hidden;
        }
        
        #window-projects .creator-tools-showcase::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent);
            animation: shine 3s linear infinite;
        }
        
        @keyframes shine {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        #window-projects .showcase-title {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 10px;
            position: relative;
            z-index: 2;
        }
        
        #window-projects .showcase-subtitle {
            font-size: 12px;
            position: relative;
            z-index: 2;
        }
        
        @media (max-width: 768px) {
            #window-projects .main-content {
                grid-template-columns: 1fr;
            }
            
            #window-projects .sidebar {
                order: 2;
            }
            
            #window-projects .friend-space {
                grid-template-columns: repeat(8, 1fr);
            }
        }
        
        #window-projects .glitter-text {
            background: linear-gradient(45deg, #e91e63, #ff6b9d, #ffd93d, #4facfe);
            background-size: 400% 400%;
            animation: glitter 2s ease-in-out infinite;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            font-weight: bold;
        }
        
        @keyframes glitter {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
        }
        
        #window-projects .message-text {
            color: black;
        }
        
        #window-projects .timestamp {
            color: red;
        }
        
        #window-projects .admin-username {
            color: red;
        }
    </style>
    <div class="myspace-header">
        <div class="myspace-nav">
            <a href="#" class="myspace-logo">MySpace.com</a>
            <div class="nav-links">
                <a href="#">Home</a>
                <a href="#">Browse</a>
                <a href="#">Search</a>
                <a href="#">Invite</a>
                <a href="#">Film</a>
                <a href="#">Mail</a>
                <a href="#">Blog</a>
                <a href="#">Favorites</a>
                <a href="#">Forum</a>
                <a href="#">Groups</a>
                <a href="#">Events</a>
                <a href="#">Videos</a>
                <a href="#">Music</a>
                <a href="#">Comedy</a>
                <a href="#">Classifieds</a>
            </div>
        </div>
    </div>

    <div class="main-container">
        <div class="profile-header">
            <div class="profile-name">Pinterest 📌</div>
            <div class="profile-tagline">"From Inspiration to Creation - The Ultimate Pin Paradise!"</div>
            <div class="profile-stats">
                <div class="stat-item">
                    <div class="stat-number">463,000,000</div>
                    <div class="stat-label">Monthly Pinners</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number">240 Billion</div>
                    <div class="stat-label">Pins Saved</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number">∞</div>
                    <div class="stat-label">Inspiration</div>
                </div>
            </div>
        </div>

        <div class="main-content">
            <div class="sidebar">
                <div class="sidebar-section">
                    <div class="sidebar-header">Pinterest's Details</div>
                    <div class="sidebar-content">
                        <strong>Status:</strong> <span class="glitter-text">Redefining Creation!</span><br>
                        <strong>Here for:</strong> Inspiring & Empowering Creators<br>
                        <strong>Hometown:</strong> San Francisco, CA<br>
                        <strong>Founded:</strong> 2010<br>
                        <strong>Mood:</strong> <span class="mood-icon">✨</span> Creative & Ambitious <span class="mood-icon">🚀</span><br>
                        <strong>Relationship Status:</strong> In a relationship with Innovation
                    </div>
                </div>

                <div class="sidebar-section">
                    <div class="sidebar-header">Pinterest's Interests</div>
                    <div class="sidebar-content">
                        <div class="interests-list">
                            <span class="interest-tag">Creator Tools</span>
                            <span class="interest-tag">0-to-1 Products</span>
                            <span class="interest-tag">UX Design</span>
                            <span class="interest-tag">Market Distinction</span>
                            <span class="interest-tag">Brand Identity</span>
                            <span class="interest-tag">User Engagement</span>
                            <span class="interest-tag">Community Building</span>
                            <span class="interest-tag">Native Content</span>
                            <span class="interest-tag">Platform Evolution</span>
                        </div>
                    </div>
                </div>

                <div class="sidebar-section">
                    <div class="sidebar-header">Pinterest's Top 8 Friends</div>
                    <div class="sidebar-content">
                        <div class="friend-space">
                            <div class="friend-pic">Creative<br>Community</div>
                            <div class="friend-pic">Content<br>Creators</div>
                            <div class="friend-pic">Design<br>Team</div>
                            <div class="friend-pic">Product<br>Innovation</div>
                            <div class="friend-pic">User<br>Experience</div>
                            <div class="friend-pic">Brand<br>Strategy</div>
                            <div class="friend-pic">Market<br>Research</div>
                            <div class="friend-pic">Future<br>Vision</div>
                        </div>
                    </div>
                </div>

                <div class="sidebar-section">
                    <div class="sidebar-header">Now Playing ♪</div>
                    <div class="sidebar-content">
                        <div class="music-player">
                            <div>♪ "Creativity Unleashed" ♪</div>
                            <div style="margin: 5px 0;">by The Pinterest Experience</div>
                            <div class="player-controls">
                                <button class="player-btn">⏮</button>
                                <button class="player-btn">▶</button>
                                <button class="player-btn">⏸</button>
                                <button class="player-btn">⏭</button>
                                <button class="player-btn">🔄</button>
                            </div>
                            <div style="margin-top: 5px; font-size: 8px;">
                                Status: <span class="blink">♪ VIBING ♪</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="content-area">
                <div class="creator-tools-showcase">
                    <div class="showcase-title">🎨 CREATOR TOOLS REVOLUTION 🎨</div>
                    <div class="showcase-subtitle">Transforming Pinterest from Inspiration Hub to Creation Powerhouse!</div>
                </div>

                <div class="blog-section">
                    <div class="blog-header">Pinterest's Blog - "The Creation Chronicles"</div>
                    <div class="blog-content">
                        
                        <div class="blog-post">
                            <div class="blog-date">Posted: March 15, 2024 at 2:30 PM</div>
                            <div class="blog-text">
                                <strong>OMG you guys!!! 😍</strong> So I have THE most exciting news to share! A few episodes back (lol life is like a TV show sometimes), I joined Pinterest at literally the most <span class="highlight">PIVOTAL MOMENT</span> ever!!! 
                                <br><br>
                                Like, picture this: Pinterest was making this HUGE bet to totally reposition itself! We weren't just going to be a platform for inspiration anymore (though we're still the QUEENS of that obvi 👑), but we were diving headfirst into <span class="highlight">CREATION</span>! 
                                <br><br>
                                Basically, we wanted to encourage <span class="highlight">native content creation</span> right on our platform! How cool is that?! <span class="mood-icon">🤩</span>
                            </div>
                        </div>

                        <div class="blog-post">
                            <div class="blog-date">Posted: March 10, 2024 at 11:45 AM</div>
                            <div class="blog-text">
                                So Pinterest already had this AMAZING ritual (seriously, it's like muscle memory for our Pinners! 💪) where people would privately search for and save content. Like, we had that DOWN! 
                                <br><br>
                                But here's where it gets SUPER exciting - I got to be part of the team developing a whole <span class="highlight">suite of creator tools</span>! The goal? To push for deeper engagement with a real sense of <span class="highlight">community and creativity</span>! 
                                <br><br>
                                I'm literally getting goosebumps just thinking about it! <span class="mood-icon">✨</span>
                            </div>
                        </div>

                        <div class="blog-post">
                            <div class="blog-date">Posted: March 5, 2024 at 4:20 PM</div>
                            <div class="blog-text">
                                Okay, so here's the really nerdy part that I'm OBSESSED with <span class="mood-icon">🤓</span> - this involved developing <span class="highlight">0 to 1 creator features</span> inside the Pinterest ecosystem! 
                                <br><br>
                                The challenge was INSANE but in the best way possible: we needed to create <span class="highlight">market distinction</span> while maintaining our <span class="highlight">brand identity</span> and making sure everything was still super <span class="highlight">user comprehensive</span>!
                                <br><br>
                                Like, imagine trying to revolutionize something while keeping its soul intact? That's exactly what we were doing! <span class="mood-icon">🎨</span>
                            </div>
                        </div>

                        <div class="blog-post">
                            <div class="blog-date">Posted: February 28, 2024 at 9:15 AM</div>
                            <div class="blog-text">
                                Can I just say how HONORED I felt to contribute to this project?! <span class="mood-icon">🥺</span> 
                                <br><br>
                                This was my very first <span class="highlight">full-time design gig</span> and I got thrown into this incredible, exciting challenge! Talk about jumping into the deep end! 
                                <br><br>
                                Every day I woke up thinking "I can't believe I get to work on tools that will help creators bring their visions to life!" The energy was just UNMATCHED! <span class="mood-icon">⚡</span>
                                <br><br>
                                Shoutout to my amazing team for making this newbie feel so welcome! You guys ROCK! <span class="mood-icon">🎸</span>
                            </div>
                        </div>

                    </div>
                </div>

                <div class="comments-section">
                    <div class="comments-header">Friends' Comments (47)</div>
                    <div class="comment">
                        <span class="comment-author">DesignGuru2006:</span> OMG this sounds AMAZING!!! Creator tools are the future! 🚀
                    </div>
                    <div class="comment">
                        <span class="comment-author">PinnerForLife:</span> Wait you worked on the new creation features?! Those are literally changing my life! ✨
                    </div>
                    <div class="comment">
                        <span class="comment-author">UXQueen:</span> 0-to-1 products are SO hard! You're incredible! 👏
                    </div>
                    <div class="comment">
                        <span class="comment-author">CreativeVibes:</span> The fact that this was your first full-time gig makes this even more impressive! 🔥
                    </div>
                    <div class="comment">
                        <span class="comment-author">BrandStrategy:</span> Market distinction while maintaining brand identity = GENIUS! 🧠
                    </div>
                </div>
            </div>
        </div>
    </div>
`;
    const workExplorerContent = {
        'C:\\Desktop\\Work': { type: 'folder', name: 'Work', children: ['Pinterest', 'AMP', 'Duolingo', 'Diversify'] },
        'AMP': {
            type: 'html_file',
            name: 'Amp',
            filePath: 'amp_tab.html',
            icon: "assets/app icons/amp app icon.png"
        },
        'Duolingo': {
            type: 'html_file',
            name: 'Duolingo',
            filePath: 'duolingo_tab.html',
            icon: "assets/app icons/duo app icon.png"
        },
        'Pinterest': {
            type: 'html_file',
            name: 'Pinterest',
            filePath: 'pinterest_page.html',
            icon: "assets/app icons/pinterest app icon.png"
        },
        'Diversify': {
            type: 'html_file',
            name: 'Diversify Design',
            filePath: 'diversify_design.html',
            icon: 'assets/app icons/diversify_design_logo.jpeg'
        }
    };
    let explorerHistory = ['C:\\Desktop\\Work'];
    let currentExplorerPath = 'C:\\Desktop\\Work';
    function setActiveTab(tabIdentifier) {
        const projectsWindow = document.getElementById('window-projects');
        if (!projectsWindow) return;
        projectsWindow.querySelectorAll('.favorite-link').forEach(link => {
            link.classList.toggle('selected', link.dataset.path === tabIdentifier);
        });
    }

    function resetFavoritesBar() {
        const projectsWindow = document.getElementById('window-projects');
        if (!projectsWindow) return;
        const favoritesBar = projectsWindow.querySelector('.ie-favorites-bar');
        if (!favoritesBar) return;

        favoritesBar.querySelector('.back-button-favorites')?.remove();
    }

    function loadUrlInExplorer(url, title) {
        explorerHistory.push(url);
        const projectsWindow = document.getElementById('window-projects');
        if (!projectsWindow) return;

        const folderView = projectsWindow.querySelector('.folder-view');
        if (folderView) {
            folderView.innerHTML = `<iframe src="${url}" class="website-iframe" title="${title}"></iframe>`;
            setActiveTab('iframe-view');
        }
        
        const titleBarText = projectsWindow.querySelector('.title-bar-text');
        if(titleBarText) titleBarText.textContent = `work.explorer - ${title}`;

        const addressBar = projectsWindow.querySelector('#address-bar');
        if(addressBar) addressBar.value = url;
        
        // Remove back button from favorites bar
        const favoritesBar = projectsWindow.querySelector('.ie-favorites-bar');
        if (favoritesBar) {
            favoritesBar.querySelector('.back-button-favorites')?.remove();
        }

        // Add back button to the main toolbar
        const backButtonContainer = projectsWindow.querySelector('#back-button-container');
        if (backButtonContainer) {
            backButtonContainer.innerHTML = ''; // Clear existing buttons
            const backButton = document.createElement('button');
            backButton.innerHTML = '&larr; Back';
            backButton.onclick = goBackInExplorer;
            backButtonContainer.appendChild(backButton);
        }
    }

    function renderWorkExplorer(path) {
        currentExplorerPath = path;
        const projectsWindow = document.getElementById('window-projects');
        if (!projectsWindow) return;
        resetFavoritesBar();

        const folderView = projectsWindow.querySelector('.folder-view');
        const addressBar = projectsWindow.querySelector('#address-bar');
        const backButtonContainer = projectsWindow.querySelector('#back-button-container');
        if (!folderView || !addressBar) return;
        folderView.innerHTML = '';
        addressBar.value = path;
        const content = workExplorerContent[path];
        if (backButtonContainer) {
            backButtonContainer.innerHTML = '';
            if (explorerHistory.length > 1) {
                const backButton = document.createElement('button');
                backButton.innerHTML = '&larr; Back';
                backButton.onclick = goBackInExplorer;
                backButtonContainer.appendChild(backButton);
            }
        }
        if (!content) {
            folderView.innerHTML = '<p>Not Found</p>';
            return;
        }
        if (content.type === 'folder') {
            setActiveTab(path);
            content.children.forEach(itemName => {
                const item = workExplorerContent[itemName];
                if(item){
                    const fileIcon = document.createElement('div');
                    fileIcon.className = 'file-icon';
                    fileIcon.innerHTML = `<img src="${item.icon}" alt="${item.name}"><span>${item.name}</span>`;
                    fileIcon.onclick = () => {
                        playClickSound();
                        explorerHistory.push(itemName);
                        showProjectDetail(itemName);
                    };
                    folderView.appendChild(fileIcon);
                }
            });
        } else if (content.type === 'app' || content.type === 'html_file') {
            showProjectDetail(path);
        }
    }
    function showHomepage() {
        const projectsWindow = document.getElementById('window-projects');
        if (!projectsWindow) return;
        resetFavoritesBar();

        const titleBarText = projectsWindow.querySelector('.title-bar-text');
        if(titleBarText) titleBarText.textContent = "work.explorer - Amy's Profile";
        
        const addressBar = projectsWindow.querySelector('#address-bar');
        if(addressBar) addressBar.value = 'C:\\Users\\Amy';

        const folderView = projectsWindow.querySelector('.folder-view');
        if (folderView) {
            const today = new Date();
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const day = String(today.getDate()).padStart(2, '0');
            const year = today.getFullYear();
            const lastLoginDate = `${month}/${day}/${year}`;

            const top8Friends = [
                { name: 'Alan', img: 'assets/top 8 profile pics/Alan.png', url: 'https://alanwalkermakes.com/' },
                { name: 'Yamilah', img: 'assets/top 8 profile pics/Yamilah.png', url: 'https://yamilah.com/' },
                { name: 'MDS', img: 'assets/top 8 profile pics/mds.jpg', url: 'https://mds.is/' },
                { name: 'Catt', img: 'assets/top 8 profile pics/Catt.png', url: 'https://cattsmall.com/' },
                { name: 'Gui', img: 'assets/top 8 profile pics/Gui.png', url: 'https://seiz.design/' },
                { name: 'Nikita', img: 'assets/top 8 profile pics/Nikita.png', url: 'http://blackuxdesigner.com/' },
                { name: 'Rich', img: 'assets/top 8 profile pics/Rich.png', url: 'https://rich-arnold.com/' },
                { name: 'Anna', img: 'assets/top 8 profile pics/Anna.png', url: 'https://dribbble.com/annabrenner' }
            ];

            const friendsHTML = top8Friends.map(friend => `
                <div class="friend-card">
                    <a href="#" data-url="${friend.url}" data-name="${friend.name}">
                        <img src="${friend.img}" alt="${friend.name}">
                        <span>${friend.name}</span>
                    </a>
                </div>
            `).join('');

            folderView.innerHTML = `
                <div class="myspace-container">
                    <div class="myspace-profile-grid">
                        <div class="profile-left-col">
                            <div class="profile-main-info">
                                <h2>Amy Lima</h2>
                                <div class="profile-header">
                                    <img src="assets/myspace prof pic.png" alt="Amy's Profile Picture" class="profile-pic-main">
                                    <div class="profile-details">
                                        <p>she/her • 32 years old<br>Brooklyn</p>
                                        <p class="last-login">last login:<br>${lastLoginDate}</p>
                                    </div>
                                </div>
                            </div>

                            <div class="profile-contact-box">
                                <h3>Contacting Amy</h3>
                                <ul>
                                    <li><a href="mailto:amylima.design@gmail.com">Send Message</a></li>
                                    <li><a href="https://www.linkedin.com/in/amylima" target="_blank">Add to Friends</a></li>
                                </ul>
                            </div>

                            <div class="profile-contact-box">
                                <h3>Links</h3>
                                <ul>
                                    <li><a href="https://www.youtube.com/watch?v=elAzAHDPXx8" target="_blank">How to go from a layoff to your dream role: Dive Club</a></li>
                                    <li><a href="https://www.linkedin.com/posts/amylima_metalayoffs-techlayoffs-activity-6996934673507459072-kIzM/?utm_source=share&utm_medium=member_desktop" target="_blank">The Art of the Pivot: Pinterest Offsite</a></li>
                                    <li><a href="https://spaces.is/loversmagazine/interviews/amy-lima" target="_blank">Lovers Interview: Lovers Mag</a></li>
                                </ul>
                            </div>
                        </div>
                        <div class="profile-right-col">
                            <div class="profile-blurbs">
                                <h3>About Me</h3>
                                <div class="blurb-section">
                                    <p>I've always been obsessed with the "why" behind how people connect-with each other, with ideas, with the world around them.<br><br>As a first-generation American raised by Brazilian parents, I grew up between cultures-never fully of one world or another.<br><br>But this third-culture experience also sparked an early curiosity about belonging and identity, and it's shaped everything since.<br><br>That lens—of exploring how people find their people—has been the throughline of my life and career.<br><br>I see design as a way to support human connection—tools that don't just serve users, but celebrate who they are and how they show up for each other.<br><br>I'm grateful you showed up here, and I hope you have fun <3333</p>
                                </div>
                            </div>
                            <!--
                            <div class="profile-interests-box">
                                 <h3>Amy's Interests</h3>
                                 <div class="interests-section">
                                    <span>General</span>
                                    <p>Human behavior, anthropology, third-culture kids, beautiful data, postmodernism, a good bodega cat.</p>
                                 </div>
                                  <div class="interests-section">
                                    <span>Music</span>
                                    <p>Funk, R&B, reggaeton, indie pop, anything I can dance to.</p>
                                 </div>
                                 <div class="interests-section">
                                    <span>Movies</span>
                                    <p>A24, psychological thrillers, coming-of-age stories, international films.</p>
                                 </div>
                            </div>
                            -->
                        </div>
                    </div>
                    <div class="profile-friends">
                        <h3>Amy's Top 8</h3>
                        <div class="top-8-grid">
                            ${friendsHTML}
                        </div>
                    </div>
                </div>
            `;

            folderView.querySelectorAll('.friend-card a').forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const url = e.currentTarget.dataset.url;
                    const name = e.currentTarget.dataset.name;
                    if (name === 'Anna') {
                        window.open(url, '_blank');
                    } else {
                        playClickSound();
                        explorerHistory.push(name);
                        loadUrlInExplorer(url, `${name}'s Portfolio`);
                    }
                });
            });
            
            setActiveTab('homepage');

            const backButtonContainer = projectsWindow.querySelector('#back-button-container');
            if (backButtonContainer) {
                backButtonContainer.innerHTML = '';
            }
        }
    }
    function showProjectDetail(projectName) {
        const projectsWindow = document.getElementById('window-projects');
        if (!projectsWindow) return;
        resetFavoritesBar();
        const mainArea = projectsWindow.querySelector('.folder-view');
        const project = workExplorerContent[projectName];
        
        const titleBarText = projectsWindow.querySelector('.title-bar-text');
        const addressBar = projectsWindow.querySelector('#address-bar');

        if (project && project.type === 'app' && mainArea) {
            mainArea.innerHTML = `<div class="project-detail-content">${project.description}</div>`;
            if(titleBarText) titleBarText.textContent = `work.explorer - ${project.name}`;
            if(addressBar) addressBar.value = `C:\\Desktop\\Work\\${project.name}`;
            setActiveTab(projectName);

            const viewButton = mainArea.querySelector('.view-project-btn');
            if(viewButton) {
                viewButton.onclick = () => {
                    playClickSound();
                    loadUrlInExplorer(project.url, project.name);
                };
            }

            const backButtonContainer = projectsWindow.querySelector('#back-button-container');
             if (backButtonContainer) {
                backButtonContainer.innerHTML = '';
                if (explorerHistory.length > 1) {
                    const backButton = document.createElement('button');
                    backButton.innerHTML = '&larr; Back';
                    backButton.onclick = () => {
                        playClickSound();
                        goBackInExplorer();
                    };
                    backButtonContainer.appendChild(backButton);
                }
            }

        } else if (project && project.type === 'html_file' && mainArea) {
            if(titleBarText) titleBarText.textContent = `work.explorer - ${project.name}`;
            if(addressBar) addressBar.value = `C:\\Desktop\\Work\\${project.name}`;
            setActiveTab(projectName);

            const cacheBust = new Date().getTime();
            mainArea.innerHTML = `<iframe src="${project.filePath}?v=${cacheBust}" class="website-iframe" title="${project.name}"></iframe>`;
            
            const backButtonContainer = projectsWindow.querySelector('#back-button-container');
            if (backButtonContainer) {
               backButtonContainer.innerHTML = '';
               if (explorerHistory.length > 1) {
                   const backButton = document.createElement('button');
                   backButton.innerHTML = '&larr; Back';
                   backButton.onclick = () => {
                       playClickSound();
                       goBackInExplorer();
                   };
                   backButtonContainer.appendChild(backButton);
               }
           }
           return;
        } else {
            showHomepage();
        }
    }
    function initializeWorkExplorer() {
        const projectsWindow = document.getElementById('window-projects');
        if (!projectsWindow) return;
        const favoritesBar = projectsWindow.querySelector('.ie-favorites-bar .favorites-links');
        if (!favoritesBar) return;
        favoritesBar.innerHTML = ''; 
        const favs = ['Pinterest', 'AMP', 'Duolingo', 'Diversify'];
        const homeButton = document.createElement('div');
        homeButton.className = 'favorite-link';
        homeButton.dataset.path = 'homepage';
        homeButton.innerHTML = `<img src="assets/desktop icons/home-folder-icon.png" alt="Home"> Home`;
        homeButton.onclick = () => {
            playClickSound();
            explorerHistory.push('homepage');
            showHomepage();
        };
        favoritesBar.appendChild(homeButton);
        favs.forEach(favName => {
            const item = workExplorerContent[favName];
            if (item) {
                const favLink = document.createElement('div');
                favLink.className = 'favorite-link';
                favLink.dataset.path = favName;
                favLink.innerHTML = `<img src="${item.icon}" alt="${item.name}" class="fav-icon">${item.name}`;
                favLink.onclick = () => {
                    playClickSound();
                    explorerHistory.push(favName); 
                    showProjectDetail(favName);
                };
                favoritesBar.appendChild(favLink);
            }
        });
        explorerHistory = ['homepage'];
        showHomepage();
    }

    function goBackInExplorer() {
        if (explorerHistory.length <= 1) return;
        explorerHistory.pop();
        const destination = explorerHistory[explorerHistory.length - 1];

        if (typeof destination === 'string') {
            if (destination === 'homepage') {
                showHomepage();
            } else if (workExplorerContent[destination] && (workExplorerContent[destination].type === 'app' || workExplorerContent[destination].type === 'html_file')) {
                showProjectDetail(destination);
            } else if (workExplorerContent[destination] && workExplorerContent[destination].type === 'folder') {
                renderWorkExplorer(destination);
            } else {
                showHomepage(); // fallback
            }
        } else if (typeof destination === 'object' && destination.type === 'iframe') {
            loadUrlInExplorer(destination.url, destination.title);
        }
    }

    // Initial calls
    populateWallpaperMenu();
    setInterval(updateClock, 1000);
    updateClock();
    
    // Note: welcomeWindow is now shown by the startup sequence
});
                
                