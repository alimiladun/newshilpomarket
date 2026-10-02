// Sound Alert System using Web Audio API (100% offline, zero-latency, no external MP3 dependencies)

class SoundAlertManager {
  constructor() {
    this.audioCtx = null;
    this.soundEnabled = true;
    
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('sm_sound_enabled');
      this.soundEnabled = stored === null ? true : stored === 'true';
    }
  }

  // Initialize or resume audio context on demand
  getAudioContext() {
    if (typeof window === 'undefined') return null;
    
    if (!this.audioCtx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.audioCtx = new AudioCtx();
      }
    }
    
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    
    return this.audioCtx;
  }

  isEnabled() {
    return this.soundEnabled;
  }

  setEnabled(val) {
    this.soundEnabled = Boolean(val);
    if (typeof window !== 'undefined') {
      localStorage.setItem('sm_sound_enabled', this.soundEnabled ? 'true' : 'false');
    }
  }

  toggle() {
    this.setEnabled(!this.soundEnabled);
    if (this.soundEnabled) {
      this.play('chime');
    }
    return this.soundEnabled;
  }

  // Play synthesized audio notification tone
  play(type = 'chime') {
    if (!this.soundEnabled) return;
    
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;

      if (type === 'order') {
        // Uplifting 4-note trade / cash register chime (C5 -> E5 -> G5 -> C6)
        const notes = [523.25, 659.25, 783.99, 1046.50];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.09);
          
          gain.gain.setValueAtTime(0, now + idx * 0.09);
          gain.gain.linearRampToValueAtTime(0.18, now + idx * 0.09 + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.09 + 0.35);
          
          osc.connect(gain);
          gain.connect(ctx.destination);
          
          osc.start(now + idx * 0.09);
          osc.stop(now + idx * 0.09 + 0.4);
        });

      } else if (type === 'quote') {
        // Dual-tone bid alert (A4 -> E5)
        const freqs = [440.0, 659.25];
        freqs.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + idx * 0.12);
          
          gain.gain.setValueAtTime(0, now + idx * 0.12);
          gain.gain.linearRampToValueAtTime(0.15, now + idx * 0.12 + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.12 + 0.3);
          
          osc.connect(gain);
          gain.connect(ctx.destination);
          
          osc.start(now + idx * 0.12);
          osc.stop(now + idx * 0.12 + 0.35);
        });

      } else {
        // Standard pleasant two-tone bell chime (D5 -> A5)
        const bellNotes = [587.33, 880.00];
        bellNotes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.14);
          
          gain.gain.setValueAtTime(0, now + idx * 0.14);
          gain.gain.linearRampToValueAtTime(0.16, now + idx * 0.14 + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.14 + 0.5);
          
          osc.connect(gain);
          gain.connect(ctx.destination);
          
          osc.start(now + idx * 0.14);
          osc.stop(now + idx * 0.14 + 0.55);
        });
      }
    } catch (e) {
      console.warn('Audio alert could not be played:', e);
    }
  }
}

export const soundAlert = new SoundAlertManager();
export default soundAlert;
