'use client';

import type { LabelColor } from 'src/components/label';

import React, { useState } from 'react';

import {
  Box,
  Grid,
  Button,
  Tooltip,
  MenuItem,
  MenuList,
  Checkbox,
  Typography,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { formatNumber } from 'src/utils/formate_number';

import studentRefundData from 'src/json/finance/fee-refund/studentFeeRefundData.json';
import {
  RequestStatusType,
  RequestStatusTypeColors,
  RequestStatusTypeOptions,
} from 'src/enums/refund-request-status';
import {
  FinancePaymentHistoryStatusType,
  FinancePaymentHistoryStatusOptions,
  FinancePaymentHistoryStatusTypeColors,
} from 'src/enums/finance-payment-history';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import SendInstantNotificationDialog from 'src/components/send-instant-notification-dialog';

import FeeRefundRequestDialog from './component/fee-refund-request-dialog';
import FinanceFeeRefundedViewDialog from './component/fee-refunded-view-dialog';
import FinanceFeeRefundAllocationDialog from './component/finance-fee-refund-allocated';
import FinanceFeeCollectionRefundApprovedDialog from './component/fee-refund-approved-dialog';

import type { IFeeRefundScreenProps } from './interface/fee-refund-interface';

const FeeRefundScreen: React.FC<IFeeRefundScreenProps> = ({ fromStudentDetailedView = false }) => {
  const dialog = useBoolean();
  const dialogForCreateRequest = useBoolean();
  const dialogForApprovalRequest = useBoolean();
  const dialogForFeeRefundedView = useBoolean();
  const [selectedStudent, setSelectedStudent] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [editData, setEditData] = useState<any>(null);

  const closeDialog = () => {
    setOpen(false);
    setEditData(null);
  };
  const handleClose = () => {
    setOpen(false);
    setEditData(null);
  };

  const sendInstantNotificationDialogValue = useBoolean();

  const handlerSendNotification = () => {
    sendInstantNotificationDialogValue.onTrue();
  };

  return (
    <>
      {open ? (
        <FeeRefundRequestDialog onClose={handleClose} />
      ) : (
        <>
          {!fromStudentDetailedView && (
            <Box
              display="flex"
              flexDirection="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <CustomBreadcrumbs
                description="This is the Refund Screen, where all created refund requests are displayed. By clicking the Approve action from the table, you can review and make a decision on the refund request. To create a new request, click on the Create Request Button"
                heading="Fee Refunds"
                links={[{ name: 'Finance', href: '/finance/dashboard' }, { name: 'Fee Refund' }]}
                sx={{ px: 1, mb: 2 }}
              />

              {/* Header Section */}
              <Box pt={2} pb={5} display="flex" justifyContent="flex-end" alignItems="center">
                <Button variant="contained" size="small" onClick={() => setOpen(true)}>
                  Create Request
                </Button>
              </Box>
            </Box>
          )}

          {/* fee refund screen view for fee collection screen  */}

          {fromStudentDetailedView && (
            <CustomizableTable
              noDataText={
                <>
                  No refund requests have been made yet. If a refund is requested by student, it
                  will be shown here.
                  <Box
                    component="a"
                    href="/finance/fee-refund"
                    color="primary.main"
                    fontWeight={600}
                    sx={{
                      '&:hover': {
                        cursor: 'pointer',
                        color: 'primary.main',
                        textDecoration: 'underline',
                      },
                    }}
                  >
                    Create Request
                  </Box>
                </>
              }
              tableId="student-refund-table"
              isShowedDense={false}
              isFilter={false}
              isSearch={false}
              data={[]}
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
                  filterType: 'enum',
                  enumOptions: FinancePaymentHistoryStatusOptions,
                  minWidth: '180px',
                  align: 'left',
                  render(value, row) {
                    const color = FinancePaymentHistoryStatusTypeColors[
                      value as FinancePaymentHistoryStatusType
                    ] as LabelColor;

                    return (
                      <Label color={color}>
                        {FinancePaymentHistoryStatusType[value as FinancePaymentHistoryStatusType]}
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
                              // setSelectedStudent(studentRefundData[0]);
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

          {/* fee refund view for fee refund route or fee refund menu */}
          {!fromStudentDetailedView && (
            <>
              <Grid container sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
                <Grid item lg={2}>
                  <CustomSelect
                    label="Class"
                    name="className"
                    options={[]}
                    labelKey="name"
                    valueKey="name"
                    value={[]}
                    onChange={(value) => console.log('className', value)}
                    fullWidth
                  />
                </Grid>
                <Grid item lg={2}>
                  <CustomSelect
                    fullWidth
                    label="Division"
                    labelKey="name"
                    valueKey="id"
                    options={[]}
                    value={[]}
                    onChange={(val) => console.log(val as string)}
                  />
                </Grid>
              </Grid>
              <CustomizableTable
                noDataText={
                  <>
                    No refund requests have been made yet for the selected filter.
                    <Box
                      onClick={() => {
                        setOpen(true);
                      }}
                      color="primary.main"
                      fontWeight={600}
                      sx={{
                        '&:hover': {
                          cursor: 'pointer',
                          color: 'primary.main',
                          textDecoration: 'underline',
                        },
                      }}
                    >
                      Create Request
                    </Box>
                  </>
                }
                onSendNotification={handlerSendNotification}
                showCheckbox={selectedStudent.length !== 0}
                tableId="student-refund-table"
                data={studentRefundData}
                columns={[
                  {
                    id: 'checkBox',
                    align: 'left',
                    minWidth: '60px',
                    isSort: false,
                    isFilter: false,
                    label: '',
                    renderColumn() {
                      return (
                        <Checkbox
                          checked={
                            !!studentRefundData?.length &&
                            selectedStudent?.length === studentRefundData?.length
                          }
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedStudent(studentRefundData || []);
                            } else {
                              setSelectedStudent([]);
                            }
                          }}
                        />
                      );
                    },
                    render(value, row) {
                      return (
                        <Checkbox
                          checked={
                            Array.isArray(selectedStudent) &&
                            selectedStudent.some((i) => i.id === row.id)
                          }
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedStudent([...selectedStudent, row]);
                            } else {
                              setSelectedStudent(
                                selectedStudent.filter((i: any) => i.id !== row.id)
                              );
                            }
                          }}
                        />
                      );
                    },
                  },
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
                    filterType: 'enum',
                    enumOptions: RequestStatusTypeOptions,
                    minWidth: '180px',
                    align: 'left',
                    render(value, row) {
                      const color = RequestStatusTypeColors[
                        value as RequestStatusType
                      ] as LabelColor;

                      return (
                        <Label color={color}>{RequestStatusType[value as RequestStatusType]}</Label>
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
                          // setSelectedStudent(studentRefundData[0]);

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
                                // setSelectedStudent(studentRefundData[0]);
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
            </>
          )}
        </>
      )}
      {sendInstantNotificationDialogValue.value && (
        <SendInstantNotificationDialog
          open={sendInstantNotificationDialogValue.value}
          onClose={sendInstantNotificationDialogValue.onFalse}
          data={[]}
          userList={selectedStudent}
        />
      )}

      {/* dialog for the approved the refund request */}
      {dialogForApprovalRequest.value && (
        <FinanceFeeCollectionRefundApprovedDialog
          dialogValue={dialogForApprovalRequest.value}
          onClose={() => {
            dialogForApprovalRequest.onFalse();
          }}
          // selectedData={selectedStudent}
        />
      )}

      {/* dialog for the refund initiate */}

      {dialog.value && (
        <FinanceFeeRefundAllocationDialog
          dialogValue={dialog.value}
          onClose={() => {
            dialog.onFalse();
          }}
          selectedData={selectedStudent}
        />
      )}

      {/* dialog for the details view of refund request */}

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
