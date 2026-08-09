// ============================================
// SOUND MANAGER - Play different notification sounds
// ============================================

class SoundManager {
  constructor() {
    this.sounds = {};
    this.enabled = true;
    this.loadSounds();
  }

  // Load all sounds from public/sounds folder
  loadSounds() {
    this.sounds = {
      notification: new Audio('/sounds/notification.wav'),
      like: new Audio('/sounds/like.wav'),
      comment: new Audio('/sounds/comment.wav'),
      follow: new Audio('/sounds/follow.wav'),
      message: new Audio('/sounds/message.mp3'),
    };

    // Preload all sounds
    Object.values(this.sounds).forEach(sound => {
      sound.load();
    });
  }

  // Play a specific sound
  play(type = 'notification') {
    if (!this.enabled) return;

    const sound = this.sounds[type];
    if (sound) {
      // Reset and play
      sound.currentTime = 0;
      sound.play().catch((error) => {
        console.log('Sound play error:', error);
        this.playFallback();
      });
    } else {
      this.playFallback();
    }
  }

  // Fallback beep sound (no file needed)
  playFallback() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      gainNode.gain.value = 0.1;
      oscillator.start();
      setTimeout(() => oscillator.stop(), 150);
    } catch (e) {
      // Silent fail if audio not supported
    }
  }

  // Toggle sound on/off
  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  // Set volume (0 to 1)
  setVolume(volume) {
    Object.values(this.sounds).forEach(sound => {
      sound.volume = Math.min(Math.max(volume, 0), 1);
    });
  }

  // Preload all sounds (call this on app start)
  preload() {
    Object.values(this.sounds).forEach(sound => {
      sound.load();
    });
  }

  // Test all sounds
  testAll() {
    const types = ['notification', 'like', 'comment', 'follow', 'message'];
    types.forEach((type, index) => {
      setTimeout(() => {
        console.log(`🔊 Playing: ${type}`);
        this.play(type);
      }, index * 500);
    });
  }
}

// Create a single instance
const soundManager = new SoundManager();

export default soundManager;