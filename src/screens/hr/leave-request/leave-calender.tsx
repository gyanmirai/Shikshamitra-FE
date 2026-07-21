import type { RootState } from 'src/redux/store';
import type { DatesSetArg, EventClickArg } from '@fullcalendar/core';

import { useSelector } from 'react-redux';
import { getSession } from 'next-auth/react';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CommonCalender from 'src/components/calender';
import { alpha, useTheme } from '@mui/material/styles';
import CustomDialog from 'src/components/customDialog';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { usePopover, CustomPopover } from 'src/components/custom-popover';
import { useAcademicOrganizationOptions } from 'src/screens/hr/hooks/useAcademicOrganizationOptions';
import {
  getLeaveStatusColor,
  getLeaveStatusLabel,
} from 'src/screens/hr/leave-request/leave-status.utils';
import {
  Box,
  Chip,
  Stack,
  Divider,
  TableRow,
  MenuList,
  MenuItem,
  TableCell,
  Typography,
} from '@mui/material';
import {
  useGetLeaveRequestByIdQuery,
  useLazyGetLeaveCalendarQuery,
  useGetMyLeaveRequestByIdQuery,
} from 'src/redux/hr/leaveApi';
import {
  shouldClearSelectedOrganization,
  resolveLeaveRequestDetailLabels,
} from 'src/screens/hr/leave-request/leave-calender.utils';
import {
  getLeaveAttachmentLabel,
  buildLeaveAttachmentDownloadUrl,
  formatLeaveCalendarDateForDisplay,
} from 'src/screens/hr/leave-request/leave-request.utils';
import {
  CALENDAR_MAX_PAGES,
  CALENDAR_PAGE_SIZE,
  dedupeCalendarItemsById,
  shouldMarkCalendarCapReached,
  buildCalendarVisibleRangePayload,
} from 'src/screens/hr/leave-request/leave-calendar.utils';

