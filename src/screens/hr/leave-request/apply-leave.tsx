'use client';

import type { RootState } from 'src/redux/store';
import type { IColumn } from 'src/components/customizabaleTable/types';

import dayjs from 'dayjs';
import { LoadingButton } from '@mui/lab';
import { Add } from '@mui/icons-material';
import { useSession } from 'next-auth/react';
import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { useSelector, useDispatch } from 'react-redux';
import CustomDialog from 'src/components/customDialog';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { hrPaths, hrPermissions } from 'src/constants/hr-menus';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { Box, Card, Button, MenuItem, MenuList, Typography } from '@mui/material';
import SendInstantNotificationDialog from 'src/components/send-instant-notification-dialog';
import {
  EmployeeLeaveStatusType,
  EmployeeLeaveStatusOptions,
} from 'src/enums/employee-leave-status';
import {
  useGetLeaveRequestByIdQuery,
  useLazyGetLeaveRequestsQuery,
  useCancelLeaveRequestMutation,
  useGetMyLeaveRequestByIdQuery,
  useLazyGetMyLeaveRequestsQuery,
  useCancelMyLeaveRequestMutation,
} from 'src/redux/hr/leaveApi';

import AddLeaveRequest from './leave-requst';
import { ApproveRejectForm } from './leave-approvals';
import { isAdminFromProfile } from './leave-request.utils';
import LeaveCalender, { LeaveRequestForm } from './leave-calender';
import {
  getLeaveStatusColor,
  getLeaveStatusLabel,
  normalizeLeaveStatus,
} from './leave-status.utils';

const LEAVE_REQUESTS_PAGE_SIZE = 100;
const MY_LEAVE_PATH = '/dashboard/my-leave';

const dedupeLeaveRequestsById = (items: any[]) => {
  const byId = new Map<string, any>();
  const withoutId: any[] = [];

  items.forEach((item) => {
    if (item?.id == null) {
      withoutId.push(item);
      return;
    }
    byId.set(String(item.id), item);
  });

  return [...Array.from(byId.values()), ...withoutId];
};

type ApplyLeaveProps = {
  mode?: 'hr' | 'self';
  showBreadcrumbs?: boolean;
};

