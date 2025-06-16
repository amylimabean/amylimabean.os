// script.js
// This file is for any future JavaScript enhancements.
// For now, it's intentionally left minimal for this simple prototype.

// Example of a very simple interaction (optional):
// document.addEventListener('DOMContentLoaded', () => {
//     const profileName = document.querySelector('.profile-name h1');
//     if (profileName) {
//         profileName.addEventListener('click', () => {
//             alert('You clicked my name! Thanks for visiting my MySpace... I mean, portfolio!');
//         });
//     }
// }); 

document.addEventListener('DOMContentLoaded', () => {
    // --- Inject Polaroid CSS ---
    const polaroidStyles = `
        .photobook-carousel {
            position: relative;
            width: 100%;
            height: 440px; /* Adjusted for larger polaroids */
            overflow: hidden;
        }
        .polaroid {
            background-image: url('assets/images/polaroid-frame.png');
            background-size: 100% 100%;
            background-repeat: no-repeat;
            
            display: none;
            position: absolute;

            width: 330px; /* 10% larger */
            height: 396px; /* 10% larger */

            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }
        .polaroid.active {
            display: block;
        }
        .carousel-image {
            position: absolute;
            top: 7.5%; 
            left: 8.5%;
            width: 83%;
            height: 72%;
            object-fit: cover;
            
            border: none;
        }
        .polaroid-caption {
            position: absolute;
            bottom: 15px;
            left: 0;
            width: 100%;
            text-align: center;
            font-family: 'Give You Glory', cursive;
            font-size: 24px;
            color: #000;
        }
    `;
    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = polaroidStyles;
    document.head.appendChild(styleSheet);
    // --- End of CSS Injection ---

    const desktopArea = document.querySelector('.desktop-area');
    const icons = document.querySelectorAll('.desktop-icon');
    const windows = document.querySelectorAll('.window');
    const modalOverlay = document.getElementById('modal-overlay');
    let highestZIndex = 100; // Initial z-index for windows
    let nextSlotIndex = 0;
    let photobookInitialized = false;

    const windowSlots = [
        { x: 50, y: 70 },   // Top-left-ish
        { x: 450, y: 90 },  // Top-right-ish (for an average window)
        { x: 70, y: 280 },  // Mid-left, lower down
        { x: 500, y: 300 }, // Mid-right-ish, lower down
        { x: 250, y: 180 }  // More central, offset from others
    ];

    function initializePhotobook() {
        const photobookWindow = document.getElementById('window-photobook');
        if (!photobookWindow) return;
    
        const prevButton = photobookWindow.querySelector('.prev-photo');
        const nextButton = photobookWindow.querySelector('.next-photo');
        const carousel = photobookWindow.querySelector('.photobook-carousel');
        
        // Step 1: Extract image data to a clean array, preventing DOM iteration issues.
        const imageData = Array.from(carousel.querySelectorAll('.carousel-image')).map(img => ({
            src: img.src,
            alt: img.alt
        }));
    
        // Step 2: Clear the container.
        carousel.innerHTML = '';
        
        // Step 3: Create all new elements from the clean data.
        const polaroids = imageData.map(data => {
            const polaroid = document.createElement('div');
            polaroid.className = 'polaroid';

            const image = document.createElement('img');
            image.src = data.src;
            image.alt = data.alt; // Directly use the corrected alt text
            image.className = 'carousel-image';

            const caption = document.createElement('div');
            caption.className = 'polaroid-caption';
            caption.textContent = data.alt; // Use alt text for the caption

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
            polaroids.forEach((p, i) => {
                p.classList.toggle('active', i === index);
            });
            currentImageIndex = index;
        }
    
        if (prevButton && nextButton && polaroids.length > 0) {
            prevButton.addEventListener('click', () => {
                let newIndex = currentImageIndex - 1;
                if (newIndex < 0) newIndex = polaroids.length - 1;
                showImage(newIndex);
            });
            nextButton.addEventListener('click', () => {
                let newIndex = currentImageIndex + 1;
                if (newIndex >= polaroids.length) newIndex = 0;
                showImage(newIndex);
            });
            
            showImage(0); // Activate the first Polaroid.
        }
    }

    // A robust function to bring a window to the top layer
    function bringToFront(windowElement) {
        if (!windowElement) return;

        // Find the highest z-index currently in use by any window.
        // We start at 100, which is the base z-index set in the CSS.
        let maxZ = 100;
        document.querySelectorAll('.window').forEach(win => {
            const z = parseInt(window.getComputedStyle(win).zIndex, 10);
            if (!isNaN(z) && z > maxZ) {
                maxZ = z;
            }
        });

        // Set the target window's z-index to be one higher than the max.
        windowElement.style.zIndex = maxZ + 1;
    }

    // --- Window Functionality (Dragging, Closing, Focusing) ---
    windows.forEach(win => {
        const titleBar = win.querySelector('.title-bar');
        const closeButton = win.querySelector('.title-bar-buttons .close');

        if (closeButton) {
            closeButton.addEventListener('click', (e) => {
                e.stopPropagation();
                
                if (win.id === 'window-about-bean') {
                    const modalOverlay = document.getElementById('modal-overlay');
                    if (modalOverlay) {
                        modalOverlay.style.display = 'none';
                    }
                    // Reset z-index tracker
                    let maxZ = 99; // Start below default
                    document.querySelectorAll('.window:not(#window-about-bean)').forEach(w => {
                        const z = parseInt(w.style.zIndex, 10);
                        if (!isNaN(z) && z > maxZ) {
                            maxZ = z;
                        }
                    });
                    highestZIndex = maxZ > 99 ? maxZ : 100;
                }
                win.style.display = 'none';

                if (clickSound) { 
                    clickSound.currentTime = 0;
                    clickSound.play().catch(error => {
                        console.warn("Close button click sound playback failed:", error);
                    });
                }
            });
        }

        if (titleBar) {
            win.addEventListener('mousedown', (e) => {
                bringToFront(win);

                const nonDraggableTags = ['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA'];
                if (nonDraggableTags.includes(e.target.tagName) || e.target.closest('button, a, input, select, textarea')) {
                    return;
                }

                // If the window is positioned with transform (i.e., our centered modal),
                // we convert its position to pixel-based top/left before starting the drag.
                if (win.style.transform !== 'none' && win.style.transform !== '') {
                    const rect = win.getBoundingClientRect();
                    win.style.left = rect.left + 'px';
                    win.style.top = rect.top + 'px';
                    win.style.transform = 'none'; // Remove transform to prevent conflicts
                }
                
                win.isDragging = true;
                // Use getBoundingClientRect for consistent offset calculation, especially for fixed elements.
                win.offsetX = e.clientX - win.getBoundingClientRect().left;
                win.offsetY = e.clientY - win.getBoundingClientRect().top;
                win.style.cursor = 'grabbing';
            });
        }
    });

    // Global mouse move for dragging windows
    document.addEventListener('mousemove', (e) => {
        windows.forEach(win => {
            if (win.isDragging) {
                let newX = e.clientX - win.offsetX;
                let newY = e.clientY - win.offsetY;
                const desktopRect = desktopArea.getBoundingClientRect();
                const menubarHeight = document.querySelector('.menubar').offsetHeight;
                const shadowBuffer = 10; // Creates a 10px buffer for the shadow
                newX = Math.max(0, Math.min(newX, desktopRect.width - win.offsetWidth - shadowBuffer));
                newY = Math.max(0, Math.min(newY, desktopRect.height - win.offsetHeight));
                win.style.left = newX + 'px';
                win.style.top = newY + 'px';
            }
        });
    });

    // Global mouse up to stop dragging
    document.addEventListener('mouseup', () => {
        windows.forEach(win => {
            win.isDragging = false;
            const titleBar = win.querySelector('.title-bar');
            win.style.cursor = 'default';
            if (titleBar) {
                titleBar.style.cursor = 'grab';
            }
        });
    });

    // --- Desktop Icon Click Functionality ---
    icons.forEach(iconToDrag => {
        iconToDrag.addEventListener('dblclick', () => {
            const windowId = iconToDrag.id.replace('icon-', 'window-');
            const targetWindow = document.getElementById(windowId);
            if (targetWindow) {
                const isCurrentlyHidden = getComputedStyle(targetWindow).display === 'none';
                targetWindow.style.display = 'flex';
                if (isCurrentlyHidden) {
                    let slot = windowSlots[nextSlotIndex];
                    if (windowId === 'window-projects') {
                        const welcomeWindow = document.getElementById('window-welcome');
                        if (welcomeWindow && welcomeWindow.style.display !== 'none') {
                            const wx = welcomeWindow.offsetLeft;
                            const wy = welcomeWindow.offsetTop;
                            const ww = welcomeWindow.offsetWidth;
                            const wh = welcomeWindow.offsetHeight;
                            if (
                                slot.x < wx + ww && slot.x + targetWindow.offsetWidth > wx &&
                                slot.y < wy + wh && slot.y + targetWindow.offsetHeight > wy
                            ) {
                                slot = { x: wx + ww + 40, y: wy + 40 };
                            }
                        }
                    }
                    targetWindow.style.left = slot.x + 'px';
                    targetWindow.style.top = slot.y + 'px';
                    nextSlotIndex = (nextSlotIndex + 1) % windowSlots.length;
                }
                bringToFront(targetWindow);

                // Initialize photobook on first open
                if (windowId === 'window-photobook' && !photobookInitialized) {
                    initializePhotobook();
                    photobookInitialized = true;
                }

                // --- Trivia window placeholder logic ---
                if (windowId === 'window-trivia') {
                    // Future: Add trivia game logic here
                    initializeTriviaGame();
                }

                if (windowId === 'window-post-secret') {
                    initializePostSecret();
                }

                // If chat icon is clicked, also open vacation/away message window
                if (iconToDrag.id === 'icon-chat') {
                    const vacationWindow = document.getElementById('window-vacation');
                    if (vacationWindow) {
                        const isVacationHidden = getComputedStyle(vacationWindow).display === 'none';
                        vacationWindow.style.display = 'flex'; // Ensure dimensions are calculable

                        if (isVacationHidden) {
                            // Position vacationWindow relative to chatWindow (targetWindow)
                            let chatWindowLeft = targetWindow.offsetLeft;
                            let chatWindowTop = targetWindow.offsetTop;
                            let chatWindowWidth = targetWindow.offsetWidth;

                            let vacationWindowWidth = vacationWindow.offsetWidth;
                            let vacationWindowHeight = vacationWindow.offsetHeight;

                            let newVacationX = chatWindowLeft + chatWindowWidth + 20; // 20px gap to the right
                            let newVacationY = chatWindowTop + 20; // 20px down from chat window's top

                            const desktopRect = desktopArea.getBoundingClientRect(); // Dimensions of the desktop area

                            // Check if placing to the right overflows
                            if (newVacationX + vacationWindowWidth > desktopRect.width) {
                                // Try placing to the left of the chat window
                                newVacationX = chatWindowLeft - vacationWindowWidth - 20;
                            }

                            // Boundary checks to keep it within desktopArea
                            newVacationX = Math.max(0, Math.min(newVacationX, desktopRect.width - vacationWindowWidth));
                            newVacationY = Math.max(0, Math.min(newVacationY, desktopRect.height - vacationWindowHeight));
                            
                            vacationWindow.style.left = newVacationX + 'px';
                            vacationWindow.style.top = newVacationY + 'px';
                        }
                        bringToFront(vacationWindow);
                    }
                }

                // Specific initializations for certain windows (existing logic)
                if (windowId === 'window-projects') {
                    initializeWorkExplorer();
                }
                const photobookWindow = document.getElementById('window-photobook');
                if (windowId === 'window-photobook' && photobookWindow) {
                    const images = photobookWindow.querySelectorAll('.carousel-image');
                    if (images.length > 0 && !photobookWindow.querySelector('.carousel-image.active')) {
                        // This is already handled by dedicated photobook logic on dblclick
                        // showImage(0); 
                    }
                }
                const affirmationsWindow = document.getElementById('window-affirmations');
                if (windowId === 'window-affirmations' && affirmationsWindow) {
                     // This is already handled by dedicated affirmations logic on dblclick
                    // displayAffirmation(0);
                }
                const chatWindow = document.getElementById('window-chat');
                if (windowId === 'window-chat' && chatWindow) {
                    // Chat refresh logic is handled by its own dblclick listener if needed
                }
                const myTunesWindow = document.getElementById('window-earbuds');
                if (windowId === 'window-earbuds' && myTunesWindow) {
                    // myTunes UI update on open is handled by its own dblclick listener
                }
            }
        });
    });

    // --- Update Clock in Menubar ---
    const dateDisplay = document.querySelector('#menu-date');
    const clockDisplay = document.querySelector('#menu-clock');
    function updateClock() {
        if (dateDisplay && clockDisplay) {
            const now = new Date();
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const dayName = days[now.getDay()];
            const dayOfMonth = String(now.getDate()).padStart(2, '0');
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const monthName = months[now.getMonth()];
            const year = now.getFullYear();
            dateDisplay.textContent = `${dayName} ${dayOfMonth} ${monthName} ${year}`;
            clockDisplay.textContent = `${hours}:${minutes}`;
        }
    }
    updateClock();
    setInterval(updateClock, 10000);

    // Ensure profile window is displayed correctly
    const welcomeWindow = document.getElementById('window-welcome');
    if (welcomeWindow) {
        welcomeWindow.style.display = 'flex';
        bringToFront(welcomeWindow);
    }
    // Ensure other windows are hidden initially
    windows.forEach(win => {
        if (win.id !== 'window-welcome') {
            if (!win.style.display || win.style.display !== 'none') {
                 // Check if it has an inline style for display:none from HTML already
                let initiallyHiddenByHTML = false;
                for(let i=0; i < win.attributes.length; i++){
                    if(win.attributes[i].name === 'style' && win.attributes[i].value.includes('display: none')){
                        initiallyHiddenByHTML = true;
                        break;
                    }
                }
                if(!initiallyHiddenByHTML){
                    win.style.display = 'none';
                }
            }
        }
    });

    // --- Affirmations Window Functionality ---
    const affirmationsWindow = document.getElementById('window-affirmations');
    if (affirmationsWindow) {
        const affirmationTextElement = affirmationsWindow.querySelector('.affirmation-text');
        const nextAffirmationButton = affirmationsWindow.querySelector('.next-affirmation');
        const tarotCardArtElement = affirmationsWindow.querySelector('.tarot-card-art');
        const affirmations = [
            "I am a strong, capable person.",
            "I have done difficult things in the past, and I can do them again.",
            "I am in charge of how I feel and I choose to feel happy.",
            "I can handle whatever comes at me.",
            "I am learning, growing, and becoming better every moment.",
            "I am worthy of investing in myself.",
            "I am more than my thoughts.",
            "I am allowed to ask for what I want and what I need.",
            "I am proud of myself for daring to try; most people don't even do that.",
            "I am not my mistakes; I forgive myself for those.",
            "I am doing the best I can with what I have.",
            "I am allowed to feel good."
        ];
        const tarotCardImages = [
            "assets/tarot card images/strength.png",
            "assets/tarot card images/ten of wands.png",
            "assets/tarot card images/sun.png",
            "assets/tarot card images/chariot.png",
            "assets/tarot card images/fool.png",
            "assets/tarot card images/ace.png",
            "assets/tarot card images/high.png",
            "assets/tarot card images/five pent.png",
            "assets/tarot card images/eight wands.png",
            "assets/tarot card images/temper.png",
            "assets/tarot card images/seven pent.png",
            "assets/tarot card images/three cups.png"
        ];
        let currentAffirmationIndex = 0;

        function displayAffirmation(index) {
            if (affirmationTextElement && affirmations[index] && tarotCardArtElement && tarotCardImages[index]) {
                affirmationTextElement.textContent = affirmations[index];
                tarotCardArtElement.style.backgroundImage = `url('${tarotCardImages[index]}')`;
                currentAffirmationIndex = index;
            }
        }

        if (nextAffirmationButton) {
            nextAffirmationButton.addEventListener('click', () => {
                let newIndex = currentAffirmationIndex + 1;
                if (newIndex >= affirmations.length) {
                    newIndex = 0;
                }
                displayAffirmation(newIndex);
            });
        }

        // Display the first affirmation when the window is opened
        const affirmationsIcon = document.getElementById('icon-affirmations');
        if (affirmationsIcon) {
            affirmationsIcon.addEventListener('dblclick', () => {
                // Existing dblclick logic in icons.forEach handles opening the window.
                // We just ensure the first affirmation is displayed.
                displayAffirmation(0);
            });
        }
        // If the window is already set to display:flex (e.g. debugging or saved state), show first affirmation.
        if (getComputedStyle(affirmationsWindow).display === 'flex') {
            displayAffirmation(0);
        }
    }

    // --- Trivia Game Functionality ---
    const triviaWindow = document.getElementById('window-trivia');
    const triviaContent = document.getElementById('trivia-content');
    let triviaInitialized = false;
    let currentQuestionIndex = 0;
    let score = 0;

    const triviaQuestions = [
        {
            question: "In which field did Amy's start her career?",
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
            question: "On any given day, whereabouts is Amy most likey?",
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

    function initializeTriviaGame() {
        if (!triviaInitialized) {
            currentQuestionIndex = 0;
            score = 0;
            displayTriviaQuestion();
            triviaInitialized = true; 
        } else {
            // If re-opening, just show the current state or restart
            displayTriviaQuestion();
        }
    }

    function displayTriviaQuestion() {
        if (currentQuestionIndex < triviaQuestions.length) {
            const q = triviaQuestions[currentQuestionIndex];
            triviaContent.innerHTML = `
                <div class="trivia-question">${q.question}</div>
                <div class="trivia-options">
                    ${q.options.map(option => `<button class="trivia-option">${option}</button>`).join('')}
                </div>
                <div class="trivia-feedback"></div>
            `;
            const optionButtons = triviaContent.querySelectorAll('.trivia-option');
            optionButtons.forEach(button => {
                button.addEventListener('click', handleTriviaAnswer);
            });
        } else {
            displayFinalScore();
        }
    }

    function handleTriviaAnswer(e) {
        const selectedButton = e.target;
        const selectedOption = selectedButton.textContent;
        const currentQuestion = triviaQuestions[currentQuestionIndex];
        const correctAnswer = currentQuestion.answer;
        const feedbackEl = triviaContent.querySelector('.trivia-feedback');

        // Apply selected styles
        selectedButton.style.backgroundColor = '#0000FF';
        selectedButton.style.color = 'white';

        if (selectedOption === correctAnswer) {
            score++;
            feedbackEl.innerHTML = `Correct! ${currentQuestion.response}`;
            feedbackEl.style.color = 'green';
        } else {
            feedbackEl.innerHTML = `Not quite! The correct answer was: ${correctAnswer}.<br>${currentQuestion.response}`;
            feedbackEl.style.color = 'red';
        }

        // Disable all option buttons
        triviaContent.querySelectorAll('.trivia-option').forEach(btn => {
            btn.disabled = true;
        });

        // Add "Next Question" or "See Score" button
        const nextButton = document.createElement('button');
        nextButton.id = 'next-trivia-question';
        if (currentQuestionIndex === triviaQuestions.length - 1) {
            nextButton.textContent = 'See Score';
        } else {
            nextButton.textContent = 'Next Question';
        }
        
        nextButton.addEventListener('click', () => {
            currentQuestionIndex++;
            displayTriviaQuestion();
        });

        // Insert after the feedback element
        feedbackEl.after(nextButton);
    }

    function displayFinalScore() {
        triviaContent.innerHTML = `
            <div class="trivia-final-score">
                <h2>Trivia Complete!</h2>
                <p>Your final score: ${score} out of ${triviaQuestions.length}</p>
                <button id="restart-trivia">Play Again?</button>
            </div>
        `;
        document.getElementById('restart-trivia').addEventListener('click', () => {
            triviaInitialized = false; // Reset for a fresh game
            initializeTriviaGame();
        });
    }

    // --- Chat Window Functionality ---
    const chatWindow = document.getElementById('window-chat');
    let guestbookScreenName = null; // Added for guestbook screen name

    if (chatWindow) { // Ensure chat window element exists
        const chatChannels = chatWindow.querySelectorAll('.chat-sidebar ul li');
        const chatCurrentChannelDisplay = chatWindow.querySelector('#chat-current-channel');
        const chatContentArea = chatWindow.querySelector('#chat-content');
        const chatInputField = chatWindow.querySelector('.chat-input-area input[type="text"]');
        const chatSendButton = chatWindow.querySelector('.chat-input-area button');
        const chatInputArea = chatWindow.querySelector('.chat-input-area'); // Added this line

        // Fun facts data and state - Remove <p> tags here, handled by appendMessage
        const allFunFacts = [
            "I've placed in 2 powerlifting competitions. <a href='https://www.linkedin.com/posts/amylima_training-strongwomen-discipline-activity-7003127533969760256-kXyR/?utm_source=share&utm_medium=member_desktop' target='_blank'>Here's</a> how it's helped me grow in my design practice. (And, since I know you're wondering, my squat PR is 330lbs)",
            "I speak 5(ish) languages: English, Portuguese, Spanish, French, and German",
            "I'm an only child of immigrant parents. <a href='https://www.youtube.com/watch?v=CxyJp4hi6e8&t=150s' target='_blank'>Here's</a> a community panel I hosted on being first-gen in tech.",
            "<a href='https://www.linkedin.com/posts/amylima_today-is-a-hard-birthday-for-me-6-months-activity-7323009432479514624-LMz6?utm_source=share&utm_medium=member_desktop&rcm=ACoAAAbDJXUBxcoNTP-UcVt_lUZyardBW5Cu1_U' target='_blank'>I ran my first half-marathon</a> in April, ramping up from barely being able to run a mile. Constantly pushing myself outside of my comfort zone keeps me challenged and focused in my personal and professional life alike"
        ];
        let remainingFunFacts = [];
        const finalFunFactMessage = "Want to know more? Let's schedule a call! Email at amylima.design@gmail.com :)";

        function shuffleArray(array) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
        }

        function appendMessage(messageHTML, sender, isGuestbookMessage = false, isSystemMessage = false) {
            if (!chatContentArea) return;
            const messageDiv = document.createElement('div');
            messageDiv.classList.add('chat-message');

            let finalHTML;
            if (sender === 'System' || isSystemMessage) {
                messageDiv.classList.add('system-message');
                const usernameSpan = `<span class="system-username"><strong>amylimabean:</strong></span>`;
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = messageHTML.trim();
                const firstChild = tempDiv.firstChild;
                if (firstChild && firstChild.nodeType === Node.ELEMENT_NODE && firstChild.tagName === 'P') {
                    let firstPInnerContent = firstChild.innerHTML;
                    let restOfTheHTML = '';
                    let sibling = firstChild.nextSibling;
                    while (sibling) {
                        restOfTheHTML += sibling.outerHTML || sibling.textContent;
                        sibling = sibling.nextSibling;
                    }
                    finalHTML = `${usernameSpan} ${firstPInnerContent}${restOfTheHTML}`;
                } else {
                    finalHTML = `${usernameSpan} ${messageHTML}`;
                }
            } else if (isGuestbookMessage) {
                messageDiv.classList.add('system-message');
                const now = new Date();
                const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                const formattedDate = `${monthNames[now.getMonth()]} ${String(now.getDate()).padStart(2, '0')}`;
                finalHTML = `<span style="color: #FC0000;"><strong>${sender}</strong></span> (${formattedDate}): ${messageHTML}`;
            } else if (sender === 'You') { // Handles "You: message" from funfacts, styled like group-chat messages
                messageDiv.classList.add('system-message'); // Left-aligned
                const now = new Date();
                const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                const formattedDate = `${monthNames[now.getMonth()]} ${String(now.getDate()).padStart(2, '0')}`;
                finalHTML = `<span style="color: #FC0000;"><strong>${sender}</strong></span> (${formattedDate}): ${messageHTML}`;
            }
            messageDiv.innerHTML = finalHTML;
            
            chatContentArea.appendChild(messageDiv);
            chatContentArea.scrollTop = chatContentArea.scrollHeight;
        }

        const channelContent = {
            "about-me": '<p>To know me is to know I\'ve always been obsessed with the "why" behind how people connect-with each other, with ideas, with the world around them.</p><p>As a first-generation American raised by Brazilian parents, I grew up between cultures-never fully of one world or another.</p><p>But this third-culture experience also sparked an early curiosity about belonging and identity, and it\'s shaped everything since. I\'ve traveled to over 60 countries trying to understand how people form meaning and connection across cultures, even moving to Germany to explore what it really means to belong somewhere as an immigrant. That lens—of exploring how people find their people—has been the throughline of my life and career.</p><p>I see design as a way to support human connection—tools that don\'t just serve users, but celebrate who they are and how they show up for each other.</p>',
            "design-philosophy": "<p>I believe in the transformative power of design, both individually and interpersonally. Product Design is not only the tool I use to create a more connected, delightful, and equitable world, but also the one in which I help people feel more seen, empowered, and joyful.</p><p>At my core, I'm driven by a deep fascination and appreciation for human behavior and expression, and I approach every project with the conviction that we should always build the thing that\'s going to elevate and empower people, and it should be beautiful.</p><p>My goal is to design products that reflect the richness of the people they serve, push the boundaries of what\'s possible, and represent a more creative, inclusive, and culture-shifting digital future.</p>",
            "life-philosophy": "<p>I believe life should be playful, whimsical, and at every interaction, rooted in love.</p><p>For me, that means throwing myself into as many new experiences as possible, and moving with kindness, gratitude, and affection for everyone and everything around me.</p><p>I believe there's no hierarchy for compassionate action, and any act of kindness, service, or love, from holding the door open for a stranger to buying yourself a little treat at the end of the day, makes the world a more joyous, life-affirming place.</p><p>I am not here to solve the universe pr take it too seriously.</p><p>I am here to taste it.</p><p>To walk into the woods and not need to find a way out.</p><p>To kiss someone and not know if it will last.</p><p>To experience the great, ordinary courage of being alive.</p>",
            "group-chat": "<p>Welcome to the group chat! Set your ScreenName below to join the party</p>"
        };

        function switchChannel(channelName) {
            if (!channelName) {
                console.error('Channel name is undefined');
                return;
            }
            if (chatCurrentChannelDisplay) {
                 chatCurrentChannelDisplay.textContent = `#${channelName}`;
            }
            
            if (chatContentArea) {
                chatContentArea.innerHTML = ''; // Clear previous content
                if (channelName === 'group-chat') { // Updated from guest-book
                    appendMessage(channelContent[channelName], 'System', false, true); 
                } else {
                    if (channelContent[channelName]) {
                        appendMessage(channelContent[channelName], 'System');
                    } else {
                        appendMessage("Content coming soon for #" + channelName + ".", 'System');
                    }
                }
                chatContentArea.scrollTop = 0;
            }
            
            if (chatInputArea) { // Check if chatInputArea exists
                if (channelName === 'group-chat') { // MODIFIED: was 'funfacts' || 'group-chat'
                    chatInputArea.style.display = 'flex'; // Make sure input area is visible
                    // Existing logic for placeholders and button text for these active channels
                    if (chatInputField && chatSendButton) { // Keep this safety check
                        if (!guestbookScreenName) {
                            chatInputField.placeholder = "Set your ScreenName to send message";
                            chatInputField.value = '';
                            chatSendButton.textContent = 'Set';
                        } else {
                            chatInputField.placeholder = "Type a message...";
                            chatInputField.value = '';
                            chatSendButton.textContent = 'Send';
                        }
                    }
                } else {
                    chatInputArea.style.display = 'none'; // Hide input area for other (read-only) channels
                }
            }
            
            chatChannels.forEach(ch => {
                ch.classList.remove('active-channel');
                if (ch.dataset.channel === channelName) {
                    ch.classList.add('active-channel');
                }
            });

            // Force repaint using a transform hack for the stubborn shadow bug
            if (chatWindow) {
                chatWindow.style.transform = 'scale(1.000001)';
                setTimeout(() => {
                    chatWindow.style.transform = 'scale(1)';
                }, 10);
            }
        }

        if (chatChannels.length > 0 && chatCurrentChannelDisplay && chatContentArea) {
            chatChannels.forEach(channel => {
                channel.addEventListener('click', () => {
                    const channelName = channel.dataset.channel;
                    switchChannel(channelName);
                });
            });

            const initialActiveChannel = chatWindow.querySelector('.chat-sidebar ul li.active-channel');
            let channelToLoad = 'about-me'; // Default to about-me
            if (initialActiveChannel && initialActiveChannel.dataset.channel) {
                channelToLoad = initialActiveChannel.dataset.channel;
            } else if (chatChannels.length > 0 && chatChannels[0] && chatChannels[0].dataset.channel) {
                channelToLoad = chatChannels[0].dataset.channel;
            }
            
            if (channelToLoad) {
                 switchChannel(channelToLoad);
            }
        }
        
        if (chatSendButton && chatInputField && chatContentArea) {
            chatSendButton.addEventListener('click', () => {
                const activeChannelElement = chatWindow.querySelector('.chat-sidebar ul li.active-channel');
                const currentChannel = activeChannelElement ? activeChannelElement.dataset.channel : null;
                const userMessage = chatInputField.value.trim();

                if (currentChannel === 'group-chat') { // Updated from guest-book
                    if (!guestbookScreenName) {
                        if (userMessage) {
                            guestbookScreenName = userMessage;
                            chatInputField.placeholder = "Type a message...";
                            chatSendButton.textContent = 'Send';
                            chatInputField.value = '';
                        } else {
                            appendMessage('Please enter a screen name.', 'System', false, true);
                        }
                    } else { 
                        if (userMessage) {
                            appendMessage(userMessage, guestbookScreenName, true);
                            chatInputField.value = '';
                        }
                    }
                }
            });
        }

        if (chatInputField) { // Ensure chatInputField exists before adding event listener
            chatInputField.addEventListener('keypress', function(event) {
                // Check if the key pressed was Enter (keyCode 13)
                if (event.key === 'Enter' || event.keyCode === 13) {
                    event.preventDefault(); // Prevent default action (like adding a newline)
                    chatSendButton.click(); // Programmatically click the send button
                }
            });
        }

        const chatIcon = document.getElementById('icon-chat'); 
        if (chatIcon) {
            // The dblclick on icon-chat is already handled by the generic icons.forEach loop.
            // That loop calls toggleWindow(windowId) which in turn calls makeDraggable.
            // When toggleWindow makes chat-window visible, the content should already be set by the above initialization.
            // If we need to refresh or set specific content *every time* it's opened:
            chatIcon.addEventListener('dblclick', () => {
                // The generic handler opens the window. We ensure content is fresh.
                // Check if window is actually made visible by the generic handler
                setTimeout(() => { // Use a small timeout to allow the display property to update
                    if ((chatWindow.style.display === 'block' || chatWindow.style.display === 'flex') && chatChannels.length > 0) {
                        let currentActive = chatWindow.querySelector('.chat-sidebar ul li.active-channel');
                        if (currentActive && currentActive.dataset.channel) {
                            switchChannel(currentActive.dataset.channel);
                        } else if (chatChannels[0] && chatChannels[0].dataset.channel) {
                            switchChannel(chatChannels[0].dataset.channel); // Fallback to first channel
                        }
                    }
                }, 0);
            });
        }
    } // End of if(chatWindow)

    // --- myTunes Player Functionality ---
    const myTunesWindow = document.getElementById('window-earbuds');
    if (myTunesWindow) {
        const audioPlayer = document.getElementById('myTunes-audio-player');
        const playBtn = myTunesWindow.querySelector('.play-btn');
        const prevBtn = myTunesWindow.querySelector('.prev-btn');
        const nextBtn = myTunesWindow.querySelector('.next-btn');
        const songTitleDisplay = myTunesWindow.querySelector('.song-title');
        const artistNameDisplay = myTunesWindow.querySelector('.artist-name');
        const timeInfoDisplay = myTunesWindow.querySelector('.time-info');
        const playlistUl = document.getElementById('myTunes-playlist');

        const songs = [
            { title: "WWMMD", artist: "Unknown Artist", src: "assets/songs/01 WWMMD.m4a" },
            { title: "Plays Pretty for Baby", artist: "Unknown Artist", src: "assets/songs/02 Plays Pretty for Baby.m4a" },
            { title: "Free Mind", artist: "Unknown Artist", src: "assets/songs/03 Free Mind.m4a" },
            { title: "Lo Vas A Olvidar", artist: "Unknown Artist", src: "assets/songs/01 Lo Vas A Olvidar.m4a" },
            { title: "Trop beau (feat. Emma Peters)", artist: "Unknown Artist", src: "assets/songs/01 Trop beau (feat. Emma Peters).m4a" }
        ];
        let currentSongIndex = 0;
        let isPlaying = false;

        // <<< START AUDIO VISUALIZER RESTORATION >>>
        let audioContext, analyser, sourceNode, dataArray, canvasCtx, canvasElement, animationFrameId;
        const fftSize = 256; // Visualizer detail - determines how many bars

        function initAudioVisualizer() {
            if (!audioPlayer) return; // Make sure audioPlayer is available

            if (!audioContext) {
                try {
                    audioContext = new (window.AudioContext || window.webkitAudioContext)();
                } catch (e) {
                    console.error("Web Audio API is not supported in this browser", e);
                    return;
                }
            }

            // If context is suspended, try to resume it (often needed after page load)
            if (audioContext.state === 'suspended') {
                audioContext.resume().catch(err => console.error("AudioContext resume failed:", err));
            }

            // Create or re-create nodes if they don't exist or if audio source changed
            // A more robust check might be needed if audioPlayer itself can be re-created dynamically
            if (!sourceNode || sourceNode.mediaElement !== audioPlayer) {
                try {
                    if (sourceNode) {
                        sourceNode.disconnect(); // Disconnect old source if it exists
                    }
                    sourceNode = audioContext.createMediaElementSource(audioPlayer);
                    analyser = audioContext.createAnalyser();
                    analyser.fftSize = fftSize;
                    sourceNode.connect(analyser);
                    analyser.connect(audioContext.destination); // Connect analyser to output
                } catch (e) {
                    console.error("Error setting up audio source for visualizer:", e);
                    return; // Stop if setup fails
                }
            }

            canvasElement = document.getElementById('myTunes-visualizer-canvas');
            if (!canvasElement) {
                console.error("Visualizer canvas not found");
                return;
            }
            canvasCtx = canvasElement.getContext('2d');
            
            const bufferLength = analyser.frequencyBinCount; // Number of data points (half of fftSize)
            dataArray = new Uint8Array(bufferLength);
        }

        function drawVisualization() {
            if (!isPlaying || !analyser || !canvasCtx || !dataArray || !canvasElement) {
                if (animationFrameId) cancelAnimationFrame(animationFrameId);
                // Clear canvas when not playing or if elements are missing
                if(canvasCtx && canvasElement) canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
                return;
            }

            animationFrameId = requestAnimationFrame(drawVisualization);
            analyser.getByteFrequencyData(dataArray); // Get frequency data into dataArray

            canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
            const barWidth = (canvasElement.width / dataArray.length) * 1.5; // Adjust for bar width
            let x = 0;

            for (let i = 0; i < dataArray.length; i++) {
                const barHeight = (dataArray[i] / 255) * canvasElement.height * 0.8; // Scale bar height

                canvasCtx.fillStyle = '#E0DCD3'; // Color of the bars (using your button background color)
                canvasCtx.fillRect(x, canvasElement.height - barHeight, barWidth, barHeight);
                x += barWidth + 1; // Move to the next bar position with 1px spacing
            }
        }
        // <<< END AUDIO VISUALIZER RESTORATION >>>

        function parseTrackName(filename) {
            // Remove leading numbers and extension
            let name = filename.replace(/^\\d+\\s*/, '').replace(/\\.[^/.]+$/, '');
            // Optional: Add spaces before capital letters for readability if needed
            // name = name.replace(/([A-Z])/g, ' $1').trim();
            return name;
        }

        songs.forEach(song => {
            const originalFilename = song.src.split('/').pop();
            song.title = parseTrackName(originalFilename);
            // If you have a way to get artist info, you can add it here
            // For now, artist remains "Unknown Artist" or you can manually set it in the array above.
        });

        function loadSong(songIndex) {
            if (songIndex >= 0 && songIndex < songs.length) {
                currentSongIndex = songIndex;
                const song = songs[currentSongIndex];
                audioPlayer.src = song.src;
                songTitleDisplay.textContent = song.title;
                artistNameDisplay.textContent = song.artist;
                timeInfoDisplay.textContent = '0:00 / ...'; // Placeholder until duration loads
                updatePlaylistUI();
                // Visualizer will be initialized/started on playSong
            }
        }

        function playSong() {
            // Initialize or resume AudioContext on first play or if suspended
            if (!audioContext) {
                initAudioVisualizer(); // This now handles AudioContext creation
            } else if (audioContext.state === 'suspended') {
                audioContext.resume().then(() => {
                    if (!analyser) initAudioVisualizer(); // Ensure analyser is set up if context was suspended
                }).catch(err => console.error("AudioContext resume failed on play:", err));
            }
            
            // If analyser is still not set up after context check (e.g. source not connected), try init again.
            if (!analyser && audioPlayer.src) {
                 initAudioVisualizer();
            }

            isPlaying = true;
            audioPlayer.play().then(() => {
                if (animationFrameId) cancelAnimationFrame(animationFrameId); // Clear previous animation frame
                if (analyser) drawVisualization(); // Start visualization if analyser is ready
            }).catch(error => {
                console.error("Error playing audio:", error);
                isPlaying = false; // Reset playing state if play fails
                playBtn.textContent = '►';
            });
            playBtn.textContent = '❚❚'; // Pause symbol
        }

        function pauseSong() {
            isPlaying = false;
            audioPlayer.pause();
            playBtn.textContent = '►'; // Play symbol
            if (animationFrameId) cancelAnimationFrame(animationFrameId); // Stop visualization
            if(canvasCtx && canvasElement) canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height); // Clear canvas on pause
        }

        function prevSong() {
            currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
            loadSong(currentSongIndex);
            playSong();
        }

        function nextSong() {
            currentSongIndex = (currentSongIndex + 1) % songs.length;
            loadSong(currentSongIndex);
            playSong();
        }

        function updateProgress() {
            if (audioPlayer.duration) {
                const currentTime = formatTime(audioPlayer.currentTime);
                const duration = formatTime(audioPlayer.duration);
                timeInfoDisplay.textContent = `${currentTime} / ${duration}`;
            }
        }
        
        function formatTime(seconds) {
            const minutes = Math.floor(seconds / 60);
            const secs = Math.floor(seconds % 60);
            return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
        }

        function updatePlaylistUI() {
            if (!playlistUl) return;
            playlistUl.innerHTML = ''; // Clear existing playlist

            // Display up to 3 next songs, or fewer if at the end of the playlist
            for (let i = 0; i < 3; i++) {
                const nextSongIndex = (currentSongIndex + 1 + i) % songs.length;
                
                // Stop if we've looped back to the current song or an earlier one in a short playlist
                if (songs.length <= 1) break; // No "up next" if only one song
                if (i > 0 && nextSongIndex === (currentSongIndex + 1) % songs.length && songs.length <= i ) break;


                // Avoid re-listing the current song if it's the only one left to show after looping
                if (nextSongIndex === currentSongIndex && songs.length > 1) {
                    if ( (currentSongIndex + 1 + i) >= songs.length ) continue; // Skip if we are at the end and would re-list current
                }


                const song = songs[nextSongIndex];
                if (!song) continue; // Should not happen with modulo, but good check

                // If we are about to list the current playing song in "Up Next" due to short list, skip
                if (nextSongIndex === currentSongIndex && songs.length > 1) {
                     // This case needs to be handled carefully to ensure we show *something* if the playlist is very short
                     // e.g. if current is last song, next is first. If current is 2nd to last, next are last then first.
                     // If current is 0, next are 1, 2. If list size is 2, current is 0, next is 1. current is 1, next is 0.
                     // The goal is not to show the currently playing song in the "Up Next"
                    if ( (currentSongIndex + 1 + i) >= songs.length && i < songs.length -1 ) {
                        // this logic is tricky. Let's simplify for now and improve later if needed.
                        // The main idea is to not show the *currently playing* song in "up next".
                    }
                }


                const li = document.createElement('li');
                li.textContent = `${song.title} - ${song.artist}`;
                li.dataset.songIndex = nextSongIndex;
                li.addEventListener('click', () => {
                    loadSong(nextSongIndex);
                    playSong();
                });
                playlistUl.appendChild(li);

                // Highlight the immediately next song differently, or just list them
                if (i === 0) {
                    // li.style.fontWeight = 'bold'; // Example: make the very next song bold
                }
            }
        }


        // Event Listeners
        playBtn.addEventListener('click', () => {
            if (isPlaying) {
                pauseSong();
            } else {
                playSong();
            }
        });

        prevBtn.addEventListener('click', prevSong);
        nextBtn.addEventListener('click', nextSong);

        audioPlayer.addEventListener('timeupdate', updateProgress);
        audioPlayer.addEventListener('loadedmetadata', updateProgress); 
        audioPlayer.addEventListener('ended', () => {
            nextSong(); // This will call loadSong and playSong, which handles visualizer start
            if (animationFrameId) cancelAnimationFrame(animationFrameId); 
            if(canvasCtx && canvasElement) canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height); // Clear on end
        });

        // Initial Load
        if (songs.length > 0) {
            loadSong(0);
        } else {
            songTitleDisplay.textContent = "No songs loaded";
            artistNameDisplay.textContent = "";
        }
        
        // When myTunes window is opened, ensure the player state is correct
        const earbudsIcon = document.getElementById('icon-earbuds');
        if (earbudsIcon) {
            earbudsIcon.addEventListener('dblclick', () => {
                // Window opening is handled by generic icon logic
                // We just ensure the UI is correctly reflecting the current/first song
                if (songs.length > 0) {
                    // If audio hasn't started, loadSong ensures UI is updated.
                    // If it was playing and closed, re-opening should show its state.
                    // loadSong(currentSongIndex); // Reload current song details
                    // updatePlaylistUI(); // Refresh playlist
                    // No, this will interrupt playback if it was playing minimized.
                    // Instead, just ensure the display is correct.
                    const song = songs[currentSongIndex];
                    songTitleDisplay.textContent = song.title;
                    artistNameDisplay.textContent = song.artist;
                    updateProgress(); // Update time
                    updatePlaylistUI(); // Update playlist
                    playBtn.textContent = isPlaying ? '❚❚' : '►';


                }
            });
        }
    }

    // --- Global Click Sound Functionality ---
    const clickSound = document.getElementById('click-sound');

    if (clickSound) {
        clickSound.volume = 0.15; // Set volume to 15%

        const clickableSelectors = [
            'a',
            'button',
            '.button', // Includes title-bar buttons
            '.action-button',
            '.control-button',
            '.player-btn',
            '.desktop-icon',
            '.file-icon',
            '.title-bar', // For window dragging - click on bar itself
            '.chat-sidebar ul li[data-channel]',
            '.menubar .menu-item', // For top menubar items
            '.menubar .dropdown-content a', // Links in dropdowns
            'input[type="text"]', // Text input fields
            'textarea', // Text area fields
            // Add other specific interactive element selectors here if needed
        ];

        document.addEventListener('click', (event) => {
            // Check if the clicked element or its parent matches any of the clickable selectors
            const clickedElement = event.target;
            
            // Prevent sound if clicking on scrollbars (often reported on html/body)
            if (clickedElement === document.documentElement || clickedElement === document.body) {
                if (event.clientX >= document.documentElement.clientWidth || event.clientY >= document.documentElement.clientHeight) {
                    return; // Click was on a scrollbar
                }
            }

            let isClickable = false;
            for (const selector of clickableSelectors) {
                if (clickedElement.closest(selector)) {
                    // Special case: if it's the title-bar, ensure not clicking its own buttons
                    if (selector === '.title-bar' && clickedElement.closest('.title-bar-buttons .button')) {
                        // This click is handled by the .button selector, so don't double count or misattribute
                        // The .button rule will set isClickable if it's a title bar button.
                    } else {
                        isClickable = true;
                        break;
                    }
                }
            }

            if (isClickable) {
                clickSound.currentTime = 0;
                clickSound.play().catch(error => {
                    console.warn("Click sound playback failed:", error);
                });
            }
        });
    }

    // --- Bean Menu Dropdown Functionality ---
    const beanMenuItem = document.getElementById('bean-menu-item');
    const beanDropdown = document.getElementById('bean-dropdown');
    const beanLogo = document.querySelector('#bean-menu-item .bean-logo'); // More specific selector

    if (beanMenuItem && beanDropdown && beanLogo) {
        const aboutThisBeanLink = document.getElementById('about-this-bean');
        if (aboutThisBeanLink) {
            aboutThisBeanLink.addEventListener('click', (event) => {
                event.preventDefault();
                event.stopPropagation();
                
                const aboutBeanWindow = document.getElementById('window-about-bean');
                const modalOverlay = document.getElementById('modal-overlay');

                if (aboutBeanWindow && modalOverlay) {
                    modalOverlay.style.display = 'block';
                    aboutBeanWindow.style.display = 'flex';
                    aboutBeanWindow.style.position = 'fixed';
                    aboutBeanWindow.style.top = '50%';
                    aboutBeanWindow.style.left = '50%';
                    aboutBeanWindow.style.transform = 'translate(-50%, -50%)';
                    aboutBeanWindow.style.zIndex = '2001';
                }
            });
        }

        // Close dropdown if clicked outside
        document.addEventListener('click', (event) => {
            if (beanDropdown.style.display === 'block' && !beanMenuItem.contains(event.target)) {
                beanDropdown.style.display = 'none';
            }
        });
    }

    if (modalOverlay) {
        modalOverlay.addEventListener('click', () => {
            const aboutBeanWindow = document.getElementById('window-about-bean');
            modalOverlay.style.display = 'none';
            if (aboutBeanWindow) {
                aboutBeanWindow.style.display = 'none';
            }
            // Also reset z-index here
            let maxZ = 99;
            document.querySelectorAll('.window:not(#window-about-bean)').forEach(w => {
                const z = parseInt(w.style.zIndex, 10);
                if (!isNaN(z) && z > maxZ) {
                    maxZ = z;
                }
            });
            highestZIndex = maxZ > 99 ? maxZ : 100;
        });
    }
    // --- End of Bean Menu Dropdown Functionality ---

    // --- Wallpaper Changer Functionality ---
    const wallpaperMenuItem = document.getElementById('wallpaper-menu-item');
    const wallpaperDropdown = document.getElementById('wallpaper-dropdown');
    const backgroundVideo = document.getElementById('background-video'); // Get the video element
    if (backgroundVideo) {
        backgroundVideo.playbackRate = 0.8; // Slow down by 20%
    }

    const wallpapers = [
        { name: "BabyBean", path: "VIDEO" }, // Special identifier for the video
        { name: "Cyber World", path: "assets/wallpaper/cyber-world.avif" },
        { name: "Bliss", path: "assets/wallpaper/bliss.jpg" },
        { name: "Free Palestine", path: "assets/wallpaper/free palestine.png" },
        { name: "Default", path: "assets/wallpaper/default.webp" },
        { name: "Upload your own", path: "UPLOAD" } // New option for uploading
    ];

    if (wallpaperMenuItem && wallpaperDropdown && desktopArea && backgroundVideo) { // Added backgroundVideo to the check
        // Populate dropdown
        wallpapers.forEach(wallpaper => {
            const link = document.createElement('a');
            link.href = "#";
            link.textContent = wallpaper.name;
            link.dataset.path = wallpaper.path;
            link.addEventListener('click', (event) => {
                event.preventDefault();
                event.stopPropagation();

                if (wallpaper.path === "UPLOAD") {
                    const fileInput = document.createElement('input');
                    fileInput.type = 'file';
                    fileInput.accept = 'image/*';
                    fileInput.style.display = 'none'; // Hide the actual input element

                    fileInput.addEventListener('change', (e) => {
                        const file = e.target.files[0];
                        if (file) {
                            const reader = new FileReader();
                            reader.onload = (loadEvent) => {
                                desktopArea.style.backgroundImage = `url('${loadEvent.target.result}')`;
                                desktopArea.style.backgroundSize = 'cover';
                                desktopArea.style.backgroundPosition = 'center';
                                backgroundVideo.style.display = 'none'; // Hide video
                            };
                            reader.readAsDataURL(file);
                        }
                        document.body.removeChild(fileInput); // Clean up the input element
                    });

                    document.body.appendChild(fileInput); // Add to body to allow click
                    fileInput.click(); // Programmatically click the hidden file input

                } else if (wallpaper.path === "VIDEO") {
                    desktopArea.style.backgroundImage = 'none'; // Remove image background
                    backgroundVideo.style.display = 'block'; // Show video
                } else {
                    desktopArea.style.backgroundImage = `url('${wallpaper.path}')`;
                    desktopArea.style.backgroundSize = 'cover';
                    desktopArea.style.backgroundPosition = 'center';
                    backgroundVideo.style.display = 'none'; // Hide video
                }

                // wallpaperDropdown.style.display = 'none'; // REMOVED: Let CSS hover handle hiding

                 // If you have a click sound, play it
                if (typeof clickSound !== 'undefined' && clickSound && clickSound.play) {
                    clickSound.currentTime = 0;
                    clickSound.play().catch(error => console.warn("Wallpaper change sound playback failed:", error));
                }
            });
            wallpaperDropdown.appendChild(link);
        });

        // ADDED: Close bean dropdown when wallpaper menu is hovered
        if (wallpaperMenuItem) {
            wallpaperMenuItem.addEventListener('mouseenter', () => {
                const beanDropdownElement = document.getElementById('bean-dropdown');
                if (beanDropdownElement && beanDropdownElement.style.display === 'block') {
                    beanDropdownElement.style.display = 'none';
                    // If bean dropdown visibility was also controlled by a class on beanMenuItem, remove it:
                    // const beanMenuItemElement = document.getElementById('bean-menu-item');
                    // if (beanMenuItemElement) beanMenuItemElement.classList.remove('active');
                }
                // Wallpaper dropdown is shown by CSS hover on wallpaperMenuItem
            });
        }

    }
    // --- End of Wallpaper Changer Functionality ---

    // <<< START WORK EXPLORER & TEXTEDIT RESTORATION >>>
    const projectDetails = {
        'Pinterest': {
            title: 'Pinterest Redesign Concept',
            description: `<p>A few episodes back, I joined Pinterest at a pivotal moment when the company was embarking on a big bet to reposition itself as a platform not only for inspiration, but creation. In other words, encouraging native content creation on platform. Pinterest already had a clear ritual for Pinners to privately search for and save content; I was part of the team developing a suite of creator tools to push for deeper engagement with a sense of community and creativity.</p>
            <p>This involved developing 0 to 1 creator features inside the Pinterest ecosystem that created market distinction while maintaining brand identity and user comprehensive. This was an exciting challenge, and one I was honored to contribute to as my very first full-time design gig</p>`
        },
        'Amp': {
            title: 'AMP Search UX Case Study',
            description: `<p>After Pinterest, I worked at a startup under Amazon Music called Amp, a bold product in the otherwise safe Amazon ecosystem that atimed to reimagine radio. Creators host their own radio shows using Amazon Music's 10mm+ song catalogue, and listeners could scan the airwaves to discover new music, creators, and fans.</p>
            <p>Sitting at the intersection of live audio and music broadcasting, Amp had a lot of deep technical and legal constraints I had to design around. It was deeply challenging, as my design work spanned the entire product, but equally rewarding – pushing such a bold vision in a behemoth like Amazon was no small task, and I learned a ton.</p>`
        },
        'Duolingo': {
            title: 'Duolingo Cultural Immersion Feature',
            description: `<p>Most recently, I worked at Duolingo within the core Monetization team.</p>
            <p>We were the highest-stakes team in the org, and incredibly high-velocity and experimentation-based. This meant that on a weekly basis, I took projects from inception to our executive Product Review for CEO and Senior Leadership approval, often while interim PMing by pitching design projects and writing product specs.</p>
            <p>Working on Monetization at such a well-oiled machine was an incredible learning experience. I got to round out my skill set by focusing on growth design and optimizations, work with the most talented folks in the industry, and craft some future-thinking projects, all while (of course) doing my lessons.</p>`
        },
        'Diversify Design': {
            title: 'Diversify Design',
            description: `<p>Diversify Design is a community I founded that supports designers from historically underrepresented backgrounds. It aims to provide a safe and transparent space for underrepresented folx in the design industry connect, learn, and grow together through meetups and knowledge exchanges.</p>
            <p>I've hosted events that have ranged from a 500+ person meetup at Config to an intimate gathering of women in design for Womens History Month with the same core mission: empowering marginalized voices in our industry.</p>
            <p>I'll keep it real tho, fam: running a community is hard work. Over the past year, I've put a pause on programming to focus on personal matters: navigating a company-wide layoff, starting a new job, and prioritizing my mental health.</p>
            <p>But! I have some exciting ideas in the works, coming soon to a city near you</p>`
        }
    };

    function showProjectDetail(projectName) {
        // Generate a unique window ID for each project
        const windowId = `window-project-detail-${projectName.replace(/\s+/g, '-').toLowerCase()}`;
        let detailWindow = document.getElementById(windowId);
        const projectData = projectDetails[projectName];

        if (!projectData) return;

        if (!detailWindow) {
            // Create the window if it doesn't exist
            detailWindow = document.createElement('div');
            detailWindow.className = 'window text-edit-style-window';
            detailWindow.id = windowId;
            detailWindow.style.position = 'absolute';
            detailWindow.style.width = '550px';
            detailWindow.style.height = '450px';
            detailWindow.style.left = (100 + Math.floor(Math.random()*200)) + 'px';
            detailWindow.style.top = (100 + Math.floor(Math.random()*100)) + 'px';
            detailWindow.style.zIndex = highestZIndex + 1;

            detailWindow.innerHTML = `
                <div class="title-bar">
                    <div class="title-bar-buttons">
                        <span class="button close"></span>
                    </div>
                    <span class="title-bar-text">Work/${projectName}</span>
                </div>
                <div class="window-content text-edit-content">
                    <div class="text-edit-main-area">${projectData.description}</div>
                </div>
            `;

            // Add close functionality
            detailWindow.querySelector('.button.close').addEventListener('click', (e) => {
                e.stopPropagation();
                detailWindow.remove();
            });

            // Make draggable
            const titleBar = detailWindow.querySelector('.title-bar');
            if (titleBar) {
                titleBar.style.cursor = 'grab';
                let isDragging = false, offsetX = 0, offsetY = 0;
                titleBar.addEventListener('mousedown', (e) => {
                    isDragging = true;
                    offsetX = e.clientX - detailWindow.offsetLeft;
                    offsetY = e.clientY - detailWindow.offsetTop;
                    titleBar.style.cursor = 'grabbing';
                });
                document.addEventListener('mousemove', (e) => {
                    if (isDragging) {
                        let newX = e.clientX - offsetX;
                        let newY = e.clientY - offsetY;
                        // Optional: keep within viewport
                        newX = Math.max(0, Math.min(newX, window.innerWidth - detailWindow.offsetWidth));
                        newY = Math.max(0, Math.min(newY, window.innerHeight - detailWindow.offsetHeight));
                        detailWindow.style.left = newX + 'px';
                        detailWindow.style.top = newY + 'px';
                    }
                });
                document.addEventListener('mouseup', () => {
                    isDragging = false;
                    titleBar.style.cursor = 'grab';
                });
            }

            // Bring to front on mousedown
            detailWindow.addEventListener('mousedown', () => {
                highestZIndex++;
                detailWindow.style.zIndex = highestZIndex;
            });

            document.body.appendChild(detailWindow);
        } else {
            // If already exists, just bring to front
            highestZIndex++;
            detailWindow.style.zIndex = highestZIndex;
            detailWindow.style.display = 'flex';
        }
    }

    function initializeWorkExplorer() {
        const workExplorerContent = document.querySelector('#window-projects .folder-view');
        if (!workExplorerContent) return;

        workExplorerContent.innerHTML = ''; // Clear existing content

        const appIcons = [
            { src: 'assets/app icons/pinterest app icon.png', name: 'Pinterest' },
            { src: 'assets/app icons/amp app icon.png', name: 'Amp' },
            { src: 'assets/app icons/duo app icon.png', name: 'Duolingo' },
            { src: 'assets/app icons/diversify_design_logo.jpeg', name: 'Diversify Design' }
        ];

        appIcons.forEach(app => {
            const fileIconDiv = document.createElement('div');
            fileIconDiv.classList.add('file-icon');

            const img = document.createElement('img');
            img.src = app.src;
            img.alt = app.name;

            const span = document.createElement('span');
            span.textContent = app.name;

            fileIconDiv.appendChild(img);
            fileIconDiv.appendChild(span);

            fileIconDiv.addEventListener('click', () => {
                showProjectDetail(app.name); 
            });

            workExplorerContent.appendChild(fileIconDiv);
        });
    }

    // --- Text Editor Toolbar Functionality ---
    function setupTextEditorToolbar() {
        const execSimpleCommand = (command, value = null) => {
            document.execCommand(command, false, value);
        };

        document.getElementById('text-edit-bold')?.addEventListener('click', () => execSimpleCommand('bold'));
        document.getElementById('text-edit-italic')?.addEventListener('click', () => execSimpleCommand('italic'));
        document.getElementById('text-edit-underline')?.addEventListener('click', () => execSimpleCommand('underline'));

        const alignmentButtons = document.querySelectorAll('.text-edit-toolbar .tool-button[data-command]');
        alignmentButtons.forEach(button => {
            button.addEventListener('click', () => {
                const command = button.dataset.command;
                if (command) {
                    execSimpleCommand(command);
                }
            });
        });

        const fontSelect = document.getElementById('text-edit-font');
        fontSelect?.addEventListener('change', (event) => {
            execSimpleCommand('fontName', event.target.value);
        });
    }
    setupTextEditorToolbar(); // Call this once to set up the listeners
    // <<< END WORK EXPLORER & TEXTEDIT RESTORATION >>>

    // --- Post Secret Functionality ---
    function initializePostSecret() {
        const postSecretWindow = document.getElementById('window-post-secret');
        if (!postSecretWindow) return;

        const postcardView = postSecretWindow.querySelector('.postcard-view');
        const secretsFeedView = postSecretWindow.querySelector('.secrets-feed-view');
        const viewSecretsBtn = document.getElementById('view-secrets-btn');
        const submitNewBtn = document.getElementById('submit-new-secret-btn');
        const submitSecretBtn = postSecretWindow.querySelector('.submit-secret-btn');
        const secretMessageTextarea = postSecretWindow.querySelector('.postcard-message');

        let secrets = [
            { text: "I'm secretly proud of this portfolio, even though it's a bit silly.", timestamp: new Date('2023-10-26T10:00:00Z') },
            { text: "I still don't really know how to center a div without looking it up.", timestamp: new Date('2023-10-27T14:30:00Z') },
            { text: "I'm worried no one will like my work.", timestamp: new Date('2023-10-28T18:45:00Z') }
        ]; // Some initial secrets for demonstration

        let isInitialized = postSecretWindow.dataset.initialized === 'true';

        if (isInitialized) {
            return; // Don't re-initialize
        }

        function renderSecrets() {
            secretsFeedView.innerHTML = '';
            secrets.forEach(secretObj => {
                const secretEntry = document.createElement('div');
                secretEntry.className = 'secret-entry';

                const secretText = document.createElement('p');
                secretText.textContent = secretObj.text;

                const secretTimestamp = document.createElement('span');
                secretTimestamp.className = 'secret-timestamp';
                secretTimestamp.textContent = new Date(secretObj.timestamp).toLocaleString();

                secretEntry.appendChild(secretText);
                secretEntry.appendChild(secretTimestamp);
                
                secretsFeedView.appendChild(secretEntry);
            });
        }

        viewSecretsBtn.addEventListener('click', () => {
            renderSecrets();
            postcardView.style.display = 'none';
            secretsFeedView.style.display = 'grid';
            viewSecretsBtn.style.display = 'none';
            submitSecretBtn.style.display = 'none';
            submitNewBtn.style.display = 'inline-block';
        });

        submitNewBtn.addEventListener('click', () => {
            postcardView.style.display = 'grid';
            secretsFeedView.style.display = 'none';
            viewSecretsBtn.style.display = 'inline-block';
            submitSecretBtn.style.display = 'inline-block';
            submitNewBtn.style.display = 'none';
        });

        submitSecretBtn.addEventListener('click', () => {
            const newSecretText = secretMessageTextarea.value.trim();
            if (newSecretText) {
                const newSecret = { text: newSecretText, timestamp: new Date() };
                secrets.unshift(newSecret); // Add new secret to the beginning
                secretMessageTextarea.value = '';
                // Switch to the feed view to show the new secret
                renderSecrets();
                postcardView.style.display = 'none';
                secretsFeedView.style.display = 'grid';
                viewSecretsBtn.style.display = 'none';
                submitSecretBtn.style.display = 'none';
                submitNewBtn.style.display = 'inline-block';

                // Optional: show a confirmation message
                const confirmation = document.createElement('p');
                confirmation.textContent = 'Your secret is safe with us.';
                confirmation.style.textAlign = 'center';
                confirmation.style.color = 'green';
                secretsFeedView.prepend(confirmation);
                setTimeout(() => confirmation.remove(), 3000);
            }
        });
        
        postSecretWindow.dataset.initialized = 'true';
    }

    // --- Guestbook Chat Functionality ---
    /*
    const guestbookForm = document.getElementById('guestbook-input-form');
    const guestbookMessagesDisplay = document.getElementById('guestbook-messages-display');
    const guestNameInput = document.getElementById('guest-name');
    const guestCommentInput = document.getElementById('guest-comment');

    if (guestbookForm && guestbookMessagesDisplay && guestNameInput && guestCommentInput) {
        guestbookForm.addEventListener('submit', (event) => {
            event.preventDefault(); // Prevent default form submission

            const userName = guestNameInput.value.trim();
            const commentText = guestCommentInput.value.trim();

            if (userName === '' || commentText === '') {
                // Optionally, provide some feedback to the user if fields are empty
                // For now, just don't submit if empty
                return;
            }

            // Create the new message element
            const newMessageDiv = document.createElement('div');
            newMessageDiv.classList.add('guestbook-message');
            
            const messageParagraph = document.createElement('p');
            const strongUser = document.createElement('strong');
            strongUser.textContent = userName + ': ';
            
            messageParagraph.appendChild(strongUser);
            messageParagraph.appendChild(document.createTextNode(commentText));
            newMessageDiv.appendChild(messageParagraph);

            // Append the new message to the display area
            guestbookMessagesDisplay.appendChild(newMessageDiv);

            // Scroll to the bottom of the messages display
            guestbookMessagesDisplay.scrollTop = guestbookMessagesDisplay.scrollHeight;

            // Clear the input fields
            guestNameInput.value = '';
            guestCommentInput.value = '';
            guestNameInput.focus(); // Optionally focus back on the name input or message input
        });
    }
    */
    // --- End Guestbook Chat Functionality ---

});
