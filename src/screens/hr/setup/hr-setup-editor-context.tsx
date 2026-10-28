'use client';

import type { DialogProps, DrawerProps } from '@mui/material';

import { Box, Dialog, Drawer, Typography } from '@mui/material';
import { useRef, useEffect, useContext, createContext } from 'react';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

export type SetupEditorState = {
  dirty: boolean;
  busy: boolean;
  save: (() => Promise<unknown> | void) | null;
  disabled?: boolean;
};
export const HrSetupEditorContext = createContext<((state: SetupEditorState) => void) | null>(null);
export const HrSetupTaskContext = createContext<((task: string) => void) | null>(null);
export const HrSetupNavigationContext = createContext<(action: () => void) => void>((action) =>
  action()
);

export function useHrSetupEditorState(state: SetupEditorState) {
  const report = useContext(HrSetupEditorContext);
  const save = useRef(state.save);
  save.current = state.save;
  const hasSave = Boolean(state.save);
  useEffect(() => {
    report?.({
      dirty: state.dirty,
      busy: state.busy,
      disabled: state.disabled,
      save: hasSave ? () => save.current?.() : null,
    });
  }, [report, state.dirty, state.busy, state.disabled, hasSave]);
  useEffect(() => () => report?.({ dirty: false, busy: false, save: null }), [report]);
  return Boolean(report);
}

export const useHrSetupEmbedded = () => Boolean(useContext(HrSetupEditorContext));

// Embedded editors use the wizard's one scroll container and one dirty-state owner.
export function SetupEditorBody({
  children,
  onSubmit,
  ...props
}: React.ComponentProps<typeof DialogScrollContent>) {
  return useHrSetupEmbedded() ? (
    <Box
      onKeyDown={(event) => {
        if (onSubmit && event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
          event.preventDefault();
          onSubmit();
        }
      }}
    >
      {children}
    </Box>
  ) : (
    <DialogScrollContent onSubmit={onSubmit} {...props}>
      {children}
    </DialogScrollContent>
  );
}

export function SetupEditorGuard({
  children,
  ...props
}: React.ComponentProps<typeof BackPopUpChecked>) {
  return useHrSetupEmbedded() ? (
    <>{children}</>
  ) : (
    <BackPopUpChecked {...props}>{children}</BackPopUpChecked>
  );
}

export function SetupEditorActions({ children }: { children: React.ReactNode }) {
  return useHrSetupEmbedded() ? null : <>{children}</>;
}

export function SetupInlineDialog({ children, ...props }: DialogProps) {
  return useHrSetupEmbedded() ? (
    props.open ? (
      <Box role="region">{children}</Box>
    ) : null
  ) : (
    <Dialog {...props}>{children}</Dialog>
  );
}

export function SetupInlineDrawer({ children, ...props }: DrawerProps) {
  return useHrSetupEmbedded() ? (
    props.open ? (
      <Box role="region">{children}</Box>
    ) : null
  ) : (
    <Drawer {...props}>{children}</Drawer>
  );
}

export function SetupInlineCustomDialog({
  children,
  title,
  ...props
}: React.ComponentProps<typeof CustomDialog>) {
  return useHrSetupEmbedded() ? (
    props.open ? (
      <Box role="region">
        <Typography variant="subtitle1">{title}</Typography>
        {children}
      </Box>
    ) : null
  ) : (
    <CustomDialog title={title} {...props}>
      {children}
    </CustomDialog>
  );
}
