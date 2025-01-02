import React, { useState } from 'react';

import { MenuItem, MenuList, Typography } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { formatNumber } from 'src/utils/formate_number';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import CollectFinesDialog from './component/collect-fines-dialog';

const LibraryFineManagement = () => {
  const dummyData = [
    // Grouped by memberId
    {
      memberId: 'B1019JH8',
      memberName: 'John Doe',
      totalFineAmount: 50,
      status: 'Overdue',
      role: 'Student',
      fines: [
        {
          bookId: 'B101',
          title: 'Introduction to Mathematics',
          issueDate: '01-11-2024',
          dueDate: '08-11-2024',
          returnDate: '12-11-2024',
          status: 'Overdue',
          fineAmount: 50,
          receivedAmount: 0,
          fineReason: 'Late Return',
        },
      ],
    },
    {
      memberId: 'B10879JH8',
      memberName: 'Jane Smith',
      totalFineAmount: 50,
      status: 'Overdue',
      role: 'Student',
      fines: [
        {
          bookId: 'B102',
          title: 'Physics Fundamentals',
          issueDate: '05-11-2024',
          dueDate: '12-11-2024',
          returnDate: null,
          status: 'Pending',
          fineAmount: 50,
          receivedAmount: 0,
          fineReason: 'Late Return',
        },
      ],
    },
    {
      memberId: 'D10879J68',
      memberName: 'Sam Wilson',
      totalFineAmount: 250,
      status: 'Overdue',
      role: 'Student',
      fines: [
        {
          bookId: 'B103',
          title: 'Chemistry Basics',
          issueDate: '08-11-2024',
          dueDate: '15-11-2024',
          returnDate: '18-11-2024',
          status: 'Paid',
          fineAmount: 150,
          receivedAmount: 150,
          fineReason: 'Late Return',
        },
        {
          bookId: 'B104',
          title: 'Biology Essentials',
          issueDate: '10-11-2024',
          dueDate: '17-11-2024',
          returnDate: '20-11-2024',
          status: 'Overdue',
          fineAmount: 100,
          receivedAmount: 0,
          fineReason: 'Late Return',
        },
      ],
    },
  ];

  const collectFineDialog = useBoolean();
  const [selectedMember, setSelectedMember] = useState<any>(null);

  const renderTableActions = (row: any) => (
    <ThreeDotsActions
      placement="right-top"
      actions={({ popover }: any) => (
        <MenuList>
          <MenuItem
            onClick={() => {
              setSelectedMember(row); // Set selected student data
              collectFineDialog.onTrue(); // Open dialog
              popover.close(); // Close popover
            }}
          >
            <Iconify icon="mingcute:pig-money-line" />
            Collect Fine
          </MenuItem>
        </MenuList>
      )}
    />
  );

  const collectFineHandler = (values: any) => {
    console.log('Collected Fine Data:', values);
    collectFineDialog.onFalse(); // Close dialog
  };

  return (
    <>
      <CustomizableTable
        columns={[
          { id: 'memberId', label: 'Gr No' },
          { id: 'memberName', label: 'Name' },
          { id: 'role', label: 'Role' },
          {
            id: 'totalFineAmount',
            label: 'Total Fine Amount',
            render(value) {
              return <Typography fontSize="12px">{formatNumber(value, 'INR')}</Typography>;
            },
          },
          {
            id: 'status',
            label: 'Status',
            render(value, row) {
              return (
                <Label
                  variant="soft"
                  color={value === 'Paid' ? 'success' : value === 'Pending' ? 'warning' : 'error'}
                >
                  {value}
                </Label>
              );
            },
          },
          { id: 'action', label: 'Action', render: (_, row) => renderTableActions(row) },
        ]}
        data={dummyData}
      />

      {collectFineDialog.value && (
        <CollectFinesDialog
          dialogValue={collectFineDialog.value}
          data={selectedMember}
          onSave={collectFineHandler}
          onClose={collectFineDialog.onFalse}
        />
      )}
    </>
  );
};

