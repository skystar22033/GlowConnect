import { useTheme } from '../../context/ThemeContext';
import { Moon, Sun } from 'lucide-react';

export default function DarkModeToggle() {
  const { darkMode, toggleDarkMode } = useTheme();

  return (
    <button
      onClick={toggleDarkMode}
      className="flex items-center gap-2 p-2 rounded-lg hover:bg-surface-raised transition"
    >
      {darkMode ? (
        <Sun className="w-4 h-4 text-yellow-400" />
      ) : (
        <Moon className="w-4 h-4 text-primary" />
      )}
      <span className="text-sm">{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
    </button>
  );
}