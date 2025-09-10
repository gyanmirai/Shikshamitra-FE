import { Box, Typography } from '@mui/material';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetIssuedBooksQuery } from 'src/redux/bookIssuedData/bookIssuedDataApi';

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
          { id: 'memberId', label: 'Member ID', align: 'left' },
          { id: 'memberName', label: 'Member Name', align: 'left' },
          { id: 'role', label: 'Role', align: 'left' },
          { id: 'copyNo', label: 'Copy No', align: 'left', filterType: 'number' },
          { id: 'issuedOn', label: 'Issued on', align: 'left', filterType: 'date' },
          { id: 'returnOn', label: 'Return on', align: 'left', filterType: 'date' },
        ]}
        data={issuedBooks || []}
      />
    </Box>
  );
};

export default IssuedBooksTable;