export default LibraryFineManagement;

// import React, { useState } from 'react';

// import { MenuItem, MenuList, Typography } from '@mui/material';

// import { useBoolean } from 'src/hooks/use-boolean';

// import { formatNumber } from 'src/utils/formate_number';

// import { Label } from 'src/components/label';
// import { Iconify } from 'src/components/iconify';
// import ThreeDotsActions from 'src/components/three-dots-actions';
// import CustomizableTable from 'src/components/customizabaleTable';

// import CollectFinesDialog from './component/collect-fines-dialog';

// const LibraryFineManagement = () => {
//     const dummyData = [
//         {
//             bookId: 'B101',
//             memberId: 'B1019JH8',
//             title: 'Introduction to Mathematics',
//             memberName: 'John Doe',
//             requestedDate: '12-11-2024',
//             status: 'Overdue',
//             fineAmount: 50,

//         },
//         {
//             bookId: 'B102',
//             memberId: 'B10879JH8',
//             title: 'Physics Fundamentals',
//             memberName: 'Jane Smith',
//             requestedDate: '14-11-2024',
//             status: 'Pending',
//             fineAmount: 50,
//         },
//         {
//             bookId: 'B103',
//             memberId: 'D10879J68',
//             title: 'Chemistry Basics',
//             memberName: 'Sam Wilson',
//             requestedDate: '18-11-2024',
//             status: 'Paid',
//             fineAmount: 150,
//         },
//     ];

//     const collectFineDialog = useBoolean();
//     const [selectedEntry, setSelectedEntry] = useState<any>(null);

//     const renderTableActions = (row: any) => (
//         <ThreeDotsActions
//             placement="right-top"
//             actions={({ popover }: any) => (
//                 <MenuList>
//                     <MenuItem
//                         onClick={() => {
//                             setSelectedEntry(row); // Set selected row data
//                             collectFineDialog.onTrue(); // Open dialog
//                             popover.close(); // Close popover
//                         }}
//                     >
//                         <Iconify icon="mingcute:pig-money-line" />
//                         Collect Fine
//                     </MenuItem>
//                 </MenuList>
//             )}
//         />
//     );

//     const collectFineHandler = (values: any) => {
//         console.log('Collected Fine Data:', values);
//         // Add logic for fine collection
//         collectFineDialog.onFalse(); // Close dialog after save
//     };

//     return (
//         <>
//             <CustomizableTable
//                 columns={[
//                     { id: 'bookId', label: 'Book Id' },
//                     { id: 'memberName', label: 'Member Name' },
//                     { id: 'requestedDate', label: 'Due Date' },
//                     {
//                         id: 'fineAmount',
//                         label: 'Fine Amount',
//                         render(value, row) {
//                             return (
//                                 <Typography fontSize="12px">
//                                     {formatNumber(value, "INR")}
//                                 </Typography>
//                             );
//                         },
//                     },
//                     {
//                         id: 'status',
//                         label: 'Status',
//                         render(value, row) {
//                             return (
//                                 <Label
//                                     variant="soft"
//                                     color={
//                                         value === "Paid"
//                                             ? 'success'
//                                             : value === "Pending"
//                                                 ? 'warning'
//                                                 : 'error'
//                                     }
//                                 >
//                                     {value}
//                                 </Label>
//                             );
//                         },
//                     },
//                     { id: 'action', label: 'Action', render: (_, row) => renderTableActions(row) },
//                 ]}
//                 data={dummyData}
//             />

//             {collectFineDialog.value && (
//                 <CollectFinesDialog
//                     dialogValue={collectFineDialog.value}
//                     data={selectedEntry}
//                     onSave={collectFineHandler}
//                     onClose={collectFineDialog.onFalse}
//                 />
//             )}
//         </>
//     );
// };

// export default LibraryFineManagement;
