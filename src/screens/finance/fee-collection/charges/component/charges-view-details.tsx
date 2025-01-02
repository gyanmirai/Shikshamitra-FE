import React from 'react';

import { Box, Typography } from '@mui/material';

import { formatNumber } from 'src/utils/formate_number';

import { Label } from 'src/components/label';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomizableTable from 'src/components/customizabaleTable';

interface ChargesViewDetailsProps {
  dialogValue: boolean;
  onClose: () => void;
  data: any;
}

const ChargesViewDetails: React.FC<ChargesViewDetailsProps> = ({ dialogValue, onClose, data }) => (
  <CustomDialog maxWidth="md" title={data.description} open={dialogValue} handleClose={onClose}>
    <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '500px' }}>
      <CustomizableTable
        isShowedDense={false}
        isFilter={false}
        isSearch={false}
        columns={[
          { id: 'dueDate', label: 'Due Date' },
          {
            id: 'chargesPerDay',
            label: 'ChargesPerDay',
            render(value, row) {
              return <Typography fontSize="12px">{formatNumber(value, 'INR')}</Typography>;
            },
          },
          {
            id: 'totalCharges',
            label: 'Total Charges',
            render(value, row) {
              return <Typography fontSize="12px">{formatNumber(value, 'INR')}</Typography>;
            },
          },
          // { id: 'description', label: 'Description' },

          {
            id: 'status',
            label: 'Status',
            render(value, row) {
              return value !== '' ? (
                <Label
                  variant="soft"
                  color={
                    value === 'Overdue'
                      ? 'error'
                      : value === 'Pending'
                        ? 'warning'
                        : value === 'Paid'
                          ? 'success'
                          : 'default'
                  }
                >
                  {value}
                </Label>
              ) : (
                <Box />
              );
            },
          },
          //   {
          //     id: 'action',
          //     label: 'Action',
          //     render(value, row: any) {
          //       return (
          //         <ThreeDotsActions
          //         showViewIcon
          //         handleViewClick={()=>{
          //           setSelectedEntry(row);
          //         }}
          //           actions={({ popover }: any) => (
          //             <MenuList>
          //               {row.status === 'Pending' && (
          //                 <MenuItem
          //                   onClick={() => {
          //                     // setIsClearCheck(false)
          //                     setSelectedEntry(row);

          //                     dialog.onTrue();
          //                   }}
          //                 >
          //                   <Iconify icon="fluent:check-24-regular" />
          //                   Collect Charges
          //                 </MenuItem>
          //               )}
          //               {row.status === 'Paid' && (
          //                 <MenuItem
          //                   onClick={() => {
          //                     // setIsClearCheck(true)
          //                     // setSelectedEntry(row);
          //                     // dialog.onTrue();
          //                   }}
          //                 >
          //                   <Iconify icon="circum:receipt" />
          //                   Generate Receipt
          //                 </MenuItem>
          //               )}
          //             </MenuList>
          //           )}
          //         />
          //       );
          //     },
          //   },
        ]}
        data={data.details}
      />
    </Scrollbar>
  </CustomDialog>
);

export default ChargesViewDetails;
