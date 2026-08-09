// ============================================
// WHATSAPP STYLE 3D AVATARS
// Using DiceBear - Reliable and Beautiful
// ============================================

export const AVATARS = [
  {
    id: 'avatar1',
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Avatar1&backgroundColor=transparent&skinColor=F5D0B8&hairColor=4A2F1A&hair=longHair&clothing=blazer&clothingColor=6C63FF&accessories=round',
  },
  {
    id: 'avatar2',
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Avatar2&backgroundColor=transparent&skinColor=F5D0B8&hairColor=1A1A1A&hair=shortHair&clothing=hoodie&clothingColor=FF6B9D&accessories=blank',
  },
  {
    id: 'avatar3',
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Avatar3&backgroundColor=transparent&skinColor=D4A574&hairColor=8B6914&hair=curlyHair&clothing=shirt&clothingColor=00D4FF&accessories=prescription01',
  },
  {
    id: 'avatar4',
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Avatar4&backgroundColor=transparent&skinColor=C68642&hairColor=6B4226&hair=shortHair&clothing=graphicShirt&clothingColor=FF4757&accessories=blank',
  },
  {
    id: 'avatar5',
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Avatar5&backgroundColor=transparent&skinColor=F5D0B8&hairColor=E74C8B&hair=longHair&clothing=blazer&clothingColor=2ECC71&accessories=round',
  },
  {
    id: 'avatar6',
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Avatar6&backgroundColor=transparent&skinColor=8D5524&hairColor=1A1A1A&hair=shortHair&clothing=hoodie&clothingColor=F39C12&accessories=blank',
  },
  {
    id: 'avatar7',
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Avatar7&backgroundColor=transparent&skinColor=F5D0B8&hairColor=8E44AD&hair=longHair&clothing=shirt&clothingColor=3498DB&accessories=prescription02',
  },
  {
    id: 'avatar8',
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Avatar8&backgroundColor=transparent&skinColor=D4A574&hairColor=4A2F1A&hair=shortHair&clothing=graphicShirt&clothingColor=1ABC9C&accessories=blank',
  },
  {
    id: 'avatar9',
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Avatar9&backgroundColor=transparent&skinColor=C68642&hairColor=C0392B&hair=longHair&clothing=blazer&clothingColor=E91E63&accessories=round',
  },
  {
    id: 'avatar10',
    image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Avatar10&backgroundColor=transparent&skinColor=8D5524&hairColor=6B4226&hair=shortHair&clothing=hoodie&clothingColor=9B59B6&accessories=blank',
  },
];

export const getAvatarById = (id) => {
  return AVATARS.find(avatar => avatar.id === id) || AVATARS[0];
};

export const getAvatarImage = (id) => {
  const avatar = getAvatarById(id);
  return avatar ? avatar.image : AVATARS[0].image;
};

export const getAvatars = () => AVATARS;