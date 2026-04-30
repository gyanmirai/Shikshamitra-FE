'use client';

import { useMemo, useContext, createContext } from 'react';

import { useSettingsContext } from './use-settings-context';
import { FONT_SIZE_MIN, FONT_SIZE_MAX, FONT_SIZE_DEFAULT } from '../config-settings';

// ----------------------------------------------------------------------

export type FontSizeContextValue = {
  fontSize: number;
  min: number;
  max: number;
  defaultFontSize: number;
  setFontSize: (value: number) => void;
  resetFontSize: () => void;
};

export const FontSizeContext = createContext<FontSizeContextValue | undefined>(undefined);

// ----------------------------------------------------------------------

type Props = { children: React.ReactNode };

/**
 * `FontSizeProvider` is a thin adapter over `SettingsProvider` that exposes
 * just the font-size slice of state through a dedicated context. It must be
 * rendered inside `SettingsProvider`.
 *
 * Persistence (localStorage) and SSR-safe hydration are already handled by
 * the underlying settings provider, so this provider does not duplicate that
 * logic.
 */
export function FontSizeProvider({ children }: Props) {
  const settings = useSettingsContext();

  const value = useMemo<FontSizeContextValue>(
    () => ({
      fontSize: clamp(settings.fontSize ?? FONT_SIZE_DEFAULT),
      min: FONT_SIZE_MIN,
      max: FONT_SIZE_MAX,
      defaultFontSize: FONT_SIZE_DEFAULT,
      setFontSize: (next: number) => settings.onUpdateField('fontSize', clamp(next)),
      resetFontSize: () => settings.onUpdateField('fontSize', FONT_SIZE_DEFAULT),
    }),
    [settings]
  );

  return <FontSizeContext.Provider value={value}>{children}</FontSizeContext.Provider>;
}

// ----------------------------------------------------------------------

function clamp(value: number): number {
  if (typeof value !== 'number' || Number.isNaN(value)) return FONT_SIZE_DEFAULT;
  return Math.min(FONT_SIZE_MAX, Math.max(FONT_SIZE_MIN, value));
}

// ----------------------------------------------------------------------

/**
 * Hook for reading and updating the global font size.
 *
 * Falls back to the underlying settings context when `FontSizeProvider` is
 * not mounted, so consumers always receive a working API.
 */
export function useFontSize(): FontSizeContextValue {
  const ctx = useContext(FontSizeContext);
  const settings = useSettingsContext();

  if (ctx) return ctx;

  // Fallback path - keeps the hook usable even without `FontSizeProvider`.
  return {
    fontSize: clamp(settings.fontSize ?? FONT_SIZE_DEFAULT),
    min: FONT_SIZE_MIN,
    max: FONT_SIZE_MAX,
    defaultFontSize: FONT_SIZE_DEFAULT,
    setFontSize: (next: number) => settings.onUpdateField('fontSize', clamp(next)),
    resetFontSize: () => settings.onUpdateField('fontSize', FONT_SIZE_DEFAULT),
  };
}
