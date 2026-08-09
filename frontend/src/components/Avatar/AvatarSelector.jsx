import { useState } from 'react';
import { X, Check, Sparkles } from 'lucide-react';
import { AVATARS, getAvatarById } from '../../data/avatarData';

export default function AvatarSelector({ user, onSave, onClose, loading = false }) {
  const [selectedAvatarId, setSelectedAvatarId] = useState(
    user?.avatarPreferences?.selectedAvatar || 'avatar1'
  );

  const handleSave = () => {
    const selectedAvatar = getAvatarById(selectedAvatarId);
    const preferences = {
      selectedAvatar: selectedAvatarId,
      avatarImage: selectedAvatar.image,
    };
    onSave(preferences);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-surface max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl border border-border-light p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-full">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-display text-text-primary">Choose Avatar</h2>
              <p className="text-sm text-text-muted">Pick your 3D character</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-surface-raised transition"
          >
            <X className="w-5 h-5 text-text-muted" />
          </button>
        </div>

        {/* Avatar Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
          {AVATARS.map((avatar) => {
            const isSelected = selectedAvatarId === avatar.id;
            return (
              <button
                key={avatar.id}
                onClick={() => setSelectedAvatarId(avatar.id)}
                className={`relative p-3 rounded-2xl border-2 transition-all duration-300 ${
                  isSelected
                    ? 'border-primary bg-primary/10 shadow-glow scale-105'
                    : 'border-border hover:border-primary/50 hover:bg-surface-raised hover:scale-105'
                }`}
              >
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 rounded-full overflow-hidden bg-gradient-brand shadow-md">
                    <img
                      src={avatar.image}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback if image fails to load
                        e.target.src = `https://ui-avatars.com/api/?name=A&background=6C63FF&color=fff&size=128&rounded=true`;
                      }}
                    />
                  </div>
                </div>
                {isSelected && (
                  <div className="absolute -top-1 -right-1 bg-primary rounded-full p-1 shadow-lg">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6 pt-4 border-t border-border-light">
          <button
            onClick={onClose}
            className="flex-1 btn-secondary"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 btn-primary flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Check className="w-4 h-4" />
                Save Avatar
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}