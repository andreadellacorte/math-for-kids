/**
 * brain-training game logic
 * Migrated from brain-training.html
 */

// @ts-nocheck
// Import utilities
import { setCookie, getCookie } from '../storage-utils';

// Declare globals that might be used
declare const window: any;
declare const document: any;

class BrainTraining {
    private setupScreen!: HTMLElement;
    private gameScreen!: HTMLElement;
    private resultsScreen!: HTMLElement;
    private difficultyButtons!: NodeListOf<Element>;
    private timeLimitSlider!: HTMLInputElement;
    private timeDisplay!: HTMLElement;
    private buttonModeRadio!: HTMLInputElement;
    private assistedModeRadio!: HTMLInputElement;
    private keyboardModeRadio!: HTMLInputElement;
    private startBtn!: HTMLButtonElement;
    private timer!: HTMLElement;
    private problemCounter!: HTMLElement;
    private accuracy!: HTMLElement;
    private progressFill!: HTMLElement;
    private equationsContainer!: HTMLElement;
    private equationItems!: (HTMLElement | null)[];
    private keyboardInput!: HTMLElement;
    private answerInput!: HTMLInputElement;
    private submitBtn!: HTMLButtonElement;
    private answerOptions!: HTMLElement;
    private playAgainBtn!: HTMLButtonElement;
    private shareSocreBtn!: HTMLButtonElement;
    private feedbackOverlay!: HTMLElement;
    private playerNameInput!: HTMLInputElement;
    private playerNameDisplay!: HTMLElement;
    private printCertificateBtn!: HTMLButtonElement;
    private audioContext: AudioContext | null = null;
    private timeLeft: number = 60;
    private currentProblem: number = 0;
    private correctAnswers: number = 0;
    private totalProblems: number = 0;
    private startTime: number | null = null;
    private problemStartTime: number | null = null;
    private responseTimes: number[] = [];
    private gameActive: boolean = false;
    private currentAnswer: number | null = null;
    private hintTimer: number | null = null;
    private equationQueue: any[] = [];
    private currentEquation: any = null;
    private selectedDifficulty: string = 'medium';
    private inputMode: string = 'button';
    private gameTimer: number | null = null;
    private keyboardMode: boolean = false;
    private assistedMode: boolean = false;
    private correctAnswerButton: HTMLButtonElement | null = null;
    private completedProblems: any = {};
    private currentEquationIndex: number = 0;

    constructor() {
        this.setupElements();
        this.resetGame();
        this.bindEvents();
    }

    setupElements(): void {
                this.setupScreen = document.getElementById('setupScreen');
                this.gameScreen = document.getElementById('gameScreen');
                this.resultsScreen = document.getElementById('resultsScreen');
                this.difficultyButtons = document.querySelectorAll('.difficulty-btn');
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
                // Certificate elements
                this.playerNameInput = document.getElementById('playerNameInput');
                this.playerNameDisplay = document.getElementById('playerNameDisplay');
                this.printCertificateBtn = document.getElementById('printCertificateBtn');
                this.setupAudio();
            }

    setupAudio(): void {
                // Create audio context for sound effects
                try {
                    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
                } catch (e) {
                    this.audioContext = null;
                }
            }

