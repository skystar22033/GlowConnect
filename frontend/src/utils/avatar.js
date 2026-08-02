// ============================================
// 3D AVATAR SYSTEM - Multi-API Support
// ============================================

// Available avatar styles with better options
export const AVATAR_STYLES = {
  // Better looking styles
  AVATAAARS: 'avataaars',
  MICAH: 'micah',
  OPEN_PEOPLE: 'open-peoples',
  PERSONAS: 'personas',
  LOREM_IPSUM: 'lorempixel',
};

// Better color palettes (matches WhatsApp style)
export const SKIN_COLORS = [
  { name: 'Porcelain', value: '#FFDFC4' },
  { name: 'Light', value: '#F5D0B8' },
  { name: 'Beige', value: '#E8B88A' },
  { name: 'Medium', value: '#D4A574' },
  { name: 'Tan', value: '#C68642' },
  { name: 'Brown', value: '#8D5524' },
  { name: 'Dark', value: '#6B3A1F' },
  { name: 'Deep', value: '#4A2810' },
  { name: 'Olive', value: '#B8A88A' },
  { name: 'Caramel', value: '#C49A6C' },
];

export const HAIR_COLORS = [
  { name: 'Black', value: '#1A1A1A' },
  { name: 'Dark Brown', value: '#4A2F1A' },
  { name: 'Brown', value: '#6B4226' },
  { name: 'Chestnut', value: '#8B5A2B' },
  { name: 'Light Brown', value: '#A67B4A' },
  { name: 'Blonde', value: '#F4D03F' },
  { name: 'Golden', value: '#E6B800' },
  { name: 'Red', value: '#C0392B' },
  { name: 'Auburn', value: '#8E1B1B' },
  { name: 'Silver', value: '#BDC3C7' },
  { name: 'Grey', value: '#7F8C8D' },
  { name: 'Blue', value: '#2980B9' },
  { name: 'Pink', value: '#E74C8B' },
  { name: 'Purple', value: '#8E44AD' },
  { name: 'Green', value: '#27AE60' },
  { name: 'White', value: '#ECF0F1' },
  { name: 'Teal', value: '#1ABC9C' },
  { name: 'Mint', value: '#2ECC71' },
];

export const OUTFIT_COLORS = [
  { name: 'Navy', value: '#1A2744' },
  { name: 'Royal Blue', value: '#2E59A0' },
  { name: 'Sky Blue', value: '#4A90D9' },
  { name: 'Teal', value: '#1ABC9C' },
  { name: 'Forest Green', value: '#27AE60' },
  { name: 'Olive', value: '#6B8E23' },
  { name: 'Crimson', value: '#C0392B' },
  { name: 'Rose', value: '#E74C8B' },
  { name: 'Purple', value: '#8E44AD' },
  { name: 'Lavender', value: '#9B59B6' },
  { name: 'Orange', value: '#F39C12' },
  { name: 'Gold', value: '#F1C40F' },
  { name: 'Grey', value: '#95A5A6' },
  { name: 'Black', value: '#2C3E50' },
  { name: 'White', value: '#ECF0F1' },
  { name: 'Pink', value: '#E91E63' },
];

// Generate avatar URL - Clean version
export const getAvatarUrl = (username, options = {}) => {
  const {
    style = 'avataaars',
    size = 256,
    skinColor = '#F5D0B8',
    hairColor = '#1A1A1A',
    outfitColor = '#2C3E50',
    backgroundColor = 'transparent',
  } = options;

  const seed = username || 'default';

  // Remove # from colors for DiceBear
  const cleanSkin = skinColor.replace('#', '');
  const cleanHair = hairColor.replace('#', '');
  const cleanOutfit = outfitColor.replace('#', '');
  const cleanBg = backgroundColor.replace('#', '');

  // Build URL
  let url = `https://api.dicebear.com/7.x/${style}/svg`;
  const params = new URLSearchParams({
    seed: seed,
    size: size.toString(),
    skinColor: cleanSkin,
    hairColor: cleanHair,
    outfitColor: cleanOutfit,
  });

  if (backgroundColor && backgroundColor !== 'transparent' && !backgroundColor.includes('gradient')) {
    params.append('backgroundColor', cleanBg);
  }

  return `${url}?${params.toString()}`;
};

// Get user avatar with priority order
export const getUserAvatar = (user) => {
  if (!user) return null;

  // 1. Real photo (highest priority)
  if (user.profileImage) {
    return user.profileImage;
  }

  // 2. Custom avatar preferences
  if (user.avatarPreferences) {
    return getAvatarUrl(user.username, {
      style: user.avatarPreferences.style || 'avataaars',
      skinColor: user.avatarPreferences.skinColor || '#F5D0B8',
      hairColor: user.avatarPreferences.hairColor || '#1A1A1A',
      outfitColor: user.avatarPreferences.outfitColor || '#2C3E50',
      backgroundColor: user.avatarPreferences.backgroundColor || 'transparent',
    });
  }

  // 3. Default avatar
  return getAvatarUrl(user.username);
};

// Get initials fallback
export const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.split(' ');
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

// Avatar style options with display names
export const STYLE_OPTIONS = [
  { id: 'avataaars', label: 'Cartoon', icon: '🧑', description: 'Fun cartoon style' },
  { id: 'micah', label: 'Realistic', icon: '👤', description: 'Realistic 3D look' },
  { id: 'open-peoples', label: 'Diverse', icon: '👥', description: 'Diverse characters' },
  { id: 'personas', label: 'Persona', icon: '🧑‍🎤', description: 'Stylish personas' },
];