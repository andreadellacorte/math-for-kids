/**
 * music-theory game logic
 * Migrated from music-theory.html
 */

// Import utilities
import { setCookie, getCookie } from '../storage-utils';

// Declare globals that might be used
declare const window: any;
declare const document: any;

interface NotePosition {
    note: string;
    y: number;
    line: boolean;
    octave: number;
}

interface IntervalData {
    name: string;
    semitones: number;
    baseNote?: string;
}

interface ChordData {
    name: string;
    notes: number[];
    baseNote?: string;
}

interface RhythmPattern {
    name: string;
    rhythm: number[];
    notes: (string | null)[];
}

class MusicTraining {
    private setupScreen!: HTMLElement;
    private gameScreen!: HTMLElement;
    private resultsScreen!: HTMLElement;
    private exerciseButtons!: NodeListOf<Element>;
    private timeLimitSlider!: HTMLInputElement;
    private timeDisplay!: HTMLElement;
    private assistedModeCheckbox!: HTMLInputElement;
    private startBtn!: HTMLButtonElement;
    private timer!: HTMLElement;
    private problemCounter!: HTMLElement;
    private accuracy!: HTMLElement;
    private progressFill!: HTMLElement;
    private musicProblem!: HTMLElement;
    private answerOptions!: HTMLElement;
    private skipBtn!: HTMLButtonElement;
    private playNoteBtn!: HTMLButtonElement;
    private playAgainBtn!: HTMLButtonElement;
    private shareScoreBtn!: HTMLButtonElement;
    private feedbackOverlay!: HTMLElement;

    private audioContext: AudioContext | null;
    private timeLeft: number;
    private currentProblem: number;
    private correctAnswers: number;
    private totalProblems: number;
    private startTime: number | null;
    private problemStartTime: number | null;
    private responseTimes: number[];
    private gameActive: boolean;
    private currentAnswer: string | null;
    private currentNote: string | null;
    private hintTimer: number | null;
    private assistedMode: boolean;
    private selectedExercise: string;
    private correctAnswerButton: HTMLButtonElement | null;
    private currentInterval: IntervalData | null;
    private intervalNotes: number[] | null;
    private currentChord: ChordData | null;
    private chordNotes: number[] | null;
    private currentPattern: RhythmPattern | null;
    private rhythmPattern: RhythmPattern | null;
    private gameTimer: number | null;

    constructor() {
        this.audioContext = null;
        this.timeLeft = 60;
        this.currentProblem = 0;
        this.correctAnswers = 0;
        this.totalProblems = 0;
        this.startTime = null;
        this.problemStartTime = null;
        this.responseTimes = [];
        this.gameActive = false;
        this.currentAnswer = null;
        this.currentNote = null;
        this.hintTimer = null;
        this.assistedMode = false;
        this.selectedExercise = 'note-recognition';
        this.correctAnswerButton = null;
        this.currentInterval = null;
        this.intervalNotes = null;
        this.currentChord = null;
        this.chordNotes = null;
        this.currentPattern = null;
        this.rhythmPattern = null;
        this.gameTimer = null;

        this.setupElements();
        this.resetGame();
        this.bindEvents();
        this.setupAudio();
    }

    setupElements(): void {
        this.setupScreen = document.getElementById('setupScreen')!;
        this.gameScreen = document.getElementById('gameScreen')!;
        this.resultsScreen = document.getElementById('resultsScreen')!;
        this.exerciseButtons = document.querySelectorAll('.exercise-btn');
        this.timeLimitSlider = document.getElementById('timeLimit') as HTMLInputElement;
        this.timeDisplay = document.getElementById('timeDisplay')!;
        this.assistedModeCheckbox = document.getElementById('assistedMode') as HTMLInputElement;
        this.startBtn = document.getElementById('startBtn') as HTMLButtonElement;
        this.timer = document.getElementById('timer')!;
        this.problemCounter = document.getElementById('problemCounter')!;
        this.accuracy = document.getElementById('accuracy')!;
        this.progressFill = document.getElementById('progressFill')!;
        this.musicProblem = document.getElementById('musicProblem')!;
        this.answerOptions = document.getElementById('answerOptions')!;
        this.skipBtn = document.getElementById('skipBtn') as HTMLButtonElement;
        this.playNoteBtn = document.getElementById('playNoteBtn') as HTMLButtonElement;
        this.playAgainBtn = document.getElementById('playAgainBtn') as HTMLButtonElement;
        this.shareScoreBtn = document.getElementById('shareScoreBtn') as HTMLButtonElement;
        this.feedbackOverlay = document.getElementById('feedbackOverlay')!;
    }