const ApplyLeave = ({ mode = 'hr', showBreadcrumbs = true }: ApplyLeaveProps) => {
  const isSelfMode = mode === 'self';
  const { data: session } = useSession();
  const { currentYear, currentMedium } = useSelector((state: RootState) => state.globalState);
  const { employee, permissions } = useSelector((state: RootState) => state.auth);
  const isAdminUser = isAdminFromProfile((session as any)?.profile);
  const hasApprovalPermission = permissions?.some(
    (permission: any) =>
      permission?.name === hrPermissions.leaveManagement.approvals && permission?.isGranted
  );
  const canReviewLeaves = !isSelfMode && Boolean(isAdminUser || hasApprovalPermission);
  const [leaveRequests, setLeaveRequests] = useState<any[]>([]);
  const [isLeaveRequestsLoading, setIsLeaveRequestsLoading] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [triggerLeaveRequests] = useLazyGetLeaveRequestsQuery();
  const [triggerMyLeaveRequests] = useLazyGetMyLeaveRequestsQuery();

  useEffect(() => {
    let isActive = true;

    const loadAcademicYearLeaveRequests = async () => {
      if (!currentYear?.id) {
        setLeaveRequests([]);
        setIsLeaveRequestsLoading(false);
        return;
      }

      setLeaveRequests([]);
      setIsLeaveRequestsLoading(true);

      try {
        const allItems: any[] = [];
        const loadPageRecursively = async (page: number, knownTotal: number): Promise<void> => {
          const response = await (isSelfMode ? triggerMyLeaveRequests : triggerLeaveRequests)(
            {
              academicYearId: currentYear.id,
              page,
              pageSize: LEAVE_REQUESTS_PAGE_SIZE,
            },
            false
          ).unwrap();

          if (!isActive) return;

          const pageItems = Array.isArray(response?.items) ? response.items : [];
          const parsedTotal = Number(response?.totalCount);
          const totalCount = page === 1 && Number.isFinite(parsedTotal) ? parsedTotal : knownTotal;

          allItems.push(...pageItems);

          const reachedTotal = Number.isFinite(totalCount) && allItems.length >= totalCount;
          const noMorePages = pageItems.length < LEAVE_REQUESTS_PAGE_SIZE || pageItems.length === 0;

          if (reachedTotal || noMorePages) {
            return;
          }

          await loadPageRecursively(page + 1, totalCount);
        };

        await loadPageRecursively(1, Number.POSITIVE_INFINITY);

        if (!isActive) return;

        setLeaveRequests(dedupeLeaveRequestsById(allItems));
      } catch (e) {
        if (!isActive) return;
        console.error(e);
        shikshaMitraToast.error({
          message: 'Unable to load leave requests. Please try again.',
        });
        setLeaveRequests([]);
      } finally {
        if (isActive) {
          setIsLeaveRequestsLoading(false);
        }
      }
    };

    loadAcademicYearLeaveRequests();

    return () => {
      isActive = false;
    };
  }, [currentYear?.id, isSelfMode, reloadKey, triggerLeaveRequests, triggerMyLeaveRequests]);

  const [deleteLeaveForHr, { isLoading: isDeleteLoadingForHr }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useCancelLeaveRequestMutation,
  });
  const [deleteLeaveForSelf, { isLoading: isDeleteLoadingForSelf }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useCancelMyLeaveRequestMutation,
  });
  const deleteLeave = isSelfMode ? deleteLeaveForSelf : deleteLeaveForHr;
  const isDeleteLoading = isSelfMode ? isDeleteLoadingForSelf : isDeleteLoadingForHr;

  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  const dispatch = useDispatch();

  const addLeaveRequestDialog = useBoolean();
  const cancelConfirmation = useBoolean();
  const approveOrRejectConfirmation = useBoolean();
  const viewCalendarView = useBoolean();
  const [editData, setEditData] = useState<any>(null);
  const [approvalData, setApprovalData] = useState<any>(null);

  const actions = useCallback(
    ({ popover }: any, row: any) => (
      <MenuList>
        <MenuItem
          onClick={() => {
            setEditData(row);
            addLeaveRequestDialog?.onTrue?.();
            popover.onClose();
          }}
        >
          <Iconify icon="carbon:view-filled" sx={{ height: '16px', width: '16px' }} />
          View
        </MenuItem>
        {canReviewLeaves &&
          normalizeLeaveStatus(row?.status) === 'PENDING' &&
          String(row?.employeeId ?? '') !== String(employee?.id ?? '') && (
            <MenuItem
              onClick={() => {
                setApprovalData({ ...row, type: EmployeeLeaveStatusType.Approved });
                approveOrRejectConfirmation.onTrue();
                popover.onClose();
              }}
              sx={{ color: 'success.main' }}
            >
              <Iconify icon="mdi:approve" sx={{ height: '16px', width: '16px' }} />
              Approve
            </MenuItem>
          )}
        {canReviewLeaves &&
          normalizeLeaveStatus(row?.status) === 'PENDING' &&
          String(row?.employeeId ?? '') !== String(employee?.id ?? '') && (
            <MenuItem
              onClick={() => {
                setApprovalData({ ...row, type: EmployeeLeaveStatusType.Rejected });
                approveOrRejectConfirmation.onTrue();
                popover.onClose();
              }}
              sx={{ color: 'error.main' }}
            >
              <Iconify icon="mdi:close-circle" sx={{ height: '16px', width: '16px' }} />
              Reject
            </MenuItem>
          )}
        <MenuItem
          onClick={() => {
            setEditData(row);
            cancelConfirmation.onTrue();
            popover.onClose();
          }}
          sx={{ color: 'error.main' }}
        >
          <Iconify icon={GlobalIcons.delete} sx={{ height: '16px', width: '16px' }} />
          Cancel
        </MenuItem>
      </MenuList>
    ),
    [
      addLeaveRequestDialog,
      approveOrRejectConfirmation,
      canReviewLeaves,
      cancelConfirmation,
      employee?.id,
    ]
  );

  const tableData = useMemo(() => {
    const apiData =
      leaveRequests?.map((item: any) => {
        const start = dayjs(item.startDate);
        const end = dayjs(item.endDate);

        return {
          id: item.id,
          name: item.name || item.employeeName,
          employeeId: item.employeeId,
          employeeIdentifier: item.employeeIdentifier || item.employeeCode,
          submittedBy: item.submittedByEmployeeCode
            ? `${item.submittedByName || '-'} (${item.submittedByEmployeeCode})`
            : (item.submittedByName ?? '-'),
          leaveType: item.leaveType,
          startDate: start.format('DD-MM-YYYY'),
          endDate: end.format('DD-MM-YYYY'),
          totalDays: item.totalDays,
          organization:
            item.mediumStageName ||
            currentMedium?.educationMediumStages?.find(
              (org: any) => String(org?.id ?? '') === String(item?.mediumStageId ?? '')
            )?.name ||
            '-',
          description: item.description,
          remarks: item.remarks,
          status: item.status,
        };
      }) || [];

    return apiData;
  }, [currentMedium?.educationMediumStages, leaveRequests]);

  const handleClose = (_e?: any, isSubmit?: boolean) => {
    const resetState = () => {
      setTimeout(() => {
        setEditData(null);
      }, 200);
    };

    const confirmLeave = () =>
      isSubmit || (isChanges && window.confirm('Are you sure you want to leave this page?'));

    if (confirmLeave()) {
      if (isSubmit) {
        setReloadKey((prev) => prev + 1);
      }
      addLeaveRequestDialog?.onFalse?.();
      resetState();
      dispatch(setIsChanges(false));
    } else if (!isChanges) {
      addLeaveRequestDialog?.onFalse?.();
      setTimeout(() => {
        setEditData(null);
      }, 200);
    }
  };

  const [selectedStudents] = useState<any>([]);
  const sendInstantNotificationDialogValue = useBoolean();

  const handlerSendNotification = () => {
    if (!sendInstantNotificationDialogValue.value) {
      sendInstantNotificationDialogValue.onTrue();
    }
  };

  const columns: IColumn[] = useMemo(
    () => [
      {
        label: 'Name',
        id: 'name',
        sticky: true,
        minWidth: '12vw',
        align: 'left',
        render(value, row) {
          return (
            <Box display="flex" alignItems="center" gap={1}>
              {value} ({row.employeeIdentifier})
            </Box>
          );
        },
      },
      {
        label: 'Leave Type',
        id: 'leaveType',
        align: 'left',
        minWidth: '10vw',
      },
      ...(!isSelfMode
        ? [
            {
              label: 'Submitted By',
              id: 'submittedBy',
              align: 'left' as const,
              minWidth: '12vw',
              render(value: any) {
                return value || '-';
              },
            },
          ]
        : []),
      {
        label: 'Start Date',
        id: 'startDate',
        filterType: 'date',
        minWidth: '120px',
        align: 'left',
        isDateFilter: true,
      },
      {
        label: 'End Date',
        id: 'endDate',
        filterType: 'date',
        minWidth: '100px',
        align: 'left',
        isDateFilter: true,
      },
      {
        label: 'Total Days',
        id: 'totalDays',
        minWidth: '7vw',
        align: 'left',
        filterType: 'number',
      },
      {
        label: 'Organization',
        id: 'organization',
        align: 'left',
        minWidth: '14vw',
      },
      {
        label: 'Description',
        id: 'description',
        align: 'left',
        minWidth: '14vw',
      },
      {
        label: 'Remarks',
        id: 'remarks',
        align: 'left',
        minWidth: '12vw',
        render(value) {
          return value || '-';
        },
      },
      {
        label: 'Status',
        id: 'status',
        filterType: 'enum',
        align: 'left',
        enumOptions: EmployeeLeaveStatusOptions,
        sticky: true,
        minWidth: '100px',
        render(value) {
          return <Label color={getLeaveStatusColor(value)}>{getLeaveStatusLabel(value)}</Label>;
        },
      },
      {
        label: 'Action',
        id: 'action',
        isFilter: false,
        isSort: false,
        sticky: true,
        render(_value, row) {
          return <ThreeDotsActions placement="right-top" actions={(prop) => actions(prop, row)} />;
        },
      },
    ],
    [actions, isSelfMode]
  );

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {viewCalendarView.value ? (
        <>
          {showBreadcrumbs && (
            <CustomBreadcrumbs
              heading="Calendar View"
              links={[
                {
                  name: isSelfMode ? 'Dashboard' : 'HR/Staff',
                  href: isSelfMode ? '/dashboard/' : '/hr/dashboard/',
                },
                {
                  name: isSelfMode ? 'My Leave' : 'Leave Management',
                  href: isSelfMode ? MY_LEAVE_PATH : hrPaths.leaveManagement.applyLeave,
                  onClick: viewCalendarView.onFalse,
                },
                { name: 'Leave Calendar' },
              ]}
              description="The Leave Calendar visually displays employees leave requests and their statuses—approved, pending, or rejected—on specific dates."
              isBack
              onBack={viewCalendarView.onFalse}
            />
          )}
          <Box display="flex" flexDirection="column" gap={2}>
            <LeaveCalender />
          </Box>
        </>
      ) : (
        <>
          {showBreadcrumbs && (
            <CustomBreadcrumbs
              heading={isSelfMode ? 'My Leave' : 'Apply Leave'}
              links={
                isSelfMode
                  ? [{ name: 'Dashboard', href: '/dashboard/' }, { name: 'My Leave' }]
                  : [
                      { name: 'HR/Staff', href: '/hr/dashboard/' },
                      { name: 'Leave Management', href: hrPaths.leaveManagement.applyLeave },
                      { name: 'Apply Leave' },
                    ]
              }
              description={
                isSelfMode
                  ? 'Apply for leave, track your requests, and manage your submissions.'
                  : 'Create new leave requests and manage existing ones.'
              }
            />
          )}
          <Card
            sx={{
              display: 'flex',
              p: 2,
              gap: 2,
              pl: 1,
              mb: 1,
              justifyContent: 'flex-end',
            }}
          >
            <Box display="flex" gap={2}>
              <Button
                variant="contained"
                size="small"
                startIcon={<Add />}
                onClick={() => {
                  addLeaveRequestDialog.onTrue();
                }}
                sx={{ px: '32px' }}
              >
                Leave Request
              </Button>
              {!isSelfMode && (
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<Iconify icon={GlobalIcons.calenderIcon} />}
                  onClick={() => {
                    viewCalendarView.onTrue();
                  }}
                  sx={{ px: '32px' }}
                >
                  View Calendar
                </Button>
              )}
            </Box>
          </Card>

          <CustomizableTable
            noDataText={
              <>
                No Leave Request Found{' '}
                <Box
                  onClick={() => addLeaveRequestDialog.onTrue?.()}
                  color="primary.main"
                  fontWeight={600}
                  sx={{
                    '&:hover': {
                      cursor: 'pointer',
                      textDecoration: 'underline',
                    },
                  }}
                >
                  Leave Request
                </Box>
              </>
            }
            onSendNotification={handlerSendNotification}
            showCheckbox={selectedStudents.length !== 0}
            isLoading={isLeaveRequestsLoading}
            tableId="apply-leave-table"
            data={tableData}
            columns={columns}
          />
        </>
      )}

      <ConfirmDialog
        open={cancelConfirmation.value}
        onClose={() => {
          setEditData(null);
          cancelConfirmation.onFalse();
        }}
        title="Cancel Leave Request"
        content={
          <>
            Are you sure you want to cancel this leave request for <strong>{editData?.name}</strong>
            ?
          </>
        }
        action={
          <LoadingButton
            variant="contained"
            color="error"
            size="small"
            loading={isDeleteLoading}
            onClick={async () => {
              const deleteResult: any = await deleteLeave(editData?.id);
              if (!deleteResult?.error) {
                setReloadKey((prev) => prev + 1);
              }
              cancelConfirmation.onFalse();
              setEditData(null);
            }}
            startIcon={<Iconify icon={GlobalIcons.delete} sx={{ height: '16px', width: '16px' }} />}
          >
            Cancel
          </LoadingButton>
        }
      />

      {approvalData?.type && (
        <CustomDialog
          open={approveOrRejectConfirmation.value}
          handleClose={() => {
            approveOrRejectConfirmation.onFalse();
            setApprovalData(null);
          }}
          title={
            <Box display="flex" flexDirection="row" gap={1} alignItems="center">
              <Typography variant="h5">
                {approvalData.type === EmployeeLeaveStatusType.Rejected
                  ? 'Reject Leave Request'
                  : 'Approve Leave Request'}
              </Typography>
              <CustomTooltip
                arrow
                placement="right"
                sx={{ textAlign: 'justify' }}
                title={
                  approvalData.type === EmployeeLeaveStatusType.Rejected
                    ? 'Remarks are required to reject the leave request.'
                    : 'Review the request and click Approve. Add remarks if you wish to include any additional info.'
                }
              >
                <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
              </CustomTooltip>
            </Box>
          }
        >
          <ApproveRejectForm
            handleClose={(_e, isSubmit) => {
              approveOrRejectConfirmation.onFalse();
              setApprovalData(null);
              if (isSubmit) {
                setReloadKey((prev) => prev + 1);
              }
            }}
            editData={approvalData}
          />
        </CustomDialog>
      )}

      {sendInstantNotificationDialogValue.value && (
        <SendInstantNotificationDialog
          open={sendInstantNotificationDialogValue.value}
          onClose={sendInstantNotificationDialogValue.onFalse}
          data={[]}
          userList={selectedStudents}
        />
      )}

      <CustomDialog
        open={addLeaveRequestDialog?.value}
        handleClose={() => {
          addLeaveRequestDialog?.onFalse?.();
          setEditData(null);
        }}
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">
              {editData ? 'View Leave Request' : 'Add Leave Request'}
            </Typography>
            <CustomTooltip
              arrow
              placement="right"
              sx={{ textAlign: 'justify' }}
              title={
                editData
                  ? 'Review the request to see all leave information.'
                  : 'Create a leave request by entering all required fields.'
              }
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
      >
        {addLeaveRequestDialog?.value &&
          (editData ? (
            <LeaveRequestForm
              editData={editData}
              mode={mode}
              hrDetailHook={useGetLeaveRequestByIdQuery}
              selfDetailHook={useGetMyLeaveRequestByIdQuery}
            />
          ) : (
            <AddLeaveRequest editData={editData} mode={mode} handleClose={handleClose} />
          ))}
      </CustomDialog>
    </Box>
  );
};

export default ApplyLeave;
