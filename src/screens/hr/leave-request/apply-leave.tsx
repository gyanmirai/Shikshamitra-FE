'use client';

import type { RootState } from 'src/redux/store';
import type { IColumn } from 'src/components/customizabaleTable/types';

import { LoadingButton } from '@mui/lab';
import { Add } from '@mui/icons-material';
import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { hrPaths } from 'src/constants/hr-menus';
import { useBoolean } from 'src/hooks/use-boolean';
import { useSelector, useDispatch } from 'react-redux';
import CustomDialog from 'src/components/customDialog';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { EmployeeLeaveStatusOptions } from 'src/enums/employee-leave-status';
import SendInstantNotificationDialog from 'src/components/send-instant-notification-dialog';
import { useAcademicOrganizationOptions } from 'src/screens/hr/hooks/useAcademicOrganizationOptions';
import {
  Box,
  Card,
  Chip,
  Alert,
  Stack,
  Button,
  MenuItem,
  MenuList,
  Typography,
} from '@mui/material';
import {
  useGetLeaveRequestByIdQuery,
  useLazyGetLeaveRequestsQuery,
  useCancelLeaveRequestMutation,
  useGetMyLeaveRequestByIdQuery,
  useLazyGetMyLeaveRequestsQuery,
  useCancelMyLeaveRequestMutation,
} from 'src/redux/hr/leaveApi';

import AddLeaveRequest from './leave-requst';
import LeaveCalender, { LeaveRequestForm } from './leave-calender';
import {
  getLeaveStatusColor,
  getLeaveStatusLabel,
  getLeaveStatusFilterValue,
} from './leave-status.utils';
import {
  parseApiProblemDetail,
  LEAVE_EMPLOYEE_NOT_FOUND,
  APPLY_LEAVE_ROW_ACTION_LABELS,
  formatLeaveCalendarDateForDisplay,
} from './leave-request.utils';

const LEAVE_REQUESTS_PAGE_SIZE = 100;
const MY_LEAVE_PATH = '/dashboard/my-leave';
const LEAVE_REQUESTS_LOAD_ERROR_MESSAGE = 'Unable to load leave requests. Please try again.';
const LEAVE_REQUESTS_NETWORK_ERROR_MESSAGE =
  'Unable to connect to the leave service. Please check that the backend is running and try again.';

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
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const { byId: organizationById } = useAcademicOrganizationOptions(currentYear?.id);
  const [leaveRequests, setLeaveRequests] = useState<any[]>([]);
  const [isLeaveRequestsLoading, setIsLeaveRequestsLoading] = useState(false);
  const [selfLeaveAccessError, setSelfLeaveAccessError] = useState<string | null>(null);
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
      setSelfLeaveAccessError(null);

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
        const parsedError = parseApiProblemDetail(e);
        if (isSelfMode && parsedError.errorCode === LEAVE_EMPLOYEE_NOT_FOUND) {
          setSelfLeaveAccessError(
            'Your user is not linked to an employee profile. Contact admin/HR.'
          );
          setLeaveRequests([]);
          return;
        }

        const message =
          (e as any)?.status === 'FETCH_ERROR'
            ? LEAVE_REQUESTS_NETWORK_ERROR_MESSAGE
            : parsedError.detail || LEAVE_REQUESTS_LOAD_ERROR_MESSAGE;

        shikshaMitraToast.error({
          message,
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
  const viewCalendarView = useBoolean();
  const [editData, setEditData] = useState<any>(null);

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
          {APPLY_LEAVE_ROW_ACTION_LABELS[0]}
        </MenuItem>
        <MenuItem
          onClick={() => {
            setEditData(row);
            cancelConfirmation.onTrue();
            popover.onClose();
          }}
          sx={{ color: 'error.main' }}
        >
          <Iconify icon={GlobalIcons.delete} sx={{ height: '16px', width: '16px' }} />
          {APPLY_LEAVE_ROW_ACTION_LABELS[1]}
        </MenuItem>
      </MenuList>
    ),
    [addLeaveRequestDialog, cancelConfirmation]
  );

  const tableData = useMemo(() => {
    const apiData =
      leaveRequests?.map((item: any) => ({
        id: item.id,
        name: item.name || item.employeeName,
        employeeId: item.employeeId,
        employeeIdentifier: item.employeeIdentifier || item.employeeCode,
        submittedBy: item.submittedByEmployeeCode
          ? `${item.submittedByName || '-'} (${item.submittedByEmployeeCode})`
          : (item.submittedByName ?? '-'),
        paidType: item.paidType ?? item.leaveType,
        startDate: formatLeaveCalendarDateForDisplay(item.startDate),
        endDate: formatLeaveCalendarDateForDisplay(item.endDate),
        totalDays: item.totalDays,
        organization:
          item.mediumStageName ||
          organizationById.get(String(item?.mediumStageId ?? ''))?.name ||
          '-',
        description: item.description,
        remarks: item.remarks,
        status: getLeaveStatusFilterValue(item.status),
      })) || [];

    return apiData;
  }, [leaveRequests, organizationById]);

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
        label: 'Paid Type',
        id: 'paidType',
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
    <Box sx={{ height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column' }}>
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
          <Box display="flex" flexDirection="column" gap={1}>
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
          {selfLeaveAccessError ? (
            <Card sx={{ p: 2 }}>
              <Alert severity="warning">{selfLeaveAccessError}</Alert>
            </Card>
          ) : (
            <>
              <Card
                variant="outlined"
                sx={{
                  p: 1.25,
                  mb: 1,
                  borderRadius: 1,
                  boxShadow: 'none',
                }}
              >
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={1}
                  alignItems={{ xs: 'stretch', sm: 'center' }}
                  justifyContent="space-between"
                >
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        flexShrink: 0,
                        borderRadius: 1,
                        color: 'primary.main',
                        bgcolor: 'primary.lighter',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Iconify icon="solar:document-text-bold-duotone" width={18} />
                    </Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                      Leave Requests
                    </Typography>
                    <Chip
                      size="small"
                      variant="soft"
                      color="info"
                      label={`${tableData.length} shown`}
                      sx={{ fontWeight: 800 }}
                    />
                  </Stack>

                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={1}
                    justifyContent="flex-end"
                  >
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<Add />}
                      onClick={() => {
                        addLeaveRequestDialog.onTrue();
                      }}
                      sx={{ borderRadius: 1, px: 2.5 }}
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
                        sx={{ borderRadius: 1, px: 2.5 }}
                      >
                        View Calendar
                      </Button>
                    )}
                  </Stack>
                </Stack>
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
        maxWidth="sm"
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