    setupAudio(): void {
        // Create audio context for sound effects and note playback
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
        this.currentNote = null;
        this.hintTimer = null;
        this.assistedMode = this.assistedModeCheckbox.checked;
        const selectedBtn = document.querySelector('.exercise-btn.selected') as HTMLElement;
        this.selectedExercise = selectedBtn?.dataset.exercise || 'note-recognition';
    }

    bindEvents(): void {
        this.startBtn.addEventListener('click', () => this.startGame());
        this.playAgainBtn.addEventListener('click', () => this.showSetup());
        this.skipBtn.addEventListener('click', () => this.skipProblem());
        this.playNoteBtn.addEventListener('click', () => this.playCurrentExercise());
        this.shareScoreBtn.addEventListener('click', () => this.shareScore());

        // Exercise button selection
        this.exerciseButtons.forEach((btn: Element) => {
            btn.addEventListener('click', () => {
                this.exerciseButtons.forEach((b: Element) => b.classList.remove('selected'));
                btn.classList.add('selected');
            });
        });

        // Time slider update
        this.timeLimitSlider.addEventListener('input', () => {
            this.timeDisplay.textContent = `${this.timeLimitSlider.value}s`;
        });
    }

    getNoteFrequency(note: string): number {
        const frequencies: { [key: string]: number } = {
            'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23,
            'G4': 392.00, 'A4': 440.00, 'B4': 493.88,
            'C5': 523.25, 'D5': 587.33, 'E5': 659.25, 'F5': 698.46,
            'G5': 783.99, 'A5': 880.00, 'B5': 987.77
        };
        return frequencies[note] || 440;
    }

    generateNoteRecognitionProblem(): NotePosition {
                // Treble clef note positions (from top to bottom) - fine-tuned for proper centering
                const positions = [
                    { note: 'G', y: -22.5, line: false, octave: 5 },  // Above staff
                    { note: 'F', y: -10, line: true, octave: 5 },     // Top line (5th line)
                    { note: 'E', y: 2.5, line: false, octave: 5 },    // Space below 5th line
                    { note: 'D', y: 15, line: true, octave: 5 },      // 4th line
                    { note: 'C', y: 27.5, line: false, octave: 5 },   // Space below 4th line
                    { note: 'B', y: 40, line: true, octave: 4 },      // 3rd line (middle)
                    { note: 'A', y: 52.5, line: false, octave: 4 },   // Space below 3rd line
                    { note: 'G', y: 65, line: true, octave: 4 },      // 2nd line
                    { note: 'F', y: 77.5, line: false, octave: 4 },   // Space below 2nd line
                    { note: 'E', y: 90, line: true, octave: 4 },      // 1st line (bottom)
                    { note: 'D', y: 102.5, line: false, octave: 4 }   // Below staff
                ];

                const position = positions[Math.floor(Math.random() * positions.length)];
                this.currentNote = position.note + position.octave;
                this.currentAnswer = position.note;

                return position;
            }

    generateIntervalProblem(): IntervalData {
                // Random starting notes for variety
                const baseNotes = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'];
                const randomBase = baseNotes[Math.floor(Math.random() * baseNotes.length)];

                // Simple intervals for beginners
                const intervals = [
                    { name: 'Same Note', semitones: 0 },
                    { name: 'Next Door Up', semitones: 2 }, // Major 2nd
                    { name: 'Skip One Up', semitones: 4 },  // Major 3rd
                    { name: 'Far Apart', semitones: 7 }     // Perfect 5th
                ];

                const interval = intervals[Math.floor(Math.random() * intervals.length)];
                this.currentInterval = { ...interval, baseNote: randomBase };
                this.currentAnswer = interval.name;

                // Set up the two notes for playback
                const baseFreq = this.getNoteFrequency(randomBase);
                const secondFreq = baseFreq * Math.pow(2, interval.semitones / 12);
                this.intervalNotes = [baseFreq, secondFreq];

                return this.currentInterval;
            }

    generateChordProblem(): ChordData {
                // Random starting notes for variety
                const baseNotes = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4'];
                const randomBase = baseNotes[Math.floor(Math.random() * baseNotes.length)];

                // Simple chords for beginners
                const chords = [
                    { name: 'Happy Sound', notes: [0, 4, 7] },    // Major
                    { name: 'Sad Sound', notes: [0, 3, 7] },     // Minor
                ];

                const chord = chords[Math.floor(Math.random() * chords.length)];
                this.currentChord = { ...chord, baseNote: randomBase };
                this.currentAnswer = chord.name;

                // Set up chord notes for playback
                const baseFreq = this.getNoteFrequency(randomBase);
                this.chordNotes = chord.notes.map(semitone =>
                    baseFreq * Math.pow(2, semitone / 12)
                );

                return this.currentChord;
            }

