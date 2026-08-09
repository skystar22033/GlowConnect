import { useState } from 'react';
import { Calendar } from 'lucide-react';

export default function SchedulePicker({ onSchedule }) {
  const [scheduledAt, setScheduledAt] = useState('');
  const [show, setShow] = useState(false);

  const handleSchedule = () => {
    if (scheduledAt) {
      onSchedule(new Date(scheduledAt));
      setShow(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShow(!show)}
        className="flex items-center gap-2 text-text-muted hover:text-primary transition"
      >
        <Calendar className="w-4 h-4" />
        <span className="text-sm">Schedule</span>
      </button>

      {show && (
        <div className="absolute bottom-full mb-2 bg-surface rounded-xl shadow-lg border border-border p-4 z-50">
          <label className="text-sm font-medium">Schedule Date</label>
          <input
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            className="input-field mt-1"
          />
          <button
            onClick={handleSchedule}
            className="btn-primary w-full mt-2 text-sm"
          >
            Schedule Post
          </button>
        </div>
      )}
    </div>
  );
}