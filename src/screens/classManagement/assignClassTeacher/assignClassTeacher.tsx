'use client';

import type { RootState } from 'src/redux/store';
import type { Organization } from 'src/types/school';

import { LoadingButton } from '@mui/lab';
import { useSelector } from 'react-redux';
import { Save } from '@mui/icons-material';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import { Box, Card, Button, Avatar } from '@mui/material';
import sortQueryString from 'src/utils/sort-query-string';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useRef, useMemo, useState, useEffect, useCallback } from 'react';
import { PaginatedSearchSelect } from 'src/components/paginated-search-select';
import SendInstantNotificationDialog from 'src/components/send-instant-notification-dialog';
import { useLazyGetEmployeeQuery, useLazyGetEmployeeByIdQuery } from 'src/redux/hr/employeeApi';
import {
  useGetClassTeacherAssignmentsQuery,
  useUpdateClassTeacherAssignmentsMutation,
} from 'src/redux/classManagementApi/classTeacherAssignmentApi/classTeacherAssignmentApi';

interface EmployeeOption {
  id: string;
  label: string;
}

// ----- Row-level teacher cell with dynamic search -----
const TeacherCell = ({
  teacherId,
  isFocused,
  onTeacherChange,
}: {
  teacherId: string | null;
  isFocused: boolean;
  onTeacherChange: (val: EmployeeOption | null) => void;
}) => {
  const [getEmployees] = useLazyGetEmployeeQuery();
  const [getEmployeeById] = useLazyGetEmployeeByIdQuery();
  const [selectedTeacher, setSelectedTeacher] = useState<EmployeeOption | null>(null);

  /**
   * Tracks IDs already returned for the current search query so that the
   * same teacher is never shown twice regardless of page boundaries or
   * race-condition appends in usePaginatedSearch. Reset on every new
   * search (page === 1) so stale IDs from a previous query are cleared.
   */
  const seenTeacherIdsRef = useRef<Set<string>>(new Set());

  // Pre-load the existing assigned teacher
  useEffect(() => {
    if (!teacherId) {
      setSelectedTeacher(null);
      return;
    }
    getEmployeeById(teacherId)
      .unwrap()
      .then((data: { id: string; fullName: string }) =>
        setSelectedTeacher({ id: data.id, label: data.fullName })
      )
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teacherId]);

  const fetchOptions = useCallback(
    async (query: string, page: number = 1) => {
      if (page === 1) seenTeacherIdsRef.current = new Set();
      const res = await getEmployees({ search: query, page }).unwrap();
      const hasMore = res.currentPage < res.totalPages;
      const data = (res?.items ?? [])
        .map((item: { id: string; fullName: string }) => ({ id: item.id, label: item.fullName }))
        .filter(({ id }: { id: string }) => {
          if (seenTeacherIdsRef.current.has(id)) return false;
          seenTeacherIdsRef.current.add(id);
          return true;
        });
      return { data, hasMore };
    },
    [getEmployees]
  );

  return (
    <PaginatedSearchSelect
      label="Class Teacher"
      fetchOptions={fetchOptions}
      value={selectedTeacher}
      onChange={(_: unknown, newValue: EmployeeOption | null) => {
        setSelectedTeacher(newValue);
        onTeacherChange(newValue);
      }}
      getOptionLabel={(option: EmployeeOption) => option?.label || ''}
      isOptionEqualToValue={(option: EmployeeOption, value: EmployeeOption) =>
        option.id === value.id
      }
      renderOption={(props: any, option: EmployeeOption) => {
        const { key: _key, ...rest } = props;
        return (
          <Box component="li" {...rest} key={option.id} sx={{ display: 'flex', gap: 1 }}>
            <Avatar sx={{ width: 24, height: 24, fontSize: 12 }}>{option.label?.[0]}</Avatar>
            {option.label}
          </Box>
        );
      }}
      debounceMs={400}
      minChars={0}
      size="small"
      fullWidth
      sx={{
        maxWidth: '280px',
        '& .MuiOutlinedInput-root': {
          '& fieldset': {
            borderColor: 'black',
          },
          '&:hover fieldset': {
            borderColor: 'black',
          },
          '&.Mui-focused fieldset': {
            borderColor: 'black',
          },
        },
      }}
    />
  );
};

