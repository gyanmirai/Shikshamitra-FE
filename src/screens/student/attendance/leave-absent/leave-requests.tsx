'use client';

import type { RootState } from 'src/redux/store';
import type { IInquiryData } from 'src/types/student';
import type { LabelColor } from 'src/components/label';
import type { IColumn } from 'src/components/customizabaleTable/types';
import type { Medium, Division, Standards, Organization } from 'src/types/school';

import dayjs from 'dayjs';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { LoadingButton } from '@mui/lab';
import { useSelector } from 'react-redux';
import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { Editor } from 'src/components/editor';
import { DatePicker } from '@mui/x-date-pickers';
import { Iconify } from 'src/components/iconify';
import { formatStr } from 'src/utils/format-time';
import { useBoolean } from 'src/hooks/use-boolean';
import FileUploader from 'src/components/custom-upload';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import sortQueryString from 'src/utils/sort-query-string';
import { hasGrantedPermission } from 'src/utils/permissions';
import { editorClasses } from 'src/components/editor/classes';
import { FormBusyRegion } from 'src/components/form-busy-region';
import ShakingTextField from 'src/components/shaking-text-field';
import { StudentFeedback } from 'src/components/student-feedback';
import CustomizableTable from 'src/components/customizabaleTable';
import React, { useId, useMemo, useState, useEffect } from 'react';
import { FormSectionCard } from 'src/components/form-section-card';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { dateFormat, dateConvertor } from 'src/utils/dateConvertor';
import { useLazyGetStudentsByDivisionQuery } from 'src/redux/student';
import { useUnsavedNavigation } from 'src/hooks/use-unsaved-navigation';
import { PaginatedSearchSelect } from 'src/components/paginated-search-select';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { renderUnsavedConfirmation } from 'src/components/confirm-dialog/render-unsaved-confirmation';
import { useGetStudentAttendanceTypeQuery } from 'src/redux/student/attendance-type/attendance-type-api';
import {
  EmployeeLeaveStatusType,
  EmployeeLeaveStatusTypeColor,
} from 'src/enums/employee-leave-status';
import {
  getLeaveStatusColor,
  getLeaveStatusLabel,
} from 'src/screens/hr/leave-request/leave-status.utils';
import {
  Box,
  Tab,
  Tabs,
  Chip,
  Grid,
  Card,
  Stack,
  Button,
  Divider,
  TextField,
  Typography,
  DialogActions,
} from '@mui/material';
import {
  useGetStudentLeaveQuery,
  useAddStudentLeaveMutation,
  useUpdateStudentLeaveMutation,
  useRejectStudentLeaveMutation,
  useApproveStudentLeaveMutation,
  useGetStudentLeaveStatusCountsQuery,
} from 'src/redux/student/student-leave/student-leave-api';

import { LeaveRequestActions } from './leave-request-actions';
import { useAttendanceContext } from '../setting/attendance-context';
import {
  parseLeaveTableFilters,
  serializeLeaveTableFiltersForApi,
} from './leave-request-table-filters';

import type { IFormValues, LeaveDecisionContext } from './type';

