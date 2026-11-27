import type { DrawerProps } from '@mui/material/Drawer';
import type { ButtonProps } from '@mui/material/Button';

import { it, vi, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useDefaultProps } from '@mui/system/DefaultPropsProvider';

import { StudentDrawerMotionProvider } from './student-drawer-motion-provider';

const media = vi.hoisted(() => ({ reduce: false }));
vi.mock('@mui/material/useMediaQuery', () => ({ default: () => media.reduce }));

function DefaultsProbe({ id }: { id: string }) {
  const drawer = useDefaultProps<Partial<DrawerProps>>({ props: {}, name: 'MuiDrawer' });
  const button = useDefaultProps<Partial<ButtonProps>>({ props: {}, name: 'MuiButton' });

  return (
    <output data-testid={id}>
      {JSON.stringify({
        duration: drawer.transitionDuration,
        slots: drawer.slotProps,
        size: button.size,
      })}
    </output>
  );
}

it.each([
  { reduce: false, duration: { enter: 240, exit: 180 } },
  { reduce: true, duration: 0 },
])('scopes the Drawer defaults to Student (reduced motion: $reduce)', ({ reduce, duration }) => {
  media.reduce = reduce;
  const theme = createTheme({ components: { MuiButton: { defaultProps: { size: 'small' } } } });

  render(
    <ThemeProvider theme={theme}>
      <DefaultsProbe id="outside" />
      <StudentDrawerMotionProvider>
        <DefaultsProbe id="inside" />
      </StudentDrawerMotionProvider>
    </ThemeProvider>
  );

  expect(JSON.parse(screen.getByTestId('outside').textContent || '{}')).toEqual({ size: 'small' });
  expect(JSON.parse(screen.getByTestId('inside').textContent || '{}')).toEqual({
    duration,
    slots: { transition: { appear: true } },
    size: 'small',
  });
});