    playSound(frequency: number, duration: number, volume: number = 0.1): void {
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

    resetGame(): void {
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

                // Initialize equation queue
                this.equationQueue = [];
                this.currentEquationIndex = 0; // Start at first equation
                this.completedProblems = [];
                this.keyboardMode = false;

                // Pre-generate initial equations
                this.initializeEquationQueue();
                this.assistedMode = this.assistedModeRadio.checked;
                this.keyboardMode = this.keyboardModeRadio.checked;
                this.selectedDifficulty = document.querySelector('.difficulty-btn.selected')?.dataset.difficulty || 'easy';

                // Load settings from cookies
                this.loadSettings();
            }

    setCookie(name: string, value: string, days: number = 365): void {
        const d = new Date();
        d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
        document.cookie = `${name}=${encodeURIComponent(value)};expires=${d.toUTCString()};path=/;SameSite=Lax`;
    }

    getCookie(name: string): string | null {
                const match = document.cookie.split(';').map(s => s.trim()).find(s => s.startsWith(name + '='));
                return match ? decodeURIComponent(match.split('=')[1]) : null;
            }

    loadSettings(): void {
                // Load input mode
                const inputMode = this.getCookie('inputMode');
                if (inputMode !== null) {
                    // Uncheck all radio buttons first
                    this.buttonModeRadio.checked = false;
                    this.assistedModeRadio.checked = false;
                    this.keyboardModeRadio.checked = false;

                    // Check the correct radio button
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

                // Load time limit
                const timeLimit = this.getCookie('timeLimit');
                if (timeLimit !== null) {
                    this.timeLimitSlider.value = timeLimit;
                    this.timeDisplay.textContent = `${timeLimit}s`;
                }

                // Load difficulty
                const difficulty = this.getCookie('difficulty');
                if (difficulty !== null) {
                    // Remove selected class from all buttons
                    this.difficultyButtons.forEach(btn => btn.classList.remove('selected'));
                    // Add selected class to the saved difficulty
                    const savedBtn = document.querySelector(`[data-difficulty="${difficulty}"]`);
                    if (savedBtn) {
                        savedBtn.classList.add('selected');
                        this.selectedDifficulty = difficulty;
                    }
                }

                // Initialize input mode display
                this.updateInputModeDisplay();

                // Load player name (shared across games)
                const savedName = this.getCookie('playerName');
                if (savedName) {
                    this.playerNameInput.value = savedName;
                }
            }

    saveSettings(): void {
                // Save input mode based on which radio button is checked
                let inputMode = 'button';
                if (this.assistedModeRadio.checked) {
                    inputMode = 'assisted';
                } else if (this.keyboardModeRadio.checked) {
                    inputMode = 'keyboard';
                }
                this.setCookie('inputMode', inputMode);
                this.setCookie('timeLimit', this.timeLimitSlider.value);
                this.setCookie('difficulty', this.selectedDifficulty);
                // Save player name if present
                const name = (this.playerNameInput?.value || '').trim();
                if (name) this.setCookie('playerName', name);
            }

            initializeEquationQueue() {
                // Generate initial 5 equations
                this.equationQueue = [];
                for (let i = 0; i < 5; i++) {
                    this.equationQueue.push(this.generateProblem());
                }

                // Generate additional equations ahead of time
                for (let i = 0; i < 10; i++) {
                    this.equationQueue.push(this.generateProblem());
                }

                this.updateEquationDisplay();
            }

    updateEquationDisplay(): void {
                for (let i = 0; i < 5; i++) {
                    const equationItem = this.equationItems[i];
                    const equationText = equationItem!.querySelector('.equation-text');
                    const equationStatus = equationItem!.querySelector('.equation-status');

                    // Remove all state classes
                    equationItem!.classList.remove('completed', 'current', 'future');

                    // Determine which equation to show in each slot
                    let equationIndex;

                    if (this.currentProblem < 3) {
                        // First 3 problems: show equations 0-4
                        equationIndex = i;
                    } else {
                        // After 3rd problem: scrolling window
                        equationIndex = (this.currentProblem - 2) + i;
                    }

                    const equation = this.equationQueue[equationIndex];

                    if (equationIndex < this.currentProblem) {
                        // Completed equation
                        equationItem!.classList.add('completed');
                        if (equation) {
                            equationText!.textContent = `${equation.num1} ${equation.operation} ${equation.num2} = ${equation.answer}`;
                            // Check if this was answered correctly
                            const wasCorrect = this.completedProblems[equationIndex]?.correct ?? true;
                            equationStatus!.textContent = wasCorrect ? '✓' : '✗';
                            (equationStatus as HTMLElement).style.color = wasCorrect ? '#28a745' : '#dc3545';
                        }
                    } else if (equationIndex === this.currentProblem) {
                        // Current equation
                        equationItem!.classList.add('current');
                        if (equation) {
                            equationText!.textContent = `${equation.num1} ${equation.operation} ${equation.num2} = ?`;
                            equationStatus!.textContent = '❯';
                        } else {
                            equationText!.textContent = 'Get Ready...';
                            equationStatus!.textContent = '❯';
                        }
                    } else {
                        // Future equation
                        equationItem!.classList.add('future');
                        if (equation) {
                            equationText!.textContent = `${equation.num1} ${equation.operation} ${equation.num2} = ?`;
                        } else {
                            equationText!.textContent = 'Loading...';
                        }
                        equationStatus!.textContent = '⋯';
                    }
                }
            }

    moveToNextEquation(wasCorrect: boolean): void {
                // Store the completed problem result
                this.completedProblems[this.currentProblem] = {
                    correct: wasCorrect
                };

                // Move to next problem
                this.currentProblem++;

                // Generate new equations if needed
                while (this.equationQueue.length <= this.currentProblem + 5) {
                    this.equationQueue.push(this.generateProblem());
                }

                // Update current answer immediately to the next problem
                const nextProblem = this.equationQueue[this.currentProblem];
                if (nextProblem) {
                    this.currentAnswer = nextProblem.answer;
                }

                // Clear input field and refocus for keyboard mode
                if (this.keyboardMode) {
                    this.answerInput.value = '';
                    setTimeout(() => {
                        this.answerInput.focus();
                        this.answerInput.select();
                    }, 100);
                }

                // Add smooth scrolling animation
                this.animateEquationScroll();
            }

            animateEquationScroll() {
                // Add gentle transition animation
                this.equationsContainer.classList.add('transitioning');

                // Update content after brief animation
                setTimeout(() => {
                    this.updateEquationDisplay();
                    this.equationsContainer.classList.remove('transitioning');
                }, 200);
            }

    updateInputModeDisplay(): void {
                if (this.keyboardMode) {
                    this.answerOptions.style.display = 'none';
                    this.keyboardInput.style.display = 'flex';
                } else {
                    this.answerOptions.style.display = 'grid';
                    this.keyboardInput.style.display = 'none';
                }
            }

            toggleInputMode() {
                this.keyboardMode = !this.keyboardMode;

                if (this.keyboardMode) {
                    this.answerOptions.style.display = 'none';
                    this.keyboardInput.style.display = 'flex';
                    this.toggleInputBtn.textContent = 'Use Buttons';
                    this.answerInput.focus();
                } else {
                    this.answerOptions.style.display = 'grid';
                    this.keyboardInput.style.display = 'none';
                    this.toggleInputBtn.textContent = 'Use Keyboard';
                }

                // Clear input field when switching modes
                this.answerInput.value = '';
            }

    submitKeyboardAnswer(): void {
                if (!this.gameActive || !this.keyboardMode) return;

                const userAnswer = parseInt(this.answerInput.value);
                if (isNaN(userAnswer)) {
                    this.answerInput.focus();
                    return;
                }

                // Ensure both values are numbers for comparison
                const correctAnswer = parseInt(this.currentAnswer);
                const isCorrect = userAnswer === correctAnswer;

                // Debug logging
                console.log('Keyboard - User answer:', userAnswer, typeof userAnswer, 'Correct answer:', correctAnswer, typeof correctAnswer, 'Original this.currentAnswer:', this.currentAnswer, typeof this.currentAnswer, 'Match:', isCorrect);

                this.handleAnswer(isCorrect);

                // Clear input for next problem
                this.answerInput.value = '';
                this.answerInput.focus();
            }

    handleAnswer(isCorrect: boolean): void {
                if (!this.gameActive) return;

                // Record response time
                const responseTime = Date.now() - this.problemStartTime;
                this.responseTimes.push(responseTime);

                // Show feedback
                this.showFeedback(isCorrect);

                // Play sound
                if (isCorrect) {
                    this.playSound(523, 0.2); // C5
                } else {
                    // Error sound sequence
                    setTimeout(() => this.playSound(250, 0.1), 100);
                    setTimeout(() => this.playSound(200, 0.2), 200);
                }

                if (isCorrect) {
                    this.correctAnswers++;
                }

                this.totalProblems++;

                // Move to next equation in the display
                this.moveToNextEquation(isCorrect);

                this.updateUI();

                // Move to next problem after delay
                setTimeout(() => {
                    if (this.timeLeft > 0 && this.gameActive) {
                        this.showProblem();
                    }
                }, 800);
            }

    bindEvents(): void {
                this.startBtn.addEventListener('click', () => this.startGame());
                this.playAgainBtn.addEventListener('click', () => this.showSetup());
                this.shareSocreBtn.addEventListener('click', () => this.shareScore());
                this.submitBtn.addEventListener('click', () => this.submitKeyboardAnswer());
                this.printCertificateBtn.addEventListener('click', () => this.printCertificate());
                this.playerNameInput.addEventListener('input', () => {
                    // Persist live as kids type
                    this.setCookie('playerName', this.playerNameInput.value);
                });

                // Enter key handling for keyboard input
                this.answerInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        this.submitKeyboardAnswer();
                    }
                });

