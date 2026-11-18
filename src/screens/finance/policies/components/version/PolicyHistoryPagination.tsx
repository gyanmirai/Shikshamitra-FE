import { TablePagination } from '@mui/material';

export default function PolicyHistoryPagination({ page, pageSize, totalCount, isLoading, onPageChange }: {
  page: number;
  pageSize: number;
  totalCount: number;
  isLoading: boolean;
  onPageChange: (page: number) => void;
}) {
  return (
    <TablePagination
      component="div"
      role="navigation"
      aria-label="Policy history pages"
      count={totalCount}
      page={totalCount ? Math.min(page, Math.ceil(totalCount / pageSize) - 1) : 0}
      rowsPerPage={pageSize}
      rowsPerPageOptions={[]}
      onPageChange={(_event, next) => onPageChange(next)}
      disabled={isLoading}
      sx={{ flex: 1, minWidth: 0, '& .MuiTablePagination-toolbar': { px: 0, minHeight: 36 } }}
    />
  );
}
