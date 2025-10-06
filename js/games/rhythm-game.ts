/**
 * rhythm-game game logic
 * Migrated from rhythm-game.html
 */

// Import utilities
import { setCookie, getCookie } from '../storage-utils';

// Declare globals that might be used
declare const window: any;
declare const document: any;

interface RhythmChoice {
    notation?: string;
    pattern: number[];
    isCorrect: boolean;
    label?: string;
}

class RhythmGame {
    private currentPattern: number[];
    private correctAnswer: number;
    private score: number;
    private level: number;
    private streak: number;
    private isPlaying: boolean;
    private tempo: number;
    private gameMode: 'listen' | 'read';
    private audioContext: AudioContext | null;
    private currentAudioChoices: RhythmChoice[] | null;
    private selectedChoice: number | null;

    private scoreElement!: HTMLElement;
    private levelElement!: HTMLElement;
    private streakElement!: HTMLElement;
    private rhythmDisplay!: HTMLElement;
    private rhythmPattern!: HTMLElement;
    private tempoSlider!: HTMLInputElement;
    private tempoValue!: HTMLElement;
    private newRhythmBtn!: HTMLButtonElement;
    private playBtn!: HTMLButtonElement;
    private checkBtn!: HTMLButtonElement;
    private listenModeBtn!: HTMLButtonElement;
    private readModeBtn!: HTMLButtonElement;
    private listenMode!: HTMLElement;
    private readMode!: HTMLElement;
    private notationChoices!: HTMLElement;
    private audioChoices!: HTMLElement;
    private notationDisplay!: HTMLElement;
    private listenModeInstructions!: HTMLElement;
    private readModeInstructions!: HTMLElement;

    constructor() {
        this.currentPattern = [];
        this.correctAnswer = 0;
        this.score = 0;
        this.level = 1;
        this.streak = 0;
        this.isPlaying = false;
        this.tempo = 100; // BPM
        this.gameMode = 'listen'; // 'listen' or 'read'
        this.currentAudioChoices = null;
        this.selectedChoice = null;

        // Audio context for generating beats
        this.audioContext = null;
        this.initAudio();

        this.initializeElements();
        this.attachEventListeners();
        this.updateDisplay();
        this.switchMode('listen');
    }

    async initAudio(): Promise<void> {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (error) {
            console.warn('Audio context not available:', error);
        }
    }

    initializeElements(): void {
        this.scoreElement = document.getElementById('score')!;
        this.levelElement = document.getElementById('level')!;
        this.streakElement = document.getElementById('streak')!;
        this.rhythmDisplay = document.getElementById('rhythmDisplay')!;
        this.rhythmPattern = document.getElementById('rhythmPattern')!;
        this.tempoSlider = document.getElementById('tempoSlider') as HTMLInputElement;
        this.tempoValue = document.getElementById('tempoValue')!;

        this.newRhythmBtn = document.getElementById('newRhythmBtn') as HTMLButtonElement;
        this.playBtn = document.getElementById('playBtn') as HTMLButtonElement;
        this.checkBtn = document.getElementById('checkBtn') as HTMLButtonElement;

        this.listenModeBtn = document.getElementById('listenModeBtn') as HTMLButtonElement;
        this.readModeBtn = document.getElementById('readModeBtn') as HTMLButtonElement;

        this.listenMode = document.getElementById('listenMode')!;
        this.readMode = document.getElementById('readMode')!;
        this.notationChoices = document.getElementById('notationChoices')!;
        this.audioChoices = document.getElementById('audioChoices')!;
        this.notationDisplay = document.getElementById('notationDisplay')!;

        this.listenModeInstructions = document.getElementById('listenModeInstructions')!;
        this.readModeInstructions = document.getElementById('readModeInstructions')!;
    }

    attachEventListeners(): void {
        this.newRhythmBtn.addEventListener('click', () => this.generateNewRhythm());
        this.playBtn.addEventListener('click', () => this.playCurrentRhythm());
        this.checkBtn.addEventListener('click', () => this.checkAnswer());

        this.listenModeBtn.addEventListener('click', () => this.switchMode('listen'));
        this.readModeBtn.addEventListener('click', () => this.switchMode('read'));

        this.tempoSlider.addEventListener('input', (e: Event) => {
            const target = e.target as HTMLInputElement;
            this.tempo = parseInt(target.value);
            this.tempoValue.textContent = this.tempo.toString();
        });
    }

    switchMode(mode: 'listen' | 'read'): void {
                this.gameMode = mode;

                // Update mode buttons
                this.listenModeBtn.classList.toggle('active', mode === 'listen');
                this.readModeBtn.classList.toggle('active', mode === 'read');

                // Update mode displays
                this.listenMode.style.display = mode === 'listen' ? 'block' : 'none';
                this.readMode.style.display = mode === 'read' ? 'block' : 'none';

                // Update instructions
                this.listenModeInstructions.style.display = mode === 'listen' ? 'block' : 'none';
                this.readModeInstructions.style.display = mode === 'read' ? 'block' : 'none';

                // Reset game state
                this.resetGame();
                this.rhythmDisplay.textContent = `${mode === 'listen' ? 'Listen Mode' : 'Read Mode'}: Press "New Rhythm" to start!`;
            }

