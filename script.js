// script.js
document.addEventListener('DOMContentLoaded', () => {
    const desktopArea = document.querySelector('.desktop-area');
    const icons = document.querySelectorAll('.desktop-icon');
    const windows = document.querySelectorAll('.window');
    const modalOverlay = document.getElementById('modal-overlay');
    
    // --- Wallpaper and Bean Menu Dropdown Logic ---
    const wallpaperMenu = document.getElementById('wallpaper-menu-item');
    const wallpaperDropdown = document.getElementById('wallpaper-dropdown');
    const beanMenu = document.getElementById('bean-menu-item');
    const beanDropdown = document.getElementById('bean-dropdown');
    const aboutBeanLink = document.getElementById('about-this-bean');
    const aboutBeanWindow = document.getElementById('window-about-bean');
    const backgroundVideo = document.querySelector('#background-video');
    const backgroundImage = document.getElementById('background-image');
    
    if (backgroundVideo) {
        backgroundVideo.playbackRate = 0.8;
    }
    
    const wallpapers = [
        { name: 'BabyBean', type: 'video', path: 'background-video.mp4' },
        { name: 'Default', type: 'image', path: 'assets/wallpaper/default.webp' },
        { name: 'Bliss', type: 'image', path: 'assets/wallpaper/bliss.jpg' },
        { name: 'Cyber World', type: 'image', path: 'assets/wallpaper/cyber-world.avif' },
        { name: 'Free Palestine', type: 'image', path: 'assets/wallpaper/free palestine.png' }
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
                if (wp.type === 'video') {
                    if (backgroundImage) backgroundImage.style.display = 'none';
                    if (backgroundVideo) {
                        backgroundVideo.style.display = 'block';
                        const source = backgroundVideo.querySelector('source');
                        if (source && source.src !== wp.path) {
                            source.src = wp.path;
                            backgroundVideo.load();
                        }
                        if (wp.name === 'BabyBean') {
                            backgroundVideo.playbackRate = 0.8;
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
            if (aboutBeanWindow) {
                aboutBeanWindow.style.display = 'flex';
                if (modalOverlay) {
                    modalOverlay.style.display = 'block';
                }
                bringToFront(aboutBeanWindow);
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

    let highestZIndex = 100;
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
        let maxZ = 100;
        document.querySelectorAll('.window').forEach(win => {
            const z = parseInt(window.getComputedStyle(win).zIndex, 10);
            if (!isNaN(z) && z > maxZ) {
                maxZ = z;
            }
        });
        windowElement.style.zIndex = maxZ + 1;
    }

    windows.forEach(win => {
        const titleBar = win.querySelector('.title-bar');
        const closeButton = win.querySelector('.title-bar-buttons .close');

        if (closeButton) {
            closeButton.addEventListener('click', (e) => {
                e.stopPropagation();
                if (win.id === 'window-about-bean' && modalOverlay) {
                    modalOverlay.style.display = 'none';
                }
                win.style.display = 'none';
                if (clickSound) { 
                    clickSound.currentTime = 0;
                    clickSound.play().catch(error => console.warn("Click sound failed:", error));
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
                win.style.cursor = 'grabbing';
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

    const clickSound = document.getElementById('click-sound');

    icons.forEach(icon => {
        icon.addEventListener('click', () => {
            if (clickSound) {
                clickSound.currentTime = 0;
                clickSound.play().catch(error => console.warn("Click sound failed:", error));
            }
            let windowId;
            if (icon.id && icon.id.startsWith('icon-')) {
                const identifier = icon.id.substring('icon-'.length);
                windowId = 'window-' + identifier;
            }
            const win = document.getElementById(windowId);
            if (win) {
                if (win.style.display !== 'none' && win.style.display !== '') {
                    bringToFront(win);
                    return;
                }
                win.style.display = 'flex';
                bringToFront(win);

                if (windowId === 'window-chat') {
                    const awayWindow = document.getElementById('window-vacation');
                    if (awayWindow) {
                        awayWindow.style.display = 'flex';
                        bringToFront(awayWindow);
                    }
                }

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
                const currentPos = win.getBoundingClientRect();
                if (currentPos.left < 0 || currentPos.top < 0 || (win.style.left === '' && win.style.top === '')) {
                    const slot = windowSlots[nextSlotIndex % windowSlots.length];
                    win.style.left = `${slot.x}px`;
                    win.style.top = `${slot.y}px`;
                    nextSlotIndex++;
                }
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
            prevButton.addEventListener('click', () => showImage((currentImageIndex - 1 + polaroids.length) % polaroids.length));
            nextButton.addEventListener('click', () => showImage((currentImageIndex + 1) % polaroids.length));
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
        const affirmationText = affirmationsWindow.querySelector('.affirmation-text');
        const nextButton = affirmationsWindow.querySelector('.next-affirmation');
        let currentAffirmationIndex = Math.floor(Math.random() * affirmations.length);
        function displayAffirmation(index) {
            const affirmation = affirmations[index];
            if (cardArt) cardArt.style.backgroundImage = `url('${affirmation.image}')`;
            if (cardTitle) cardTitle.textContent = affirmation.card;
            if (affirmationText) affirmationText.textContent = affirmation.text;
        }
        if (nextButton) {
            nextButton.addEventListener('click', () => {
                let lastIndex = currentAffirmationIndex;
                do {
                    currentAffirmationIndex = Math.floor(Math.random() * affirmations.length);
                } while (affirmations.length > 1 && currentAffirmationIndex === lastIndex);
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
                optionButton.addEventListener('click', handleTriviaAnswer);
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
            if (restartBtn) restartBtn.addEventListener('click', initializeTriviaGame);
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
            
            chatContentArea.innerHTML = '';
            channel.messages.forEach(msg => {
                const innerHtml = `<span class="username">${msg.sender}:</span> <span class="message-text">${msg.text}</span>`;
                appendMessage(innerHtml, false);
            });

            if (channelName === 'group-chat') {
                guestbookMessages.forEach(msg => {
                    const innerHtml = `<span class="username">${msg.sender}:</span> <span class="message-text">${msg.text}</span>`;
                    appendMessage(innerHtml, true);
                });
            }
            
            chatContentArea.scrollTop = 0;
            updateChatInputVisibility();
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
            guestbookMessages.push({ sender: userScreenName, text: messageText });
            appendMessage(`<span class="username">${userScreenName}:</span> <span class="message-text">${messageText}</span>`, true);
            messageInput.value = '';
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
        
        setScreenNameBtn.addEventListener('click', setScreenName);
        screenNameInput.addEventListener('keypress', e => e.key === 'Enter' && setScreenName());
        sendMessageBtn.addEventListener('click', handleSendMessage);
        messageInput.addEventListener('keypress', e => e.key === 'Enter' && handleSendMessage());
        
        switchChannel('design-philosophy');
    }

    const postSecretWindow = document.getElementById('window-post-secret');
    if (postSecretWindow) {
        let secrets = JSON.parse(localStorage.getItem('secrets')) || [
            { text: "I'm terrified that I'm not living up to my potential.", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3) },
            { text: "I tell people I've read books when I've only seen the movie.", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12) },
            { text: "Sometimes I pretend I'm in a music video when I'm walking down the street.", timestamp: new Date(Date.now() - 1000 * 60 * 30) },
            { text: "I still think about my high school crush.", timestamp: new Date(Date.now() - 1000 * 60 * 5) }
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
            postcardView.style.display = 'grid';
            secretsFeedView.style.display = 'none';
            sendBtn.style.display = 'inline-block';
            viewBtn.style.display = 'inline-block';
            submitNewBtn.style.display = 'none';
        });
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
        if (playBtn) playBtn.addEventListener('click', () => isPlaying ? pauseSong() : playSong());
        if (prevBtn) prevBtn.addEventListener('click', prevSong);
        if (nextBtn) nextBtn.addEventListener('click', nextSong);
        if (audioPlayer) {
            audioPlayer.addEventListener('timeupdate', updateProgress);
            audioPlayer.addEventListener('ended', nextSong);
            audioPlayer.addEventListener('loadedmetadata', updateProgress);
        }
        loadSong(currentTrackIndex);
    }
    
    const workExplorerContent = {
        'C:\\Desktop\\Work': { type: 'folder', name: 'Work', children: ['AMP', 'Duo', 'Pinterest', 'Diversify'] },
        'AMP': { type: 'app', name: 'AMP', description: "Led design for AMP...", icon: "assets/app icons/amp app icon.png", url: "https://www.figma.com/proto/Xp8nSBrpP00e5gNfT66b57/AMP-Case-Study" },
        'Duo': { type: 'app', name: 'Duo', description: "As the lead designer for Duo...", icon: "assets/app icons/duo app icon.png", url: "https://www.figma.com/proto/l8WdkUTkH2DeN4tGzwqM2J/Duo-Case-Study" },
        'Pinterest': { type: 'app', name: 'Pinterest', description: "I led a project to redesign...", icon: "assets/app icons/pinterest app icon.png", url: "https://www.figma.com/proto/zD4aNf6xZdMQt1Yp9E5C0Y/Pinterest-Case-Study" },
        'Diversify': { type: 'app', name: 'Diversify', description: "As a passion project, I co-founded...", icon: "assets/app icons/diversify_design_logo.jpeg", url: "https://diversify.design/" }
    };
    let currentPath = 'C:\\Desktop\\Work';
    let historyStack = ['C:\\Desktop\\Work'];
    function setActiveTab(tabIdentifier) {
        const projectsWindow = document.getElementById('window-projects');
        if (!projectsWindow) return;
        projectsWindow.querySelectorAll('.favorite-link').forEach(link => {
            link.classList.toggle('selected', link.dataset.path === tabIdentifier);
        });
    }
    function loadUrlInExplorer(url, title) {
        const projectsWindow = document.getElementById('window-projects');
        if (!projectsWindow) return;
        const folderView = projectsWindow.querySelector('.folder-view');
        if (folderView) {
            folderView.innerHTML = `<iframe src="${url}" class="website-iframe" title="${title}"></iframe>`;
            setActiveTab('iframe-view');
        }
    }
    function renderWorkExplorer(path) {
        currentPath = path;
        const projectsWindow = document.getElementById('window-projects');
        if (!projectsWindow) return;
        const folderView = projectsWindow.querySelector('.folder-view');
        const addressBar = projectsWindow.querySelector('#address-bar');
        const backButtonContainer = projectsWindow.querySelector('#back-button-container');
        if (!folderView || !addressBar) return;
        folderView.innerHTML = '';
        addressBar.value = path;
        const content = workExplorerContent[path];
        if (backButtonContainer) {
            backButtonContainer.innerHTML = '';
            if (historyStack.length > 1) {
                const backButton = document.createElement('button');
                backButton.innerHTML = '&larr; Back';
                backButton.onclick = () => {
                    historyStack.pop();
                    renderWorkExplorer(historyStack[historyStack.length - 1]);
                };
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
                        historyStack.push(itemName);
                        renderWorkExplorer(itemName);
                    };
                    folderView.appendChild(fileIcon);
                }
            });
        } else if (content.type === 'app') {
            setActiveTab(path);
            folderView.innerHTML = `<h3>${content.name}</h3><p>${content.description}</p><button class="action-button view-project-btn">View Project</button>`;
            const viewBtn = folderView.querySelector('.view-project-btn');
            if (viewBtn) viewBtn.onclick = () => loadUrlInExplorer(content.url, content.name);
        }
    }
    function showHomepage() {
        const projectsWindow = document.getElementById('window-projects');
        if (!projectsWindow) return;
        const folderView = projectsWindow.querySelector('.folder-view');
        if (folderView) {
            folderView.innerHTML = `<h2>Welcome</h2><p>Select a project.</p>`;
            setActiveTab('homepage');
            historyStack = ['C:\\Desktop\\Work'];
        }
    }
    function showProjectDetail(projectName) {
        const projectsWindow = document.getElementById('window-projects');
        if (!projectsWindow) return;
        const mainArea = projectsWindow.querySelector('.folder-view');
        const project = workExplorerContent[projectName];
        if (project && project.type === 'app' && mainArea) {
            mainArea.innerHTML = `<div class="project-detail-content"><h3>${project.name}</h3><p>${project.description}</p><button class="action-button" onclick="loadUrlInExplorer('${project.url}', '${project.name}')">View Case Study</button></div>`;
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
        const favs = ['AMP', 'Duo', 'Pinterest', 'Diversify'];
        const homeButton = document.createElement('div');
        homeButton.className = 'favorite-link';
        homeButton.dataset.path = 'homepage';
        homeButton.innerHTML = `<img src="assets/desktop icons/home-folder-icon.png" alt="Home"> Home`;
        homeButton.onclick = showHomepage;
        favoritesBar.appendChild(homeButton);
        favs.forEach(favName => {
            const item = workExplorerContent[favName];
            if (item) {
                const favLink = document.createElement('div');
                favLink.className = 'favorite-link';
                favLink.dataset.path = favName;
                favLink.innerHTML = `<img src="${item.icon}" alt="${item.name}">${item.name}`;
                favLink.onclick = () => {
                    historyStack = ['C:\\Desktop\\Work', favName]; 
                    showProjectDetail(favName);
                    setActiveTab(favName);
                };
                favoritesBar.appendChild(favLink);
            }
        });
        showHomepage();
    }

    // Initial calls
    populateWallpaperMenu();
    setInterval(updateClock, 1000);
    updateClock();
});
                
                