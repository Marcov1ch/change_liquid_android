import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { isNavActive, NAV_ITEMS } from '../../theme/nav';

export function BottomNav() {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const needsSetup = user?.profile_visited === false;

  return (
    <nav
      className="shrink-0 fixed bottom-0 inset-x-0 z-40 bg-surface/95 backdrop-blur border-t border-outline-variant"
      aria-label="Основная навигация"
    >
      <div className="max-w-3xl mx-auto grid grid-cols-3 px-2 pt-1.5 sheet-safe">
        {NAV_ITEMS.map(item => {
          const Icon = item.icon;
          const active = isNavActive(pathname, item.to);
          const profileDot = item.to === '/profile' && needsSetup;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              aria-current={active ? 'page' : undefined}
              aria-label={profileDot ? 'Профиль: требуется настройка' : item.label}
              className={`flex flex-col items-center justify-center gap-0.5 min-h-[56px] rounded-md3-sm ${
                active ? 'text-primary-on-container' : 'text-surface-on-variant'
              }`}
            >
              <span className={`relative flex items-center justify-center w-16 h-7 rounded-md3-full ${active ? 'bg-primary-container' : ''}`}>
                <Icon size={22} weight={active ? 'fill' : 'regular'} />
                {profileDot && (
                  <span className="absolute top-0 right-3 w-2 h-2 rounded-md3-full bg-error ring-2 ring-surface" aria-hidden="true" />
                )}
              </span>
              <span className="text-[11px] font-medium leading-4">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