    resetGame(): void {
        this.currentPattern = [];
        this.correctAnswer = 0;
        this.notationChoices.style.display = 'none';
        this.audioChoices.style.display = 'none';
        this.notationDisplay.textContent = '';
        this.playBtn.disabled = true;
        this.checkBtn.disabled = true;
        this.clearChoiceSelection();
    }

    generateNewRhythm(): void {
                this.resetGame();

                // Generate a 4-beat pattern
                this.currentPattern = [];
                const beatTypes = [0, 1, 2]; // 0=rest, 1=quarter, 2=eighth notes

                for (let i = 0; i < 4; i++) {
                    this.currentPattern.push(beatTypes[Math.floor(Math.random() * beatTypes.length)]);
                }

                // Ensure at least 2 beats are not rests
                const nonRestBeats = this.currentPattern.filter(beat => beat !== 0).length;
                if (nonRestBeats < 2) {
                    this.currentPattern[0] = 1;
                    this.currentPattern[2] = 1;
                }

                if (this.gameMode === 'listen') {
                    this.startListenMode();
                } else {
                    this.startReadMode();
                }

                this.playBtn.disabled = false;
                this.checkBtn.disabled = false;
            }

    startListenMode(): void {
        this.rhythmDisplay.textContent = 'Listen to the rhythm...';
        this.playCurrentRhythm();

        // Generate notation choices after a delay
        setTimeout(() => {
            this.generateNotationChoices();
        }, 1000);
    }

    startReadMode(): void {
        this.displayNotation();
        this.generateAudioChoices();
        this.rhythmDisplay.textContent = 'Study the notation, then choose the matching audio';
    }

    generateNotationChoices(): void {
        const choices: RhythmChoice[] = [];

                // Correct answer
                choices.push({
                    notation: this.patternToNotation(this.currentPattern),
                    pattern: [...this.currentPattern],
                    isCorrect: true
                });

                // Generate 3 incorrect options
                for (let i = 0; i < 3; i++) {
                    let wrongPattern;
                    do {
                        wrongPattern = this.generateRandomPattern();
                    } while (this.patternsEqual(wrongPattern, this.currentPattern));

                    choices.push({
                        notation: this.patternToNotation(wrongPattern),
                        pattern: wrongPattern,
                        isCorrect: false
                    });
                }

                // Shuffle choices
                this.shuffleArray(choices);
                this.correctAnswer = choices.findIndex(choice => choice.isCorrect);

                // Display choices
                this.displayNotationChoices(choices);
                this.notationChoices.style.display = 'grid';
            }

    generateAudioChoices(): void {
        const choices: RhythmChoice[] = [];

                // Correct answer
                choices.push({
                    pattern: [...this.currentPattern],
                    isCorrect: true,
                    label: 'Option A'
                });

                // Generate 3 incorrect options
                for (let i = 0; i < 3; i++) {
                    let wrongPattern;
                    do {
                        wrongPattern = this.generateRandomPattern();
                    } while (this.patternsEqual(wrongPattern, this.currentPattern));

                    choices.push({
                        pattern: wrongPattern,
                        isCorrect: false,
                        label: `Option ${String.fromCharCode(66 + i)}` // B, C, D
                    });
                }

                // Shuffle choices
                this.shuffleArray(choices);
                this.correctAnswer = choices.findIndex(choice => choice.isCorrect);

                // Store choices for audio playback
                this.currentAudioChoices = choices;

                // Display choices
                this.displayAudioChoices(choices);
                this.audioChoices.style.display = 'grid';
            }

    displayNotation(): void {
        this.notationDisplay.textContent = this.patternToNotation(this.currentPattern);
    }

    displayNotationChoices(choices: RhythmChoice[]): void {
        this.notationChoices.innerHTML = '';
        choices.forEach((choice: RhythmChoice, index: number) => {
            const button = document.createElement('div');
            button.className = 'choice-button';
            button.dataset.choice = index.toString();
            button.innerHTML = `<div style="font-size: 1.5em; margin-bottom: 10px;">${choice.notation}</div>`;
            button.addEventListener('click', () => this.selectChoice(index));
            this.notationChoices.appendChild(button);
        });
    }

    displayAudioChoices(choices: RhythmChoice[]): void {
        this.audioChoices.innerHTML = '';
        choices.forEach((choice: RhythmChoice, index: number) => {
            const button = document.createElement('div');
            button.className = 'choice-button';
            button.dataset.choice = index.toString();
            button.innerHTML = `
                <div style="font-size: 1.2em; margin-bottom: 10px;">${choice.label}</div>
                <button onclick="event.stopPropagation(); game.playPattern(${index})" class="btn secondary" style="font-size: 0.8em;">🔊 Play</button>
            `;
            button.addEventListener('click', () => this.selectChoice(index));
            this.audioChoices.appendChild(button);
        });
    }

