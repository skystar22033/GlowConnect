export const AVATAR_COLORS = {
  SKIN: [
    { name: 'Light', value: 'F5D0B8' },
    { name: 'Medium', value: 'D4A574' },
    { name: 'Tan', value: 'C68642' },
    { name: 'Brown', value: '8D5524' },
    { name: 'Dark', value: '6B3A1F' },
    { name: 'Deep', value: '4A2810' },
  ],
  HAIR: [
    { name: 'Black', value: '1A1A1A' },
    { name: 'Dark Brown', value: '4A2F1A' },
    { name: 'Brown', value: '6B4226' },
    { name: 'Light Brown', value: '8B6914' },
    { name: 'Blonde', value: 'F4D03F' },
    { name: 'Red', value: 'C0392B' },
    { name: 'Silver', value: 'BDC3C7' },
    { name: 'Blue', value: '2980B9' },
    { name: 'Pink', value: 'E74C8B' },
    { name: 'Purple', value: '8E44AD' },
    { name: 'Green', value: '27AE60' },
    { name: 'White', value: 'ECF0F1' },
  ],
  OUTFIT: [
    { name: 'Navy', value: '2C3E50' },
    { name: 'Red', value: 'E74C3C' },
    { name: 'Blue', value: '3498DB' },
    { name: 'Green', value: '2ECC71' },
    { name: 'Purple', value: '9B59B6' },
    { name: 'Pink', value: 'E91E63' },
    { name: 'Orange', value: 'F39C12' },
    { name: 'Teal', value: '1ABC9C' },
    { name: 'Grey', value: '95A5A6' },
    { name: 'Black', value: '2C3E50' },
    { name: 'White', value: 'ECF0F1' },
    { name: 'Yellow', value: 'F1C40F' },
  ],
  BACKGROUND: [
    { name: 'Gradient Purple', value: 'linear-gradient(135deg, #7C3AED, #EC4899)' },
    { name: 'Gradient Blue', value: 'linear-gradient(135deg, #3B82F6, #06B6D4)' },
    { name: 'Gradient Pink', value: 'linear-gradient(135deg, #EC4899, #F472B6)' },
    { name: 'Gradient Orange', value: 'linear-gradient(135deg, #F59E0B, #EF4444)' },
    { name: 'Gradient Green', value: 'linear-gradient(135deg, #10B981, #34D399)' },
    { name: 'Solid Navy', value: '#1E293B' },
    { name: 'Solid White', value: '#FFFFFF' },
    { name: 'Solid Black', value: '#0F172A' },
    { name: 'None', value: 'transparent' },
  ],
};

// Generate avatar URL with all customizations
export const generateAvatarUrl = (username, options = {}) => {
  const {
    style = 'avataaars',
    size = 256,
    skinColor = 'F5D0B8',
    hairColor = '1A1A1A',
    outfitColor = '2C3E50',
    backgroundColor = 'transparent',
  } = options;

  const seed = username || 'default';
  
  let url = `https://api.dicebear.com/7.x/${style}/svg`;
  const params = new URLSearchParams({
    seed,
    size: size.toString(),
    skinColor,
    hairColor,
    outfitColor,
  });
  
  // Only add backgroundColor if not transparent
  if (backgroundColor && backgroundColor !== 'transparent') {
    params.append('backgroundColor', backgroundColor.replace('#', ''));
  }
  
  return `${url}?${params.toString()}`;
};