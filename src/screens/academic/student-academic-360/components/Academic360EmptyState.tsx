'use client';

import { EmptyContent } from 'src/components/empty-content';

type Academic360EmptyStateProps = {
  title: string;
  description?: string;
  compact?: boolean;
};

export function Academic360EmptyState({
  title,
  description,
  compact = false,
}: Academic360EmptyStateProps) {
  return (
    <EmptyContent
      title={title}
      description={description}
      sx={{ py: compact ? 2 : 3, height: 'auto', minWidth: 0 }}
      slotProps={{
        img: { maxWidth: compact ? 96 : 160 },
        description: { maxWidth: 340, overflowWrap: 'anywhere' },
      }}
    />
  );
}
