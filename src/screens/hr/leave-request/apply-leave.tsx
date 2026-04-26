'use client';

import type { RootState } from 'src/redux/store';
import type { LabelColor } from 'src/components/label';
import type { IColumn } from 'src/components/customizabaleTable/types';

import dayjs from 'dayjs';
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
import { Box, Card, Button, MenuItem, MenuList, Typography } from '@mui/material';
import SendInstantNotificationDialog from 'src/components/send-instant-notification-dialog';
import { useLazyGetLeaveRequestsQuery, useCancelLeaveRequestMutation } from 'src/redux/hr/leaveApi';
import {
  EmployeeLeaveStatusType,
  EmployeeLeaveStatusOptions,
  EmployeeLeaveStatusTypeColor,
} from 'src/enums/employee-leave-status';

import AddLeaveRequest from './leave-requst';
import LeaveCalender, { LeaveRequestForm } from './leave-calender';

const LEAVE_REQUESTS_PAGE_SIZE = 200;

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

const ApplyLeave = () => {
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const [leaveRequests, setLeaveRequests] = useState<any[]>([]);
  const [isLeaveRequestsLoading, setIsLeaveRequestsLoading] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [triggerLeaveRequests] = useLazyGetLeaveRequestsQuery();

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
          const response = await triggerLeaveRequests(
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
  }, [currentYear?.id, reloadKey, triggerLeaveRequests]);

  const [deleteLeave, { isLoading: isDeleteLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useCancelLeaveRequestMutation,
  });

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
          View
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
          Cancel
        </MenuItem>
      </MenuList>
    ),
    [addLeaveRequestDialog, cancelConfirmation]
  );

  const tableData = useMemo(() => {
    const apiData =
      leaveRequests?.map((item: any) => {
        const start = dayjs(item.startDate);
        const end = dayjs(item.endDate);

        return {
          id: item.id,
          name: item.name,
          employeeIdentifier: item.employeeIdentifier,
          leaveType: item.leaveType,
          startDate: start.format('DD-MM-YYYY'),
          endDate: end.format('DD-MM-YYYY'),
          totalDays: item.totalDays,
          organization: item.mediumStageName,
          description: item.description,
          remarks: item.remarks,
          status: item.status,
        };
      }) || [];

    return apiData;
  }, [leaveRequests]);

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
          const color = EmployeeLeaveStatusTypeColor[
            value as EmployeeLeaveStatusType
          ] as LabelColor;

          return <Label color={color}>{EmployeeLeaveStatusType[value]}</Label>;
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
    [actions]
  );

  return (
    <Box sx={{ height: '100%', minHeight: '0', display: 'flex', flexDirection: 'column' }}>
      {viewCalendarView.value ? (
        <>
          <CustomBreadcrumbs
            heading="Calendar View"
            links={[
              { name: 'HR/Staff', href: '/hr/dashboard/' },
              {
                name: 'Leave Management',
                href: hrPaths.leaveManagement.applyLeave,
                onClick: viewCalendarView.onFalse,
              },
              { name: 'Leave Management' },
            ]}
            description="The Leave Calendar visually displays employees leave requests and their statuses—approved, pending, or rejected—on specific dates."
            isBack
            onBack={viewCalendarView.onFalse}
          />
          <Box display="flex" flexDirection="column" gap={2}>
            <LeaveCalender />
          </Box>
        </>
      ) : (
        <>
          <CustomBreadcrumbs
            heading="Apply Leave"
            links={[
              { name: 'HR/Staff', href: '/hr/dashboard/' },
              { name: 'Leave Management', href: hrPaths.leaveManagement.applyLeave },
              { name: 'Apply Leave' },
            ]}
            description="Create new leave requests and manage existing ones."
          />
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
            <LeaveRequestForm editData={editData} />
          ) : (
            <AddLeaveRequest editData={editData} handleClose={handleClose} />
          ))}
      </CustomDialog>
    </Box>
  );
};

export default ApplyLeave;