                // Arrow key controls for button mode
                document.addEventListener('keydown', (e) => {
                    if (!this.gameActive || this.keyboardMode) return;

                    const buttons = this.answerOptions.querySelectorAll('.answer-btn');
                    if (buttons.length !== 4) return;

                    let targetButton = null;

                    switch(e.key) {
                        case 'ArrowLeft':
                            targetButton = buttons[0];
                            e.preventDefault();
                            break;
                        case 'ArrowUp':
                            targetButton = buttons[1];
                            e.preventDefault();
                            break;
                        case 'ArrowDown':
                            targetButton = buttons[2];
                            e.preventDefault();
                            break;
                        case 'ArrowRight':
                            targetButton = buttons[3];
                            e.preventDefault();
                            break;
                    }

                    if (targetButton && targetButton.style.pointerEvents !== 'none') {
                        const answer = targetButton.textContent;
                        this.selectAnswer(answer, targetButton);
                    }
                });

                // Difficulty button selection
                this.difficultyButtons.forEach(btn => {
                    btn.addEventListener('click', () => {
                        this.difficultyButtons.forEach(b => b.classList.remove('selected'));
                        btn.classList.add('selected');
                        // Update the selectedDifficulty immediately
                        this.selectedDifficulty = btn.dataset.difficulty;
                        this.saveSettings();
                    });
                });