const LeaveAndAbsentScreen = ({
  scope,
  selectedMedium,
  selectedOrganizationId,
  selectedStandardId,
  selectedDivisionId,
}: {
  scope: {
    boardId?: string;
    academicYearId?: string;
    educationMediumId?: string;
    organizationId?: string;
    standardId?: string;
    divisionId?: string;
  };
  selectedMedium?: Medium;
  selectedOrganizationId?: string;
  selectedStandardId?: string;
  selectedDivisionId?: string;
}) => {
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const canWrite = hasGrantedPermission(permissions, 'Students.Attendance.LeaveAndAbsent.Add');
  // State to control the dialog visibility
  // Dialog control for add/edit form
  const dialog = useBoolean();
  const [formBusy, setFormBusy] = useState(false);
  const [formDirty, setFormDirty] = useState(false);
  const [decisionLeave, setDecisionLeave] = useState<LeaveDecisionContext | null>(null);
  // Dialog control for reject confirmation
  const confirmRejectDialog = useBoolean();
  // Dialog control for view leave details
  const viewDialog = useBoolean();
  const [viewData, setViewData] = useState<any>(null);
  const [editingLeave, setEditingLeave] = useState<any>(null);

  const [whichStatus, setWhichStatus] = useState<EmployeeLeaveStatusType | null>(null);

  const [leaveId, setLeaveId] = useState<string>('');

  const { requestNavigation, confirmation } = useUnsavedNavigation(formDirty, {
    blockNavigation: formBusy,
    guardContextChanges: true,
    renderConfirmation: renderUnsavedConfirmation,
  });

  const context = useAttendanceContext();
  const requiresMediumSelection = context.params.get('dashboard') === 'pending' && !selectedMedium;
  const requestedStatus = context.params.get('leaveStatus');
  const selectedStatus: 'pending' | 'approved' | 'rejected' = [
    'pending',
    'approved',
    'rejected',
  ].includes(requestedStatus ?? '')
    ? (requestedStatus as 'pending' | 'approved' | 'rejected')
    : 'pending';
  const statusValue = {
    pending: EmployeeLeaveStatusType.Pending,
    approved: EmployeeLeaveStatusType.Approved,
    rejected: EmployeeLeaveStatusType.Rejected,
  }[selectedStatus];
  const page = Math.max(0, Number(context.params.get('leavePage')) || 0);
  const rowsPerPage = [10, 25, 50, 100].includes(Number(context.params.get('leaveSize')))
    ? Number(context.params.get('leaveSize'))
    : 10;
  const savedTableFilters = context.params.get('leaveFilters');
  const hasDomainFilters = ['board', 'medium', 'organization', 'class', 'division'].some((key) =>
    context.params.has(key)
  );
  const tableFilters = useMemo(
    () => parseLeaveTableFilters(savedTableFilters),
    [savedTableFilters]
  );
  const tableFiltersQuery = useMemo(
    () => serializeLeaveTableFiltersForApi(tableFilters),
    [tableFilters]
  );
  const countTableFiltersQuery = useMemo(
    () =>
      serializeLeaveTableFiltersForApi(tableFilters.filter((filter) => filter.column !== 'status')),
    [tableFilters]
  );
  const skipLeaveQueries =
    !scope.academicYearId ||
    (context.params.get('dashboard') !== 'pending' && !scope.educationMediumId);
  const query = {
    sorting: context.params.get('leaveSort') || '',
    filterText: context.params.get('leaveSearch') || undefined,
    skipCount: page * rowsPerPage,
    maxResultCount: rowsPerPage,
    status: statusValue,
    tableFilters: tableFiltersQuery,
  };
  const {
    currentData: leaveData,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetStudentLeaveQuery,
    params: { ...query, ...scope },
    options: { skip: skipLeaveQueries },
    popupConfig: { error: false },
  });
  const countQuery = {
    ...scope,
    filterText: query.filterText,
    tableFilters: countTableFiltersQuery,
  };
  const { currentData: statusCounts } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetStudentLeaveStatusCountsQuery,
    params: countQuery,
    options: { skip: skipLeaveQueries },
    popupConfig: { error: false },
  });

  const handleClose = (_e: any, isSubmit?: boolean) => {
    const close = () => {
      dialog.onFalse();
      setEditingLeave(null);
      confirmRejectDialog.onFalse();
      setWhichStatus(null);
      setLeaveId('');
      setDecisionLeave(null);
      setFormDirty(false);
    };
    if (isSubmit) close();
    else requestNavigation(close);
  };

  const tableData = useMemo(
    () =>
      leaveData?.items?.map((item: any) => ({
        ...item,
        // Use backend's totalDays value directly
        totalDays: item.totalDays,
        // Format leaveDate properly
        formattedLeaveDate: item.leaveDate
          ? dayjs(item.leaveDate).format(formatStr.split.date)
          : '-',
        // Format endDate with null handling
        formattedEndDate: item.endDate ? dayjs(item.endDate).format(formatStr.split.date) : '-',
      })),
    [leaveData]
  );

  const columns: IColumn[] = useMemo(
    () => [
      // {
      //   id: 'checkBox',
      //   label: ' ',
      //   isSort: false,
      //   isFilter: false,
      //   minWidth: '60px',
      //   sticky: true,
      //   renderColumn: (value) => (
      //     <Checkbox
      //       checked={tableData?.length === selectedStudent?.length}
      //       onChange={(e) => {
      //         if (e.target.checked) {
      //           setSelectedStudent(tableData);
      //         } else {
      //           setSelectedStudent([]);
      //         }
      //       }}
      //     />
      //   ),
      //   render(value, row) {
      //     return (
      //       <Checkbox
      //         checked={selectedStudent.some((student: any) => student.id === row.id)}
      //         onChange={(e) => {
      //           if (!e.target.checked) {
      //             setSelectedStudent(
      //               selectedStudent.filter((student: any) => student.id !== row.id)
      //             );
      //           } else {
      //             setSelectedStudent([...selectedStudent, row]);
      //           }
      //         }}
      //       />
      //     );
      //   },
      // },
      {
        id: 'studentName',
        label: 'Student',
        filterType: 'string',
        sticky: true,
        render(value, row) {
          return (
            <Box display="flex" alignItems="center" gap={1}>
              {value}
            </Box>
          );
        },
      },
      { id: 'organizationName', label: 'Medium', filterType: 'string' },
      { id: 'className', label: 'Class', filterType: 'string' },
      { id: 'divisionName', label: 'Division', filterType: 'string' },
      { id: 'leaveTypeName', label: 'Leave type', filterType: 'string', minWidth: '120px' },
      {
        id: 'formattedLeaveDate',
        label: 'Start date',
        filterType: 'date',
        minWidth: '120px',
        align: 'right',
      },
      {
        id: 'formattedEndDate',
        label: 'End date',
        filterType: 'date',
        minWidth: '120px',
        align: 'right',
        render(value, row) {
          return row.isHalfDay ? dayjs(row.leaveDate).format(formatStr.split.date) : value;
        },
      },
      {
        id: 'totalDays',
        label: 'Total days',
        minWidth: '120px',
        filterType: 'number',
        align: 'right',
        render(value, row) {
          if (value === null || value === undefined || Number.isNaN(value)) return '-';
          const days = parseFloat(value);
          if (days === 0.5) return 'Half day';
          return days === 1 ? '1 day' : `${days} days`;
        },
      },
      {
        id: 'status',
        label: 'Status',
        filterType: 'enum',
        isSort: false,
        sticky: true,
        enumOptions: [
          { label: 'Pending', value: EmployeeLeaveStatusType.Pending },
          { label: 'Approved', value: EmployeeLeaveStatusType.Approved },
          { label: 'Rejected', value: EmployeeLeaveStatusType.Rejected },
        ],
        render(value, row) {
          const color = EmployeeLeaveStatusTypeColor[
            value as EmployeeLeaveStatusType
          ] as LabelColor;

          return <Label color={color}>{EmployeeLeaveStatusType[value]}</Label>;
        },
      },
      {
        id: 'action',
        label: 'Actions',
        sticky: true,
        minWidth: 120,
        isSort: false,
        isFilter: false,
        align: 'right',
        render(value, row) {
          if (!canWrite || row.status !== EmployeeLeaveStatusType.Pending) return null;
          const student = row.studentName || 'student';
          return (
            <LeaveRequestActions
              editDisabled={requiresMediumSelection}
              studentName={student}
              onApprove={() => {
                setDecisionLeave(row);
                setWhichStatus(EmployeeLeaveStatusType.Approved);
                setLeaveId(row.id);
                confirmRejectDialog.onTrue();
              }}
              onReject={() => {
                setDecisionLeave(row);
                setWhichStatus(EmployeeLeaveStatusType.Rejected);
                setLeaveId(row.id);
                confirmRejectDialog.onTrue();
              }}
              onEdit={() => {
                if (requiresMediumSelection) return;
                setEditingLeave(row);
                dialog.onTrue();
              }}
            />
          );
        },
      },
    ],

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [canWrite, requiresMediumSelection]
  );

  return (
    <Box sx={{ height: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
      <Card sx={{ boxShadow: 'var(--shadows-4)', px: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Tabs
            value={selectedStatus}
            onChange={(_, value) => {
              const nextFilters = tableFilters.filter((filter) => filter.column !== 'status');
              context.update({
                leaveStatus: String(value),
                leaveFilters: nextFilters.length ? JSON.stringify(nextFilters) : undefined,
                leavePage: undefined,
              });
            }}
            aria-label="Leave request status"
            sx={{ '& .MuiTabs-flexContainer': { gap: 2 }, flexGrow: 1 }}
          >
            {[
              {
                value: 'pending',
                label: 'Pending',
                color: 'warning',
                count: statusCounts?.pendingCount,
              },
              {
                value: 'approved',
                label: 'Approved',
                color: 'success',
                count: statusCounts?.approvedCount,
              },
              {
                value: 'rejected',
                label: 'Rejected',
                color: 'error',
                count: statusCounts?.rejectedCount,
              },
            ].map((tab) => (
              <Tab
                key={tab.value}
                value={tab.value}
                sx={{ fontSize: '12px' }}
                label={
                  <Box display="flex" justifyContent="center" gap={1} alignItems="center">
                    {tab.label}
                    <Label color={tab.color as LabelColor}>{tab.count ?? '…'}</Label>
                  </Box>
                }
              />
            ))}
          </Tabs>
          {canWrite && (
            <Button
              size="small"
              variant="contained"
              disabled={requiresMediumSelection}
              startIcon={<Iconify icon="mdi:plus" />}
              sx={{ ml: 'auto' }}
              onClick={() => {
                setEditingLeave(null);
                dialog.onTrue();
              }}
            >
              Add leave request
            </Button>
          )}
        </Box>
      </Card>
      {canWrite && requiresMediumSelection && (
        <StudentFeedback notificationKey="STU-0624" presentation="inline" severity="info">
          Select a medium in the filters to add or edit leave requests. You can still review,
          approve, or reject requests across all mediums.
        </StudentFeedback>
      )}
      {isError && (
        <StudentFeedback
          notificationKey="STU-0625"
          presentation="toast"
          severity="error"
          toastAction={<Button onClick={refetch}>Retry</Button>}
        >
          Leave requests could not be loaded.
        </StudentFeedback>
      )}
      <CustomizableTable
        tableTitle="Leave requests"
        wrapperProps={{ sx: { flex: 1, minHeight: 0 } }}
        tableContainerProps={{ sx: { height: 1 } }}
        tableId="leave-absent-table"
        noDataText={
          <>
            {context.params.get('leaveSearch')
              ? 'No leave requests match your search. Clear the search to see requests in this scope.'
              : tableFilters.length
                ? `No ${selectedStatus} leave requests match the selected column filters.`
                : hasDomainFilters
                  ? `No ${selectedStatus} leave requests match these filters.`
                  : `No ${selectedStatus} leave requests yet.`}{' '}
            {(context.params.get('leaveSearch') || tableFilters.length || hasDomainFilters) && (
              <Button
                size="small"
                onClick={() => {
                  if (context.params.get('leaveSearch')) {
                    context.update({ leaveSearch: undefined, leavePage: undefined });
                  } else if (tableFilters.length) {
                    context.update({ leaveFilters: undefined, leavePage: undefined });
                  } else {
                    context.update({
                      board: undefined,
                      medium: undefined,
                      organization: undefined,
                      class: undefined,
                      division: undefined,
                      leavePage: undefined,
                    });
                  }
                }}
              >
                {context.params.get('leaveSearch')
                  ? 'Clear search'
                  : tableFilters.length
                    ? 'Clear column filters'
                    : 'Clear filters'}
              </Button>
            )}
            {canWrite && !context.params.get('leaveSearch') && !tableFilters.length && (
              <Button
                size="small"
                disabled={requiresMediumSelection}
                onClick={() => {
                  setEditingLeave(null);
                  dialog.onTrue();
                }}
              >
                Add leave request
              </Button>
            )}
          </>
        }
        columns={columns}
        data={tableData || []}
        getRowAction={(row) => ({
          label: `View leave request for ${row.studentName || 'student'}`,
          onClick: () => {
            setViewData(row);
            viewDialog.onTrue();
          },
        })}
        serverSide
        serverSidePagination
        serverSideSort
        serverSideSortMode="single"
        serverSideFilter
        filters={tableFilters}
        onServerFilter={(nextFilters) =>
          context.update({
            leaveFilters: nextFilters.length
              ? JSON.stringify(
                  nextFilters.map(({ column, type, value, valueType, label, displayValue }) => ({
                    column,
                    type,
                    value,
                    valueType,
                    label: typeof label === 'string' ? label : undefined,
                    displayValue: typeof displayValue === 'string' ? displayValue : undefined,
                  }))
                )
              : undefined,
            leavePage: undefined,
          })
        }
        totalCount={leaveData?.totalCount || 0}
        page={page}
        rowsPerPage={rowsPerPage}
        searchTerm={context.params.get('leaveSearch') || ''}
        onServerSearch={(value) => context.update({ leaveSearch: value, leavePage: undefined })}
        serverSideSearch
        onServerSort={(_, sortData) =>
          context.update({ leaveSort: sortQueryString(sortData), leavePage: undefined })
        }
        onServerPagination={(nextPage, nextSize) =>
          context.update({ leavePage: String(nextPage - 1), leaveSize: String(nextSize) })
        }
        isLoading={isLoading || (isFetching && !leaveData)}
        isRefreshing={isFetching && Boolean(leaveData)}
        errorContent={
          isError ? <Box role="region" aria-label="Leave requests unavailable" /> : undefined
        }
      />{' '}
      <CustomDialog
        maxWidth="md"
        open={dialog.value}
        disableClose={formBusy}
        guardUnsavedChanges={false}
        handleClose={() => handleClose(null, false)}
        title={editingLeave ? 'Edit Leave Request' : 'Add Leave Request'}
        titleInfo={
          editingLeave ? 'Update this pending leave request.' : 'Create a student leave request.'
        }
      >
        <LeaveRequestForm
          key={editingLeave?.id ?? 'new'}
          editData={editingLeave}
          selectedMedium={selectedMedium}
          selectedOrganizationId={selectedOrganizationId}
          selectedStandardId={selectedStandardId}
          selectedDivisionId={selectedDivisionId}
          handleClose={handleClose}
          onBusyChange={setFormBusy}
          onDirtyChange={setFormDirty}
        />
      </CustomDialog>
      <CustomDialog
        title={`${whichStatus === EmployeeLeaveStatusType.Rejected ? 'Reject Leave' : 'Approve Leave'} · ${decisionLeave?.studentName || 'Student'}`}
        titleInfo="Review the selected leave request before recording your decision."
        open={confirmRejectDialog.value}
        disableClose={formBusy}
        guardUnsavedChanges={false}
        hasForm={false}
        handleClose={() => handleClose(null, false)}
      >
        <LeaveAbsent
          handleClose={handleClose}
          leaveId={leaveId}
          status={whichStatus}
          onBusyChange={setFormBusy}
          onDirtyChange={setFormDirty}
          requestData={decisionLeave}
        />
      </CustomDialog>
      {/* View Leave Details Dialog */}
      <CustomDialog
        open={viewDialog.value}
        handleClose={() => {
          viewDialog.onFalse();
          setViewData(null);
        }}
        title="Leave Request Details"
        titleInfo="Read-only details for the selected leave request."
        hasForm={false}
        guardUnsavedChanges={false}
        maxWidth="sm"
        paperProps={{ sx: { maxWidth: 520 } }}
      >
        <DialogScrollContent sx={{ p: 0 }}>
          <StudentLeaveViewDetail data={viewData} />
        </DialogScrollContent>
        <DialogActions>
          <Button
            variant="outlined"
            size="small"
            startIcon={<Iconify icon={GlobalIcons.cancel} />}
            onClick={() => {
              viewDialog.onFalse();
              setViewData(null);
            }}
          >
            Close
          </Button>
        </DialogActions>
      </CustomDialog>
      {confirmation}
    </Box>
  );
};

export default LeaveAndAbsentScreen;

const LeaveRequestForm = ({
  onDirtyChange,
  onBusyChange,
  handleClose,
  editData,
  selectedMedium,
  selectedOrganizationId,
  selectedStandardId,
  selectedDivisionId,
}: {
  onDirtyChange: (dirty: boolean) => void;
  handleClose: (e: any, isSubmit: boolean) => void;
  onBusyChange: (busy: boolean) => void;
  editData?: any;
  selectedMedium?: Medium;
  selectedOrganizationId?: string;
  selectedStandardId?: string;
  selectedDivisionId?: string;
}) => {
  const descriptionLabelId = useId();
  const supportingDocumentLabelId = useId();
  const supportingDocumentHelpId = useId();
  // State to store all available organizations
  const [allOrganization, setAllOrganization] = useState<Organization[]>([]);
  // State to store the selected organization
  const [organization, setOrganization] = useState<string>('');
  // State to store all available classes
  const [allClass, setAllClass] = useState<Standards[]>([]);
  // State to store the selected class
  const [classes, setClass] = useState<string>('');
  // State to store all available divisions
  const [allDivision, setAllDivision] = useState<Division[]>([]);
  // State to store the selected division
  const [division, setDivision] = useState<string>('');
  // State to store the selected student
  const [student, setStudent] = useState<IInquiryData | null>(null);
  // Selector to get the current board from Redux store
  const medium = selectedMedium;

  // Effect to update all organizations and set default organization when medium changes
  useEffect(() => {
    setAllOrganization(medium?.educationMediumStages || []);
    setOrganization(selectedOrganizationId || medium?.educationMediumStages?.[0]?.id || '');
  }, [medium, selectedOrganizationId]);

  // Effect to update all classes and set default class when organization changes
  useEffect(() => {
    const availableClasses =
      allOrganization.find((item) => item.id === organization)?.standards || [];
    setAllClass(availableClasses);
    setClass(
      availableClasses.some((item) => item.id === selectedStandardId)
        ? selectedStandardId!
        : availableClasses[0]?.id || ''
    );
  }, [organization, allOrganization, selectedStandardId]);

  // Effect to update all divisions and set default division when class changes
  useEffect(() => {
    const availableDivisions = allClass.find((item) => item.id === classes)?.divisions || [];
    setAllDivision(availableDivisions);
    setDivision(
      availableDivisions.some((item) => item.id === selectedDivisionId)
        ? selectedDivisionId!
        : availableDivisions[0]?.id || ''
    );
  }, [allClass, classes, selectedDivisionId]);

  // Returns getStudents function and loading state
  const [getStudents, { isLoading: isStudentsLoading }] = useQueryAndMutation({
    type: 'mutation',
    params: { divisionId: division },
    currentQueryAndMutation: useLazyGetStudentsByDivisionQuery,
  });

  // Fetch all attendance types
  const { data: attendanceTypes } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetStudentAttendanceTypeQuery,
  });

  const [addLeaveRequest, { isLoading: addStudentLeaveLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddStudentLeaveMutation,
  });
  const [updateLeaveRequest, { isLoading: updateStudentLeaveLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateStudentLeaveMutation,
  });

  const { dirty, errors, touched, setFieldValue, values, handleSubmit } = useFormik<IFormValues>({
    initialValues: {
      leaveType: editData?.studentLeaveTypeId ?? '',
      description: editData?.description ?? '',
      startDate: editData?.leaveDate ? dayjs(editData.leaveDate) : null,
      endDate: editData?.endDate ? dayjs(editData.endDate) : null,
      isHalfDay: editData?.isHalfDay ?? false,
      rejectionReason: '',
      status: null,
      docs: '',
    },
    validationSchema: Yup.object({
      leaveType: Yup.string().required('Leave type is required'),
      isHalfDay: Yup.boolean(),
      startDate: Yup.mixed()
        .nullable()
        .test('is-valid-dayjs', (value, testContext) => {
          const label = testContext.parent.isHalfDay ? 'Date' : 'Start date';
          if (!value) return testContext.createError({ message: `${label} is required` });
          if (!dayjs(value as any).isValid()) {
            return testContext.createError({ message: `${label} must be a valid date` });
          }
          return true;
        }),
      endDate: Yup.mixed()
        .nullable()
        .test(
          'is-valid-dayjs',
          'End date must be a valid date',
          (value) => !value || dayjs(value as any).isValid()
        )
        .test('endDate', '', (value, context) => {
          const { isHalfDay } = context.parent;
          const { startDate } = context.parent;
          if (isHalfDay) return true;
          if (startDate && value) {
            const fullStartDate = dayjs(startDate);
            const endDate = dayjs(value as any);

            const isSameOrAfter =
              endDate.isSame(fullStartDate, 'day') || endDate.isAfter(fullStartDate, 'day');

            return (
              isSameOrAfter ||
              context.createError({ message: 'End date must be same or after start date' })
            );
          }
          if (!value && !isHalfDay) {
            return context.createError({ message: 'End date is required' });
          }
          return true;
        }),
      description: Yup.string().required('Leave description is required'),
      status: Yup.string().nullable(),
      rejectionReason: Yup.string().test(
        'rejectionReason',
        'Rejection reason is required',
        (value, context) => {
          const { status } = context.parent;
          if (status === EmployeeLeaveStatusType.Rejected) {
            return !!value || context.createError({ message: 'Rejection reason is required' });
          }
          return true;
        }
      ),
    }),
    onSubmit: async (val) => {
      try {
        const payload = {
          studentLeaveTypeId: val.leaveType,
          isHalfDay: val.isHalfDay,
          description: val.description,
          ...(val.docs
            ? {
                attachment: val.docs.replace(/^data:[^;]+;base64,/, ''),
                attachmentFileName: `${editData?.studentName || student?.firstName || 'Student'} ${val.leaveType} ${val.startDate?.format(dateFormat)}`,
                attachmentContentType: 'application/octet-stream',
              }
            : {}),
          leaveDate: dateConvertor(val?.startDate?.format(dateFormat) || ''),
          ...(!val.isHalfDay
            ? {
                endDate: dateConvertor(val?.endDate?.format(dateFormat) || ''),
              }
            : { endDate: null }),
        };
        if (editData?.id) {
          await updateLeaveRequest({ id: editData.id, data: payload }).unwrap();
        } else {
          if (!student?.studentId) return;
          await addLeaveRequest({ studentId: student.studentId, ...payload }).unwrap();
        }
        shikshaMitraToast.success({
          message: editData ? 'Leave request updated.' : 'Leave request submitted as pending.',
        });
        handleClose(null, true);
      } catch (err) {
        shikshaMitraToast.error({
          message: (err as any)?.data?.detail || 'Leave request could not be saved. Please retry.',
        });
      }
    },
  });

  const { currentYear } = useSelector((state: RootState) => state.globalState);
  useEffect(() => {
    onBusyChange(addStudentLeaveLoading || updateStudentLeaveLoading);
  }, [addStudentLeaveLoading, updateStudentLeaveLoading, onBusyChange]);
  useEffect(() => () => onBusyChange(false), [onBusyChange]);
  useEffect(() => {
    onDirtyChange(dirty);
  }, [dirty, onDirtyChange]);
  return (
    <>
      <DialogScrollContent>
        <FormBusyRegion
          busy={addStudentLeaveLoading || updateStudentLeaveLoading}
          label="Saving leave request…"
        >
          {editData && (
            <Typography variant="subtitle2" sx={{ mb: 2 }}>
              Student: {editData.studentName}
              {editData.hasAttachment && !values.docs ? ' · Existing attachment retained' : ''}
            </Typography>
          )}
          {!editData && (
            <FormSectionCard
              title="Student Details"
              icon={GlobalIcons.notebook}
              descriptionTooltip="Choose the student's class and division before searching for a student."
              titleTypographyProps={{ variant: 'subtitle1', fontWeight: 600 }}
            >
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <CustomSelect
                    label="Organization"
                    disabled={!medium}
                    options={allOrganization || []}
                    value={organization}
                    labelKey="name"
                    valueKey="id"
                    onChange={(value: any) => {
                      setOrganization(value || '');
                      setStudent(null);
                    }}
                    formControlProps={{ sx: { width: '100%' } }}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <CustomSelect
                    label="Class"
                    disabled={!organization}
                    options={allClass || []}
                    value={classes}
                    labelKey="name"
                    valueKey="id"
                    onChange={(value: any) => {
                      setClass(value || '');
                      setStudent(null);
                    }}
                    formControlProps={{ sx: { width: '100%' } }}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <CustomSelect
                    label="Division"
                    disabled={!classes}
                    options={allDivision || []}
                    value={division}
                    labelKey="name"
                    valueKey="id"
                    onChange={(value: any) => {
                      setDivision(value || '');
                      setStudent(null);
                    }}
                    formControlProps={{ sx: { width: '100%' } }}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <CustomTooltip
                    placement="top"
                    title={
                      student
                        ? `${student?.firstName || ''} ${student?.lastName || ''}`.trim()
                        : undefined
                    }
                  >
                    <PaginatedSearchSelect
                      key={`${organization}-${classes}-${division}`}
                      label="Student"
                      isLoading={isStudentsLoading}
                      noOptionsText="No students found"
                      disabled={!division}
                      fetchOptions={async (query: string, page: number) => {
                        if (!division) return { data: [], hasMore: false };
                        try {
                          const res = await getStudents(division).unwrap();

                          let filteredItems = res?.items || [];
                          if (query) {
                            const lowerQuery = query.toLowerCase();
                            filteredItems = filteredItems.filter((item: any) =>
                              `${item.firstName || ''} ${item.lastName || ''} ${item.middleName || ''}`
                                .toLowerCase()
                                .includes(lowerQuery)
                            );
                          }

                          return {
                            data: filteredItems?.map((item: any) => ({
                              label: `${item?.firstName || ''} ${item?.lastName || ''}`,
                              id: item.studentId,
                              originalData: item,
                            })),
                            hasMore: false,
                          };
                        } catch {
                          return { data: [], hasMore: false };
                        }
                      }}
                      value={
                        student
                          ? {
                              label: `${student.firstName || ''} ${student.lastName || ''}`,
                              id: student.studentId as string,
                            }
                          : null
                      }
                      isOptionEqualToValue={(option, value) => option.id === value?.id}
                      getOptionLabel={(option: any) => option?.label || ''}
                      renderOption={(prop, option: any) => (
                        <li {...prop} key={option.id}>
                          {option.label}
                        </li>
                      )}
                      minChars={0}
                      onChange={(_, value: any) => {
                        setStudent(value?.originalData || null);
                      }}
                      fullWidth
                      sx={{ width: '100%' }}
                      size="small"
                    />
                  </CustomTooltip>
                </Grid>
              </Grid>
            </FormSectionCard>
          )}

          {(editData || student?.studentId) && (
            <FormSectionCard
              title="Leave Details"
              icon={GlobalIcons.notebook}
              descriptionTooltip="Choose the leave type, dates, reason, and supporting attachment."
              titleTypographyProps={{ variant: 'subtitle1', fontWeight: 600 }}
              sx={{ mt: 2 }}
            >
              <Grid container spacing={2}>
                {/* Row 1: Leave Type and Half Day Button */}
                <Grid size={{ xs: 12, sm: values.isHalfDay ? 4 : 3 }}>
                  <ShakingTextField error={!!(touched.leaveType && errors.leaveType)}>
                    <CustomSelect
                      label="Leave type"
                      required
                      options={attendanceTypes?.items || []}
                      value={values.leaveType}
                      labelKey="leaveTypeName"
                      valueKey="id"
                      onChange={(value: any) => {
                        setFieldValue('leaveType', value || '');
                      }}
                      error={!!(touched.leaveType && errors.leaveType)}
                      helperText={(touched.leaveType && errors.leaveType) as string}
                      formControlProps={{ sx: { width: '100%' } }}
                    />
                  </ShakingTextField>
                </Grid>

                <Grid size={{ xs: 12, sm: values.isHalfDay ? 4 : 3 }}>
                  <Button
                    variant={values.isHalfDay ? 'contained' : 'outlined'}
                    color={values.isHalfDay ? 'primary' : 'inherit'}
                    size="small"
                    fullWidth
                    aria-pressed={values.isHalfDay}
                    onClick={() => {
                      setFieldValue('isHalfDay', !values.isHalfDay);
                      if (!values.isHalfDay) setFieldValue('endDate', null);
                    }}
                  >
                    Half day
                  </Button>
                </Grid>

                {/* Row 2: Date Fields */}
                <Grid size={{ xs: 12, sm: values.isHalfDay ? 4 : 3 }}>
                  <ShakingTextField error={touched.startDate && Boolean(errors.startDate)}>
                    <DatePicker
                      label={values.isHalfDay ? 'Date' : 'Start date'}
                      value={values.startDate}
                      onChange={(value) => setFieldValue('startDate', value)}
                      format={formatStr.split.date}
                      minDate={dayjs(currentYear?.startDate)}
                      maxDate={dayjs(currentYear?.endDate)}
                      disablePast={!editData}
                      slotProps={{
                        textField: {
                          required: true,
                          size: 'small',
                          fullWidth: true,
                          helperText: touched.startDate && errors.startDate,
                          error: touched.startDate && Boolean(errors.startDate),
                        },
                      }}
                    />
                  </ShakingTextField>
                </Grid>

                {!values.isHalfDay && (
                  <Grid size={{ xs: 12, sm: values.isHalfDay ? 4 : 3 }}>
                    <ShakingTextField error={touched.endDate && Boolean(errors.endDate)}>
                      <DatePicker
                        label="End date"
                        value={values.endDate}
                        format={formatStr.split.date}
                        minDate={dayjs(currentYear?.startDate)}
                        maxDate={dayjs(currentYear?.endDate)}
                        disablePast={!editData}
                        onChange={(value) => setFieldValue('endDate', value)}
                        slotProps={{
                          textField: {
                            required: true,
                            size: 'small',
                            fullWidth: true,
                            helperText: touched.endDate && errors.endDate,
                            error: touched.endDate && Boolean(errors.endDate),
                          },
                        }}
                      />
                    </ShakingTextField>
                  </Grid>
                )}

                {/* Row 3: Description and Upload */}
                <Grid size={{ xs: 12 }} mb={-1}>
                  <Typography id={descriptionLabelId} variant="subtitle2">
                    Leave description *
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <ShakingTextField error={touched.description && Boolean(errors.description)}>
                    <Editor
                      value={values.description}
                      onChange={(value) => setFieldValue('description', value)}
                      placeholder="Describe the reason for leave."
                      editorProps={{
                        attributes: {
                          role: 'textbox',
                          'aria-labelledby': descriptionLabelId,
                          'aria-required': 'true',
                        },
                      }}
                      error={touched.description && Boolean(errors.description)}
                      helperText={touched.description && errors.description}
                      sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        [`& .${editorClasses.content.root}`]: {
                          minHeight: '200px',
                          height: '100%',
                          flex: 1,
                          '& .tiptap': {
                            '&.ProseMirror': {
                              padding: '16px',
                              paddingBottom: '24px',
                              minHeight: '100%',
                              height: '100%',
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'flex-start',
                            },
                          },
                        },
                      }}
                    />
                  </ShakingTextField>
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Typography id={supportingDocumentLabelId} variant="subtitle2" sx={{ mb: 1 }}>
                    Supporting document (optional)
                  </Typography>
                  <FileUploader
                    value={typeof values.docs === 'string' ? undefined : values.docs}
                    multiple={false}
                    onChange={(value) => setFieldValue('docs', value)}
                    primaryText="Choose supporting document"
                    disabled={addStudentLeaveLoading || updateStudentLeaveLoading}
                    parentsProps={{ role: 'group', 'aria-labelledby': supportingDocumentLabelId }}
                    dragProps={{ 'aria-describedby': supportingDocumentHelpId }}
                  />
                  <Typography
                    id={supportingDocumentHelpId}
                    variant="caption"
                    color="text.secondary"
                  >
                    One PNG, JPG, JPEG or PDF file, up to 5 MB.
                  </Typography>
                </Grid>
              </Grid>
            </FormSectionCard>
          )}
        </FormBusyRegion>
      </DialogScrollContent>

      <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
        <Button
          startIcon={<Iconify icon="mdi:close" />}
          size="small"
          disabled={addStudentLeaveLoading || updateStudentLeaveLoading}
          onClick={() => {
            handleClose(null, false);
          }}
          variant="outlined"
        >
          Cancel
        </Button>
        <LoadingButton
          type="submit"
          startIcon={<Iconify icon="mdi:content-save-outline" />}
          onClick={(e: any) => handleSubmit(e)}
          variant="contained"
          size="small"
          loading={addStudentLeaveLoading || updateStudentLeaveLoading}
          disabled={!editData && !student?.studentId}
        >
          Submit
        </LoadingButton>
      </DialogActions>
    </>
  );
};

