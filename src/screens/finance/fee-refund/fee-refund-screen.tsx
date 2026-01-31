'use client';

import type { RootState } from 'src/redux/store';
import type { LabelColor } from 'src/components/label';
import type { Division, Standards, Organization } from 'src/types/school';

import { useSelector } from 'react-redux';
import Add from '@mui/icons-material/Add';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import React, { useState, useEffect } from 'react';
import { useBoolean } from 'src/hooks/use-boolean';
import { formatNumber } from 'src/utils/formate_number';
import CustomSelect from 'src/components/custom-select';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Box, Button, Tooltip, MenuItem, MenuList, Typography } from '@mui/material';
import studentRefundData from 'src/json/finance/fee-refund/studentFeeRefundData.json';
import SendInstantNotificationDialog from 'src/components/send-instant-notification-dialog';
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

import FinanceFeeRefundedViewDialog from './component/fee-refunded-view-dialog';
import FinanceFeeRefundAllocationDialog from './component/finance-fee-refund-allocated';
import FinanceFeeCollectionRefundApprovedDialog from './component/fee-refund-approved-dialog';
import NewFeeRefundRequestForm from '../new-fee-refund/component/new-fee-refund-request-form';

import type { IFeeRefundScreenProps } from './interface/fee-refund-interface';
import type { IStudentRefundRequest } from '../new-fee-refund/new-refund-request-interface';