                // Settings checkboxes
                // Radio button event handlers
                [this.buttonModeRadio, this.assistedModeRadio, this.keyboardModeRadio].forEach(radio => {
                    radio.addEventListener('change', () => {
                        if (radio.checked) {
                            // Update mode variables
                            this.assistedMode = this.assistedModeRadio.checked;
                            this.keyboardMode = this.keyboardModeRadio.checked;

                            // Update input display
                            this.updateInputModeDisplay();

                            // Focus input if switching to keyboard mode
                            if (this.keyboardMode && this.gameActive) {
                                setTimeout(() => this.answerInput.focus(), 100);
                            }

                            // Save settings
                            this.saveSettings();
                        }
                    });
                });


                // Time slider update
                this.timeLimitSlider.addEventListener('input', () => {
                    this.timeDisplay.textContent = `${this.timeLimitSlider.value}s`;
                    this.saveSettings();
                });
            }

    generateProblem(): any {
                const difficulty = this.selectedDifficulty;
                let num1!, num2!, operation, answer;

                switch (difficulty) {
                    case 'easy':
                        num1 = Math.floor(Math.random() * 9) + 1;  // 1-9
                        num2 = Math.floor(Math.random() * 9) + 1;  // 1-9
                        operation = Math.random() < 0.8 ? '+' : '-';  // Mostly addition
                        // For subtraction, ensure first number is larger to avoid negative results
                        if (operation === '-' && num1 < num2) {
                            [num1, num2] = [num2, num1];
                        }
                        break;
                    case 'medium':
                        num1 = Math.floor(Math.random() * 90) + 10;
                        num2 = Math.floor(Math.random() * 9) + 1;
                        operation = Math.random() < 0.6 ? '+' : '-';
                        break;
                    case 'hard':
                        num1 = Math.floor(Math.random() * 90) + 10;
                        num2 = Math.floor(Math.random() * 90) + 10;
                        operation = Math.random() < 0.5 ? '+' : '-';
                        break;
                    case 'expert':
                        num1 = Math.floor(Math.random() * 900) + 100;
                        num2 = Math.floor(Math.random() * 90) + 10;
                        const ops = ['+', '-', '×', '÷'];
                        operation = ops[Math.floor(Math.random() * ops.length)];
                        break;
                }

                // Calculate answer and ensure positive results for subtraction
                switch (operation) {
                    case '+':
                        answer = num1 + num2;
                        break;
                    case '-':
                        // For non-easy modes, ensure first number is larger
                        if (difficulty !== 'easy' && num1 < num2) {
                            [num1, num2] = [num2, num1];
                        }
                        answer = num1 - num2;
                        break;
                    case '×':
                        // For multiplication, use smaller numbers
                        num1 = Math.floor(Math.random() * 12) + 1;
                        num2 = Math.floor(Math.random() * 12) + 1;
                        answer = num1 * num2;
                        break;
                    case '÷':
                        // For division, ensure whole number results
                        answer = Math.floor(Math.random() * 12) + 1;
                        num2 = Math.floor(Math.random() * 9) + 2;
                        num1 = answer * num2;
                        break;
                }

                return { num1!, num2!, operation, answer };
            }

    showProblem(): void {
                const problem = this.equationQueue[this.currentProblem];
                if (!problem) return;

                this.currentAnswer = problem.answer;

                // Update input mode display
                this.updateInputModeDisplay();

                // Focus input field if in keyboard mode
                if (this.keyboardMode) {
                    setTimeout(() => this.answerInput.focus(), 100);
                }

                // Clear any existing hint timer
                if (this.hintTimer) {
                    clearTimeout(this.hintTimer);
                    this.hintTimer = null;
                }

                // Generate multiple choice options
                const options = this.generateOptions(problem.answer);
                this.answerOptions.innerHTML = '';

                // Arrow key labels for each button position
                const arrowLabels = ['←', '↑', '↓', '→'];

                options.forEach((option, index) => {
                    const button = document.createElement('button');
                    button.className = 'answer-btn';

                    // Create container for answer and arrow hint
                    const arrowHint = document.createElement('span');
                    arrowHint.className = 'arrow-hint';
                    arrowHint.textContent = arrowLabels[index];
                    arrowHint.style.cssText = 'position: absolute; top: 4px; right: 8px; opacity: 0.4; font-size: 0.8em;';

                    button.textContent = option;
                    button.style.position = 'relative';
                    button.appendChild(arrowHint);

                    button.addEventListener('click', () => this.selectAnswer(option, button));

                    // Store reference to correct answer button for assisted mode
                    if (option === this.currentAnswer) {
                        this.correctAnswerButton = button;
                    }

                    this.answerOptions.appendChild(button);
                });

                this.problemStartTime = Date.now();

                // Start hint timer for assisted mode
                if (this.assistedMode) {
                    this.hintTimer = setTimeout(() => {
                        if (this.correctAnswerButton && this.gameActive) {
                            this.correctAnswerButton.classList.add('hint');
                        }
                    }, 3000); // Start hinting after 3 seconds
                }
            }

    generateOptions(correctAnswer: number): number[] {
                const options = [correctAnswer];
                const range = Math.max(10, Math.floor(correctAnswer * 0.5));

                while (options.length < 4) {
                    let option;
                    if (Math.random() < 0.5) {
                        // Generate nearby wrong answers
                        option = correctAnswer + Math.floor(Math.random() * range) - Math.floor(range / 2);
                    } else {
                        // Generate random wrong answers
                        option = Math.floor(Math.random() * (correctAnswer * 2)) + 1;
                    }

                    if (option > 0 && !options.includes(option)) {
                        options.push(option);
                    }
                }

                // Shuffle options
                return options.sort(() => Math.random() - 0.5);
            }

    selectAnswer(answer: any, button: any): void {
                if (!this.gameActive) return;

                // Clear hint timer and remove hint animation
                if (this.hintTimer) {
                    clearTimeout(this.hintTimer);
                    this.hintTimer = null;
                }
                document.querySelectorAll('.answer-btn.hint').forEach(btn => {
                    btn.classList.remove('hint');
                });

                // Ensure both values are numbers for comparison
                const userAnswer = parseInt(answer);
                const correctAnswer = parseInt(this.currentAnswer);
                const isCorrect = userAnswer === correctAnswer;

                // Debug logging
                console.log('Button - User answer:', userAnswer, typeof userAnswer, 'Correct answer:', correctAnswer, typeof correctAnswer, 'Original this.currentAnswer:', this.currentAnswer, typeof this.currentAnswer, 'Match:', isCorrect);

                // Visual feedback on button
                button.classList.add(isCorrect ? 'correct' : 'incorrect');

                // Disable all buttons temporarily
                const allButtons = this.answerOptions.querySelectorAll('.answer-btn');
                allButtons.forEach((btn: Element) => (btn as HTMLElement).style.pointerEvents = 'none');

                this.handleAnswer(isCorrect);
            }

    showFeedback(isCorrect: boolean): void {
                this.feedbackOverlay.textContent = isCorrect ? '✓ Correct!' : '✗ Wrong!';
                this.feedbackOverlay.className = `feedback-overlay ${isCorrect ? 'correct' : 'incorrect'}`;

                // Trigger animation by forcing reflow
                this.feedbackOverlay.offsetHeight;

                setTimeout(() => {
                    this.feedbackOverlay.className = 'feedback-overlay';
                }, 600);
            }


            skipProblem() {
                if (!this.gameActive) return;
                this.totalProblems++;

                // Move to next equation in the display
                this.moveToNextEquation(false);

                this.responseTimes.push(10000); // Penalty time
                this.updateUI();

                if (this.timeLeft > 0) {
                    this.showProblem();
                }
            }

    updateUI(): void {
                const accuracy = this.totalProblems > 0 ? Math.round((this.correctAnswers / this.totalProblems) * 100) : 100;
                this.accuracy.textContent = `${accuracy}%`;
                this.problemCounter.textContent = `${this.currentProblem}`;

                const progress = Math.min((this.currentProblem / 60) * 100, 100);
                this.progressFill.style.width = `${progress}%`;
            }

    updateTimer(): void {
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

    calculateBrainAge(): number {
                const accuracy = this.totalProblems > 0 ? (this.correctAnswers / this.totalProblems) : 0;
                const avgResponseTime = this.responseTimes.length > 0 ?
                    this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length : 5000;

                const difficultyMultiplier = {
                    'easy': 1.2,
                    'medium': 1.0,
                    'hard': 0.8,
                    'expert': 0.6
                }[this.selectedDifficulty];

                // Base age calculation (lower is better)
                let brainAge = 20;

                // Accuracy factor (0-100%)
                brainAge += (1 - accuracy) * 40;

                // Speed factor (response time in seconds)
                brainAge += Math.min((avgResponseTime / 1000) * 5, 30);

                // Difficulty bonus
                brainAge *= difficultyMultiplier;

                // Problems solved bonus
                brainAge -= Math.min(this.totalProblems * 0.2, 10);

                return Math.max(8, Math.min(80, Math.round(brainAge)));
            }

    startGame(): void {
                this.resetGame();
                this.gameActive = true;
                this.showScreen('game');

                // Enable audio context on user interaction
                if (this.audioContext && this.audioContext.state === 'suspended') {
                    this.audioContext.resume();
                }

                // Start the game immediately
                this.gameTimer = setInterval(() => this.updateTimer(), 1000);
                this.updateEquationDisplay();
                this.showProblem();

                // Focus input if in keyboard mode
                if (this.keyboardMode) {
                    setTimeout(() => {
                        this.answerInput.focus();
                        this.answerInput.select();
                    }, 100);
                }
            }

    endGame(): void {
                this.gameActive = false;
                clearInterval(this.gameTimer);

                // Clear hint timer
                if (this.hintTimer) {
                    clearTimeout(this.hintTimer);
                    this.hintTimer = null;
                }

                // Calculate results
                const brainAge = this.calculateBrainAge();
                const accuracy = this.totalProblems > 0 ? Math.round((this.correctAnswers / this.totalProblems) * 100) : 0;
                const avgTime = this.responseTimes.length > 0 ?
                    (this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length / 1000).toFixed(1) : '0.0';

                // Get difficulty name
                const difficultyNames = {
                    'easy': 'Easy',
                    'medium': 'Medium',
                    'hard': 'Hard',
                    'expert': 'Expert'
                };

                // Show results
                document.getElementById('brainAge').textContent = `Brain Age: ${brainAge}`;
                document.getElementById('finalProblems').textContent = this.totalProblems;
                document.getElementById('finalAccuracy').textContent = `${accuracy}%`;
                document.getElementById('avgTime').textContent = `${avgTime}s`;
                document.getElementById('finalDifficulty').textContent = difficultyNames[this.selectedDifficulty];

                // Populate certificate
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
                document.getElementById('certLevel').textContent = difficultyNames[this.selectedDifficulty];
                try {
                    const dateStr = new Date().toLocaleDateString(undefined, {year: 'numeric', month: 'short', day: 'numeric'});
                    document.getElementById('certDate').textContent = dateStr;
                } catch {}

                this.showScreen('results');
            }

    printCertificate(): void {
                // Open a clean print view of the certificate only
                const cert = document.getElementById('certificate');
                if (!cert) return;
                const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Brain Training Certificate</title>
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

    shareScore(): void {
                const brainAge = document.getElementById('brainAge').textContent;
                const accuracy = document.getElementById('finalAccuracy').textContent;
                const problems = document.getElementById('finalProblems').textContent;

                const shareText = `🧠 I just completed Brain Training Speed Math!\n${brainAge}, solved ${problems} problems with ${accuracy} accuracy!\n\nTry it yourself: ${window.location.href}`;

                if (navigator.share) {
                    navigator.share({
                        title: 'Brain Training Speed Math Results',
                        text: shareText
                    });
                } else {
                    navigator.clipboard.writeText(shareText).then(() => {
                        alert('Score copied to clipboard!');
                    });
                }
            }

    showScreen(screen: string): void {
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

    showSetup(): void {
                this.resetGame();
                this.showScreen('setup');
            }
        }

        // Initialize the game
        new BrainTraining();

// Export init function if it exists
if (typeof window !== 'undefined') {
  // Initialization code runs automatically
}
