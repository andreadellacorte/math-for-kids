/**
 * Tests for audio-utils module
 */

import { playSound, playSuccessSound, playErrorSound, playClickSound, playMelody } from '../js/audio-utils';

// Mock AudioContext
class MockAudioContext {
    createOscillator() {
        return new MockOscillator();
    }
    createGain() {
        return new MockGain();
    }
    get currentTime() {
        return 0;
    }
    get destination() {
        return {};
    }
}

class MockOscillator {
    frequency = { value: 0 };
    type = 'sine';
    connect() {}
    start() {}
    stop() {}
}

class MockGain {
    gain = {
        setValueAtTime() {},
        linearRampToValueAtTime() {},
        exponentialRampToValueAtTime() {}
    };
    connect() {}
}

describe('Audio Utilities', () => {
    let mockAudioContext: MockAudioContext;

    beforeEach(() => {
        mockAudioContext = new MockAudioContext();
        // @ts-ignore - mocking window.AudioContext
        global.AudioContext = jest.fn(() => mockAudioContext);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('playSound', () => {
        it('should play a sound with default parameters', () => {
            const createOscillatorSpy = jest.spyOn(mockAudioContext, 'createOscillator');
            const createGainSpy = jest.spyOn(mockAudioContext, 'createGain');

            playSound(440);

            expect(createOscillatorSpy).toHaveBeenCalled();
            expect(createGainSpy).toHaveBeenCalled();
        });

        it('should play a sound with custom duration', () => {
            const createOscillatorSpy = jest.spyOn(mockAudioContext, 'createOscillator');

            playSound(440, 500);

            expect(createOscillatorSpy).toHaveBeenCalled();
        });

        it('should play a sound with custom wave type', () => {
            const createOscillatorSpy = jest.spyOn(mockAudioContext, 'createOscillator');

            playSound(440, 200, 'square');

            expect(createOscillatorSpy).toHaveBeenCalled();
        });

        it('should not throw when AudioContext is unavailable', () => {
            // @ts-ignore
            global.AudioContext = undefined;

            expect(() => playSound(440)).not.toThrow();
        });
    });

    describe('playClickSound', () => {
        it('should play click sound', () => {
            const createOscillatorSpy = jest.spyOn(mockAudioContext, 'createOscillator');

            playClickSound();

            expect(createOscillatorSpy).toHaveBeenCalled();
        });
    });

    describe('playMelody', () => {
        it('should play a sequence of notes', () => {
            jest.useFakeTimers();
            const createOscillatorSpy = jest.spyOn(mockAudioContext, 'createOscillator');

            playMelody([
                { frequency: 440, duration: 200 },
                { frequency: 523, duration: 200 }
            ]);

            jest.runAllTimers();
            expect(createOscillatorSpy).toHaveBeenCalled();
            jest.useRealTimers();
        });
    });

    describe('playSuccessSound', () => {
        it('should play success sound', () => {
            const createOscillatorSpy = jest.spyOn(mockAudioContext, 'createOscillator');

            playSuccessSound();

            expect(createOscillatorSpy).toHaveBeenCalled();
        });
    });

    describe('playErrorSound', () => {
        it('should play error sound', () => {
            const createOscillatorSpy = jest.spyOn(mockAudioContext, 'createOscillator');

            playErrorSound();

            expect(createOscillatorSpy).toHaveBeenCalled();
        });
    });
});
