import { Box, Typography } from '@mui/material';
import CustomizableTable from 'src/components/customizable-table';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetIssuedBooksQuery } from 'src/redux/book-issued-data/bookIssuedDataApi';

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
        isLoading={yearLoading}
        noDataText="Issued Book Data Not Found"
        columns={[
          { id: 'memberName', label: 'Member Name', align: 'left', minWidth: '150px' },
          { id: 'memberId', label: 'Member ID', align: 'left', minWidth: '120px' },
          { id: 'role', label: 'Role', align: 'left' },
          { id: 'classNo', label: 'Class', align: 'left', minWidth: '80px' },
          { id: 'division', label: 'Division', align: 'left', minWidth: '80px' },
          { id: 'accessionNo', label: 'Accession No.', align: 'left', minWidth: '150px' },
          {
            id: 'issuedOn',
            label: 'Issued on',
            align: 'left',
            filterType: 'date',
            minWidth: '120px',
          },
          {
            id: 'returnOn',
            label: 'Return on',
            align: 'left',
            filterType: 'date',
            minWidth: '120px',
          },
        ]}
        data={issuedBooks || []}
      />
    </Box>
  );
};

export default IssuedBooksTable;
