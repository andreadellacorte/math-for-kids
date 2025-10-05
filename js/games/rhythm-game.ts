// @ts-nocheck
/**
 * rhythm-game game logic
 * Migrated from rhythm-game.html
 */

// Import utilities
import { setCookie, getCookie } from '../storage-utils';

// Declare globals that might be used
declare const window: any;
declare const document: any;

class RhythmGame {
            constructor() {
                this.currentPattern = [];
                this.correctAnswer = 0;
                this.score = 0;
                this.level = 1;
                this.streak = 0;
                this.isPlaying = false;
                this.tempo = 100; // BPM
                this.gameMode = 'listen'; // 'listen' or 'read'

                // Audio context for generating beats
                this.audioContext = null;
                this.initAudio();

                this.initializeElements();
                this.attachEventListeners();
                this.updateDisplay();
                this.switchMode('listen');
            }

            async initAudio() {
                try {
                    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
                } catch (error) {
                    console.warn('Audio context not available:', error);
                }
            }

            initializeElements() {
                this.scoreElement = document.getElementById('score');
                this.levelElement = document.getElementById('level');
                this.streakElement = document.getElementById('streak');
                this.rhythmDisplay = document.getElementById('rhythmDisplay');
                this.rhythmPattern = document.getElementById('rhythmPattern');
                this.tempoSlider = document.getElementById('tempoSlider');
                this.tempoValue = document.getElementById('tempoValue');

                this.newRhythmBtn = document.getElementById('newRhythmBtn');
                this.playBtn = document.getElementById('playBtn');
                this.checkBtn = document.getElementById('checkBtn');

                this.listenModeBtn = document.getElementById('listenModeBtn');
                this.readModeBtn = document.getElementById('readModeBtn');

                this.listenMode = document.getElementById('listenMode');
                this.readMode = document.getElementById('readMode');
                this.notationChoices = document.getElementById('notationChoices');
                this.audioChoices = document.getElementById('audioChoices');
                this.notationDisplay = document.getElementById('notationDisplay');

                this.listenModeInstructions = document.getElementById('listenModeInstructions');
                this.readModeInstructions = document.getElementById('readModeInstructions');
            }

            attachEventListeners() {
                this.newRhythmBtn.addEventListener('click', () => this.generateNewRhythm());
                this.playBtn.addEventListener('click', () => this.playCurrentRhythm());
                this.checkBtn.addEventListener('click', () => this.checkAnswer());

                this.listenModeBtn.addEventListener('click', () => this.switchMode('listen'));
                this.readModeBtn.addEventListener('click', () => this.switchMode('read'));

                this.tempoSlider.addEventListener('input', (e) => {
                    this.tempo = parseInt(e.target.value);
                    this.tempoValue.textContent = this.tempo;
                });
            }

            switchMode(mode) {
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

            resetGame() {
                this.currentPattern = [];
                this.correctAnswer = 0;
                this.notationChoices.style.display = 'none';
                this.audioChoices.style.display = 'none';
                this.notationDisplay.textContent = '';
                this.playBtn.disabled = true;
                this.checkBtn.disabled = true;
                this.clearChoiceSelection();
            }

            generateNewRhythm() {
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

            startListenMode() {
                this.rhythmDisplay.textContent = 'Listen to the rhythm...';
                this.playCurrentRhythm();

                // Generate notation choices after a delay
                setTimeout(() => {
                    this.generateNotationChoices();
                }, 1000);
            }

            startReadMode() {
                this.displayNotation();
                this.generateAudioChoices();
                this.rhythmDisplay.textContent = 'Study the notation, then choose the matching audio';
            }

            generateNotationChoices() {
                const choices = [];

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

            generateAudioChoices() {
                const choices = [];

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

            displayNotation() {
                this.notationDisplay.textContent = this.patternToNotation(this.currentPattern);
            }

            displayNotationChoices(choices) {
                this.notationChoices.innerHTML = '';
                choices.forEach((choice, index) => {
                    const button = document.createElement('div');
                    button.className = 'choice-button';
                    button.dataset.choice = index;
                    button.innerHTML = `<div style="font-size: 1.5em; margin-bottom: 10px;">${choice.notation}</div>`;
                    button.addEventListener('click', () => this.selectChoice(index));
                    this.notationChoices.appendChild(button);
                });
            }

            displayAudioChoices(choices) {
                this.audioChoices.innerHTML = '';
                choices.forEach((choice, index) => {
                    const button = document.createElement('div');
                    button.className = 'choice-button';
                    button.dataset.choice = index;
                    button.innerHTML = `
                        <div style="font-size: 1.2em; margin-bottom: 10px;">${choice.label}</div>
                        <button onclick="event.stopPropagation(); game.playPattern(${index})" class="btn secondary" style="font-size: 0.8em;">🔊 Play</button>
                    `;
                    button.addEventListener('click', () => this.selectChoice(index));
                    this.audioChoices.appendChild(button);
                });
            }

            async playPattern(choiceIndex) {
                if (this.gameMode !== 'read' || !this.currentAudioChoices) return;

                if (this.currentAudioChoices[choiceIndex]) {
                    await this.playRhythmPattern(this.currentAudioChoices[choiceIndex].pattern);
                }
            }

            selectChoice(choiceIndex) {
                this.clearChoiceSelection();

                const container = this.gameMode === 'listen' ? this.notationChoices : this.audioChoices;
                const button = container.querySelector(`[data-choice="${choiceIndex}"]`);
                if (button) {
                    button.classList.add('selected');
                    this.selectedChoice = choiceIndex;
                }
            }

            clearChoiceSelection() {
                document.querySelectorAll('.choice-button').forEach(btn => {
                    btn.classList.remove('selected', 'correct', 'incorrect');
                });
                this.selectedChoice = null;
            }

            patternToNotation(pattern) {
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

            generateRandomPattern() {
                const pattern = [];
                const beatTypes = [0, 1, 2];

                for (let i = 0; i < 4; i++) {
                    pattern.push(beatTypes[Math.floor(Math.random() * beatTypes.length)]);
                }

                // Ensure at least 2 beats are not rests
                const nonRestBeats = pattern.filter(beat => beat !== 0).length;
                if (nonRestBeats < 2) {
                    pattern[0] = 1;
                    pattern[2] = 1;
                }

                return pattern;
            }

            patternsEqual(a, b) {
                return a.length === b.length && a.every((val, i) => val === b[i]);
            }

            shuffleArray(array) {
                for (let i = array.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [array[i], array[j]] = [array[j], array[i]];
                }
            }

            async playCurrentRhythm() {
                await this.playRhythmPattern(this.currentPattern);
            }

            async playRhythmPattern(pattern) {
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

            playBeep(frequency, duration) {
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

            sleep(ms) {
                return new Promise(resolve => setTimeout(resolve, ms));
            }

            checkAnswer() {
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

            showResults(isCorrect) {
                const container = this.gameMode === 'listen' ? this.notationChoices : this.audioChoices;
                const buttons = container.querySelectorAll('.choice-button');

                buttons.forEach((btn, index) => {
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

            updateDisplay() {
                this.scoreElement.textContent = this.score;
                this.levelElement.textContent = this.level;
                this.streakElement.textContent = this.streak;
            }
        }

        // Global reference for audio choice playback
        let game;

        // Initialize game when page loads
        document.addEventListener('DOMContentLoaded', () => {
            game = new RhythmGame();
        });

// Export init function if it exists
if (typeof window !== 'undefined') {
  // Initialization code runs automatically
}
