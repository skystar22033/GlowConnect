import { getUserAvatar } from '../../utils/avatar';

export default function AvatarDisplay({ user, size = 'md', className = '', onClick }) {
  const avatarUrl = getUserAvatar(user);

  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl',
    '2xl': 'w-20 h-20 text-2xl',
    '3xl': 'w-28 h-28 text-3xl',
    '4xl': 'w-36 h-36 text-4xl',
    '5xl': 'w-48 h-48 text-5xl',
  };

  const sizeClass = sizeClasses[size] || sizeClasses.md;

  return (
    <div
      onClick={onClick}
      className={`rounded-full overflow-hidden flex-shrink-0 ${sizeClass} ${className} ${
        onClick ? 'cursor-pointer hover:opacity-80 transition' : ''
      }`}
    >
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={user?.username || 'Avatar'}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = `https://ui-avatars.com/api/?name=${user?.username || 'User'}&background=7C3AED&color=fff&size=256`;
          }}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gradient-brand text-white font-bold text-2xl">
          {user?.username?.charAt(0).toUpperCase() || 'U'}
        </div>
      )}
    </div>
  );
}