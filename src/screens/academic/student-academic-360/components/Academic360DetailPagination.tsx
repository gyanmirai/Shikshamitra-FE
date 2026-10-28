import TablePagination from '@mui/material/TablePagination';

type Props = {
  count: number;
  page: number;
  pageSize: number;
  onChange: (page: number) => void;
};

export function Academic360DetailPagination({ count, page, pageSize, onChange }: Props) {
  return (
    <TablePagination
      component="div"
      count={count}
      page={page}
      rowsPerPage={pageSize}
      rowsPerPageOptions={[pageSize]}
      onPageChange={(_event, nextPage) => onChange(nextPage)}
      sx={{ flexShrink: 0, borderTop: 1, borderColor: 'divider', bgcolor: 'background.paper' }}
    />
  );
}
