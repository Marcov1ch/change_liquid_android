import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { truncateNickname } from '../utils/nickname';

export function HomeHeader() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="z-30 shrink-0 bg-surface-container border-b border-outline-variant shadow-md3-1">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1A6DFF" strokeWidth="1.5" strokeLinecap="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
          </svg>
          <h1 className="text-title-md text-surface-on m-0">ChangeLiquid</h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/profile')}
            className="relative md3-btn-tonal !py-2 !px-4 !rounded-md3-sm text-label-sm shadow-md3-3"
            aria-label={user && !user.profile_visited ? 'Профиль: требуется настройка' : 'Профиль'}
            title={user && !user.profile_visited ? 'Загляните в профиль и выберите валюту' : undefined}
          >
            {user?.username ? truncateNickname(user.username) : 'Профиль'}
            {user && !user.profile_visited && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