const LeaveAbsent = ({
  onDirtyChange,
  requestData,
  onBusyChange,
  handleClose,
  status,
  leaveId,
}: {
  onDirtyChange: (dirty: boolean) => void;
  requestData: LeaveDecisionContext | null;
  handleClose: (e: any, isSubmit: boolean) => void;
  status: EmployeeLeaveStatusType | null;
  leaveId: string;
  onBusyChange: (busy: boolean) => void;
}) => {
  /**
   * Custom hook for managing leave status changes
   * Uses mutation to update leave request status in the backend
   * @returns {Array} - Array containing the mutation function
   */
  const [approveStudentLeave, { isLoading: isApproveLeaveLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useApproveStudentLeaveMutation,
  });
  const [rejectStudentLeave, { isLoading: isRejectLeaveLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useRejectStudentLeaveMutation,
  });

  const busy = isApproveLeaveLoading || isRejectLeaveLoading;
  useEffect(() => {
    onBusyChange(busy);
  }, [busy, onBusyChange]);
  useEffect(() => () => onBusyChange(false), [onBusyChange]);
  const { dirty, values, errors, touched, handleChange, handleSubmit } = useFormik({
    initialValues: {
      remarks: '',
    },
    validationSchema: Yup.object({
      remarks:
        status === EmployeeLeaveStatusType.Rejected
          ? Yup.string().required('Remarks is required')
          : Yup.string(),
    }),
    async onSubmit() {
      try {
        if (status === EmployeeLeaveStatusType.Approved) {
          await approveStudentLeave({
            id: leaveId,
            data: {
              status,
              remarks: values.remarks,
              rejectionReason: values.remarks,
            },
          }).unwrap();
        } else if (status === EmployeeLeaveStatusType.Rejected) {
          await rejectStudentLeave({
            id: leaveId,
            data: {
              status,
              remarks: values.remarks,
              rejectionReason: values.remarks,
            },
          }).unwrap();
        }
        handleClose(null, true);
        shikshaMitraToast.success({
          message: `Leave Request ${EmployeeLeaveStatusType[status as EmployeeLeaveStatusType]} successfully`,
        });
      } catch (error) {
        console.error('Error submitting form:', error);
      }
    },
  });
  useEffect(() => {
    onDirtyChange(dirty);
  }, [dirty, onDirtyChange]);

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <DialogScrollContent>
        <FormBusyRegion busy={busy} label="Recording leave decision…">
          <FormSectionCard
            title="Leave Decision"
            icon={GlobalIcons.notebook}
            descriptionTooltip="Confirm the request and enter a reason when rejecting."
            titleTypographyProps={{ variant: 'subtitle1', fontWeight: 600 }}
          >
            <Typography variant="body2" sx={{ mb: 2 }}>
              {requestData?.studentName} · {requestData?.leaveTypeName || 'Leave'} ·{' '}
              {requestData?.leaveDate
                ? dayjs(requestData.leaveDate).format(formatStr.split.date)
                : 'Date unavailable'}
              {requestData?.endDate
                ? ` – ${dayjs(requestData.endDate).format(formatStr.split.date)}`
                : ''}
            </Typography>
            <ShakingTextField error={Boolean(touched.remarks && errors.remarks)}>
              <TextField
                disabled={busy}
                value={values.remarks}
                onChange={handleChange}
                name="remarks"
                label="Remarks"
                required={status === EmployeeLeaveStatusType.Rejected}
                size="small"
                multiline
                fullWidth
                rows={4}
                error={touched.remarks && !!errors.remarks}
                helperText={touched.remarks && (errors.remarks as string)}
                sx={{ mb: 2 }}
              />
            </ShakingTextField>
          </FormSectionCard>
        </FormBusyRegion>
      </DialogScrollContent>
      <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
        <Button
          variant="outlined"
          size="small"
          color="inherit"
          disabled={busy}
          onClick={() => {
            handleClose(null, false);
          }}
          startIcon={<Iconify icon="mdi:close" />}
        >
          Cancel
        </Button>
        <LoadingButton
          type="submit"
          startIcon={
            <Iconify
              icon={
                status === EmployeeLeaveStatusType.Rejected
                  ? 'mdi:close-circle-outline'
                  : 'mdi:check-circle-outline'
              }
            />
          }
          onClick={(e: any) => handleSubmit(e)}
          variant="contained"
          size="small"
          loading={isApproveLeaveLoading || isRejectLeaveLoading}
        >
          {status === EmployeeLeaveStatusType.Rejected ? 'Reject' : 'Approve'}
        </LoadingButton>
      </DialogActions>
    </Box>
  );
};

