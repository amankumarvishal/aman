// DOM Elements
const textDisplay = document.getElementById('textDisplay');
const textInput = document.getElementById('textInput');
const wpmDisplay = document.getElementById('wpm');
const accuracyDisplay = document.getElementById('accuracy');
const timeDisplay = document.getElementById('time');
const errorsDisplay = document.getElementById('errors');
const resetBtn = document.getElementById('resetBtn');
const showStatsBtn = document.getElementById('showStatsBtn');
const shareBtn = document.getElementById('shareBtn');
const levelBtns = document.querySelectorAll('.level-btn');
const modeBtns = document.querySelectorAll('.mode-btn');
const customTextArea = document.getElementById('customText');
const useCustomTextBtn = document.getElementById('useCustomText');
const loginBtn = document.getElementById('loginBtn');
const usernameInput = document.getElementById('username');
const userProfile = document.getElementById('userProfile');
const loginForm = document.getElementById('loginForm');
const themeOptions = document.querySelectorAll('.theme-option');
const keyboardDisplay = document.getElementById('keyboardDisplay');
const detailedStats = document.querySelector('.detailed-stats');
const leaderboardBody = document.getElementById('leaderboardBody');
const leaderboardMode = document.getElementById('leaderboardMode');

// State variables
let currentText = '';
let timeLeft = 60;
let timer = null;
let isTyping = false;
let startTime;
let currentLevel = 'easy';
let currentMode = 'practice';
let username = localStorage.getItem('username') || '';
let userStats = {
    bestWpm: 0,
    avgWpm: 0,
    testsCompleted: 0
};
let wpmHistory = [];
let mistakeMap = new Map();
let currentTheme = localStorage.getItem('theme') || 'default';

// Texts for different levels
const texts = {
    easy: [
        "The quick brown fox jumps over the lazy dog.",
        "A simple sentence is easy to type quickly.",
        "Practice makes perfect when learning to type.",
    ],
    medium: [
        "The five boxing wizards jump quickly to test their reflexes and agility.",
        "Pack my box with five dozen liquor jugs for a quick party tonight.",
        "How vexingly quick daft zebras jump when chased by angry dogs.",
    ],
    hard: [
        "Sphinx of black quartz, judge my vow while playing jazzy tunes quickly.",
        "The job requires extra pluck and zeal from every young wage earner.",
        "Two driven jocks help fax my big quiz while playing heavy metal.",
    ],
    expert: [
        "Waltz, nymph, for quick jigs vex Bud with your crazy dance moves now.",
        "Quick zephyrs blow, vexing daft Jim while playing jazzy tunes today.",
        "The quick onyx goblin jumps over the lazy dwarf in dark caverns.",
    ]
};

const challengeTexts = {
    easy: [
        "Type as fast as you can while maintaining accuracy in this simple test.",
        "Focus on your speed and accuracy to improve your typing skills now.",
        "Keep your eyes on the screen and maintain a steady typing rhythm.",
    ],
    medium: [
        "Programming requires attention to detail and accurate typing skills daily.",
        "JavaScript developers write code quickly while maintaining high quality.",
        "Web development combines creativity with technical typing precision.",
    ],
    hard: [
        "Professional typists can achieve speeds of over 100 words per minute consistently.",
        "The quick brown fox jumps over the lazy dog while playing a jazzy tune.",
        "Experienced programmers type efficiently using keyboard shortcuts frequently.",
    ],
    expert: [
        "Mastering touch typing requires dedication, practice, and proper finger placement.",
        "Expert typists maintain high accuracy while achieving remarkable typing speeds.",
        "Competitive typing demands perfect balance between speed and precision always.",
    ]
};

// Challenge mode texts
// const challengeTexts = {
//     easy: ["Complete this text in under 30 seconds with 95% accuracy to win!"],
//     medium: ["Type this challenging text with perfect accuracy to earn bonus points!"],
//     hard: ["Race against time! Complete this text in under 20 seconds to set a record!"],
//     expert: ["Master challenge! Type this complex text perfectly under intense time pressure!"]
// };