const ClassTeacherAssignment = () => {
  const resetConfirmDialog = useBoolean();
  const saveConfirmDialog = useBoolean();

  const { currentMedium: medium } = useSelector((state: RootState) => state.globalState);
  const [organization, setOrganization] = useState<string>('');
  const [allOrganization, setAllOrganization] = useState<Organization[]>([]);

  // Set initial organization
  useEffect(() => {
    setAllOrganization(medium?.educationMediumStages || []);
    if (medium?.educationMediumStages?.length > 0) {
      setOrganization(medium.educationMediumStages[0].id);
    }
  }, [medium]);

  const [query, setQuery] = useState({
    sorting: '',
    skipCount: 0,
    maxResultCount: 10,
  });

  const {
    data: assignmentsData,
    refetch: refetchAssignments,
    isLoading: isClassAssignmentLoading,
    isFetching: isClassAssignmentFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassTeacherAssignmentsQuery,
    params: {
      organizationId: organization,
      ...query,
    },
    options: { skip: !organization },
  });

  console.log('Assignments Data:', assignmentsData);

  const [updateAssignments, { isLoading: isSaving }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateClassTeacherAssignmentsMutation,
  });

  const [tableData, setTableData] = useState<any[]>([]);
  const [originalTableData, setOriginalTableData] = useState<any[]>([]);
  const [focusedCells, setFocusedCells] = useState<number[]>([]);
  const sendInstantNotificationDialogValue = useBoolean();
  const [selectedStudents] = useState<any>([]);

  // Build Table Data
  useEffect(() => {
    if (!assignmentsData) return;

    const newTableData = assignmentsData.map((item: any) => ({
      classId: item.classId,
      className: item.className,
      divisionId: item.divisionId,
      divisionName: item.divisionName,
      classTeacher: item.assignedTeacher?.teacherId || null,
    }));

    setTableData(newTableData);
    setOriginalTableData(JSON.parse(JSON.stringify(newTableData)));
  }, [assignmentsData]);

  const hasChanges = useMemo(
    () => JSON.stringify(tableData) !== JSON.stringify(originalTableData),
    [tableData, originalTableData]
  );

  const handleTeacherChange = (newValue: EmployeeOption | null, rowIndex: number) => {
    const newTableData = [...tableData];
    newTableData[rowIndex].classTeacher = newValue?.id || null;
    setTableData(newTableData);

    if (newValue?.id) {
      if (!focusedCells.includes(rowIndex)) {
        setFocusedCells((prev) => [...prev, rowIndex]);
      }
    } else {
      setFocusedCells((prev) => prev.filter((cell) => cell !== rowIndex));
    }
  };

  const handleReset = () => {
    setTableData(JSON.parse(JSON.stringify(originalTableData)));
    setFocusedCells([]);
    resetConfirmDialog.onFalse();
    shikshaMitraToast.success({
      message: 'Changes have been reset successfully',
    });
  };

  const handleSave = async () => {
    try {
      const assignments = tableData
        .filter((row) => row.classTeacher)
        .map((row) => ({
          classId: row.classId,
          divisionId: row.divisionId,
          teacherId: row.classTeacher,
        }));

      if (assignments.length === 0) {
        shikshaMitraToast.error({
          message: 'Please assign at least one class teacher before saving.',
        });
        saveConfirmDialog.onFalse();
        return;
      }

      const payload = {
        organizationId: organization,
        assignments,
      };

      await updateAssignments(payload).unwrap();

      shikshaMitraToast.success({
        message: 'Class Teacher assignments have been saved successfully',
      });

      refetchAssignments();
      saveConfirmDialog.onFalse();
      setFocusedCells([]);
    } catch (error) {
      console.error(error);
      shikshaMitraToast.error({
        message: 'Failed to save assignments',
      });
    }
  };

  const getModifiedSubjects = () =>
    tableData
      .filter((row, index) => {
        const original = originalTableData[index];
        return row.classTeacher !== original?.classTeacher;
      })
      .map((row) => `${row.className} - ${row.divisionName}`);

  const handlerSendNotification = () => {
    if (!sendInstantNotificationDialogValue.value) {
      sendInstantNotificationDialogValue.onTrue();
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <CustomBreadcrumbs
        heading="Class Teacher Assignment"
        links={[
          { name: 'Class Management', href: '/classManagement/dashboard' },
          { name: 'Class Teacher Assignment' },
        ]}
        description="Assign teachers to specific classes and divisions, manage class teacher allocations."
      />
      <Card sx={{ mb: 1, p: 1 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <CustomSelect
            options={allOrganization}
            label="Organization *"
            value={organization}
            onChange={(val) => {
              setOrganization(val as any);
            }}
            labelKey="name"
            valueKey="id"
            formControlProps={{ sx: { maxWidth: '250px', width: '100%' } }}
          />

          <Box display="flex" gap={2} justifyContent="flex-end">
            <Button
              variant="outlined"
              startIcon={<Iconify icon={GlobalIcons.resetIcon} />}
              onClick={resetConfirmDialog.onTrue}
              size="small"
              disabled={!hasChanges}
              sx={{ px: '32px' }}
            >
              Reset
            </Button>
            <LoadingButton
              startIcon={<Save />}
              variant="contained"
              size="small"
              onClick={saveConfirmDialog.onTrue}
              loading={isSaving}
              disabled={!hasChanges}
              sx={{ px: '32px' }}
            >
              Save
            </LoadingButton>
          </Box>
        </Box>
      </Card>

      <CustomizableTable
        onSendNotification={handlerSendNotification}
        showCheckbox={selectedStudents.length !== 0}
        tableId="assignTeacherTable"
        isLoading={isClassAssignmentLoading || isClassAssignmentFetching}
        noDataText={<>No Division Data Found for this Organization</>}
        columns={[
          {
            id: 'className',
            label: 'Class',
            align: 'left',
          },
          {
            id: 'divisionName',
            label: 'Division',
            align: 'left',
          },
          {
            id: 'classTeacher',
            label: 'Class Teacher',
            isSort: false,
            isFilter: false,
            align: 'left',
            minWidth: 320,
            render: (value: any, row: any) => {
              const rowIndex = tableData.indexOf(row);
              return (
                <TeacherCell
                  teacherId={row.classTeacher}
                  isFocused={focusedCells.includes(rowIndex)}
                  onTeacherChange={(newValue) => handleTeacherChange(newValue, rowIndex)}
                />
              );
            },
          },
        ]}
        serverSide
        onServerSort={(column, sortData) => {
          setQuery((prev) => ({
            ...prev,
            sorting: sortQueryString(sortData),
          }));
        }}
        onServerPagination={(page: number, rowsPerPage: number) => {
          setQuery((prev) => ({
            ...prev,
            skipCount: page * rowsPerPage,
            maxResultCount: rowsPerPage,
          }));
        }}
        data={tableData}
      />

      {sendInstantNotificationDialogValue.value && (
        <SendInstantNotificationDialog
          open={sendInstantNotificationDialogValue.value}
          onClose={sendInstantNotificationDialogValue.onFalse}
          data={[]}
          userList={selectedStudents}
        />
      )}

      <ConfirmDialog
        title="Reset"
        open={resetConfirmDialog.value}
        onClose={resetConfirmDialog.onFalse}
        content="Are you sure you want to reset the selected changes?"
        action={
          <Button
            variant="contained"
            startIcon={<Iconify icon={GlobalIcons.resetIcon} />}
            onClick={handleReset}
            size="small"
          >
            Reset
          </Button>
        }
      />

      <ConfirmDialog
        title="Save"
        open={saveConfirmDialog.value}
        onClose={saveConfirmDialog.onFalse}
        content={
          <>
            Are you sure you want to save the <strong>{getModifiedSubjects().join(', ')}</strong>{' '}
            changes?
          </>
        }
        action={
          <LoadingButton
            size="small"
            variant="contained"
            startIcon={<Iconify icon={GlobalIcons.submit} />}
            onClick={handleSave}
            loading={isSaving}
          >
            Save
          </LoadingButton>
        }
      />
    </Box>
  );
};

export default ClassTeacherAssignment;