const LeaveDetailField = ({
  label,
  value,
  fullWidth = false,
}: {
  label: string;
  value: React.ReactNode;
  fullWidth?: boolean;
}) => (
  <Box sx={{ minWidth: 0, gridColumn: fullWidth ? '1 / -1' : undefined }}>
    <Typography variant="caption" color="text.secondary" display="block" mb={0.25}>
      {label}
    </Typography>
    <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>
      {value}
    </Typography>
  </Box>
);

const StudentLeaveViewDetail = ({ data }: { data: any }) => {
  if (!data) return null;

  const isHalfDay = data.isHalfDay ?? data.halfDay ?? false;
  const startDate = data.leaveDate || data.startDate;
  const { endDate } = data;
  const { totalDays } = data;
  const studentContext = [
    data.className || data.class,
    data.divisionName ? `Division ${data.divisionName}` : null,
    data.organizationName,
  ]
    .filter(Boolean)
    .join(' · ');
  const plainDescription = data.description
    ? data.description.replace(/<[^>]*>/g, '').trim()
    : null;

  return (
    <Stack spacing={2} sx={{ p: 2 }}>
      <Box sx={{ px: { xs: 2, sm: 3 }, py: 2.5 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          flexWrap="wrap"
          gap={1.5}
        >
          <Box minWidth={0}>
            <Typography variant="subtitle1" fontWeight={700}>
              {data.studentName || '-'}
            </Typography>
            {studentContext && (
              <Typography variant="body2" color="text.secondary" sx={{ overflowWrap: 'anywhere' }}>
                {studentContext}
              </Typography>
            )}
          </Box>
          <Label color={getLeaveStatusColor(data.status)} sx={{ flexShrink: 0, mt: 0.25 }}>
            {getLeaveStatusLabel(data.status)}
          </Label>
        </Stack>
      </Box>

      <Divider />

      <FormSectionCard
        title="Leave Details"
        icon={GlobalIcons.notebook}
        descriptionTooltip="Saved leave type, duration, and dates."
        titleTypographyProps={{ variant: 'subtitle1', fontWeight: 600 }}
      >
        <Stack direction="row" alignItems="center" justifyContent="flex-end" mb={2} gap={1}>
          {totalDays != null && (
            <Chip
              label={`${totalDays} ${totalDays === 1 || totalDays === 0.5 ? 'day' : 'days'}`}
              size="small"
              variant="outlined"
            />
          )}
        </Stack>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
            columnGap: 3,
            rowGap: 2,
          }}
        >
          <LeaveDetailField label="Leave type" value={data.leaveTypeName || '-'} />
          <LeaveDetailField label="Session" value={isHalfDay ? 'Half day' : 'Full day'} />
          <LeaveDetailField
            label={isHalfDay ? 'Date' : 'Start date'}
            value={startDate ? dayjs(startDate).format(formatStr.split.date) : '-'}
            fullWidth={isHalfDay || !endDate}
          />
          {!isHalfDay && endDate && (
            <LeaveDetailField
              label="End date"
              value={dayjs(endDate).format(formatStr.split.date)}
            />
          )}
        </Box>
      </FormSectionCard>

      {plainDescription && (
        <>
          <Divider />
          <FormSectionCard
            title="Reason"
            icon={GlobalIcons.notebook}
            descriptionTooltip="The reason recorded when this request was created."
            titleTypographyProps={{ variant: 'subtitle1', fontWeight: 600 }}
          >
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
              {plainDescription}
            </Typography>
          </FormSectionCard>
        </>
      )}

      {data.remarks && (
        <>
          <Divider />
          <FormSectionCard
            title="Remarks"
            icon={GlobalIcons.notebook}
            descriptionTooltip="Remarks recorded with the leave decision."
            titleTypographyProps={{ variant: 'subtitle1', fontWeight: 600 }}
          >
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
              {data.remarks}
            </Typography>
          </FormSectionCard>
        </>
      )}

      {data.attachmentUrl && (
        <>
          <Divider />
          <FormSectionCard
            title="Attachment"
            icon={GlobalIcons.documentIcon}
            descriptionTooltip="The supporting file attached to this leave request."
            titleTypographyProps={{ variant: 'subtitle1', fontWeight: 600 }}
          >
            <Button
              component="a"
              href={data.attachmentUrl}
              target="_blank"
              rel="noopener noreferrer"
              variant="outlined"
              size="small"
              startIcon={<Iconify icon="mdi:paperclip" width={16} />}
            >
              View attachment
            </Button>
          </FormSectionCard>
        </>
      )}
    </Stack>
  );
};
