import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export function useBackNavigation(enabled = true): void {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!enabled) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
      const isBack = event.key === 'Escape' || event.key === 'BrowserBack';
      const isBackspace = event.key === 'Backspace';

      const target = document.activeElement;
      const editable =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        (target instanceof HTMLElement && target.isContentEditable);

      if (!isBack && !(isBackspace && !editable)) return;

      event.preventDefault();
      if (location.pathname !== '/') {
        navigate(-1);
      } else {
        navigate('/');
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [enabled, location.pathname, navigate]);
}