const LeaveCalender = () => {
  const [currentDateClick, setCurrentDateClick] = useState<EventClickArg | null>(null);
  const popover = usePopover();
  const { employee } = useSelector((state: any) => state.auth);
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const { options: organizationOptions, isLoading: organizationOptionsLoading } =
    useAcademicOrganizationOptions(currentYear?.id);
  const [selectedMediumStageId, setSelectedMediumStageId] = useState<string>('');
  const [calendarVisibleRange, setCalendarVisibleRange] = useState<{
    rangeStart: string;
    rangeEnd: string;
  } | null>(null);
  const [calendarItems, setCalendarItems] = useState<any[]>([]);
  const [calendarTotalCount, setCalendarTotalCount] = useState(0);
  const [isCalendarLoading, setIsCalendarLoading] = useState(false);
  const [calendarCapReached, setCalendarCapReached] = useState(false);
  const [triggerCalendarQuery] = useLazyGetLeaveCalendarQuery();

  const onDatesSet = useCallback((arg: DatesSetArg) => {
    const newRange = buildCalendarVisibleRangePayload(arg.start, arg.end);
    setCalendarVisibleRange((prev) => {
      if (prev && prev.rangeStart === newRange.rangeStart && prev.rangeEnd === newRange.rangeEnd) {
        return prev;
      }
      return newRange;
    });
  }, []);

  useEffect(() => {
    let isActive = true;

    const loadCalendarData = async () => {
      if (!currentYear?.id || !calendarVisibleRange) {
        setCalendarItems([]);
        setCalendarTotalCount(0);
        setCalendarCapReached(false);
        setIsCalendarLoading(false);
        return;
      }

      setIsCalendarLoading(true);
      setCalendarCapReached(false);

      try {
        const allItems: any[] = [];

        const loadPageRecursively = async (
          page: number,
          knownTotalCount: number
        ): Promise<{ totalCount: number; reachedPageLimit: boolean }> => {
          const response = await triggerCalendarQuery(
            {
              academicYearId: currentYear.id,
              rangeStart: calendarVisibleRange.rangeStart,
              rangeEnd: calendarVisibleRange.rangeEnd,
              page,
              pageSize: CALENDAR_PAGE_SIZE,
            },
            false
          ).unwrap();

          const totalCount = page === 1 ? (response?.totalCount ?? 0) : knownTotalCount;

          const pageItems = Array.isArray(response?.items) ? response.items : [];
          allItems.push(...pageItems);

          const shouldStop =
            allItems.length >= totalCount ||
            pageItems.length === 0 ||
            pageItems.length < CALENDAR_PAGE_SIZE;

          if (shouldStop) {
            return { totalCount, reachedPageLimit: false };
          }

          if (page >= CALENDAR_MAX_PAGES) {
            return { totalCount, reachedPageLimit: true };
          }

          return loadPageRecursively(page + 1, totalCount);
        };

        const { totalCount, reachedPageLimit } = await loadPageRecursively(1, 0);

        if (!isActive) {
          return;
        }

        const deduped = dedupeCalendarItemsById(allItems);
        setCalendarItems(deduped);
        setCalendarTotalCount(totalCount);
        setCalendarCapReached(
          shouldMarkCalendarCapReached(reachedPageLimit, totalCount, deduped.length)
        );
      } catch {
        if (!isActive) {
          return;
        }
        setCalendarItems([]);
        setCalendarTotalCount(0);
        setCalendarCapReached(false);
      } finally {
        if (isActive) {
          setIsCalendarLoading(false);
        }
      }
    };

    loadCalendarData();

    return () => {
      isActive = false;
    };
  }, [calendarVisibleRange, currentYear?.id, triggerCalendarQuery]);

  useEffect(() => {
    if (
      shouldClearSelectedOrganization(
        selectedMediumStageId,
        organizationOptions,
        organizationOptionsLoading
      )
    ) {
      setSelectedMediumStageId('');
    }
  }, [organizationOptions, organizationOptionsLoading, selectedMediumStageId]);

  const calendarData = useMemo(
    () =>
      calendarItems
        .filter((i: any) =>
          selectedMediumStageId ? String(i?.mediumStageId ?? '') === selectedMediumStageId : true
        )
        .map((i: any) => {
          const paidType = i.paidType ?? i.leaveTypeName ?? i.leaveType ?? '';
          const color = paidType === 'Unpaid' ? '#ED6C02' : '#2E7D32';
          const desc = String(i.description ?? '');
          const plainDesc = desc.replace(/<[^>]+>/g, '');
          return {
            ...i,
            start: i.startDate,
            end: i.endDate,
            color,
            allDay: false,
            employeeCode: i.employeeCode,
            textColor: color,
            title: `${paidType} [${i.employeeName ?? i.name ?? ''}] ${i.status ?? ''}`,
            reason: i.reason ?? plainDesc,
            description: plainDesc,
            paidType,
            name: i.employeeName ?? i.name,
            viewStartDate: i.startDate,
            viewEndDate: i.endDate,
            ...(i.employeeId === employee?.id ? { className: 'ownEvent' } : {}),
          };
        }) || [],
    [calendarItems, employee?.id, selectedMediumStageId]
  );
  const editData = useMemo(() => {
    if (currentDateClick) {
      return calendarData.find((i: any) => i.id === currentDateClick.event.id);
    }
    return null;
  }, [calendarData, currentDateClick]);

  return (
    <Box sx={{ height: '100%' }}>
      <CommonCalender
        data={calendarData}
        isLoading={isCalendarLoading}
        datesSet={onDatesSet}
        onDateClick={(arg) => {
          setCurrentDateClick(arg);
        }}
        initialView="dayGridMonth"
        formate="MMM YYYY"
        containerProps={{
          sx: {
            height: '100%',
            minHeight: '0',
          },
        }}
        views={{
          timeGridWeek: {
            dayHeaderFormat: { weekday: 'short', day: '2-digit' }, // Sun, 01
          },
          dayGridMonth: {
            titleFormat: { year: 'numeric', month: 'long' }, // June 2025
          },
          dayGridDay: {
            titleFormat: { day: '2-digit', month: 'long', year: 'numeric' }, // 18 June 2025
          },
        }}
        allDaySlot={false}
        viewOptions={[
          { value: 'dayGridMonth', label: 'Month', icon: 'mingcute:calendar-month-line' },
          { value: 'timeGridWeek', label: 'Week', icon: 'mingcute:calendar-week-line' },
          { value: 'listWeek', label: 'Agenda', icon: 'fluent:calendar-agenda-24-regular' },
        ]}
        validRange={{ start: currentYear?.startDate, end: currentYear?.endDate }}
      />
      {calendarCapReached && (
        <Typography variant="caption" color="warning.main" sx={{ display: 'block', mt: 1 }}>
          {selectedMediumStageId
            ? `Showing ${calendarData.length} filtered events from ${calendarItems.length} loaded of ${calendarTotalCount} total leave events for this view. Refine filters or date range to load remaining events.`
            : `Showing ${calendarData.length} of ${calendarTotalCount} leave events for this view. Refine filters or date range to load remaining events.`}
        </Typography>
      )}
      <CustomDialog
        open={!!currentDateClick}
        handleClose={() => setCurrentDateClick(null)}
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">Leave Request Details</Typography>
            <CustomTooltip
              arrow
              placement="right"
              title="Displays detailed information about the employeeâ€™s leave request, including type, dates, reason, and approval status."
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
      >
        <LeaveRequestForm editData={editData} />
      </CustomDialog>

      <CustomPopover
        open={popover.open}
        anchorEl={popover.anchorEl}
        onClose={popover.onClose}
        slotProps={{ arrow: { placement: 'top-left' } }}
      >
        <MenuList>
          <MenuItem
            selected={!selectedMediumStageId}
            onClick={() => {
              setSelectedMediumStageId('');
              popover.onClose();
            }}
          >
            All Medium Stages
          </MenuItem>
          {organizationOptions.map((org) => (
            <MenuItem
              key={org.id}
              selected={selectedMediumStageId === String(org.id)}
              value={org.id}
              onClick={() => {
                setSelectedMediumStageId(String(org.id));
                popover.onClose();
              }}
            >
              {org.name}
            </MenuItem>
          ))}
        </MenuList>
      </CustomPopover>
    </Box>
  );
};

