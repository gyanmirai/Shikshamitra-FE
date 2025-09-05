import type { LabelColor } from 'src/components/label';

import { Label } from 'src/components/label';
import { Box, Typography } from '@mui/material';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetIssuedBooksQuery } from 'src/redux/bookIssuedData/bookIssuedDataApi';
import {
  LibraryBookStatus,
  LibraryBookStatusColors,
  LibraryBookStatusOptions,
} from 'src/enums/library-book-status';

const IssuedBooksTable = () => {
  const { data: issuedBooks, isLoading: yearLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetIssuedBooksQuery,
  });
  return (
    <Box p={2}>
      <Typography variant="h6" color="primary.main" gutterBottom>
        Issued Books
      </Typography>
      <CustomizableTable
        tableId="issued-books"
        noDataText="Issued Book Data Not Found"
        columns={[
          { id: 'memberId', label: 'Member ID', align: 'left' },
          { id: 'memberName', label: 'Member Name', align: 'left' },
          { id: 'copyNo', label: 'Copy No', align: 'left', filterType: 'number' },
          { id: 'issuedOn', label: 'Issued on', align: 'left', filterType: 'date' },
          { id: 'returnOn', label: 'Return on', align: 'left', filterType: 'date' },
          {
            id: 'status',
            label: 'Status',
            align: 'left',
            filterType: 'enum',
            enumOptions: LibraryBookStatusOptions,
            sticky: true,
            render(value, row) {
              const color = LibraryBookStatusColors[value as LibraryBookStatus];
              return <Label color={color as LabelColor}>{LibraryBookStatus[value]}</Label>;
            },
          },
        ]}
        data={issuedBooks || []}
      />
    </Box>
  );
};

export default IssuedBooksTable;
