import { getAvatarImage } from '../../data/avatarData';

export default function Avatar({ 
  src, 
  name, 
  size = 'md', 
  className = '', 
  username,
  avatarPreferences 
}) {
  // ✅ Priority 1: Real uploaded photo
  if (src && src.startsWith('http')) {
    return (
      <div className={`rounded-full overflow-hidden flex-shrink-0 bg-gradient-brand ${getSizeClass(size)} ${className}`}>
        <img
          src={src}
          alt={name || 'Avatar'}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  // ✅ Priority 2: Selected avatar
  if (avatarPreferences?.selectedAvatar) {
    const avatarUrl = getAvatarImage(avatarPreferences.selectedAvatar);
    return (
      <div className={`rounded-full overflow-hidden flex-shrink-0 bg-gradient-brand ${getSizeClass(size)} ${className}`}>
        <img
          src={avatarUrl}
          alt={name || 'Avatar'}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = `https://ui-avatars.com/api/?name=${name || 'User'}&background=6C63FF&color=fff&size=128&rounded=true`;
          }}
        />
      </div>
    );
  }

  // ✅ Priority 3: Generate based on username
  if (username) {
    const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}&backgroundColor=transparent`;
    return (
      <div className={`rounded-full overflow-hidden flex-shrink-0 bg-gradient-brand ${getSizeClass(size)} ${className}`}>
        <img
          src={avatarUrl}
          alt={name || 'Avatar'}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  // ✅ Priority 4: Fallback to initials
  return (
    <div className={`rounded-full overflow-hidden flex-shrink-0 bg-gradient-brand ${getSizeClass(size)} ${className}`}>
      <div className="w-full h-full flex items-center justify-center text-white font-bold text-2xl">
        {name?.charAt(0).toUpperCase() || 'U'}
      </div>
    </div>
  );
}

function getSizeClass(size) {
  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl',
    '2xl': 'w-20 h-20 text-2xl',
    '3xl': 'w-24 h-24 text-3xl',
    '4xl': 'w-32 h-32 text-4xl',
  };
  return sizeClasses[size] || sizeClasses.md;
}