import { Box, Button, Typography } from '@mui/material';

interface SubjectTableEmptyStateProps {
  hasSubjects: boolean;
  searchTerm: string;
  canAdd: boolean;
  onAllocate: () => void;
  onClearSearch: () => void;
}

export function SubjectTableEmptyState({
  hasSubjects,
  searchTerm,
  canAdd,
  onAllocate,
  onClearSearch,
}: SubjectTableEmptyStateProps) {
  const normalizedSearch = searchTerm.trim();

  if (hasSubjects) {
    return (
      <Box width="100%" display="flex" flexDirection="column" alignItems="center">
        <Typography variant="body2" color="text.secondary">
          {normalizedSearch
            ? `No results found for “${normalizedSearch}”.`
            : 'No subjects match the current filters.'}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
          Try a different search term or clear the current filters.
        </Typography>
        {normalizedSearch && (
          <Button variant="text" size="small" onClick={onClearSearch} sx={{ mt: 0.5 }}>
            Clear search
          </Button>
        )}
      </Box>
    );
  }

  return (
    <Box width="100%" display="flex" flexDirection="column" alignItems="center">
      <Typography variant="body2" color="text.secondary" mb={1}>
        No subjects allocated for this class yet.
      </Typography>
      {canAdd && (
        <Button variant="text" onClick={onAllocate}>
          + Allocate Subjects
        </Button>
      )}
    </Box>
  );
}