// Keyboard layout
const keyboard = {
    row1: '`1234567890-=',
    row2: 'qwertyuiop[]\\',
    row3: 'asdfghjkl;\'',
    row4: 'zxcvbnm,./'
};

// Initialize the application
function init() {
    loadUserProfile();
    setupKeyboard();
    setTheme(currentTheme);
    setMode('practice'); // Set initial mode
    setLevel('easy'); // Set initial level
    resetTest();
    setupEventListeners();
}

// Set up event listeners
function setupEventListeners() {
    textInput.addEventListener('input', handleInput);
    resetBtn.addEventListener('click', resetTest);
    showStatsBtn.addEventListener('click', toggleDetailedStats);
    shareBtn.addEventListener('click', shareResults);
    loginBtn.addEventListener('click', handleLogin);
    useCustomTextBtn.addEventListener('click', useCustomText);
    leaderboardMode.addEventListener('change', updateLeaderboard);
    
    levelBtns.forEach(btn => {
        btn.addEventListener('click', () => setLevel(btn.dataset.level));
    });
    
    modeBtns.forEach(btn => {
        btn.addEventListener('click', () => setMode(btn.dataset.mode));
    });
    
    themeOptions.forEach(option => {
        option.addEventListener('click', () => setTheme(option.dataset.theme));
    });
}

// Handle input events
function handleInput() {
    const inputText = textInput.value;
    const targetText = currentText;

    if (!isTyping && inputText.length > 0) {
        startTypingTest();
    }

    // Update display and track mistakes
    let displayHTML = '';
    let mistakes = 0;
    
    [...targetText].forEach((char, index) => {
        if (index >= inputText.length) {
            displayHTML += `<span class="remaining">${char}</span>`;
        } else if (char === inputText[index]) {
            displayHTML += `<span class="correct">${char}</span>`;
        } else {
            displayHTML += `<span class="incorrect">${char}</span>`;
            mistakes++;
            if (!mistakeMap.has(char)) {
                mistakeMap.set(char, 1);
            } else {
                mistakeMap.set(char, mistakeMap.get(char) + 1);
            }
        }
    });

    textDisplay.innerHTML = displayHTML;
    errorsDisplay.textContent = mistakes;
    
    // Update stats
    if (isTyping) {
        const wpm = calculateWPM(inputText.length);
        const accuracy = calculateAccuracy(mistakes, inputText.length);
        
        wpmDisplay.textContent = wpm;
        accuracyDisplay.textContent = accuracy + '%';
        wpmHistory.push(wpm);
    }

    // Check if test is complete
    if (inputText.length === targetText.length) {
        endTest();
    }
}

// Start typing test
function startTypingTest() {
    isTyping = true;
    startTime = Date.now();
    startTimer();
}

// Update the display
function updateDisplay() {
    const inputText = textInput.value;
    const targetText = currentText;
    let displayHTML = '';

    [...targetText].forEach((char, index) => {
        if (index >= inputText.length) {
            displayHTML += `<span>${char}</span>`;
        } else if (char === inputText[index]) {
            displayHTML += `<span class="correct">${char}</span>`;
        } else {
            displayHTML += `<span class="incorrect">${char}</span>`;
        }
    });

    textDisplay.innerHTML = displayHTML;
    updateKeyboardDisplay(inputText[inputText.length - 1]);
}

// Track typing mistakes
function trackMistakes(input, target) {
    const inputChars = [...input];
    const targetChars = [...target];
    
    inputChars.forEach((char, index) => {
        if (char !== targetChars[index]) {
            const mistake = `${targetChars[index]} → ${char}`;
            mistakeMap.set(mistake, (mistakeMap.get(mistake) || 0) + 1);
        }
    });
}

// Update typing statistics
function updateStats() {
    const wpm = calculateWPM();
    const accuracy = calculateAccuracy();
    const errors = countErrors();
    
    wpmDisplay.textContent = wpm;
    accuracyDisplay.textContent = accuracy + '%';
    errorsDisplay.textContent = errors;
    
    wpmHistory.push(wpm);
    updateWPMChart();
}