const FeeRefundScreen: React.FC<IFeeRefundScreenProps> = ({ fromStudentDetailedView = false }) => {
  const dialog = useBoolean();
  const dialogForApprovalRequest = useBoolean();
  const dialogForFeeRefundedView = useBoolean();
  const [selectedStudent, setSelectedStudent] = useState<any>([]);
  const [selectedRefundRequest, setSelectedRefundRequest] = useState<IStudentRefundRequest | null>(
    null
  );

  const [open, setOpen] = useState(false);
  const [, setEditData] = useState<any>(null);
  const confirmDelete = useBoolean();
  const [isEdit, setIsEdit] = useState(false);

  const links = open
    ? [
        { name: 'Finance', href: '/finance/dashboard' },
        { name: 'Fee Refund', href: '/finance/fee-refund' },

        { name: 'Refund Request Form' },
      ]
    : [
        { name: 'Finance', href: '/finance/dashboard' },
        { name: 'Fee Refund', href: '/finance/fee-refund' },
      ];

  const handleClose = () => {
    setOpen(false);
    setIsEdit(false);
    setSelectedRefundRequest(null);
    setEditData(null);
  };

  const sendInstantNotificationDialogValue = useBoolean();

  const handlerSendNotification = () => {
    sendInstantNotificationDialogValue.onTrue();
  };

  // States for managing organization/stage selection
  const [allOrganization, setAllOrganization] = useState<Organization[]>([]);
  const [organization, setOrganization] = useState<string>('');

  // States for managing class/standard selection
  const [allClass, setAllClass] = useState<Standards[]>([]);
  const [classes, setClass] = useState<string>('');

  // States for managing division selection
  const [allDivision, setAllDivision] = useState<Division[]>([]);
  const [division, setDivision] = useState<string>('');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { currentMedium: medium, setCurrentMedium: setMedium } = useSelector(
    (state: RootState) => state.globalState
  );

  // Effect to update organizations when medium changes
  useEffect(() => {
    setAllOrganization(medium?.educationMediumStages || []);
    setOrganization(medium?.educationMediumStages?.[0]?.id || '');
  }, [medium]);

  // Effect to update classes when organization changes
  useEffect(() => {
    setAllClass(allOrganization.find((org: any) => org?.id === organization)?.standards || []);
    setClass(
      allOrganization.find((org: any) => org?.id === organization)?.standards?.[0]?.id || ''
    );
  }, [organization, allOrganization]);

  // Effect to update divisions when class changes
  useEffect(() => {
    setAllDivision(allClass.find((org: any) => org?.id === classes)?.divisions || []);
    setDivision(allClass.find((org: any) => org?.id === classes)?.divisions?.[0]?.id || '');
  }, [allClass, classes]);
  return (
    <Box height="100%" display="flex" flexDirection="column">
      <>
        {!fromStudentDetailedView && (
          <CustomBreadcrumbs
            description="This is the Refund Screen, where all created refund requests are displayed. By clicking the Approve action from the table, you can review and make a decision on the refund request. To create a new request, click on the Create Request Button"
            heading="Fee Refund"
            links={links}
            isBack={open}
            onBack={() => {
              setOpen(false);
              setIsEdit(false);
              setSelectedRefundRequest(null);
              setEditData(null);
            }}
            action={
              !open && (
                <Button
                  size="small"
                  startIcon={<Add />}
                  variant="contained"
                  onClick={() => {
                    setOpen(true);
                  }}
                >
                  Create Request
                </Button>
              )
            }
          />
        )}
      </>
      {open ? (
        <NewFeeRefundRequestForm
          onClose={handleClose}
          isEdit={isEdit}
          data={selectedRefundRequest}
        />
      ) : (
        <>
          {/* fee refund screen view for fee collection screen  */}

          {fromStudentDetailedView && (
            <CustomizableTable
              noDataText={
                <>
                  No refund requests have been made yet.
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
              data={[]}
              columns={[
                {
                  id: 'requestedOn',
                  label: 'Requested On',
                  filterType: 'date',
                  align: 'left',
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
                  align: 'left',
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
                  align: 'left',
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
                  label: 'Refund Amount',
                  filterType: 'formattedNumber',
                  align: 'left',
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
                  filterType: 'number',
                  align: 'left',
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
                  minWidth: 70,
                  isSort: false,
                  sticky: true,
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
                  isFilter: false,
                  isSort: false,
                  align: 'left',
                  minWidth: 40,
                  sticky: true,
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
              <Box display="flex" gap={2} flexWrap="wrap" mb={2}>
                <CustomSelect
                  options={allOrganization}
                  label="Organization"
                  value={organization}
                  onChange={(val) => setOrganization(val as string)}
                  labelKey="name"
                  valueKey="id"
                  formControlProps={{ sx: { maxWidth: '250px', width: '100%' } }}
                  disabled={!medium}
                />
                <CustomSelect
                  options={allClass}
                  label="Class"
                  value={classes}
                  onChange={(val) => setClass(val as string)}
                  labelKey="name"
                  valueKey="id"
                  formControlProps={{ sx: { maxWidth: '250px', width: '100%' } }}
                  disabled={!organization}
                />
                <CustomSelect
                  options={allDivision}
                  label="Division"
                  value={division}
                  onChange={(val) => setDivision(val as string)}
                  labelKey="name"
                  valueKey="id"
                  formControlProps={{ sx: { maxWidth: '250px', width: '100%' } }}
                  disabled={!classes}
                />
              </Box>
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
                  // {
                  //   id: 'checkBox',
                  //   align: 'left',
                  //   minWidth: '60px',
                  //   isSort: false,
                  //   isFilter: false,
                  //   label: '',
                  //   renderColumn() {
                  //     return (
                  //       <Checkbox
                  //         checked={
                  //           !!studentRefundData?.length &&
                  //           selectedStudent?.length === studentRefundData?.length
                  //         }
                  //         onChange={(e) => {
                  //           if (e.target.checked) {
                  //             setSelectedStudent(studentRefundData || []);
                  //           } else {
                  //             setSelectedStudent([]);
                  //           }
                  //         }}
                  //       />
                  //     );
                  //   },
                  //   render(value, row) {
                  //     return (
                  //       <Checkbox
                  //         checked={
                  //           Array.isArray(selectedStudent) &&
                  //           selectedStudent.some((i) => i.id === row.id)
                  //         }
                  //         onChange={(e) => {
                  //           if (e.target.checked) {
                  //             setSelectedStudent([...selectedStudent, row]);
                  //           } else {
                  //             setSelectedStudent(
                  //               selectedStudent.filter((i: any) => i.id !== row.id)
                  //             );
                  //           }
                  //         }}
                  //       />
                  //     );
                  //   },
                  // },
                  // {
                  //   id: 'rollNo',
                  //   label: 'Roll No',
                  //   filterType: 'number',
                  //   render(value, row) {
                  //     return (
                  //       <Typography minWidth="120px" fontSize="12px">
                  //         {value}
                  //       </Typography>
                  //     );
                  //   },
                  // },
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
                    filterType: 'number',
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
                    filterType: 'number',
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
                    filterType: 'date',
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
                    label: 'Refund Amount',
                    filterType: 'formattedNumber',
                    align: 'right',
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
                    filterType: 'number',
                    align: 'right',
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
                    minWidth: '100px',
                    align: 'left',
                    isSort: false,
                    sticky: true,
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
                    label: 'Actions',
                    isSort: false,
                    isFilter: false,
                    sticky: true,
                    render: (row: any, popover) => (
                      <ThreeDotsActions
                        placement="right-top"
                        showViewIcon
                        showEditIcon
                        showDeleteIcon
                        handleDeleteClick={() => {
                          setSelectedRefundRequest(row);
                          confirmDelete.onTrue();
                        }}
                        handleViewClick={() => {
                          // setSelectedStudent(studentRefundData[0]);

                          dialogForFeeRefundedView.onTrue();
                        }}
                        handleEditClick={() => {
                          setSelectedRefundRequest(row);
                          setSelectedStudent(row);
                          setOpen(true);
                          setIsEdit(true);
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
                              Approve
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

      {confirmDelete.value && (
        <ConfirmDialog
          open={confirmDelete.value}
          onClose={() => {
            confirmDelete.onFalse();
          }}
          title="Delete"
          content="Are you sure want to delete?"
          action={
            <Button variant="contained" color="error" onClick={async () => {}}>
              Yes
            </Button>
          }
        />
      )}
    </Box>
  );
};

export default FeeRefundScreen;
