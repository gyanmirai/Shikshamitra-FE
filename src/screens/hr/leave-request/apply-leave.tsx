'use client';

import { leaveRequestColumnBindings } from 'src/screens/hr/leave-request/leave-table-filters';
import { serverColumnFilters } from 'src/screens/hr/utils/server-column-filters';
import type { RootState } from 'src/redux/store';
import type { IColumn } from 'src/components/customizabaleTable/types';

import { LoadingButton } from '@mui/lab';
import { createPortal } from 'react-dom';
import { Add } from '@mui/icons-material';
import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { hrPaths } from 'src/constants/hr-menus';
import { useBoolean } from 'src/hooks/use-boolean';
import { useSelector, useDispatch } from 'react-redux';
import CustomDialog from 'src/components/customDialog';
import { shikshaMitraToast } from 'src/components/toast';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { useHrTableExport } from 'src/screens/hr/hooks/use-hr-table-export';
import { EmployeeLeaveStatusOptions } from 'src/enums/employee-leave-status';
import { Box, Card, Alert, Stack, Button, MenuItem, MenuList } from '@mui/material';
import SendInstantNotificationDialog from 'src/components/send-instant-notification-dialog';
import { useAcademicOrganizationOptions } from 'src/screens/hr/hooks/useAcademicOrganizationOptions';
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

const MY_LEAVE_PATH = '/dashboard/my-leave';
const LEAVE_REQUESTS_LOAD_ERROR_MESSAGE = 'Unable to load leave requests. Please try again.';
const LEAVE_REQUESTS_NETWORK_ERROR_MESSAGE =
  'Unable to connect to the leave service. Please check that the backend is running and try again.';

type ApplyLeaveProps = {
  mode?: 'hr' | 'self';
  showBreadcrumbs?: boolean;
  actionsContainer?: HTMLElement | null;
  openCreateOnMount?: boolean;
};