// Calculate Words Per Minute
function calculateWPM(inputLength) {
    const timeElapsed = (Date.now() - startTime) / 60000; // Convert to minutes
    const wordsTyped = inputLength / 5; // Standard: 5 characters = 1 word
    return Math.round(wordsTyped / timeElapsed);
}

// Calculate typing accuracy
function calculateAccuracy(mistakes, totalChars) {
    if (totalChars === 0) return 100;
    const correctChars = totalChars - mistakes;
    return Math.round((correctChars / totalChars) * 100);
}

// Count typing errors
function countErrors() {
    const inputText = textInput.value;
    const targetText = currentText;
    let errors = 0;

    [...inputText].forEach((char, index) => {
        if (targetText[index] !== char) {
            errors++;
        }
    });

    return errors;
}

// Timer functionality
function startTimer() {
    timer = setInterval(() => {
        timeLeft--;
        timeDisplay.textContent = timeLeft + 's';
        
        if (timeLeft <= 0) {
            endTest();
        }
    }, 1000);
}

// End typing test
function endTest() {
    isTyping = false;
    clearInterval(timer);
    textInput.disabled = true;
    
    const finalWpm = calculateWPM(textInput.value.length);
    const finalAccuracy = calculateAccuracy(mistakeMap.size, currentText.length);
    
    if (username) {
        updateUserStats(finalWpm);
    }
    
    showDetailedStats();
    updateWPMChart();
    showCommonMistakes();
}

// Reset typing test
function resetTest() {
    // Clear timers and state
    clearInterval(timer);
    timeLeft = 60;
    isTyping = false;
    startTime = null;
    
    // Reset statistics
    wpmHistory = [];
    mistakeMap.clear();
    
    // Reset input and display
    textInput.value = '';
    textInput.disabled = false;
    textInput.focus();
    
    // Reset display elements
    timeDisplay.textContent = timeLeft + 's';
    wpmDisplay.textContent = '0';
    accuracyDisplay.textContent = '100%';
    errorsDisplay.textContent = '0';
    
    // Get new text and update display
    currentText = getRandomText();
    textDisplay.innerHTML = [...currentText].map(char => 
        `<span class="remaining">${char}</span>`
    ).join('');
    
    // Hide detailed stats if shown
    const detailedStats = document.querySelector('.detailed-stats');
    if (detailedStats) {
        detailedStats.classList.add('hidden');
    }
}

// Get random text based on level and mode
function getRandomText() {
    let textArray;
    if (currentMode === 'custom') {
        return customTextArea.value.trim() || texts[currentLevel][0];
    } else if (currentMode === 'challenge') {
        textArray = challengeTexts[currentLevel];
    } else {
        textArray = texts[currentLevel];
    }
    return textArray[Math.floor(Math.random() * textArray.length)];
}

// Set difficulty level
function setLevel(level) {
    currentLevel = level;
    levelBtns.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.level === level) {
            btn.classList.add('active');
        }
    });
    currentText = getRandomText(); // Get new text for the selected level
    textDisplay.textContent = currentText;
    resetTest();
}

// Set game mode
function setMode(mode) {
    currentMode = mode;
    modeBtns.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.mode === mode) {
            btn.classList.add('active');
        }
    });
    
    // Toggle custom text area visibility
    const customTextSection = document.querySelector('.custom-text-section');
    if (customTextSection) {
        customTextSection.classList.toggle('hidden', mode !== 'custom');
    }

    // Get new text for the selected mode
    currentText = getRandomText();
    textDisplay.textContent = currentText;
    
    resetTest();
}

// Use custom text
function useCustomText() {
    const text = customTextArea.value.trim();
    if (text.length > 0) {
        currentText = text;
        textDisplay.innerHTML = text;
        resetTest();
    }
}

// Handle user login
function handleLogin() {
    const newUsername = usernameInput.value.trim();
    if (newUsername) {
        username = newUsername;
        localStorage.setItem('username', username);
        loadUserProfile();
    }
}

