// ============================================
// SIMPLIFIED AVATAR SYSTEM - 6 Ready-Made
// ============================================

import { AVATARS, getAvatarById } from '../data/avatarData';

// Get avatar image URL by ID
export const getAvatarImage = (avatarId) => {
  const avatar = getAvatarById(avatarId);
  return avatar ? avatar.image : AVATARS[0].image;
};

// Get user avatar (prioritize real photo, then avatar)
export const getUserAvatar = (user) => {
  if (!user) return null;

  // If user has uploaded a real photo, use it
  if (user.profileImage) {
    return user.profileImage;
  }

  // If user has selected an avatar, use it
  if (user.avatarPreferences?.selectedAvatar) {
    return getAvatarImage(user.avatarPreferences.selectedAvatar);
  }

  // Fallback to default avatar (avatar1)
  return AVATARS[0].image;
};

// Get all avatars list
export const getAvatars = () => {
  return AVATARS;
};

// Get avatar by ID
export const getAvatar = (id) => {
  return getAvatarById(id);
};