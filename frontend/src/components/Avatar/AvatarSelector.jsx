import { useState } from 'react';
import { X, Check, Sparkles, RefreshCw, Loader2, User } from 'lucide-react';
import { 
  getAvatarUrl, 
  SKIN_COLORS, 
  HAIR_COLORS, 
  OUTFIT_COLORS,
  STYLE_OPTIONS 
} from '../../utils/avatar';

export default function AvatarSelector({ user, onSave, onClose, loading = false }) {
  const [selectedStyle, setSelectedStyle] = useState(
    user?.avatarPreferences?.style || 'avataaars'
  );
  const [skinColor, setSkinColor] = useState(
    user?.avatarPreferences?.skinColor || '#F5D0B8'
  );
  const [hairColor, setHairColor] = useState(
    user?.avatarPreferences?.hairColor || '#1A1A1A'
  );
  const [outfitColor, setOutfitColor] = useState(
    user?.avatarPreferences?.outfitColor || '#2C3E50'
  );

  // Generate preview URL
  const previewUrl = getAvatarUrl(user?.username || 'preview', {
    style: selectedStyle,
    skinColor,
    hairColor,
    outfitColor,
    size: 300,
  });

  const handleSave = () => {
    const preferences = {
      style: selectedStyle,
      skinColor,
      hairColor,
      outfitColor,
    };
    onSave(preferences);
  };

  const randomize = () => {
    const randomSkin = SKIN_COLORS[Math.floor(Math.random() * SKIN_COLORS.length)];
    const randomHair = HAIR_COLORS[Math.floor(Math.random() * HAIR_COLORS.length)];
    const randomOutfit = OUTFIT_COLORS[Math.floor(Math.random() * OUTFIT_COLORS.length)];
    const randomStyle = STYLE_OPTIONS[Math.floor(Math.random() * STYLE_OPTIONS.length)];

    setSkinColor(randomSkin.value);
    setHairColor(randomHair.value);
    setOutfitColor(randomOutfit.value);
    setSelectedStyle(randomStyle.id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-surface max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl border border-border-light p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-full">
              <User className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-xl font-bold font-display text-text-primary">Customize Avatar</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-surface-raised transition"
          >
            <X className="w-5 h-5 text-text-muted" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Preview */}
          <div className="flex flex-col items-center">
            <div className="relative">
              <div className="w-64 h-64 rounded-2xl shadow-xl overflow-hidden bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-primary/20">
                <img
                  src={previewUrl}
                  alt="Avatar Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = `https://ui-avatars.com/api/?name=${user?.username || 'User'}&background=7C3AED&color=fff&size=256`;
                  }}
                />
              </div>
              <button
                onClick={randomize}
                className="absolute -bottom-3 -right-3 p-2.5 bg-primary rounded-full shadow-lg hover:scale-110 transition-transform"
              >
                <RefreshCw className="w-4 h-4 text-white" />
              </button>
            </div>
            <div className="mt-4 text-center">
              <p className="text-sm font-medium text-text-primary">Your Avatar</p>
              <button
                onClick={randomize}
                className="mt-1 text-xs text-primary hover:underline font-medium"
              >
                🎲 Randomize
              </button>
            </div>
          </div>

          {/* Right: Customization */}
          <div className="space-y-5">
            {/* Style */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Style
              </label>
              <div className="grid grid-cols-2 gap-2">
                {STYLE_OPTIONS.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => setSelectedStyle(style.id)}
                    className={`p-3 rounded-xl border-2 transition-all text-left ${
                      selectedStyle === style.id
                        ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                        : 'border-border hover:border-border-dark hover:bg-surface-raised'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{style.icon}</span>
                      <div>
                        <p className="text-sm font-medium text-text-primary">{style.label}</p>
                        <p className="text-xs text-text-muted">{style.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Skin */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Skin Color
              </label>
              <div className="flex gap-2 flex-wrap">
                {SKIN_COLORS.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setSkinColor(color.value)}
                    className={`w-9 h-9 rounded-full border-2 transition-all ${
                      skinColor === color.value
                        ? 'border-primary scale-110 ring-2 ring-primary/30 shadow-md'
                        : 'border-border hover:scale-105'
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            {/* Hair */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Hair Color
              </label>
              <div className="flex gap-2 flex-wrap">
                {HAIR_COLORS.slice(0, 10).map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setHairColor(color.value)}
                    className={`w-9 h-9 rounded-full border-2 transition-all ${
                      hairColor === color.value
                        ? 'border-primary scale-110 ring-2 ring-primary/30 shadow-md'
                        : 'border-border hover:scale-105'
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            {/* Outfit */}
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                Outfit Color
              </label>
              <div className="flex gap-2 flex-wrap">
                {OUTFIT_COLORS.slice(0, 10).map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setOutfitColor(color.value)}
                    className={`w-9 h-9 rounded-full border-2 transition-all ${
                      outfitColor === color.value
                        ? 'border-primary scale-110 ring-2 ring-primary/30 shadow-md'
                        : 'border-border hover:scale-105'
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>
          </div>
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
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Check className="w-4 h-4" />
            )}
            Save Avatar
          </button>
        </div>
      </div>
    </div>
  );
}