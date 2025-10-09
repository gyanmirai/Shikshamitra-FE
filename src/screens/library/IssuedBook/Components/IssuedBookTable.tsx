import type { LabelColor } from 'src/components/label';
import type { UseBooleanReturn } from 'src/hooks/use-boolean';

import React from 'react';
import { Box } from '@mui/material';
import { Label } from 'src/components/label';
import CustomizableTable from 'src/components/customizabaleTable';
import { LibraryBookStatus, LibraryBookStatusColors } from 'src/enums/library-book-status'; // Make sure this import path is correct

import type { ILibraryBookData } from './type';

// const TABS = [
//   {
//     label: 'Issued',
//     value: LibraryBookStatus.Issued,
//     color: 'info',
//   },
//   {
//     label: 'Overdue',
//     value: LibraryBookStatus.Overdue,
//     color: 'error',
//   },
// ];

const BookIssueReturnTable = ({
  addDialog,
  data,
  onReturnBook,
}: {
  addDialog: UseBooleanReturn;
  data: ILibraryBookData[];
  onReturnBook: (row: ILibraryBookData) => void;
}) => {
  // const [tabValue, setTabValue] = useState(LibraryBookStatus.Issued);
  // const currentIndex = TABS.findIndex((tab) => tab.value === tabValue);

  // Count books by status for tab labels
  // const bookCounts = useMemo(
  //   () => ({
  //     issued: data?.filter((i) => i.status === LibraryBookStatus.Issued)?.length || 0,
  //     overdue: data?.filter((i) => i.status === LibraryBookStatus.Overdue)?.length || 0,
  //   }),
  //   [data]
  // );

  // Filter table data based on selected tab
  // const tableData = useMemo(() => data?.filter((i) => i.status === tabValue), [data, tabValue]);

  // const actions = useCallback(
  //   ({ popover: pop, row }: any) => (
  //     <MenuList>
  //       <MenuItem
  //         onClick={() => {
  //           onReturnBook(row);
  //           pop.onClose();
  //         }}
  //       >
  //         <Iconify icon="streamline:return-2-solid" sx={{ height: '16px', width: '16px' }} />
  //         Return Book
  //       </MenuItem>
  //     </MenuList>
  //   ),
  //   [onReturnBook]
  // );

  // For FormSlider navigation (optional: add back click logic if needed)
  const isBackClick = false;

  return (
    <Box>
      {/* <Box display="flex" justifyContent="space-between" sx={{ mb: 1 }}>
        <Tabs
          value={tabValue}
          onChange={(_, newValue) => setTabValue(newValue)}
          sx={{
            '& .MuiTabs-flexContainer': { gap: 2 },
            flexGrow: 1,
          }}
        >
          {TABS.map((tab) => (
            <Tab
              key={tab.value}
              label={
                <Box display="flex" alignItems="center" gap={1}>
                  {tab.label}
                  <Label color={tab.color as LabelColor}>
                    {tab.value === LibraryBookStatus.Issued
                      ? bookCounts.issued
                      : bookCounts.overdue}
                  </Label>
                </Box>
              }
              value={tab.value}
              sx={{ fontSize: '12px', ml: 2 }}
            />
          ))}
        </Tabs>
      </Box> */}
      {/* <FormSlider
        steps={TABS}
        isBackClick={isBackClick}
        step={currentIndex}
        containerProps={{
          sx: {
            p: 0,
          },
        }}
      > */}
      {/* <Scrollbar sx={{ p: 1 }}> */}
      <CustomizableTable
        tableId="library-book-table"
        noDataText="No Issue Book Data Found "
        columns={[
          {
            id: 'memberName',
            label: 'Member Name',
            align: 'left',
            minWidth: '140px',
            sticky: true,
          },
          { id: 'memberId', label: 'Member ID', align: 'left', minWidth: '120px' },
          { id: 'role', label: 'Role', align: 'left', minWidth: '100px' },
          { id: 'bookTitle', label: 'Book Title', align: 'left', minWidth: '120px' },
          { id: 'accessionNo', label: 'Accession No.', align: 'left', minWidth: '150px' },
          { id: 'classNo', label: 'Class', align: 'left', minWidth: '80px' },
          { id: 'division', label: 'Division', align: 'left', minWidth: '80px' },
          { id: 'grNo', label: 'GR No.', align: 'left', minWidth: '120px' },
          { id: 'contactNo', label: 'Contact No.', align: 'left', minWidth: '120px' },
          { id: 'bookCategory', label: 'Book Category', align: 'left', minWidth: '140px' },
          {
            id: 'requestedDate',
            label: 'Issue Date',
            align: 'left',
            filterType: 'date',
            minWidth: '120px',
          },
          {
            id: 'dueDate',
            label: 'Due Date',
            align: 'left',
            filterType: 'date',
            minWidth: '120px',
          },
          {
            id: 'status',
            label: 'Status',
            filterType: 'enum',
            sticky: true,
            enumOptions: [
              { label: 'Issued', value: LibraryBookStatus.Issued },
              { label: 'Overdue', value: LibraryBookStatus.Overdue },
            ],
            align: 'left',
            render(value, row) {
              const color = LibraryBookStatusColors[value as LibraryBookStatus] as LabelColor;
              return <Label color={color}>{LibraryBookStatus[value]}</Label>;
            },
          },
        ]}
        data={data || []}
      />
      {/* </Scrollbar>
      </FormSlider> */}
    </Box>
  );
};

export default BookIssueReturnTable;