    generateScaleProblem(): RhythmPattern {
                // Random notes and instruments for variety
                const notes = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'];
                const randomNote = notes[Math.floor(Math.random() * notes.length)];

                // Different rhythm patterns with varying notes
                const patterns = [
                    {
                        name: 'Slow Beat',
                        rhythm: [500, 500, 500, 500],
                        notes: [randomNote, randomNote, randomNote, randomNote]
                    },
                    {
                        name: 'Fast Beat',
                        rhythm: [250, 250, 250, 250],
                        notes: [randomNote, randomNote, randomNote, randomNote]
                    },
                    {
                        name: 'Long-Short',
                        rhythm: [750, 250, 750, 250],
                        notes: [randomNote, randomNote, randomNote, randomNote]
                    },
                    {
                        name: 'Skip Beat',
                        rhythm: [500, 0, 500, 500],
                        notes: [randomNote, null, randomNote, randomNote]
                    },
                    {
                        name: 'Up and Down',
                        rhythm: [400, 400, 400, 400],
                        notes: this.generateMelodyPattern(randomNote)
                    },
                    {
                        name: 'Bouncy Beat',
                        rhythm: [300, 150, 300, 150, 300],
                        notes: this.generateBouncyPattern(randomNote)
                    }
                ];

                const pattern = patterns[Math.floor(Math.random() * patterns.length)];
                this.currentPattern = pattern;
                this.currentAnswer = pattern.name;

                // Set up rhythm for playback
                this.rhythmPattern = pattern;

                return pattern;
            }

    generateMelodyPattern(baseNote: string): (string | null)[] {
                const baseIndex = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'].indexOf(baseNote);
                const notes = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'];

                // Create a simple up-down melody
                return [
                    notes[baseIndex],
                    notes[Math.min(baseIndex + 1, notes.length - 1)],
                    notes[Math.min(baseIndex + 2, notes.length - 1)],
                    notes[baseIndex]
                ];
            }

    generateBouncyPattern(baseNote: string): (string | null)[] {
                const baseIndex = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'].indexOf(baseNote);
                const notes = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'];

                // Create a bouncy pattern
                return [
                    notes[baseIndex],
                    notes[Math.min(baseIndex + 2, notes.length - 1)],
                    notes[baseIndex],
                    notes[Math.min(baseIndex + 2, notes.length - 1)],
                    notes[baseIndex]
                ];
            }

    generateOptions(correctAnswer: string, type: string): string[] {
        let allOptions: string[] = [];

                switch (type) {
                    case 'note-recognition':
                        allOptions = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
                        break;
                    case 'interval-recognition':
                        allOptions = ['Same Note', 'Next Door Up', 'Skip One Up', 'Far Apart'];
                        break;
                    case 'chord-recognition':
                        allOptions = ['Happy Sound', 'Sad Sound'];
                        break;
                    case 'scale-patterns':
                        allOptions = ['Slow Beat', 'Fast Beat', 'Long-Short', 'Skip Beat', 'Up and Down', 'Bouncy Beat'];
                        break;
                }

                // Ensure correct answer is included
                const options = [correctAnswer];

                // Add random wrong answers
                while (options.length < 4 && options.length < allOptions.length) {
                    const option = allOptions[Math.floor(Math.random() * allOptions.length)];
                    if (!options.includes(option)) {
                        options.push(option);
                    }
                }

                // Shuffle options
                return options.sort(() => Math.random() - 0.5);
            }

    showProblem(): void {
        let problemData: NotePosition | IntervalData | ChordData | RhythmPattern;
        let problemHTML = '';

        switch (this.selectedExercise) {
            case 'note-recognition':
                problemData = this.generateNoteRecognitionProblem();
                problemHTML = this.createStaffHTML(problemData as NotePosition);
                break;
            case 'interval-recognition':
                problemData = this.generateIntervalProblem();
                problemHTML = `<div class="interval-display">Listen to the interval and identify it</div>`;
                break;
            case 'chord-recognition':
                problemData = this.generateChordProblem();
                problemHTML = `<div class="chord-display">Listen to the chord and identify its type</div>`;
                break;
            case 'scale-patterns':
                problemData = this.generateScaleProblem();
                problemHTML = `<div class="chord-display">Listen to the scale and identify its type</div>`;
                break;
        }

                this.musicProblem.innerHTML = problemHTML;

                // Clear any existing hint timer
                if (this.hintTimer) {
                    clearTimeout(this.hintTimer);
                    this.hintTimer = null;
                }

        // Generate multiple choice options
        const options = this.generateOptions(this.currentAnswer!, this.selectedExercise);
        this.answerOptions.innerHTML = '';

        options.forEach((option: string, index: number) => {
            const button = document.createElement('button');
            button.className = 'answer-btn';
            button.textContent = option;
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
            }, 3000) as unknown as number;
        }

