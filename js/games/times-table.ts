// @ts-nocheck
/**
 * times-table game logic
 * Migrated from times-table.html
 */

// Import utilities
import { setCookie, getCookie } from '../storage-utils';

// Declare globals that might be used
declare const window: any;
declare const document: any;

class TimesTableTraining {
            constructor() {
                this.setupElements();
                this.resetGame();
                this.bindEvents();
            }

            setupElements() {
                this.setupScreen = document.getElementById('setupScreen');
                this.gameScreen = document.getElementById('gameScreen');
                this.resultsScreen = document.getElementById('resultsScreen');
                this.difficultyButtons = document.querySelectorAll('.difficulty-btn');
                this.tableButtons = document.querySelectorAll('.table-btn');
                this.randomOrderCheckbox = document.getElementById('randomOrder');
                this.timeLimitSlider = document.getElementById('timeLimit');
                this.timeDisplay = document.getElementById('timeDisplay');
                this.buttonModeRadio = document.getElementById('buttonMode');
                this.assistedModeRadio = document.getElementById('assistedMode');
                this.keyboardModeRadio = document.getElementById('keyboardInputMode');
                this.startBtn = document.getElementById('startBtn');
                this.timer = document.getElementById('timer');
                this.problemCounter = document.getElementById('problemCounter');
                this.accuracy = document.getElementById('accuracy');
                this.progressFill = document.getElementById('progressFill');
                this.equationsContainer = document.getElementById('equationsContainer');
                this.equationItems = [];
                for (let i = 0; i < 5; i++) {
                    this.equationItems[i] = document.getElementById(`equation-${i}`);
                }
                this.keyboardInput = document.getElementById('keyboardInput');
                this.answerInput = document.getElementById('answerInput');
                this.submitBtn = document.getElementById('submitBtn');
                this.answerOptions = document.getElementById('answerOptions');
                this.playAgainBtn = document.getElementById('playAgainBtn');
                this.shareSocreBtn = document.getElementById('shareSocreBtn');
                this.feedbackOverlay = document.getElementById('feedbackOverlay');
                this.playerNameInput = document.getElementById('playerNameInput');
                this.playerNameDisplay = document.getElementById('playerNameDisplay');
                this.printCertificateBtn = document.getElementById('printCertificateBtn');
                this.setupAudio();
            }

            setupAudio() {
                try {
                    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
                } catch (e) {
                    this.audioContext = null;
                }
            }

            playSound(frequency, duration, volume = 0.1) {
                if (!this.audioContext) return;

                try {
                    const oscillator = this.audioContext.createOscillator();
                    const gainNode = this.audioContext.createGain();

                    oscillator.connect(gainNode);
                    gainNode.connect(this.audioContext.destination);

                    oscillator.frequency.value = frequency;
                    oscillator.type = 'sine';

                    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
                    gainNode.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 0.01);
                    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);

