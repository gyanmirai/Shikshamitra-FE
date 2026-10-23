'use client';

import type { Ref, ReactNode } from 'react';
import type { AlertProps } from '@mui/material';

import { Iconify } from 'src/components/iconify';
import { shikshaMitraToast } from 'src/components/toast';
import { Box, Alert, Stack, IconButton } from '@mui/material';
import { useRef, useEffect, useContext, createContext, isValidElement } from 'react';

type Presentation = 'toast' | 'inline' | 'persistent';

export type StudentFeedbackProps = AlertProps & {
  /** Stable source identifier, independent of React render identity. */
  notificationKey: string;
  /** Request failures use toast; inline/persistent are reserved for local validation and business state. */
  presentation?: Presentation;
  closeDisabled?: boolean;
  ref?: Ref<HTMLDivElement>;
  /** Additional identity for persisted user-specific notices or record-specific contexts. */
  scopeKey?: string;
};

const FeedbackScope = createContext<string | null>(null);

export function StudentFeedbackProvider({
  scopeKey,
  children,
}: {
  scopeKey: string;
  children: ReactNode;
}) {
  return <FeedbackScope.Provider value={scopeKey}>{children}</FeedbackScope.Provider>;
}

function messageText(node: ReactNode): string {
  if (node == null || typeof node === 'boolean') return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(messageText).join(' ');
  if (isValidElement<{ children?: ReactNode }>(node)) return messageText(node.props.children);
  return '';
}

type ActiveNotice = {
  owners: number;
  toastId: ReturnType<typeof shikshaMitraToast.info>;
  releaseTimer?: ReturnType<typeof setTimeout>;
};

// Entries exist only while the condition is mounted. The deferred release bridges React
// StrictMode's effect replay, without suppressing a later, genuinely new failed operation.
const activeNotices = new Map<string, ActiveNotice>();

function acquireNotice(key: string, show: () => ActiveNotice['toastId']) {
  let entry = activeNotices.get(key);
  if (entry) {
    clearTimeout(entry.releaseTimer);
    entry.releaseTimer = undefined;
    entry.owners += 1;
  } else {
    entry = { owners: 1, toastId: show() };
    activeNotices.set(key, entry);
  }
  const retained = entry;
  return () => {
    retained.owners -= 1;
    if (retained.owners !== 0) return;
    retained.releaseTimer = setTimeout(() => {
      if (retained.owners !== 0) return;
      if (retained.toastId != null) shikshaMitraToast.dismiss(retained.toastId);
      if (activeNotices.get(key) === retained) activeNotices.delete(key);
    }, 0);
  };
}

/** Student notices use the application toast; required local states have no banner surface. */
export function StudentFeedback({
  notificationKey,
  scopeKey: noticeScope,
  presentation = 'toast',
  severity = 'success',
  children,
  action,
  onClose,
  closeText = 'Close',
  closeDisabled = false,
  sx,
  role,
  id,
  ref,
  tabIndex,
  'aria-label': ariaLabel,
}: StudentFeedbackProps) {
  const scope = useContext(FeedbackScope);
  const latest = useRef({ children, onClose, closeDisabled, closeText });
  const text = messageText(children).replace(/\s+/g, ' ').trim();
  // Identical notices in nested/sibling regions share an announcement. JSX identity,
  // event handlers, sx and loading/disabled action changes do not create new events.
  const signature = JSON.stringify([scope, noticeScope, severity, text || notificationKey]);

  useEffect(() => {
    latest.current = { children, onClose, closeDisabled, closeText };
  }, [children, onClose, closeDisabled, closeText]);

  useEffect(() => {
    if (presentation === 'inline' || !text) return undefined;
    return acquireNotice(signature, () =>
      shikshaMitraToast[severity]({
        message: latest.current.children,
        alertProps: (toastId: string | number) => ({
          closeText: latest.current.closeText,
          onClose: (event: React.SyntheticEvent) => {
            if (latest.current.closeDisabled) return;
            latest.current.onClose?.(event);
            shikshaMitraToast.dismiss(toastId);
          },
        }),
      })
    );
  }, [presentation, severity, signature, text]);

  // A toast must not leave an orphan Retry/Reload row in the page. Local validation
  // and business blockers explicitly opt into inline/persistent presentation below.
  if (presentation === 'toast') return null;

  return (
    <Stack
      data-student-feedback={notificationKey}
      spacing={1}
      sx={sx}
      id={id}
      ref={ref}
      tabIndex={tabIndex}
      role={role}
      aria-label={ariaLabel}
    >
      <Box
        sx={{
          typography: 'body2',
          color: severity === 'error' ? 'error.main' : 'text.secondary',
          overflowWrap: 'anywhere',
        }}
      >
        {children}
      </Box>
      {(action || onClose) && (
        <Stack direction="row" justifyContent="flex-end" alignItems="center" spacing={1}>
          {action}
          {onClose && (
            <IconButton
              aria-label={closeText}
              size="small"
              disabled={closeDisabled}
              onClick={onClose}
            >
              <Iconify icon="mdi:close" width={18} />
            </IconButton>
          )}
        </Stack>
      )}
    </Stack>
  );
}

/** Shared tables retain their existing behavior outside the Student workspace. */
export function StudentScopedFeedback(props: StudentFeedbackProps) {
  const scope = useContext(FeedbackScope);
  const { notificationKey, presentation, closeDisabled, scopeKey, ...alertProps } = props;
  return scope == null ? (
    <Alert {...alertProps} />
  ) : (
    <StudentFeedback {...props} presentation="toast" />
  );
}
