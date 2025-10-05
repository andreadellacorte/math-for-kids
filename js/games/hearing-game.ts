// @ts-nocheck
/**
 * hearing-game game logic
 * Migrated from hearing-game.html
 */

// Import utilities
import { setCookie, getCookie } from '../storage-utils';

// Declare globals that might be used
declare const window: any;
declare const document: any;

class HearingGame {
            constructor() {
                this.patterns = [
                    {
                        name: 'Ascending',
                        description: 'Going Up',
                        visual: '♪ ↗ ♪ ↗ ♪',
                        generator: () => this.generateAscending()
                    },
                    {
                        name: 'Descending',
                        description: 'Going Down',
                        visual: '♪ ↘ ♪ ↘ ♪',
                        generator: () => this.generateDescending()
                    },
                    {
                        name: 'Up-down',
                        description: 'Up then Down',
                        visual: '♪ ↗ ♪ ↘ ♪',
                        generator: () => this.generateUpDown()
                    },
                    {
                        name: 'Down-up',
                        description: 'Down then Up',
                        visual: '♪ ↘ ♪ ↗ ♪',
                        generator: () => this.generateDownUp()
                    },
                    {
                        name: 'Repeat',
                        description: 'Same Note',
                        visual: '♪ → ♪ → ♪',
                        generator: () => this.generateRepeat()
                    }
                ];

                this.baseFrequencies = [
                    261.63, // C4
                    293.66, // D4
                    329.63, // E4
                    349.23, // F4
                    392.00, // G4
                    440.00, // A4
                    493.88, // B4
                    523.25  // C5
                ];

                this.currentSequence = [];
                this.currentPattern = null;
                this.selectedPattern = null;
                this.score = 0;
                this.level = 1;
                this.streak = 0;
                this.volume = 0.5;

                // Audio context
                this.audioContext = null;
                this.initAudio();

                this.initializeElements();
                this.createPatternOptions();
                this.attachEventListeners();
                this.updateDisplay();
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
                this.audioDisplay = document.getElementById('audioDisplay');
                this.sequenceDisplay = document.getElementById('sequenceDisplay');
                this.patternsContainer = document.getElementById('patternsContainer');
                this.volumeSlider = document.getElementById('volumeSlider');
                this.volumeValue = document.getElementById('volumeValue');

                this.newSequenceBtn = document.getElementById('newSequenceBtn');
                this.playBtn = document.getElementById('playBtn');
                this.checkBtn = document.getElementById('checkBtn');
            }

            createPatternOptions() {
                this.patternsContainer.innerHTML = '';

                this.patterns.forEach((pattern, index) => {
                    const option = document.createElement('div');
                    option.className = 'pattern-option';
                    option.dataset.pattern = pattern.name;

                    option.innerHTML = `
                        <div class="pattern-visual">${pattern.visual}</div>
                        <div class="pattern-label">${pattern.name}</div>
                        <div style="font-size: 0.9em; color: #666;">${pattern.description}</div>
                    `;

                    option.addEventListener('click', () => this.selectPattern(pattern.name, option));
                    this.patternsContainer.appendChild(option);
                });
            }

            attachEventListeners() {
                this.newSequenceBtn.addEventListener('click', () => this.generateNewSequence());
                this.playBtn.addEventListener('click', () => this.playCurrentSequence());
                this.checkBtn.addEventListener('click', () => this.checkAnswer());

                this.volumeSlider.addEventListener('input', (e) => {
                    this.volume = e.target.value / 100;
                    this.volumeValue.textContent = `${e.target.value}%`;
                });
            }

            generateNewSequence() {
                // Reset game state
                this.currentSequence = [];
                this.selectedPattern = null;
                this.clearPatternSelection();

                // Choose a random pattern
                this.currentPattern = this.patterns[Math.floor(Math.random() * this.patterns.length)];

                // Generate sequence based on pattern
                this.currentSequence = this.currentPattern.generator();

                this.audioDisplay.textContent = 'Playing sequence... 🎵';
                this.sequenceDisplay.textContent = 'Listen carefully and select the pattern you hear...';

                this.playCurrentSequence();

                this.playBtn.disabled = false;
                this.checkBtn.disabled = false;
            }

            generateAscending() {
                // Three notes going up
                const start = Math.floor(Math.random() * 4); // 0-3
                return [
                    this.baseFrequencies[start],
                    this.baseFrequencies[start + 2],
                    this.baseFrequencies[start + 4]
                ];
            }

