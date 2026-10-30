import type { ReactNode } from 'react';

import Button from '@mui/material/Button';

import { EmptyContent } from '../../empty-content';

interface Props {
  noDataText: ReactNode;
  tableWidth: number;
  searchTerm?: string;
  hasActiveFilters?: boolean;
  onClearCriteria?: () => void;
}

export default function TableEmptyState({
  noDataText,
  tableWidth,
  searchTerm = '',
  hasActiveFilters = false,
  onClearCriteria,
}: Props) {
  const stickyWidth = tableWidth || '100%';
  const normalizedSearchTerm = searchTerm.trim();
  const hasSearch = normalizedSearchTerm.length > 0;
  const isFilteredEmptyState = hasSearch || hasActiveFilters;
  const clearLabel =
    hasSearch && hasActiveFilters
      ? 'Clear search and filters'
      : hasSearch
        ? 'Clear search'
        : 'Clear filters';

  if (isFilteredEmptyState) {
    return (
      <EmptyContent
        slotProps={{ img: { maxWidth: { xs: 88, sm: 192 } } }}
        title={hasSearch ? `No results found for “${normalizedSearchTerm}”` : 'No results found'}
        description="Try different criteria or clear the active search and filters."
        action={
          onClearCriteria ? (
            <Button
              variant="outlined"
              color="inherit"
              size="small"
              onClick={onClearCriteria}
              sx={{ mt: { xs: 1, sm: 2 } }}
            >
              {clearLabel}
            </Button>
          ) : null
        }
        sx={{ width: stickyWidth, position: 'sticky', left: 0, p: 0 }}
      />
    );
  }

  return (
    <EmptyContent
      slotProps={{ img: { maxWidth: { xs: 88, sm: 192 } } }}
      title={noDataText}
      sx={{ width: stickyWidth, position: 'sticky', left: 0, p: 0 }}
    />
  );
}