    async playPattern(choiceIndex: number): Promise<void> {
        if (this.gameMode !== 'read' || !this.currentAudioChoices) return;

        if (this.currentAudioChoices[choiceIndex]) {
            await this.playRhythmPattern(this.currentAudioChoices[choiceIndex].pattern);
        }
    }

    selectChoice(choiceIndex: number): void {
        this.clearChoiceSelection();

        const container = this.gameMode === 'listen' ? this.notationChoices : this.audioChoices;
        const button = container.querySelector(`[data-choice="${choiceIndex}"]`) as HTMLElement;
        if (button) {
            button.classList.add('selected');
            this.selectedChoice = choiceIndex;
        }
    }

    clearChoiceSelection(): void {
        document.querySelectorAll('.choice-button').forEach((btn: Element) => {
            btn.classList.remove('selected', 'correct', 'incorrect');
        });
        this.selectedChoice = null;
    }

    patternToNotation(pattern: number[]): string {
        let notation = '';
        for (let beat of pattern) {
            switch (beat) {
                case 0:
                    notation += '𝄽 '; // Rest
                    break;
                case 1:
                    notation += '♩ '; // Quarter note
                    break;
                case 2:
                    notation += '♫ '; // Eighth notes
                    break;
            }
        }
        return notation.trim();
    }

    generateRandomPattern(): number[] {
        const pattern: number[] = [];
        const beatTypes = [0, 1, 2];

        for (let i = 0; i < 4; i++) {
            pattern.push(beatTypes[Math.floor(Math.random() * beatTypes.length)]);
        }

        // Ensure at least 2 beats are not rests
        const nonRestBeats = pattern.filter((beat: number) => beat !== 0).length;
        if (nonRestBeats < 2) {
            pattern[0] = 1;
            pattern[2] = 1;
        }

        return pattern;
    }

    patternsEqual(a: number[], b: number[]): boolean {
        return a.length === b.length && a.every((val: number, i: number) => val === b[i]);
    }

    shuffleArray<T>(array: T[]): void {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    async playCurrentRhythm(): Promise<void> {
        await this.playRhythmPattern(this.currentPattern);
    }

    async playRhythmPattern(pattern: number[]): Promise<void> {
                if (!this.audioContext || this.isPlaying) return;

                this.isPlaying = true;
                const originalText = this.rhythmDisplay.textContent;
                this.rhythmDisplay.textContent = 'Playing rhythm... 🎵';

                const beatDuration = 60000 / this.tempo; // milliseconds per beat

                for (let i = 0; i < pattern.length; i++) {
                    const beatType = pattern[i];

                    if (beatType === 1) {
                        // Quarter note
                        this.playBeep(440, 0.2);
                    } else if (beatType === 2) {
                        // Two eighth notes
                        this.playBeep(440, 0.1);
                        setTimeout(() => this.playBeep(440, 0.1), beatDuration / 2);
                    }
                    // Rest (0) - no sound

                    await this.sleep(beatDuration);
                }

                this.isPlaying = false;
                this.rhythmDisplay.textContent = originalText;
            }

    playBeep(frequency: number, duration: number): void {
        if (!this.audioContext) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }

    sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    checkAnswer(): void {
                if (this.selectedChoice === null) {
                    this.rhythmDisplay.textContent = 'Please select an answer first!';
                    return;
                }

                const isCorrect = this.selectedChoice === this.correctAnswer;
                this.showResults(isCorrect);

                if (isCorrect) {
                    this.score += 10 + (this.level * 5);
                    this.streak++;

                    if (this.streak % 5 === 0) {
                        this.level++;
                        this.rhythmDisplay.textContent = `🎉 Level Up! Now level ${this.level}!`;
                    }
                } else {
                    this.streak = 0;
                }

                this.updateDisplay();

                // Reset for next round
                setTimeout(() => {
                    this.resetGame();
                    this.rhythmDisplay.textContent = 'Ready for next rhythm!';
                }, 3000);
            }

    showResults(isCorrect: boolean): void {
        const container = this.gameMode === 'listen' ? this.notationChoices : this.audioChoices;
        const buttons = container.querySelectorAll('.choice-button');

        buttons.forEach((btn: Element, index: number) => {
            if (index === this.correctAnswer) {
                btn.classList.add('correct');
            } else if (index === this.selectedChoice && !isCorrect) {
                btn.classList.add('incorrect');
            }
        });

        if (isCorrect) {
            this.rhythmDisplay.textContent = '🎉 Correct! Great rhythm recognition!';
        } else {
            this.rhythmDisplay.textContent = '❌ Not quite right. The correct answer is highlighted in green.';
        }
    }

    updateDisplay(): void {
        this.scoreElement.textContent = this.score.toString();
        this.levelElement.textContent = this.level.toString();
        this.streakElement.textContent = this.streak.toString();
    }
}

// Global reference for audio choice playback
let game: RhythmGame;

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    game = new RhythmGame();
});

// Export init function if it exists
if (typeof window !== 'undefined') {
  // Initialization code runs automatically
}
