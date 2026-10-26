import type { MenuProps } from '@mui/material/Menu';
import type { FormControlProps } from '@mui/material/FormControl';

import { useForkRef } from '@mui/material/utils';
import { useRef, useState, useEffect } from 'react';

export function useSearchMenu(
  enabled: boolean,
  menuProps: Partial<MenuProps> | undefined,
  forwardedRef: FormControlProps['ref']
) {
  const controlRef = useRef<HTMLDivElement>(null);
  const ref = useForkRef(controlRef, forwardedRef);
  const [width, setWidth] = useState<number>();

  useEffect(() => {
    const control = controlRef.current;
    if (!enabled || !control) return undefined;
    const measure = () => setWidth(control.getBoundingClientRect().width || undefined);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(control);
    return () => observer.disconnect();
  }, [enabled]);

  const searchMenuProps: Partial<MenuProps> = {
    autoFocus: false,
    disableAutoFocusItem: true,
    ...menuProps,
    slotProps: {
      ...menuProps?.slotProps,
      paper: (ownerState) => {
        const slot = menuProps?.slotProps?.paper;
        const paperProps = typeof slot === 'function' ? slot(ownerState) : slot;
        const sx = paperProps?.sx ?? menuProps?.PaperProps?.sx;
        return {
          ...paperProps,
          style: {
            width,
            minWidth: 0,
            maxWidth: 'calc(100% - 32px)',
            ...menuProps?.PaperProps?.style,
            ...paperProps?.style,
          },
          sx: [
            {
              bgcolor: 'background.paper',
              backgroundImage: 'none',
              maxHeight: 'min(320px, calc(100% - 32px))',
              '& .MuiMenu-list': { maxHeight: 'none' },
              '& .MuiMenuItem-root': { whiteSpace: 'normal', overflowWrap: 'anywhere' },
            },
            ...(Array.isArray(sx) ? sx : [sx]),
          ],
        };
      },
    },
  };

  return { ref, menuProps: enabled ? searchMenuProps : menuProps };
}