                // Auto-play audio for all exercises
                setTimeout(() => this.playCurrentExercise(), 500);
            }

    createStaffHTML(noteData: NotePosition): string {
                const needsLedgerLine = noteData.y < 0 || noteData.y > 100;
                const ledgerLineHTML = needsLedgerLine ?
                    `<div class="staff-line" style="top: ${noteData.y}%; width: 60px; left: 135px;"></div>` : '';

                return `
                    <div class="staff">
                        <div class="staff-lines">
                            <div class="staff-line"></div>
                            <div class="staff-line"></div>
                            <div class="staff-line"></div>
                            <div class="staff-line"></div>
                            <div class="staff-line"></div>
                            ${ledgerLineHTML}
                        </div>
                        <div class="clef">𝄞</div>
                        <div class="note" style="top: ${noteData.y}%;">
                            <div class="note-stem"></div>
                        </div>
                    </div>
                    <p style="font-size: 1.2em; margin-top: 20px;">🎵 What letter name is this note?</p>
                `;
            }

    playCurrentNote(): void {
        if (!this.audioContext || !this.currentNote) return;

        // Enable audio context on user interaction
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }

        const frequency = this.getNoteFrequency(this.currentNote);
        this.playSound(frequency, 1, 0.3);
    }

    playCurrentExercise(): void {
        if (!this.audioContext) return;

        // Enable audio context on user interaction
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }

        switch (this.selectedExercise) {
            case 'note-recognition':
                this.playCurrentNote();
                break;
            case 'interval-recognition':
                this.playInterval();
                break;
            case 'chord-recognition':
                this.playChord();
                break;
            case 'scale-patterns':
                this.playRhythm();
                break;
        }
    }

    playInterval(): void {
        if (!this.intervalNotes) return;

        // Play first note
        this.playSound(this.intervalNotes[0], 0.8, 0.3);

        // Play second note after a short delay
        setTimeout(() => {
            this.playSound(this.intervalNotes![1], 0.8, 0.3);
        }, 900);
    }

    playChord(): void {
        if (!this.chordNotes) return;

        // Play all notes of the chord simultaneously
        this.chordNotes.forEach((frequency: number) => {
            this.playSound(frequency, 1.5, 0.2);
        });
    }

    playRhythm(): void {
        if (!this.rhythmPattern) return;

        let currentTime = 0;

        this.rhythmPattern.rhythm.forEach((duration: number, index: number) => {
            if (duration > 0 && this.rhythmPattern!.notes[index]) {
                const frequency = this.getNoteFrequency(this.rhythmPattern!.notes[index]!);
                setTimeout(() => {
                    this.playSound(frequency, duration / 1000 * 0.8, 0.3);
                }, currentTime);
            }
            currentTime += duration;
        });
    }

    selectAnswer(answer: string, button: HTMLButtonElement): void {
                if (!this.gameActive) return;

        // Clear hint timer and remove hint animation
        if (this.hintTimer) {
            clearTimeout(this.hintTimer);
            this.hintTimer = null;
        }
        document.querySelectorAll('.answer-btn.hint').forEach((btn: Element) => {
            btn.classList.remove('hint');
        });

        const isCorrect = answer === this.currentAnswer;
        const responseTime = Date.now() - this.problemStartTime!;
        this.responseTimes.push(responseTime);

        // Visual feedback on button
        button.classList.add(isCorrect ? 'correct' : 'incorrect');

        // If wrong answer, highlight the correct one
        if (!isCorrect && this.correctAnswerButton) {
            setTimeout(() => {
                this.correctAnswerButton!.classList.add('correct');
            }, 300);
        }

        // Disable all buttons temporarily
        const allButtons = this.answerOptions.querySelectorAll('.answer-btn');
        allButtons.forEach((btn: Element) => (btn as HTMLElement).style.pointerEvents = 'none');

                // Show overlay feedback
                this.showFeedback(isCorrect);

                // Play sound
                if (isCorrect) {
                    // Happy sound: rising tones
                    this.playSound(523, 0.1); // C5
                    setTimeout(() => this.playSound(659, 0.1), 100); // E5
                    setTimeout(() => this.playSound(784, 0.2), 200); // G5
                } else {
                    // Error sound: descending buzz
                    this.playSound(300, 0.1);
                    setTimeout(() => this.playSound(250, 0.1), 100);
                    setTimeout(() => this.playSound(200, 0.2), 200);
                }

                if (isCorrect) {
                    this.correctAnswers++;
                }

                this.totalProblems++;
                this.currentProblem++;
                this.updateUI();

                // Move to next problem after longer delay to show correct answer
                setTimeout(() => {
                    if (this.timeLeft > 0 && this.gameActive) {
                        this.showProblem();
                    }
                }, isCorrect ? 800 : 1500); // Longer delay for wrong answers
            }

    showFeedback(isCorrect: boolean): void {
        this.feedbackOverlay.textContent = isCorrect ? '♪ Correct!' : '♫ Wrong!';
        this.feedbackOverlay.className = `feedback-overlay ${isCorrect ? 'correct' : 'incorrect'}`;

        // Trigger animation by forcing reflow
        this.feedbackOverlay.offsetHeight;

        setTimeout(() => {
            this.feedbackOverlay.className = 'feedback-overlay';
        }, 600);
    }

    skipProblem(): void {
        if (!this.gameActive) return;
        this.totalProblems++;
        this.currentProblem++;
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
        this.timer.textContent = this.timeLeft.toString();

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

    calculateMusicAge(): number {
                const accuracy = this.totalProblems > 0 ? (this.correctAnswers / this.totalProblems) : 0;
                const avgResponseTime = this.responseTimes.length > 0 ?
                    this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length : 5000;

        const multipliers: { [key: string]: number } = {
            'note-recognition': 1.0,
            'interval-recognition': 0.9,
            'chord-recognition': 0.8,
            'scale-patterns': 0.7
        };
        const exerciseMultiplier = multipliers[this.selectedExercise] || 1.0;

                // Base age calculation (lower is better)
                let musicAge = 20;

                // Accuracy factor (0-100%)
                musicAge += (1 - accuracy) * 40;

                // Speed factor (response time in seconds)
                musicAge += Math.min((avgResponseTime / 1000) * 5, 30);

                // Exercise difficulty bonus
                musicAge *= exerciseMultiplier;

                // Problems solved bonus
                musicAge -= Math.min(this.totalProblems * 0.2, 10);

                return Math.max(8, Math.min(80, Math.round(musicAge)));
            }

    startGame(): void {
        this.resetGame();
        this.gameActive = true;
        this.showScreen('game');

        // Enable audio context on user interaction
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }

        // Start countdown
        this.gameTimer = setInterval(() => this.updateTimer(), 1000) as unknown as number;

        // Show first problem
        this.showProblem();
    }

    endGame(): void {
        this.gameActive = false;
        if (this.gameTimer !== null) {
            clearInterval(this.gameTimer);
        }

                // Clear hint timer
                if (this.hintTimer) {
                    clearTimeout(this.hintTimer);
                    this.hintTimer = null;
                }

                // Calculate results
                const musicAge = this.calculateMusicAge();
                const accuracy = this.totalProblems > 0 ? Math.round((this.correctAnswers / this.totalProblems) * 100) : 0;
                const avgTime = this.responseTimes.length > 0 ?
                    (this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length / 1000).toFixed(1) : '0.0';

        // Get exercise name
        const exerciseNames: { [key: string]: string } = {
            'note-recognition': 'Note Names',
            'interval-recognition': 'Sound Distance',
            'chord-recognition': 'Happy or Sad',
            'scale-patterns': 'Beat Patterns'
        };

        // Show results
        document.getElementById('musicAge')!.textContent = `Musical Age: ${musicAge}`;
        document.getElementById('finalProblems')!.textContent = this.totalProblems.toString();
        document.getElementById('finalAccuracy')!.textContent = `${accuracy}%`;
        document.getElementById('avgTime')!.textContent = `${avgTime}s`;
        document.getElementById('finalExercise')!.textContent = exerciseNames[this.selectedExercise] || 'Unknown';

                this.showScreen('results');
            }

    shareScore(): void {
        const musicAge = document.getElementById('musicAge')!.textContent;
        const accuracy = document.getElementById('finalAccuracy')!.textContent;
        const problems = document.getElementById('finalProblems')!.textContent;
        const exercise = document.getElementById('finalExercise')!.textContent;

        const shareText = `🎵 I just completed Music Theory Training!\n${musicAge}, solved ${problems} ${exercise} problems with ${accuracy} accuracy!\n\nTry it yourself: ${window.location.href}`;

        if (navigator.share) {
            navigator.share({
                title: 'Music Theory Training Results',
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
new MusicTraining();

// Export init function if it exists
if (typeof window !== 'undefined') {
  // Initialization code runs automatically
}