// Load user profile
function loadUserProfile() {
    if (username) {
        loginForm.classList.add('hidden');
        userProfile.classList.remove('hidden');
        document.querySelector('.username').textContent = username;
        
        // Load user stats from localStorage
        const savedStats = JSON.parse(localStorage.getItem(`stats_${username}`)) || userStats;
        userStats = savedStats;
        updateUserStatsDisplay();
    }
}

// Update user statistics
function updateUserStats(wpm) {
    userStats.testsCompleted++;
    userStats.bestWpm = Math.max(userStats.bestWpm, wpm);
    userStats.avgWpm = Math.round((userStats.avgWpm * (userStats.testsCompleted - 1) + wpm) / userStats.testsCompleted);
    
    localStorage.setItem(`stats_${username}`, JSON.stringify(userStats));
    updateUserStatsDisplay();
}

// Update user stats display
function updateUserStatsDisplay() {
    document.getElementById('bestWpm').textContent = userStats.bestWpm;
    document.getElementById('avgWpm').textContent = userStats.avgWpm;
    document.getElementById('testsCompleted').textContent = userStats.testsCompleted;
}

// Show/hide detailed statistics
function toggleDetailedStats() {
    detailedStats.classList.toggle('hidden');
    if (!detailedStats.classList.contains('hidden')) {
        updateWPMChart();
        showCommonMistakes();
    }
}

// Update WPM chart
function updateWPMChart() {
    const ctx = document.getElementById('wpmChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: wpmHistory.map((_, i) => i + 1),
            datasets: [{
                label: 'WPM Progress',
                data: wpmHistory,
                borderColor: getComputedStyle(document.documentElement).getPropertyValue('--primary-color'),
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Show common mistakes
function showCommonMistakes() {
    const mistakesList = document.getElementById('commonMistakes');
    mistakesList.innerHTML = '';
    
    const sortedMistakes = [...mistakeMap.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
    
    sortedMistakes.forEach(([mistake, count]) => {
        const li = document.createElement('li');
        li.textContent = `${mistake}: ${count} times`;
        mistakesList.appendChild(li);
    });
}

// Set theme
function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    currentTheme = theme;
    localStorage.setItem('theme', theme);
}

// Setup keyboard display
function setupKeyboard() {
    const createRow = (keys) => {
        return [...keys].map(key => `<div class="key" data-key="${key}">${key}</div>`).join('');
    };
    
    keyboardDisplay.innerHTML = `
        <div class="keyboard-row">${createRow(keyboard.row1)}</div>
        <div class="keyboard-row">${createRow(keyboard.row2)}</div>
        <div class="keyboard-row">${createRow(keyboard.row3)}</div>
        <div class="keyboard-row">${createRow(keyboard.row4)}</div>
    `;
}

// Update keyboard display
function updateKeyboardDisplay(key) {
    document.querySelectorAll('.key').forEach(k => k.classList.remove('active'));
    if (key) {
        const keyEl = document.querySelector(`[data-key="${key.toLowerCase()}"]`);
        if (keyEl) keyEl.classList.add('active');
    }
}

// Share results
function shareResults() {
    const text = `I just typed ${wpmDisplay.textContent} WPM with ${accuracyDisplay.textContent} accuracy on Typing Master! Can you beat my score?`;
    if (navigator.share) {
        navigator.share({
            title: 'Typing Master Score',
            text: text,
            url: window.location.href
        });
    } else {
        alert('Share your score:\n\n' + text);
    }
}

// Update leaderboard
function updateLeaderboard() {
    const mode = leaderboardMode.value;
    const leaderboardData = JSON.parse(localStorage.getItem(`leaderboard_${mode}`)) || [];
    
    leaderboardBody.innerHTML = leaderboardData
        .sort((a, b) => b.wpm - a.wpm)
        .slice(0, 10)
        .map((entry, index) => `
            <tr>
                <td>${index + 1}</td>
                <td>${entry.username}</td>
                <td>${entry.wpm}</td>
                <td>${entry.accuracy}%</td>
            </tr>
        `)
        .join('');
}

// Initialize the application
init();
