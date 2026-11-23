import { useEffect } from 'react';

type Direction = 'up' | 'down' | 'left' | 'right';

const FOCUSABLE_SELECTOR = '[data-focusable]';

function isEditable(element: Element | null): boolean {
  if (!element) return false;
  if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) return true;
  return element instanceof HTMLElement && element.isContentEditable;
}

function isUsable(element: HTMLElement): boolean {
  if (element.hasAttribute('disabled')) return false;
  if (element.getAttribute('aria-hidden') === 'true') return false;
  if (element.closest('[aria-hidden="true"]')) return false;
  const rect = element.getBoundingClientRect();
  if (rect.width < 2 || rect.height < 2) return false;
  const style = window.getComputedStyle(element);
  return style.visibility !== 'hidden' && style.display !== 'none' && Number(style.opacity) !== 0;
}

function activeScope(): HTMLElement {
  const overlays = Array.from(document.querySelectorAll<HTMLElement>('[data-nav-scope="overlay"]'));
  for (let index = overlays.length - 1; index >= 0; index -= 1) {
    const overlay = overlays[index];
    if (overlay.getClientRects().length > 0 && window.getComputedStyle(overlay).display !== 'none') {
      return overlay;
    }
  }
  return document.body;
}

function collectCandidates(scope: HTMLElement): HTMLElement[] {
  return Array.from(scope.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(isUsable);
}

function overlap(aStart: number, aEnd: number, bStart: number, bEnd: number): number {
  return Math.min(aEnd, bEnd) - Math.max(aStart, bStart);
}

function focusElement(element: HTMLElement): void {
  element.focus({ preventScroll: true });
  element.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
}

function moveFocus(direction: Direction): void {
  const scope = activeScope();
  const candidates = collectCandidates(scope);
  if (candidates.length === 0) return;

  const current = document.activeElement as HTMLElement | null;
  if (!current || current === document.body || !candidates.includes(current)) {
    const fallback = candidates.find((element) => element.hasAttribute('data-autofocus')) ?? candidates[0];
    focusElement(fallback);
    return;
  }

  const currentRect = current.getBoundingClientRect();
  const horizontal = direction === 'left' || direction === 'right';
  let best: HTMLElement | null = null;
  let bestScore = Number.POSITIVE_INFINITY;

  for (const candidate of candidates) {
    if (candidate === current) continue;

    const rect = candidate.getBoundingClientRect();
    const currentCenterX = currentRect.left + currentRect.width / 2;
    const currentCenterY = currentRect.top + currentRect.height / 2;
    const candidateCenterX = rect.left + rect.width / 2;
    const candidateCenterY = rect.top + rect.height / 2;

    let primary = 0;
    let gap = 0;

    if (horizontal) {
      const deltaX = candidateCenterX - currentCenterX;
      if (direction === 'right' && deltaX <= 1) continue;
      if (direction === 'left' && deltaX >= -1) continue;
      primary = Math.abs(deltaX);
      const verticalOverlap = overlap(currentRect.top, currentRect.bottom, rect.top, rect.bottom);
      gap = verticalOverlap >= 0 ? 0 : -verticalOverlap;
    } else {
      const deltaY = candidateCenterY - currentCenterY;
      if (direction === 'down' && deltaY <= 1) continue;
      if (direction === 'up' && deltaY >= -1) continue;
      primary = Math.abs(deltaY);
      const horizontalOverlap = overlap(currentRect.left, currentRect.right, rect.left, rect.right);
      gap = horizontalOverlap >= 0 ? 0 : -horizontalOverlap;
    }

    const score = primary + gap * 2.6;
    if (score < bestScore) {
      bestScore = score;
      best = candidate;
    }
  }

  if (best) focusElement(best);
}

export function useSpatialNavigation(enabled = true): void {
  useEffect(() => {
    if (!enabled) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;

      const key = event.key;
      const isArrow = key === 'ArrowUp' || key === 'ArrowDown' || key === 'ArrowLeft' || key === 'ArrowRight';
      if (!isArrow) return;

      if (isEditable(document.activeElement) && (key === 'ArrowLeft' || key === 'ArrowRight')) {
        return;
      }

      event.preventDefault();
      const direction = key.replace('Arrow', '').toLowerCase() as Direction;
      moveFocus(direction);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [enabled]);
}
