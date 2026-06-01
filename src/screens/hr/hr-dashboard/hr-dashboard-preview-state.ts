export const shouldShowDashboardSnapshotSkeleton = ({
  status,
  isFetching,
  hasPreview,
}: {
  status?: string;
  isFetching: boolean;
  hasPreview: boolean;
}) => status === 'Refreshing' || (isFetching && !hasPreview);

export const getDashboardSnapshotEmptyStateCopy = ({
  status,
  isRefreshing,
}: {
  status?: string;
  isRefreshing?: boolean;
}) => {
  const failed = status === 'Failed';
  const refreshing = status === 'Refreshing' || isRefreshing;

  if (failed) {
    return {
      title: 'Dashboard snapshot is not available',
      description:
        'The last refresh could not build a saved view. Start another refresh and keep using the HR screens below while it runs.',
      tone: 'error' as const,
      icon: 'solar:danger-triangle-linear',
    };
  }

  if (refreshing) {
    return {
      title: 'Preparing HR dashboard snapshot',
      description:
        'Refresh is running in the background. This page will update automatically when the saved view is ready.',
      tone: 'warning' as const,
      icon: 'solar:refresh-linear',
    };
  }

  return {
    title: 'No HR dashboard snapshot yet',
    description:
      'Start a refresh to prepare the saved HR view. Daily scheduled refresh will also prepare this automatically.',
    tone: 'info' as const,
    icon: 'solar:database-linear',
  };
};