            generateDescending() {
                // Three notes going down
                const start = Math.floor(Math.random() * 4) + 4; // 4-7
                return [
                    this.baseFrequencies[start],
                    this.baseFrequencies[start - 2],
                    this.baseFrequencies[start - 4]
                ];
            }

            generateUpDown() {
                // Low, high, medium
                const base = Math.floor(Math.random() * 3); // 0-2
                return [
                    this.baseFrequencies[base],
                    this.baseFrequencies[base + 4],
                    this.baseFrequencies[base + 2]
                ];
            }

            generateDownUp() {
                // High, low, medium
                const base = Math.floor(Math.random() * 3) + 4; // 4-6
                return [
                    this.baseFrequencies[base],
                    this.baseFrequencies[base - 4],
                    this.baseFrequencies[base - 2]
                ];
            }

            generateRepeat() {
                // Three notes of the same pitch
                const base = Math.floor(Math.random() * 6) + 1; // 1-6
                return [
                    this.baseFrequencies[base],
                    this.baseFrequencies[base],
                    this.baseFrequencies[base]
                ];
            }


            async playCurrentSequence() {
                if (!this.audioContext || this.currentSequence.length === 0) return;

                this.audioDisplay.textContent = 'Playing sequence... 🎵';

                for (let i = 0; i < this.currentSequence.length; i++) {
                    this.playNote(this.currentSequence[i], 0.8);
                    await this.sleep(900); // Pause between notes
                }

                this.audioDisplay.textContent = 'Select the pattern you heard!';
            }

            playNote(frequency, duration) {
                if (!this.audioContext) return;

                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();

                oscillator.connect(gainNode);
                gainNode.connect(this.audioContext.destination);

                oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
                oscillator.type = 'sine';

                gainNode.gain.setValueAtTime(this.volume * 0.3, this.audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

                oscillator.start(this.audioContext.currentTime);
                oscillator.stop(this.audioContext.currentTime + duration);
            }

            sleep(ms) {
                return new Promise(resolve => setTimeout(resolve, ms));
            }

            selectPattern(patternName, element) {
                // Clear previous selection
                this.clearPatternSelection();

                // Set new selection
                this.selectedPattern = patternName;
                element.classList.add('selected');

                this.sequenceDisplay.textContent = `Selected: ${patternName}`;
            }

            clearPatternSelection() {
                document.querySelectorAll('.pattern-option').forEach(option => {
                    option.classList.remove('selected', 'correct', 'incorrect');
                });
            }

            checkAnswer() {
                if (!this.selectedPattern) {
                    this.sequenceDisplay.textContent = 'Please select a pattern first!';
                    return;
                }

                const isCorrect = this.selectedPattern === this.currentPattern.name;
                this.showResults(isCorrect);

                if (isCorrect) {
                    this.score += 20 + (this.level * 5);
                    this.streak++;

                    if (this.streak % 4 === 0) {
                        this.level++;
                        this.audioDisplay.textContent = `🎉 Level Up! Now level ${this.level}!`;
                    }
                } else {
                    this.streak = 0;
                }

                this.updateDisplay();

                // Reset for next round
                setTimeout(() => {
                    this.clearPatternSelection();
                    this.playBtn.disabled = true;
                    this.checkBtn.disabled = true;
                    this.sequenceDisplay.textContent = 'Ready for the next sequence...';
                }, 3000);
            }

            showResults(isCorrect) {
                // Show correct answer and user selection
                document.querySelectorAll('.pattern-option').forEach(option => {
                    const patternName = option.dataset.pattern;

                    if (patternName === this.currentPattern.name) {
                        option.classList.add('correct');
                    } else if (patternName === this.selectedPattern && !isCorrect) {
                        option.classList.add('incorrect');
                    }
                });

                if (isCorrect) {
                    this.audioDisplay.textContent = '🎉 Excellent! You identified the pattern correctly!';
                    this.sequenceDisplay.textContent = `✅ Correct! It was ${this.currentPattern.name}`;
                } else {
                    this.audioDisplay.textContent = '❌ Not quite right. Try listening again!';
                    this.sequenceDisplay.textContent = `❌ The correct pattern was: ${this.currentPattern.name}`;
                }
            }

            updateDisplay() {
                this.scoreElement.textContent = this.score;
                this.levelElement.textContent = this.level;
                this.streakElement.textContent = this.streak;
            }
        }

        // Initialize game when page loads
        document.addEventListener('DOMContentLoaded', () => {
            new HearingGame();
        });

// Export init function if it exists
if (typeof window !== 'undefined') {
  // Initialization code runs automatically
}
