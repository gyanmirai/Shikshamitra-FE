import { useRef, useState, useEffect, useCallback } from 'react';
import { renderUnsavedConfirmation } from 'src/components/confirm-dialog/render-unsaved-confirmation';

import { useUnsavedRouteGuard } from './use-unsaved-route-guard';
import { useAcademicContextGuard } from './use-academic-context-guard';
import { UnsavedNavigationConfirmation } from './unsaved-navigation-confirmation';

type Options = {
  title?: string;
  description?: string;
  keepEditingLabel?: string;
  discardLabel?: string;
  push?: (href: string) => void;
  blockNavigation?: boolean;
  guardContextChanges?: boolean;
  onNavigationApproved?: () => void;
  onBeforeTraversal?: () => void;
  renderConfirmation?: (keepEditing: () => void, discard: () => void) => React.ReactNode;
};

export function useUnsavedNavigation(isDirty: boolean, options: Options = {}) {
  const { title, description, push, blockNavigation = false } = options;
  const guardContextChanges = options.guardContextChanges ?? false;
  const renderConfirmation =
    options.renderConfirmation ??
    (guardContextChanges
      ? (keepEditing: () => void, discard: () => void) =>
          renderUnsavedConfirmation(keepEditing, discard, {
            title,
            description,
            busy: blockNavigation,
          })
      : undefined);
  const [pending, setPending] = useState<(() => void) | null>(null);
  const approvedCallback = useRef(options.onNavigationApproved);
  approvedCallback.current = options.onNavigationApproved;
  /** Memoization Justification: Finance and Academic dialog close effects depend on this reset callback. */
  const cancelNavigation = useCallback(() => setPending(null), []);
  /** Memoization Justification: Route and academic guard subscriptions depend on this callback's dirty/busy snapshot. */
  const requestNavigation = useCallback(
    (proceed: () => void) => {
      if (blockNavigation) return;
      if (!isDirty) proceed();
      else setPending(() => proceed);
    },
    [isDirty, blockNavigation]
  );
  /** Memoization Justification: Local close owners depend on a stable approved-navigation callback. */
  const requestApprovedNavigation = useCallback(
    (proceed: () => void) =>
      requestNavigation(() => {
        approvedCallback.current?.();
        proceed();
      }),
    [requestNavigation]
  );
  const localRequestNavigation = options.onNavigationApproved
    ? requestApprovedNavigation
    : requestNavigation;

  useAcademicContextGuard(
    guardContextChanges,
    isDirty,
    blockNavigation,
    requestNavigation,
    options.onNavigationApproved
  );

  useEffect(() => {
    if (!isDirty && !blockNavigation) return undefined;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [isDirty, blockNavigation]);

  useUnsavedRouteGuard({
    dirty: isDirty,
    busy: blockNavigation,
    push,
    allowWithoutRouter: guardContextChanges,
    onBeforeTraversal: options.onBeforeTraversal,
    requestNavigation: guardContextChanges ? requestNavigation : localRequestNavigation,
  });

  const confirmation =
    pending && renderConfirmation ? (
      renderConfirmation(
        () => setPending(null),
        () => {
          if (blockNavigation) return;
          const proceed = pending;
          setPending(null);
          proceed();
        }
      )
    ) : pending ? (
      <UnsavedNavigationConfirmation
        title={title}
        description={description}
        busy={blockNavigation}
        keepEditingLabel={options.keepEditingLabel}
        discardLabel={options.discardLabel}
        onKeepEditing={() => setPending(null)}
        onDiscard={() => {
          if (blockNavigation) return;
          const proceed = pending;
          setPending(null);
          proceed();
        }}
      />
    ) : null;

  return { requestNavigation: localRequestNavigation, cancelNavigation, confirmation };
}