export default LeaveCalender;

type LeaveDetailHook = (arg: any, options?: any) => any;

type LeaveRequestFormProps = {
  editData: any;
  mode?: 'hr' | 'self';
  hrDetailHook?: LeaveDetailHook;
  selfDetailHook?: LeaveDetailHook;
};

export const LeaveRequestForm = ({
  editData,
  mode = 'hr',
  hrDetailHook = useGetLeaveRequestByIdQuery,
  selfDetailHook = useGetMyLeaveRequestByIdQuery,
}: LeaveRequestFormProps) => {
  const isSelfMode = mode === 'self';
  const theme = useTheme();
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const { byId: organizationById } = useAcademicOrganizationOptions(currentYear?.id);
  const { data: leaveDetailForHr, isLoading: isHrLeaveDetailLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: hrDetailHook,
    params: { id: editData?.id },
    options: { skip: !editData?.id || isSelfMode },
  });
  const { data: leaveDetailForSelf, isLoading: isSelfLeaveDetailLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: selfDetailHook,
    params: { id: editData?.id },
    options: { skip: !editData?.id || !isSelfMode },
  });
  const leaveDetail = isSelfMode ? leaveDetailForSelf : leaveDetailForHr;
  const isLeavePolicyLoading = isSelfMode ? isSelfLeaveDetailLoading : isHrLeaveDetailLoading;

  const detail = leaveDetail || editData;
  const submittedByLabel = detail?.submittedByEmployeeCode
    ? `${detail?.submittedByName || '-'} (${detail.submittedByEmployeeCode})`
    : (detail?.submittedByName ?? '-');
  const organizationFromStore = organizationById.get(
    String(detail?.mediumStageId ?? editData?.mediumStageId ?? '')
  )?.name;
  const { academicYearLabel, organizationLabel } = resolveLeaveRequestDetailLabels({
    detail,
    editData,
    organizationName: organizationFromStore,
    currentYearName: currentYear?.name,
  });
  const attachmentLabel = getLeaveAttachmentLabel(detail);

  const handleOpenAttachment = useCallback(async () => {
    if (!detail?.id) {
      return;
    }

    try {
      const session: any = await getSession();
      const response = await fetch(
        buildLeaveAttachmentDownloadUrl(detail.id, isSelfMode ? 'self' : 'hr'),
        {
          credentials: 'include',
          headers: {
            ...(session?.accessToken ? { Authorization: `Bearer ${session.accessToken}` } : {}),
          },
        }
      );

      if (!response.ok) {
        throw new Error('Attachment download failed');
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      window.open(objectUrl, '_blank', 'noopener,noreferrer');
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
    } catch (error) {
      console.error(error);
      shikshaMitraToast.error({ message: 'Unable to open leave attachment.' });
    }
  }, [detail?.id, isSelfMode]);

  const employeeName =
    detail?.employeeName ||
    `${editData?.employee?.firstName || ''} ${editData?.employee?.lastName || ''}`.trim() ||
    '-';

  // eslint-disable-next-line react/no-unstable-nested-components
  const InfoRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <Box display="flex" justifyContent="space-between" alignItems="center">
      <Typography variant="body2" color="text.secondary" sx={{ flexShrink: 0, mr: 2 }}>
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={600} textAlign="right">
        {value}
      </Typography>
    </Box>
  );

  // eslint-disable-next-line react/no-unstable-nested-components
  const SectionHeader = ({ icon, label }: { icon: string; label: string }) => (
    <Stack direction="row" alignItems="center" spacing={0.75} mb={2}>
      <Iconify icon={icon} width={15} color="text.disabled" />
      <Typography
        variant="overline"
        sx={{ color: 'text.disabled', letterSpacing: 1.2, lineHeight: 1, fontSize: '0.68rem' }}
      >
        {label}
      </Typography>
    </Stack>
  );

  return isLeavePolicyLoading ? (
    <TableRow>
      <TableCell sx={{ height: '50px' }}>
        <Box className="loader" height={24} />
      </TableCell>
    </TableRow>
  ) : (
    <Scrollbar sx={{ maxHeight: 520 }}>
      {/*  Header  */}
      <Box sx={{ px: 3, pt: 2.5, pb: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" gap={1}>
          <Box minWidth={0}>
            <Typography variant="h5" fontWeight={700} mb={0.5}>
              {employeeName}
            </Typography>
            <Stack direction="row" alignItems="center" spacing={0.75} flexWrap="wrap">
              <Typography variant="body2" color="text.secondary" fontWeight={500}>
                {detail?.employeeCode || '-'}
              </Typography>
              {submittedByLabel && (
                <>
                  <Box
                    sx={{
                      width: 3,
                      height: 3,
                      borderRadius: '50%',
                      bgcolor: 'text.disabled',
                      flexShrink: 0,
                    }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    Submitted by {submittedByLabel}
                  </Typography>
                </>
              )}
            </Stack>
          </Box>
          <Label
            color={getLeaveStatusColor(detail?.status ?? editData?.status)}
            sx={{ flexShrink: 0, mt: 0.5 }}
          >
            <Box
              sx={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                bgcolor: 'currentColor',
                mr: 0.75,
                display: 'inline-block',
                opacity: 0.85,
              }}
            />
            {getLeaveStatusLabel(detail?.status ?? editData?.status)}
          </Label>
        </Box>
      </Box>

      <Divider />

      {/*  Section: Employee Information  */}
      <Box sx={{ px: 3, py: 2.5 }}>
        <SectionHeader icon="mdi:account-outline" label="Employee Information" />
        <Stack spacing={1.5}>
          <InfoRow label="Academic year" value={academicYearLabel} />
          <InfoRow label="Organization" value={organizationLabel} />
          <InfoRow label="Employee code" value={detail?.employeeCode || '-'} />
          <InfoRow label="Submitted by" value={submittedByLabel} />
        </Stack>
      </Box>

      <Divider />

      {/*  Section: Leave Details  */}
      <Box sx={{ px: 3, py: 2.5 }}>
        <SectionHeader icon="mdi:calendar-outline" label="Leave Details" />
        <Stack spacing={1.5}>
          <InfoRow label="Paid type" value={detail?.paidType || editData?.paidType || '-'} />
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="body2" color="text.secondary" sx={{ flexShrink: 0, mr: 2 }}>
              Duration
            </Typography>
            <Stack direction="row" alignItems="center" spacing={0.75}>
              <Typography variant="body2" fontWeight={600}>
                {formatLeaveCalendarDateForDisplay(
                  detail?.startDate || editData?.viewStartDate,
                  'DD MMM YYYY'
                )}
              </Typography>
              {!detail?.halfDay && (
                <>
                  <Iconify icon="mdi:arrow-right" width={14} color="text.disabled" />
                  <Typography variant="body2" fontWeight={600}>
                    {formatLeaveCalendarDateForDisplay(
                      detail?.endDate || editData?.viewEndDate,
                      'DD MMM YYYY'
                    )}
                  </Typography>
                </>
              )}
              {detail?.totalDays != null && (
                <Chip
                  label={`${detail.totalDays} ${detail.totalDays === 1 ? 'day' : 'days'}`}
                  size="small"
                  sx={{ height: 22, fontSize: '0.68rem', fontWeight: 700 }}
                />
              )}
            </Stack>
          </Box>
          <InfoRow label="Session" value={detail?.halfDay ? 'Half day' : 'Full day'} />
        </Stack>
      </Box>

      {/*  Section: Reason  */}
      {(detail?.description || editData?.reason || editData?.description) && (
        <>
          <Divider />
          <Box sx={{ px: 3, py: 2.5 }}>
            <SectionHeader icon="mdi:format-list-text" label="Reason" />
            <Box
              sx={{
                p: 2,
                borderRadius: 1.5,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.neutral',
              }}
            >
              <Typography variant="body2" lineHeight={1.85}>
                {detail?.description ||
                  editData?.reason ||
                  (editData?.description && (
                    // eslint-disable-next-line react/no-danger
                    <span dangerouslySetInnerHTML={{ __html: editData.description }} />
                  ))}
              </Typography>
            </Box>
          </Box>
        </>
      )}

      {/*  Section: Remarks  */}
      {detail?.remarks && (
        <>
          <Divider />
          <Box sx={{ px: 3, py: 2.5 }}>
            <SectionHeader icon="mdi:comment-text-outline" label="Remarks" />
            <Typography variant="body2" color="text.secondary" lineHeight={1.75}>
              {detail.remarks}
            </Typography>
          </Box>
        </>
      )}

      {/*  Section: Attachment  */}
      {detail?.attachmentUrl && (
        <>
          <Divider />
          <Box sx={{ px: 3, py: 2.5 }}>
            <SectionHeader icon="mdi:paperclip" label="Attachment" />
            <Box
              component="button"
              onClick={handleOpenAttachment}
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1,
                px: 2,
                py: 0.875,
                borderRadius: 5,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.neutral',
                cursor: 'pointer',
                transition: 'border-color 0.15s, background-color 0.15s',
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.06),
                  borderColor: 'primary.main',
                },
              }}
            >
              <Iconify icon="mdi:file-document-outline" width={14} color="primary.main" />
              <Typography variant="body2" fontWeight={500} color="text.primary">
                {attachmentLabel}
              </Typography>
              <Iconify icon="mdi:arrow-right" width={14} color="text.disabled" />
            </Box>
          </Box>
        </>
      )}
    </Scrollbar>
  );
};