                    oscillator.start(this.audioContext.currentTime);
                    oscillator.stop(this.audioContext.currentTime + duration);
                } catch (e) {
                    // Audio might not be supported
                }
            }

            resetGame() {
                this.timeLeft = parseInt(this.timeLimitSlider.value) || 60;
                this.currentProblem = 0;
                this.correctAnswers = 0;
                this.totalProblems = 0;
                this.startTime = null;
                this.problemStartTime = null;
                this.responseTimes = [];
                this.gameActive = false;
                this.currentAnswer = null;
                this.hintTimer = null;
                this.equationQueue = [];
                this.currentEquationIndex = 0;
                this.completedProblems = [];
                this.keyboardMode = false;
                this.sequentialIndex = 0;

                this.initializeEquationQueue();
                this.assistedMode = this.assistedModeRadio.checked;
                this.keyboardMode = this.keyboardModeRadio.checked;
                this.selectedDifficulty = document.querySelector('.difficulty-btn.selected')?.dataset.difficulty || 'easy';
                this.specificTable = document.querySelector('.table-btn.selected')?.dataset.table || null;
                this.randomOrder = this.randomOrderCheckbox.checked;

                this.loadSettings();
            }

            setCookie(name, value, days = 365) {
                const d = new Date();
                d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
                document.cookie = `${name}=${encodeURIComponent(value)};expires=${d.toUTCString()};path=/;SameSite=Lax`;
            }

            getCookie(name) {
                const match = document.cookie.split(';').map(s => s.trim()).find(s => s.startsWith(name + '='));
                return match ? decodeURIComponent(match.split('=')[1]) : null;
            }

            loadSettings() {
                const inputMode = this.getCookie('timesTableInputMode');
                if (inputMode !== null) {
                    this.buttonModeRadio.checked = false;
                    this.assistedModeRadio.checked = false;
                    this.keyboardModeRadio.checked = false;

                    switch(inputMode) {
                        case 'button':
                            this.buttonModeRadio.checked = true;
                            this.assistedMode = false;
                            this.keyboardMode = false;
                            break;
                        case 'assisted':
                            this.assistedModeRadio.checked = true;
                            this.assistedMode = true;
                            this.keyboardMode = false;
                            break;
                        case 'keyboard':
                            this.keyboardModeRadio.checked = true;
                            this.assistedMode = false;
                            this.keyboardMode = true;
                            break;
                        default:
                            this.buttonModeRadio.checked = true;
                            this.assistedMode = false;
                            this.keyboardMode = false;
                    }
                }

                const timeLimit = this.getCookie('timesTableTimeLimit');
                if (timeLimit !== null) {
                    this.timeLimitSlider.value = timeLimit;
                    this.timeDisplay.textContent = `${timeLimit}s`;
                }

                const difficulty = this.getCookie('timesTableDifficulty');
                if (difficulty !== null) {
                    this.difficultyButtons.forEach(btn => btn.classList.remove('selected'));
                    const savedBtn = document.querySelector(`[data-difficulty="${difficulty}"]`);
                    if (savedBtn) {
                        savedBtn.classList.add('selected');
                        this.selectedDifficulty = difficulty;
                    }
                }

                this.updateInputModeDisplay();

                const savedName = this.getCookie('playerName');
                if (savedName) {
                    this.playerNameInput.value = savedName;
                }

                const specificTable = this.getCookie('timesTableSpecific');
                if (specificTable !== null && specificTable !== 'null') {
                    const savedTableBtn = document.querySelector(`[data-table="${specificTable}"]`);
                    if (savedTableBtn) {
                        savedTableBtn.classList.add('selected');
                        this.specificTable = specificTable;
                    }
                }

                const randomOrder = this.getCookie('timesTableRandomOrder');
                if (randomOrder !== null) {
                    this.randomOrderCheckbox.checked = randomOrder === 'true';
                    this.randomOrder = randomOrder === 'true';
                }
            }

            saveSettings() {
                let inputMode = 'button';
                if (this.assistedModeRadio.checked) {
                    inputMode = 'assisted';
                } else if (this.keyboardModeRadio.checked) {
                    inputMode = 'keyboard';
                }
                this.setCookie('timesTableInputMode', inputMode);
                this.setCookie('timesTableTimeLimit', this.timeLimitSlider.value);
                this.setCookie('timesTableDifficulty', this.selectedDifficulty);
                this.setCookie('timesTableSpecific', this.specificTable || 'null');
                this.setCookie('timesTableRandomOrder', this.randomOrder);
                const name = (this.playerNameInput?.value || '').trim();
                if (name) this.setCookie('playerName', name);
            }

            initializeEquationQueue() {
                this.equationQueue = [];
                for (let i = 0; i < 5; i++) {
                    this.equationQueue.push(this.generateProblem());
                }

                for (let i = 0; i < 10; i++) {
                    this.equationQueue.push(this.generateProblem());
                }

                this.updateEquationDisplay();
            }

            updateEquationDisplay() {
                for (let i = 0; i < 5; i++) {
                    const equationItem = this.equationItems[i];
                    const equationText = equationItem.querySelector('.equation-text');
                    const equationStatus = equationItem.querySelector('.equation-status');

                    equationItem.classList.remove('completed', 'current', 'future');

                    let equationIndex;

                    if (this.currentProblem < 3) {
                        equationIndex = i;
                    } else {
                        equationIndex = (this.currentProblem - 2) + i;
                    }

                    const equation = this.equationQueue[equationIndex];

                    if (equationIndex < this.currentProblem) {
                        equationItem.classList.add('completed');
                        if (equation) {
                            equationText.textContent = `${equation.num1} × ${equation.num2} = ${equation.answer}`;
                            const wasCorrect = this.completedProblems[equationIndex]?.correct ?? true;
                            equationStatus.textContent = wasCorrect ? '✓' : '✗';
                            equationStatus.style.color = wasCorrect ? '#28a745' : '#dc3545';
                        }
                    } else if (equationIndex === this.currentProblem) {
                        equationItem.classList.add('current');
                        if (equation) {
                            equationText.textContent = `${equation.num1} × ${equation.num2} = ?`;
                            equationStatus.textContent = '❯';
                        } else {
                            equationText.textContent = 'Get Ready...';
                            equationStatus.textContent = '❯';
                        }
                    } else {
                        equationItem.classList.add('future');
                        if (equation) {
                            equationText.textContent = `${equation.num1} × ${equation.num2} = ?`;
                        } else {
                            equationText.textContent = 'Loading...';
                        }
                        equationStatus.textContent = '⋯';
                    }
                }
            }

            moveToNextEquation(wasCorrect) {
                this.completedProblems[this.currentProblem] = {
                    correct: wasCorrect
                };

                this.currentProblem++;

                while (this.equationQueue.length <= this.currentProblem + 5) {
                    this.equationQueue.push(this.generateProblem());
                }

                const nextProblem = this.equationQueue[this.currentProblem];
                if (nextProblem) {
                    this.currentAnswer = nextProblem.answer;
                }

                if (this.keyboardMode) {
                    this.answerInput.value = '';
                    setTimeout(() => {
                        this.answerInput.focus();
                        this.answerInput.select();
                    }, 100);
                }

                this.animateEquationScroll();
            }

            animateEquationScroll() {
                this.equationsContainer.classList.add('transitioning');

                setTimeout(() => {
                    this.updateEquationDisplay();
                    this.equationsContainer.classList.remove('transitioning');
                }, 200);
            }

            updateInputModeDisplay() {
                if (this.keyboardMode) {
                    this.answerOptions.style.display = 'none';
                    this.keyboardInput.style.display = 'flex';
                } else {
                    this.answerOptions.style.display = 'grid';
                    this.keyboardInput.style.display = 'none';
                }
            }

            submitKeyboardAnswer() {
                if (!this.gameActive || !this.keyboardMode) return;

                const userAnswer = parseInt(this.answerInput.value);
                if (isNaN(userAnswer)) {
                    this.answerInput.focus();
                    return;
                }

                const correctAnswer = parseInt(this.currentAnswer);
                const isCorrect = userAnswer === correctAnswer;

                this.handleAnswer(isCorrect);

                this.answerInput.value = '';
                this.answerInput.focus();
            }

            handleAnswer(isCorrect) {
                if (!this.gameActive) return;

                const responseTime = Date.now() - this.problemStartTime;
                this.responseTimes.push(responseTime);

                this.showFeedback(isCorrect);

                if (isCorrect) {
                    this.playSound(523, 0.2);
                } else {
                    setTimeout(() => this.playSound(250, 0.1), 100);
                    setTimeout(() => this.playSound(200, 0.2), 200);
                }

                if (isCorrect) {
                    this.correctAnswers++;
                }

                this.totalProblems++;

                this.moveToNextEquation(isCorrect);

                this.updateUI();

                setTimeout(() => {
                    if (this.timeLeft > 0 && this.gameActive) {
                        this.showProblem();
                    }
                }, 800);
            }

            bindEvents() {
                this.startBtn.addEventListener('click', () => this.startGame());
                this.playAgainBtn.addEventListener('click', () => this.showSetup());
                this.shareSocreBtn.addEventListener('click', () => this.shareScore());
                this.submitBtn.addEventListener('click', () => this.submitKeyboardAnswer());
                this.printCertificateBtn.addEventListener('click', () => this.printCertificate());
                this.playerNameInput.addEventListener('input', () => {
                    this.setCookie('playerName', this.playerNameInput.value);
                });

                this.answerInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        this.submitKeyboardAnswer();
                    }
                });

                this.difficultyButtons.forEach(btn => {
                    btn.addEventListener('click', () => {
                        this.difficultyButtons.forEach(b => b.classList.remove('selected'));
                        btn.classList.add('selected');
                        this.selectedDifficulty = btn.dataset.difficulty;
                        // Deselect specific table when selecting difficulty
                        this.tableButtons.forEach(tb => tb.classList.remove('selected'));
                        this.specificTable = null;
                        this.saveSettings();
                    });
                });

                this.tableButtons.forEach(btn => {
                    btn.addEventListener('click', () => {
                        // Toggle table selection
                        const wasSelected = btn.classList.contains('selected');
                        this.tableButtons.forEach(b => b.classList.remove('selected'));

                        if (!wasSelected) {
                            btn.classList.add('selected');
                            this.specificTable = btn.dataset.table;
                            // Deselect difficulty when selecting specific table
                            this.difficultyButtons.forEach(db => db.classList.remove('selected'));
                        } else {
                            this.specificTable = null;
                        }
                        this.saveSettings();
                    });
                });

                this.randomOrderCheckbox.addEventListener('change', () => {
                    this.randomOrder = this.randomOrderCheckbox.checked;
                    this.saveSettings();
                });

                [this.buttonModeRadio, this.assistedModeRadio, this.keyboardModeRadio].forEach(radio => {
                    radio.addEventListener('change', () => {
                        if (radio.checked) {
                            this.assistedMode = this.assistedModeRadio.checked;
                            this.keyboardMode = this.keyboardModeRadio.checked;

                            this.updateInputModeDisplay();

                            if (this.keyboardMode && this.gameActive) {
                                setTimeout(() => this.answerInput.focus(), 100);
                            }

                            this.saveSettings();
                        }
                    });
                });

                this.timeLimitSlider.addEventListener('input', () => {
                    this.timeDisplay.textContent = `${this.timeLimitSlider.value}s`;
                    this.saveSettings();
                });
            }

            generateProblem() {
                let num1, num2;

                // If specific table is selected
                if (this.specificTable) {
                    num1 = parseInt(this.specificTable);

                    if (this.randomOrder) {
                        // Random order
                        num2 = Math.floor(Math.random() * 12) + 1; // 1-12
                    } else {
                        // Sequential order: 1, 2, 3, ... 12, then repeat
                        num2 = (this.sequentialIndex % 12) + 1;
                        this.sequentialIndex++;
                    }
                } else {
                    // Use difficulty ranges
                    const difficulty = this.selectedDifficulty;

                    switch (difficulty) {
                        case 'easy':
                            // 2-5 times tables
                            num1 = Math.floor(Math.random() * 4) + 2;  // 2-5
                            num2 = Math.floor(Math.random() * 12) + 1; // 1-12
                            break;
                        case 'medium':
                            // 2-9 times tables
                            num1 = Math.floor(Math.random() * 8) + 2;  // 2-9
                            num2 = Math.floor(Math.random() * 12) + 1; // 1-12
                            break;
                        case 'hard':
                            // 2-12 times tables
                            num1 = Math.floor(Math.random() * 11) + 2;  // 2-12
                            num2 = Math.floor(Math.random() * 12) + 1;  // 1-12
                            break;
                        case 'expert':
                            // All times tables up to 15
                            num1 = Math.floor(Math.random() * 14) + 2;  // 2-15
                            num2 = Math.floor(Math.random() * 15) + 1;  // 1-15
                            break;
                    }
                }

                const answer = num1 * num2;
                return { num1, num2, operation: '×', answer };
            }

            showProblem() {
                const problem = this.equationQueue[this.currentProblem];
                if (!problem) return;

                this.currentAnswer = problem.answer;

                this.updateInputModeDisplay();

                if (this.keyboardMode) {
                    setTimeout(() => this.answerInput.focus(), 100);
                }

                if (this.hintTimer) {
                    clearTimeout(this.hintTimer);
                    this.hintTimer = null;
                }

                const options = this.generateOptions(problem.answer);
                this.answerOptions.innerHTML = '';

                options.forEach((option, index) => {
                    const button = document.createElement('button');
                    button.className = 'answer-btn';
                    button.textContent = option;
                    button.addEventListener('click', () => this.selectAnswer(option, button));

                    if (option === this.currentAnswer) {
                        this.correctAnswerButton = button;
                    }

                    this.answerOptions.appendChild(button);
                });

                this.problemStartTime = Date.now();

                if (this.assistedMode) {
                    this.hintTimer = setTimeout(() => {
                        if (this.correctAnswerButton && this.gameActive) {
                            this.correctAnswerButton.classList.add('hint');
                        }
                    }, 3000);
                }
            }

            generateOptions(correctAnswer) {
                const options = [correctAnswer];
                const range = Math.max(10, Math.floor(correctAnswer * 0.5));

                while (options.length < 4) {
                    let option;
                    if (Math.random() < 0.5) {
                        option = correctAnswer + Math.floor(Math.random() * range) - Math.floor(range / 2);
                    } else {
                        option = Math.floor(Math.random() * (correctAnswer * 2)) + 1;
                    }

                    if (option > 0 && !options.includes(option)) {
                        options.push(option);
                    }
                }

                return options.sort(() => Math.random() - 0.5);
            }

            selectAnswer(answer, button) {
                if (!this.gameActive) return;

                if (this.hintTimer) {
                    clearTimeout(this.hintTimer);
                    this.hintTimer = null;
                }
                document.querySelectorAll('.answer-btn.hint').forEach(btn => {
                    btn.classList.remove('hint');
                });

                const userAnswer = parseInt(answer);
                const correctAnswer = parseInt(this.currentAnswer);
                const isCorrect = userAnswer === correctAnswer;

                button.classList.add(isCorrect ? 'correct' : 'incorrect');

                const allButtons = this.answerOptions.querySelectorAll('.answer-btn');
                allButtons.forEach(btn => btn.style.pointerEvents = 'none');

                this.handleAnswer(isCorrect);
            }

            showFeedback(isCorrect) {
                this.feedbackOverlay.textContent = isCorrect ? '✓ Correct!' : '✗ Wrong!';
                this.feedbackOverlay.className = `feedback-overlay ${isCorrect ? 'correct' : 'incorrect'}`;

                this.feedbackOverlay.offsetHeight;

                setTimeout(() => {
                    this.feedbackOverlay.className = 'feedback-overlay';
                }, 600);
            }

            updateUI() {
                const accuracy = this.totalProblems > 0 ? Math.round((this.correctAnswers / this.totalProblems) * 100) : 100;
                this.accuracy.textContent = `${accuracy}%`;
                this.problemCounter.textContent = `${this.currentProblem}`;

                const progress = Math.min((this.currentProblem / 60) * 100, 100);
                this.progressFill.style.width = `${progress}%`;
            }

            updateTimer() {
                this.timer.textContent = this.timeLeft;

                if (this.timeLeft <= 10) {
                    this.timer.className = 'timer danger';
                } else if (this.timeLeft <= 20) {
                    this.timer.className = 'timer warning';
                } else {
                    this.timer.className = 'timer';
                }

                if (this.timeLeft <= 0) {
                    this.endGame();
                } else {
                    this.timeLeft--;
                }
            }

            calculateBrainAge() {
                const accuracy = this.totalProblems > 0 ? (this.correctAnswers / this.totalProblems) : 0;
                const avgResponseTime = this.responseTimes.length > 0 ?
                    this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length : 5000;

                const difficultyMultiplier = {
                    'easy': 1.2,
                    'medium': 1.0,
                    'hard': 0.8,
                    'expert': 0.6
                }[this.selectedDifficulty];

                let brainAge = 20;

                brainAge += (1 - accuracy) * 40;

                brainAge += Math.min((avgResponseTime / 1000) * 5, 30);

                brainAge *= difficultyMultiplier;

                brainAge -= Math.min(this.totalProblems * 0.2, 10);

                return Math.max(8, Math.min(80, Math.round(brainAge)));
            }

            startGame() {
                this.resetGame();
                this.gameActive = true;
                this.showScreen('game');

                if (this.audioContext && this.audioContext.state === 'suspended') {
                    this.audioContext.resume();
                }

                this.gameTimer = setInterval(() => this.updateTimer(), 1000);
                this.updateEquationDisplay();
                this.showProblem();

                if (this.keyboardMode) {
                    setTimeout(() => {
                        this.answerInput.focus();
                        this.answerInput.select();
                    }, 100);
                }
            }

            endGame() {
                this.gameActive = false;
                clearInterval(this.gameTimer);

                if (this.hintTimer) {
                    clearTimeout(this.hintTimer);
                    this.hintTimer = null;
                }

                const brainAge = this.calculateBrainAge();
                const accuracy = this.totalProblems > 0 ? Math.round((this.correctAnswers / this.totalProblems) * 100) : 0;
                const avgTime = this.responseTimes.length > 0 ?
                    (this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length / 1000).toFixed(1) : '0.0';

                const difficultyNames = {
                    'easy': 'Easy (2-5)',
                    'medium': 'Medium (2-9)',
                    'hard': 'Hard (2-12)',
                    'expert': 'Expert (2-15)'
                };

                let difficultyText;
                if (this.specificTable) {
                    difficultyText = `${this.specificTable} times table`;
                    if (!this.randomOrder) {
                        difficultyText += ' (sequential)';
                    }
                } else {
                    difficultyText = difficultyNames[this.selectedDifficulty];
                }

                document.getElementById('brainAge').textContent = `Brain Age: ${brainAge}`;
                document.getElementById('finalProblems').textContent = this.totalProblems;
                document.getElementById('finalAccuracy').textContent = `${accuracy}%`;
                document.getElementById('avgTime').textContent = `${avgTime}s`;
                document.getElementById('finalDifficulty').textContent = difficultyText;

                const name = (this.playerNameInput.value || '').trim();
                if (name) {
                    this.playerNameDisplay.textContent = name;
                    this.playerNameDisplay.style.display = '';
                    this.playerNameInput.style.display = 'none';
                } else {
                    this.playerNameDisplay.style.display = 'none';
                    this.playerNameInput.style.display = '';
                }
                document.getElementById('certAge').textContent = brainAge;
                document.getElementById('certProblems').textContent = this.totalProblems;
                document.getElementById('certAccuracy').textContent = `${accuracy}%`;
                document.getElementById('certAvg').textContent = `${avgTime}s`;
                document.getElementById('certLevel').textContent = difficultyText;
                try {
                    const dateStr = new Date().toLocaleDateString(undefined, {year: 'numeric', month: 'short', day: 'numeric'});
                    document.getElementById('certDate').textContent = dateStr;
                } catch {}

                this.showScreen('results');
            }

            printCertificate() {
                const cert = document.getElementById('certificate');
                if (!cert) return;
                const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Times Table Training Certificate</title>
  <style>
    * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    body { margin: 16mm; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    .certificate { ${'border: 6px double #2d3748; border-radius: 16px; padding: 30px;'} }
    @page { size: A4; margin: 12mm; }
  </style>
  <link rel="stylesheet" href="${location.origin + location.pathname.replace(/\/[^/]*$/, '/') + 'styles.css'}">
  <style>${document.querySelector('style')?.textContent || ''}</style>
  </head>
<body>
  ${cert.outerHTML}
  <script>window.onload = function(){ setTimeout(function(){ window.print(); }, 100); };<\/script>
</body>
</html>`;
                const w = window.open('', '_blank');
                if (!w) return;
                w.document.open();
                w.document.write(html);
                w.document.close();
            }

            shareScore() {
                const brainAge = document.getElementById('brainAge').textContent;
                const accuracy = document.getElementById('finalAccuracy').textContent;
                const problems = document.getElementById('finalProblems').textContent;

                const shareText = `✖️ I just completed Times Table Training!\n${brainAge}, solved ${problems} problems with ${accuracy} accuracy!\n\nTry it yourself: ${window.location.href}`;

                if (navigator.share) {
                    navigator.share({
                        title: 'Times Table Training Results',
                        text: shareText
                    });
                } else {
                    navigator.clipboard.writeText(shareText).then(() => {
                        alert('Score copied to clipboard!');
                    });
                }
            }

            showScreen(screen) {
                this.setupScreen.classList.add('hidden');
                this.gameScreen.classList.add('hidden');
                this.resultsScreen.classList.add('hidden');

                switch (screen) {
                    case 'setup':
                        this.setupScreen.classList.remove('hidden');
                        break;
                    case 'game':
                        this.gameScreen.classList.remove('hidden');
                        break;
                    case 'results':
                        this.resultsScreen.classList.remove('hidden');
                        break;
                }
            }

            showSetup() {
                this.resetGame();
                this.showScreen('setup');
            }
        }

        // Initialize the game
        new TimesTableTraining();

// Export init function if it exists
if (typeof window !== 'undefined') {
  // Initialization code runs automatically
}
