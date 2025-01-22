'use client';

import React, { useState } from 'react';

import { Box, Button, Tooltip, MenuItem, MenuList, Typography } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { formatNumber } from 'src/utils/formate_number';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import FeeRefundRequestDialog from './component/fee-refund-request-dialog';
import FinanceFeeRefundedViewDialog from './component/fee-refunded-view-dialog';
import FinanceFeeRefundAllocationDialog from './component/finance-fee-refund-allocated';
import FinanceFeeCollectionRefundApprovedDialog from './component/fee-refund-approved-dialog';

interface FeeRefundScreenProps {
  fromStudentDetailedView?: boolean;
}

const FeeRefundScreen: React.FC<FeeRefundScreenProps> = ({ fromStudentDetailedView = false }) => {
  const studentRefundData = [
    {
      studentName: 'Vishal Rameshbhai Patel',
      standard: 10,
      class: 'A',
      refrenceNumber: 'refsm8q7wq',
      requestedOn: '18-11-2024',
      reason: 'Fee paid Twice',
      status: 'Pending',
      feestructureId: 'hkjl987',
      paymentTerm: 'Monthly',
      totalPending: 38000,
      totalPaid: 40000,
      discountAmount: 0,
      fixedReduction: 0,
      overAllDueDate: '20-04-2025',
      totalFees: 78000,
      totalDueAfterDiscount: 0,
      previousCharges: 500,
      askForRefund: 3000,
      reasonForRejection: '-',
      approvedAmount: '-',
      chargesDetails:
        'The payment of 500 made by cheque in June 2024 was bounced. Cheque No: H8749.',

      fees: [
        {
          feeHeadId: 198,
          feeHead: 'Tuition',
          totalFees: 60000,
          amount: 5000,
          paymentDates: [
            {
              month: 'June-2024',
              date: '15-01-2024',
              status: 'Unpaid',
              amount: 5000,
              paymentHistory: [
                {
                  paymentMode: 'Card',
                  amount: '2000',
                  paymentId: '54j8',
                  paymentStatus: 'Success',
                },
                { paymentMode: 'Cash', amount: '2000' },
                {
                  paymentMode: 'Online',
                  amount: '1000',
                  paymentId: 'h8749',
                  paymentStatus: 'Failed',
                },
                {
                  paymentMode: 'Online',
                  amount: '500',
                  paymentId: 'h8749',
                  paymentStatus: 'Success',
                },
                {
                  paymentMode: 'Check',
                  amount: '500',
                  paymentId: 'h8749',
                  paymentStatus: 'Not Clear',
                  charges: 500,
                },
              ],
            },
            {
              month: 'July-2024',
              date: '15-02-2024',
              status: 'Paid',
              amount: 5000,
              paymentHistory: [
                {
                  paymentMode: 'Bank Transfer',
                  amount: '3000',
                  paymentId: 'jh238',
                  paymentStatus: 'Success',
                },
                {
                  paymentMode: 'Card',
                  amount: '2000',
                  paymentId: 'aa123',
                  paymentStatus: 'Success',
                },
              ],
            },
            {
              month: 'Aug-2024',
              date: '15-03-2024',
              status: 'Paid',
              amount: 5000,
              paymentHistory: [
                {
                  paymentMode: 'Online',
                  amount: '4000',
                  paymentId: 'bb874',
                  paymentStatus: 'Success',
                },
                { paymentMode: 'Cash', amount: '1000' },
              ],
            },
            {
              month: 'Sep-2024',
              date: '15-04-2024',
              status: 'Paid',
              amount: 5000,
              paymentHistory: [
                {
                  paymentMode: 'Check',
                  amount: '3000',
                  paymentId: 'ck452',
                  paymentStatus: 'Cleared',
                },
                {
                  paymentMode: 'Online',
                  amount: '2000',
                  paymentId: 'on123',
                  paymentStatus: 'Success',
                },
              ],
            },
            {
              month: 'Oct-2024',
              date: '15-05-2024',
              status: 'Paid',
              amount: 5000,
              paymentHistory: [
                {
                  paymentMode: 'Card',
                  amount: '2500',
                  paymentId: 'cd998',
                  paymentStatus: 'Success',
                },
                {
                  paymentMode: 'Bank Transfer',
                  amount: '2500',
                  paymentId: 'bt321',
                  paymentStatus: 'Success',
                },
              ],
            },
            {
              month: 'Nov-2024',
              date: '15-06-2024',
              status: 'Paid',
              amount: 5000,
              paymentHistory: [{ paymentMode: 'Cash', amount: '5000' }],
            },
            {
              month: 'Dec-2024',
              date: '15-07-2024',
              status: 'Paid',
              amount: 5000,
              paymentHistory: [
                {
                  paymentMode: 'Online',
                  amount: '5000',
                  paymentId: 'on654',
                  paymentStatus: 'Success',
                },
              ],
            },
            {
              month: 'Jan-2025',
              date: '15-08-2024',
              status: 'Paid',
              amount: 5000,
              paymentHistory: [
                {
                  paymentMode: 'Card',
                  amount: '5000',
                  paymentId: 'ca876',
                  paymentStatus: 'Success',
                },
              ],
            },
            {
              month: 'Feb-2025',
              date: '15-09-2024',
              status: 'Unpaid',
              amount: 5000,
              paymentHistory: [
                {
                  paymentMode: 'Bank Transfer',
                  amount: '2000',
                  paymentId: 'bt987',
                  paymentStatus: 'Pending',
                },
                { paymentMode: 'Cash', amount: '3000' },
              ],
            },
            {
              month: 'April-2025',
              date: '15-10-2024',
              status: 'Unpaid',
              amount: 5000,
              paymentHistory: [],
            },
            {
              month: 'May-2025',
              date: '15-11-2024',
              status: 'Unpaid',
              amount: 5000,
              paymentHistory: [],
            },
          ],
        },
        {
          feeHeadId: 230,
          feeHead: 'Library',
          totalFees: 18000,
          amount: 1500,
          paymentDates: [
            {
              month: 'June-2024',
              date: '15-01-2024',
              status: 'Paid',
              amount: 1500,
              paymentHistory: [
                {
                  paymentMode: 'Card',
                  amount: '500',
                  paymentId: 'JUN123',
                  paymentStatus: 'Success',
                },
                { paymentMode: 'Cash', amount: '1000', paymentStatus: 'Success' },
              ],
            },
            {
              month: 'July-2024',
              date: '15-02-2024',
              status: 'Paid',
              amount: 1500,
              paymentHistory: [
                {
                  paymentMode: 'Online',
                  amount: '1500',
                  paymentId: 'JUL456',
                  paymentStatus: 'Success',
                },
              ],
            },
            {
              month: 'Aug-2024',
              date: '15-03-2024',
              status: 'Paid',
              amount: 1500,
              paymentHistory: [
                {
                  paymentMode: 'Bank Transfer',
                  amount: '1000',
                  paymentId: 'AUG789',
                  paymentStatus: 'Success',
                },
                { paymentMode: 'Cash', amount: '500', paymentStatus: 'Success' },
              ],
            },
            {
              month: 'Sep-2024',
              date: '15-03-2024',
              status: 'Paid',
              amount: 1500,
              paymentHistory: [
                {
                  paymentMode: 'Check',
                  amount: '1500',
                  paymentId: 'SEP101',
                  paymentStatus: 'Cleared',
                },
              ],
            },
            {
              month: 'Oct-2024',
              date: '15-03-2024',
              status: 'Paid',
              amount: 1500,
              paymentHistory: [
                {
                  paymentMode: 'Card',
                  amount: '750',
                  paymentId: 'OCT202',
                  paymentStatus: 'Success',
                },
                {
                  paymentMode: 'Online',
                  amount: '750',
                  paymentId: 'OCT203',
                  paymentStatus: 'Success',
                },
              ],
            },
            {
              month: 'Nov-2024',
              date: '15-03-2024',
              status: 'Paid',
              amount: 1500,
              paymentHistory: [{ paymentMode: 'Cash', amount: '1500', paymentStatus: 'Success' }],
            },
            {
              month: 'Dec-2024',
              date: '15-03-2024',
              status: 'Paid',
              amount: 1500,
              paymentHistory: [
                {
                  paymentMode: 'Online',
                  amount: '1500',
                  paymentId: 'DEC404',
                  paymentStatus: 'Success',
                },
              ],
            },
            {
              month: 'Jan-2025',
              date: '15-03-2024',
              status: 'Paid',
              amount: 1500,
              paymentHistory: [
                {
                  paymentMode: 'Bank Transfer',
                  amount: '1500',
                  paymentId: 'JAN505',
                  paymentStatus: 'Success',
                },
              ],
            },
            {
              month: 'Feb-2025',
              date: '15-03-2024',
              status: 'Unpaid',
              amount: 1500,
              paymentHistory: [
                {
                  paymentMode: 'Online',
                  amount: '500',
                  paymentId: 'FEB606',
                  paymentStatus: 'Failed',
                },
                { paymentMode: 'Cash', amount: '1000', paymentStatus: 'Pending' },
              ],
            },
            {
              month: 'April-2025',
              date: '15-03-2024',
              status: 'Unpaid',
              amount: 1500,
              paymentHistory: [
                {
                  paymentMode: 'Check',
                  amount: '1500',
                  paymentId: 'APR707',
                  paymentStatus: 'Not Cleared',
                },
              ],
            },
            {
              month: 'May-2025',
              date: '15-03-2024',
              status: 'Unpaid',
              amount: 1500,
              paymentHistory: [],
            },
          ],
        },
      ],
    },
  ];

  // const [selectedEntry, setSelectedEntry] = useState(dummyUser);
  // const [isEdit, setIsEdit] = useState(false);
  // const [tableData, setTableData] = useState(dummyUser);
  const dialog = useBoolean();
  const dialogForCreateRequest = useBoolean();
  const dialogForApprovalRequest = useBoolean();
  const dialogForFeeRefundedView = useBoolean();
  const [selectedStudent, setSelectedStudent] = useState<any>(null);

  const closeDialog = () => {
    dialog.onFalse();
  };

  const handleSave = () => {};

  return (
    <>
      {!fromStudentDetailedView && (
        <Box display="flex" flexDirection="row" justifyContent="space-between" alignItems="center">
          <CustomBreadcrumbs
            heading="Fee Refund"
            links={[{ name: 'Finance' }, { name: 'Fee Refund' }]}
            sx={{ px: 1, mb: 2 }}
          />

          {/* Header Section */}
          <Box
            pt={2} // Consistent padding
            pb={5}
            display="flex"
            justifyContent="flex-end"
            alignItems="center"
          >
            {/* Filters Section */}
            {/* <Box display="flex" gap={3} alignItems="center">
              <CustomSelect
                label="Standard"
                options={[]}
                value=""
                onChange={() => {}}
                formControlProps={{ sx: { minWidth: 140 } }}
              />
              <CustomSelect
                label="Division"
                options={[]}
                value=""
                onChange={() => {}}
                formControlProps={{ sx: { minWidth: 140 } }}
              />
              <TextField
                label="Search by student name"
                variant="outlined"
                size="small"
                value=""
                onChange={(e) => {
                  console.log(e.target.value);
                }}
              />
            </Box> */}

            {/* Action Button */}
            <Button
              variant="contained"
              size="small"
              onClick={() => {
                dialogForCreateRequest.onTrue();
              }}
            >
              Create Request
            </Button>
          </Box>
        </Box>
      )}

      {fromStudentDetailedView && (
        <CustomizableTable
          tableId="student-refund-table"
          isShowedDense={false}
          isFilter={false}
          isSearch={false}
          data={studentRefundData}
          columns={[
            {
              id: 'requestedOn',
              label: 'Requested On',
              render(value, row) {
                return (
                  <Typography minWidth="150px" fontSize="12px">
                    {value}
                  </Typography>
                );
              },
            },
            {
              id: 'reason',
              label: 'Reason',
              render(value, row) {
                return (
                  <Tooltip title={value} arrow>
                    <Typography minWidth="200px" fontSize="12px" noWrap>
                      {value}
                    </Typography>
                  </Tooltip>
                );
              },
            },
            {
              id: 'reasonForRejection',
              label: 'Reason For Rejection',
              render(value, row) {
                return (
                  <Tooltip title={value} arrow>
                    <Typography minWidth="200px" fontSize="12px" noWrap>
                      {value}
                    </Typography>
                  </Tooltip>
                );
              },
            },
            {
              id: 'askForRefund',
              label: 'Ask For Refund',
              render(value, row) {
                return (
                  <Typography minWidth="100px" fontSize="12px" textAlign="center">
                    {formatNumber(value, 'INR')}
                  </Typography>
                );
              },
            },
            {
              id: 'approvedAmount',
              label: 'Approved Amount',
              render(value, row) {
                return (
                  <Typography minWidth="100px" fontSize="12px">
                    {value}
                  </Typography>
                );
              },
            },
            {
              id: 'status',
              label: 'Status',
              render(value, row) {
                return (
                  <Label
                    variant="soft"
                    color={
                      value === 'Rejected'
                        ? 'error'
                        : value === 'Pending'
                          ? 'warning'
                          : value === 'Approved'
                            ? 'success'
                            : 'default'
                    }
                  >
                    {value}
                  </Label>
                );
              },
            },
            {
              id: 'action',
              label: 'Action',
              render: (row: any, popover) => (
                <ThreeDotsActions
                  placement="right-top"
                  // showViewIcon
                  // handleViewClick={() => {
                  //   setSelectedStudent(studentRefundData[0]);

                  //   dialogForFeeRefundedView.onTrue();
                  // }}
                  actions={() => (
                    <MenuList>
                      <MenuItem
                        onClick={() => {
                          dialogForApprovalRequest.onTrue();
                          // popover.onClose();
                        }}
                      >
                        <Iconify icon="mdi:check" />
                        Approved
                      </MenuItem>
                      <MenuItem
                        onClick={() => {
                          setSelectedStudent(studentRefundData[0]);
                          dialog.onTrue();
                          // popover.onClose();
                        }}
                      >
                        <Iconify icon="uil:process" />
                        Proceed For Refund
                      </MenuItem>
                    </MenuList>
                  )}
                />
              ),
            },
          ]}
        />
      )}

      {!fromStudentDetailedView && (
        <CustomizableTable
          tableId="student-refund-table"
          data={studentRefundData}
          columns={[
            {
              id: 'rollNo',
              label: 'Roll No',
              render(value, row) {
                return (
                  <Typography minWidth="120px" fontSize="12px">
                    {value}
                  </Typography>
                );
              },
            },
            {
              id: 'studentName',
              label: 'Student Name',
              render(value, row) {
                return (
                  <Typography minWidth="180px" fontSize="12px">
                    {value}
                  </Typography>
                );
              },
            },
            {
              id: 'standard',
              label: 'Standard',
              render(value, row) {
                return (
                  <Typography minWidth="100px" fontSize="12px">
                    {value}
                  </Typography>
                );
              },
            },
            {
              id: 'class',
              label: 'Class',
              render(value, row) {
                return (
                  <Typography minWidth="100px" fontSize="12px">
                    {value}
                  </Typography>
                );
              },
            },
            {
              id: 'requestedOn',
              label: 'Requested On',
              render(value, row) {
                return (
                  <Typography minWidth="150px" fontSize="12px">
                    {value}
                  </Typography>
                );
              },
            },
            {
              id: 'reason',
              label: 'Reason',
              render(value, row) {
                return (
                  <Tooltip title={value} arrow>
                    <Typography minWidth="200px" fontSize="12px" noWrap>
                      {value}
                    </Typography>
                  </Tooltip>
                );
              },
            },
            {
              id: 'reasonForRejection',
              label: 'Reason For Rejection',
              render(value, row) {
                return (
                  <Tooltip title={value} arrow>
                    <Typography minWidth="200px" fontSize="12px" noWrap>
                      {value}
                    </Typography>
                  </Tooltip>
                );
              },
            },
            {
              id: 'askForRefund',
              label: 'Ask For Refund',
              render(value, row) {
                return (
                  <Typography minWidth="100px" fontSize="12px" textAlign="left">
                    {formatNumber(value, 'INR')}
                  </Typography>
                );
              },
            },
            {
              id: 'approvedAmount',
              label: 'Approved Amount',
              render(value, row) {
                return (
                  <Typography minWidth="100px" fontSize="12px">
                    {value}
                  </Typography>
                );
              },
            },
            {
              id: 'status',
              label: 'Status',
              render(value, row) {
                return (
                  <Label
                    variant="soft"
                    color={
                      value === 'Rejected'
                        ? 'error'
                        : value === 'Pending'
                          ? 'warning'
                          : value === 'Approved'
                            ? 'success'
                            : 'default'
                    }
                  >
                    {value}
                  </Label>
                );
              },
            },
            {
              id: 'action',
              label: 'Action',
              render: (row: any, popover) => (
                <ThreeDotsActions
                  placement="right-top"
                  showViewIcon
                  handleViewClick={() => {
                    setSelectedStudent(studentRefundData[0]);

                    dialogForFeeRefundedView.onTrue();
                  }}
                  actions={() => (
                    <MenuList>
                      <MenuItem
                        onClick={() => {
                          dialogForApprovalRequest.onTrue();
                          // popover.onClose();
                        }}
                      >
                        <Iconify icon="mdi:check" />
                        Approved
                      </MenuItem>
                      <MenuItem
                        onClick={() => {
                          setSelectedStudent(studentRefundData[0]);
                          dialog.onTrue();
                          // popover.onClose();
                        }}
                      >
                        <Iconify icon="uil:process" />
                        Proceed For Refund
                      </MenuItem>
                    </MenuList>
                  )}
                />
              ),
            },
          ]}
        />
      )}
      {dialogForApprovalRequest.value && (
        <FinanceFeeCollectionRefundApprovedDialog
          dialogValue={dialogForApprovalRequest.value}
          onClose={() => {
            dialogForApprovalRequest.onFalse();
          }}
          selectedData={selectedStudent}
        />
      )}

      {dialogForCreateRequest.value && (
        <FeeRefundRequestDialog
          dialogValue={dialogForCreateRequest.value}
          onClose={() => {
            dialogForCreateRequest.onFalse();
          }}
        />
      )}
      {dialog.value && (
        <FinanceFeeRefundAllocationDialog
          dialogValue={dialog.value}
          onClose={closeDialog}
          selectedData={selectedStudent}
        />
      )}

      {dialogForFeeRefundedView.value && (
        <FinanceFeeRefundedViewDialog
          dialogValue={dialogForFeeRefundedView.value}
          onClose={() => {
            dialogForFeeRefundedView.onFalse();
          }}
          selectedData={selectedStudent}
        />
      )}
    </>
  );
};

export default FeeRefundScreen;