const ApplyLeave = ({
  mode = 'hr',
  showBreadcrumbs = true,
  actionsContainer,
  openCreateOnMount = false,
}: ApplyLeaveProps) => {
  const isSelfMode = mode === 'self';
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const { byId: organizationById } = useAcademicOrganizationOptions(currentYear?.id);
  const [leaveRequests, setLeaveRequests] = useState<any[]>([]);
  const [isLeaveRequestsLoading, setIsLeaveRequestsLoading] = useState(false);
  const [selfLeaveAccessError, setSelfLeaveAccessError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [tableQuery, setTableQuery] = useState({
    page: 1,
    pageSize: 20,
    search: '',
    status: '',
    paidType: '',
  });
  const [totalCount, setTotalCount] = useState(0);
  const [tableError, setTableError] = useState<unknown>();
  const exportTable = useHrTableExport(isSelfMode ? 'hr-self-leave-history' : 'hr-leave-requests', {
    academicYearId: currentYear?.id,
    ...tableQuery,
  });
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
        const response = await (isSelfMode ? triggerMyLeaveRequests : triggerLeaveRequests)(
          { academicYearId: currentYear.id, ...tableQuery },
          false
        ).unwrap();
        if (!isActive) return;
        setLeaveRequests(response?.items || []);
        setTotalCount(response?.totalCount || 0);
        setTableError(undefined);
      } catch (e) {
        if (!isActive) return;
        setTableError(e);
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
  }, [
    currentYear?.id,
    isSelfMode,
    reloadKey,
    tableQuery,
    triggerLeaveRequests,
    triggerMyLeaveRequests,
  ]);

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

  const addLeaveRequestDialog = useBoolean(openCreateOnMount);
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
        appliedDate: formatLeaveCalendarDateForDisplay(item.appliedDate),
        startDate: formatLeaveCalendarDateForDisplay(item.startDate),
        endDate: formatLeaveCalendarDateForDisplay(item.endDate),
        totalDays: item.totalDays,
        organization:
          item.mediumStageName ||
          organizationById.get(String(item?.mediumStageId ?? ''))?.name ||
          '-',
        description: item.reason ?? item.description,
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
        stickyOnMobile: false,
        minWidth: 180,
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
        minWidth: 100,
      },
      ...(!isSelfMode
        ? [
            {
              label: 'Submitted By',
              id: 'submittedBy',
              defaultHidden: true,
              align: 'left' as const,
              minWidth: '12vw',
              render(value: any) {
                return value || '-';
              },
            },
          ]
        : []),
      {
        label: 'Applied Date',
        id: 'appliedDate',
        filterType: 'date',
        minWidth: '120px',
        align: 'left',
        isDateFilter: true,
        cellSx: { whiteSpace: 'nowrap' },
      },
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
        minWidth: '120px',
        align: 'left',
        isDateFilter: true,
      },
      {
        label: 'Total Days',
        id: 'totalDays',
        minWidth: 80,
        align: 'left',
        filterType: 'number',
      },
      {
        label: 'Organization',
        id: 'organization',
        defaultHidden: true,
        align: 'left',
        minWidth: '14vw',
      },
      {
        label: 'Reason',
        id: 'description',
        align: 'left',
        minWidth: 180,
      },
      {
        label: 'Remarks',
        id: 'remarks',
        defaultHidden: true,
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
        stickyOnMobile: false,
        stickyPosition: 'right' as const,
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
        stickyOnMobile: false,
        stickyPosition: 'right' as const,
        render(_value, row) {
          return <ThreeDotsActions placement="right-top" actions={(prop) => actions(prop, row)} />;
        },
      },
    ],
    [actions, isSelfMode]
  );

  const renderActions = (content: React.ReactNode) =>
    actionsContainer ? (
      createPortal(content, actionsContainer)
    ) : (
      <Box sx={{ mb: 1 }}>{content}</Box>
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
              description="The Leave Calendar visually displays staff leave requests and their statuses—approved, pending, or rejected—on specific dates."
              isBack
              onBack={viewCalendarView.onFalse}
            />
          )}
          {renderActions(
            <Button
              variant="outlined"
              color="inherit"
              size="small"
              startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}
              onClick={viewCalendarView.onFalse}
            >
              Back to Requests
            </Button>
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
              {renderActions(
                <Stack
                  direction="row"
                  spacing={1}
                  useFlexGap
                  flexWrap="wrap"
                  justifyContent="flex-end"
                >
                  {!isSelfMode && (
                    <Button
                      variant="outlined"
                      color="inherit"
                      size="small"
                      startIcon={<Iconify icon={GlobalIcons.calenderIcon} />}
                      onClick={viewCalendarView.onTrue}
                    >
                      View Calendar
                    </Button>
                  )}
                  <Button
                    variant="contained"
                    color="inherit"
                    size="small"
                    startIcon={<Add />}
                    onClick={addLeaveRequestDialog.onTrue}
                  >
                    Apply Leave
                  </Button>
                </Stack>
              )}
              <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
                <CustomizableTable
                  wrapperProps={{ sx: { height: 1 } }}
                  tableContainerProps={{ sx: { height: 1 } }}
                  tableTitle="Leave requests and history"
                  showColumns
                  showExport
                  showFullScreen
                  exportScope="all"
                  onExport={exportTable}
                  error={tableError}
                  onRetry={() => setReloadKey((key) => key + 1)}
                  serverSidePagination
                  serverSideSearch
                  page={tableQuery.page - 1}
                  rowsPerPage={tableQuery.pageSize}
                  totalCount={totalCount}
                  onServerPagination={(page, pageSize) =>
                    setTableQuery((query) => ({ ...query, page, pageSize }))
                  }
                  onServerSearch={(search) =>
                    setTableQuery((query) => ({ ...query, page: 1, search }))
                  }
                  noDataText="No leave requests for this academic year."
                  onSendNotification={handlerSendNotification}
                  showCheckbox={selectedStudents.length !== 0}
                  isLoading={isLeaveRequestsLoading}
                  tableId="apply-leave-table"
                  data={tableData}
                  searchTerm={tableQuery.search}
                  {...serverColumnFilters(
                    columns,
                    leaveRequestColumnBindings,
                    tableQuery,
                    (patch) =>
                      setTableQuery((current) => ({
                        ...current,
                        page: 1,
                        status: String(patch.status ?? ''),
                        paidType: String(patch.paidType ?? ''),
                      }))
                  )}
                />
              </Box>
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
        title={editData ? 'View Leave Request' : 'Add Leave Request'}
        titleInfo={
          editData
            ? 'Review the request to see all leave information.'
            : 'Create a leave request by entering all required fields.'
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
