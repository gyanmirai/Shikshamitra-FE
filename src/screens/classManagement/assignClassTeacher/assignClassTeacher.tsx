'use client';

import type { RootState } from 'src/redux/store';
import type { Organization } from 'src/types/school';

import { LoadingButton } from '@mui/lab';
import { useSelector } from 'react-redux';
import { Save } from '@mui/icons-material';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Box, Card, Button } from '@mui/material';
import { useBoolean } from 'src/hooks/use-boolean';
import { useMemo, useState, useEffect } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import sortQueryString from 'src/utils/sort-query-string';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { PaginatedSearchSelect } from 'src/components/paginated-search-select';
import SendInstantNotificationDialog from 'src/components/send-instant-notification-dialog';
import {
  useGetClassTeacherAssignmentsQuery,
  useUpdateClassTeacherAssignmentsMutation,
} from 'src/redux/classManagementApi/classTeacherAssignmentApi/classTeacherAssignmentApi';

interface ITeacherOption {
  value: string;
  name: string;
}

const teacherOptions: ITeacherOption[] = [
  { value: 't1', name: 'Sharma Riya Kumar' },
  { value: 't2', name: 'Patel Ankit Rajesh' },
  { value: 't3', name: 'Desai Priya Mahesh' },
  { value: 't4', name: 'Singh Rahul Vikram' },
  { value: 't5', name: 'Mehta Neha Suresh' },
  { value: 't6', name: 'Kumar Deepak Prakash' },
  { value: 't7', name: 'Mishra Pooja Dinesh' },
  { value: 't8', name: 'Joshi Vikram Shyam' },
];

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
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassTeacherAssignmentsQuery,
    params: {
      organizationId: organization,
      ...query,
    },
  });

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

  const handleTeacherChange = (teacherId: string | null, rowIndex: number) => {
    const newTableData = [...tableData];
    newTableData[rowIndex].classTeacher = teacherId;
    setTableData(newTableData);

    if (teacherId) {
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
        .filter((row) => row.classTeacher) // Only send assignments with a teacher
        .map((row) => ({
          classId: row.classId,
          divisionId: row.divisionId,
          teacherId: row.classTeacher,
        }));

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
    // Returns list of "Class - Division" that have changed
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

  const getAvailableTeachers = (currentRow: any) =>
    // Filter out teachers already assigned to OTHER rows
    teacherOptions.filter((teacher) => {
      const isAssignedToAny = tableData.some(
        (row) => row.classTeacher === teacher.value && row !== currentRow
      );
      return !isAssignedToAny;
    });

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
      <Card
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          p: 1.5,
        }}
      >
        <PaginatedSearchSelect
          label="Organization *"
          fetchOptions={async (searchQuery) => {
            const items = allOrganization || [];
            const filtered = items.filter((item: any) =>
              item?.name?.toLowerCase().includes(searchQuery.toLowerCase())
            );
            return {
              data: filtered.map((item: any) => ({
                label: item.name,
                id: item.id,
              })),
              hasMore: false,
            };
          }}
          value={
            organization
              ? {
                  label: allOrganization.find((org: any) => org.id === organization)?.name || '',
                  id: organization,
                }
              : null
          }
          isOptionEqualToValue={(option, value) => option.id === value?.id}
          getOptionLabel={(option: any) => option?.label || ''}
          renderOption={(optionProps, option: any) => (
            <li {...optionProps} key={option.id}>
              {option.label}
            </li>
          )}
          minChars={0}
          onChange={(_, value: any) => {
            const val = value?.id || '';
            setOrganization(val);
          }}
          sx={{ maxWidth: '250px', width: '100%' }}
          noOptionsText="No results found"
          size="small"
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
      </Card>

      <CustomizableTable
        onSendNotification={handlerSendNotification}
        showCheckbox={selectedStudents.length !== 0}
        tableId="assignTeacherTable"
        isLoading={isClassAssignmentLoading}
        noDataText={<>No Division Data Found for this Organization</>}
        columns={[
          {
            id: 'className',
            label: 'Class',
          },
          {
            id: 'divisionName',
            label: 'Division',
          },
          {
            id: 'classTeacher',
            label: 'Class Teacher',
            isSort: false,
            isFilter: false,
            render: (value, row: any) => {
              const activeTeacher =
                teacherOptions.find((t) => t.value === row.classTeacher) || null;

              return (
                <PaginatedSearchSelect
                  label="Class Teacher"
                  fetchOptions={async (searchQuery) => {
                    const available = getAvailableTeachers(row);
                    const filtered = available.filter((t) =>
                      t.name.toLowerCase().includes(searchQuery.toLowerCase())
                    );
                    return {
                      data: filtered.map((t) => ({
                        label: t.name,
                        id: t.value,
                      })),
                      hasMore: false,
                    };
                  }}
                  value={
                    activeTeacher ? { label: activeTeacher.name, id: activeTeacher.value } : null
                  }
                  isOptionEqualToValue={(option, val) => option.id === val?.id}
                  getOptionLabel={(option: any) => option?.label || ''}
                  renderOption={(optionProps, option: any) => (
                    <li {...optionProps} key={option.id}>
                      {option.label}
                    </li>
                  )}
                  minChars={0}
                  noOptionsText="No results found"
                  onChange={(_, newValue: any) => {
                    handleTeacherChange(newValue?.id || null, tableData.indexOf(row));
                  }}
                  sx={{
                    maxWidth: '280px',
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: focusedCells.includes(tableData.indexOf(row))
                          ? 'primary.main'
                          : 'rgba(0,0,0,0.23)',
                        borderWidth: focusedCells.includes(tableData.indexOf(row)) ? 2 : 1,
                      },
                      '&:hover fieldset': {
                        borderColor: focusedCells.includes(tableData.indexOf(row))
                          ? 'primary.main'
                          : undefined,
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: focusedCells.includes(tableData.indexOf(row))
                          ? 'primary.main'
                          : undefined,
                      },
                    },
                  }}
                  size="small"
                  ListboxProps={{
                    style: {
                      maxHeight: '200px',
                      overflowY: 'auto',
                    },
                  }}
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
