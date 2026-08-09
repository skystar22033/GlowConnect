import { useNotifications } from '../../context/NotificationContext';
import { Volume2, VolumeX, Play } from 'lucide-react';

export default function SoundToggle() {
  const { soundEnabled, toggleSound, testSound } = useNotifications();

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={toggleSound}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-surface-raised transition"
      >
        {soundEnabled ? (
          <>
            <Volume2 className="w-4 h-4 text-primary" />
            <span className="text-sm text-text-primary">Sound On</span>
          </>
        ) : (
          <>
            <VolumeX className="w-4 h-4 text-text-muted" />
            <span className="text-sm text-text-muted">Sound Off</span>
          </>
        )}
      </button>
      
      <button
        onClick={() => testSound('notification')}
        className="p-2 rounded-lg hover:bg-surface-raised transition text-text-muted hover:text-primary"
        title="Test Sound"
      >
        <Play className="w-4 h-4" />
      </button>
    </div>
  );
}