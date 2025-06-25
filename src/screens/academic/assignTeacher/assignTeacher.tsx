'use client';

import type { Division, Standards } from 'src/types/school';

import { useState, useEffect } from 'react';

import { Save, RestartAlt } from '@mui/icons-material';
import { Box, Button, TextField, Autocomplete } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { GlobalIcons } from 'src/utils/icons';

import { useGetClassQuery } from 'src/redux/class/classApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';

import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import SendInstantNotificationDialog from 'src/components/send-instant-notification-dialog';

const AssignTeacher = () => {
  const assignTeacherDialog = useBoolean();
  const resetConfirmDialog = useBoolean();
  const saveConfirmDialog = useBoolean();

  const { data: classData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassQuery,
  });

  const [classes, setClasses] = useState('');
  const [division, setDivision] = useState('');
  const [organization, setOrganization] = useState('');
  const [divisionOptions, setDivisionOptions] = useState<Division[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<any>([]);
  const [originalTeacherAssignments, setOriginalTeacherAssignments] = useState<{
    [key: number]: string;
  }>({});
  const [focusedCells, setFocusedCells] = useState<number[]>([]);
  const sendInstantNotificationDialogValue = useBoolean();
  const [isEdit, setIsEdit] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const [availableTeachers] = useState([
    'Sharma Priya Rajesh',
    'Patel Amit Kumar',
    'Singh Neha Raj',
    'Gupta Rahul Mohan',
    'Verma Anita Suresh',
    'Kumar Deepak Prakash',
    'Mishra Pooja Dinesh',
    'Joshi Vikram Shyam',
  ]);

  useEffect(() => {
    if (classData?.items?.length) {
      if (classes) {
        const selectedClass = classData.items.find((i: Standards) => i.id === classes);
        setDivisionOptions(selectedClass?.divisions || []);
        if (selectedClass?.divisions?.length) {
          setDivision(selectedClass.divisions[0].id);
        }
      } else {
        const firstClass = classData.items[0];
        setClasses(firstClass.id);
        setDivisionOptions(firstClass?.divisions || []);
        if (firstClass?.divisions?.length) {
          setDivision(firstClass.divisions[0].id);
        }
      }
    }
  }, [classData, classes]);

  const [tableData, setTableData] = useState([
    { className: '1', division: 'A', classTeacher: '' },
    { className: '1', division: 'B', classTeacher: '' },
    { className: '3', division: 'C', classTeacher: '' },
    { className: '4', division: 'D', classTeacher: '' },
  ]);

  const handleTeacherChange = (val: string, rowIndex: number) => {
    const newTableData = [...tableData];
    if (!originalTeacherAssignments[rowIndex]) {
      setOriginalTeacherAssignments((prev) => ({
        ...prev,
        [rowIndex]: newTableData[rowIndex].classTeacher,
      }));
    }
    newTableData[rowIndex].classTeacher = val;
    setTableData(newTableData);
    setHasChanges(true);

    if (val) {
      setFocusedCells((prev) => [...prev, rowIndex]);
    } else {
      setFocusedCells((prev) => prev.filter((cell) => cell !== rowIndex));
    }
  };

  const handleReset = () => {
    const newTableData = [...tableData];
    Object.entries(originalTeacherAssignments).forEach(([index, originalTeacher]) => {
      newTableData[Number(index)].classTeacher = originalTeacher;
    });
    setTableData(newTableData);
    setOriginalTeacherAssignments({});
    setFocusedCells([]);
    setHasChanges(false);
    resetConfirmDialog.onFalse();
    shikshaMitraToast.success({ message: 'Selected changes reset successfully' });
  };

  const handleSave = () => {
    setOriginalTeacherAssignments({});
    setFocusedCells([]);
    setHasChanges(false);
    saveConfirmDialog.onFalse();
    shikshaMitraToast.success({ message: 'Changes saved successfully' });
  };

  const getModifiedSubjects = () =>
    Object.entries(originalTeacherAssignments).map(([index]) => {
      const row = tableData[Number(index)];
      return `${row.className}-${row.division}`;
    });

  const handlerSendNotification = () => {
    if (!sendInstantNotificationDialogValue.value) {
      sendInstantNotificationDialogValue.onTrue();
    }
  };

  const getAvailableTeachers = (currentRow: any) =>
    availableTeachers.filter(
      (teacher) => !tableData.some((row) => row.classTeacher === teacher && row !== currentRow)
    );

  return (
    <Box>
      <CustomBreadcrumbs
        heading="Class Teacher Assignment"
        links={[
          { name: 'Class Management', href: '/classManagement/dashboard' },
          { name: 'Class Teacher Assignment' },
        ]}
        description="Assign teachers to specific classes and divisions, manage class teacher allocations."
        sx={{ px: 1, mb: 2 }}
      />
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
          ml: 1,
        }}
      >
        <CustomSelect
          label="Organization"
          options={[
            { value: 'Pre Primary', label: 'Pre Primary' },
            { value: 'Primary', label: 'Primary' },
            { value: 'Secondary', label: 'Secondary' },
            { value: 'Higher Secondary', label: 'Higher Secondary' },
          ]}
          value={organization}
          onChange={(val) => {
            setOrganization(val as string);
          }}
          formControlProps={{ sx: { maxWidth: '250px', width: '100%' } }}
        />
        <Box display="flex" gap={2} justifyContent="flex-end">
          <Button
            variant="outlined"
            startIcon={<RestartAlt />}
            onClick={resetConfirmDialog.onTrue}
            size="small"
            disabled={!hasChanges}
          >
            Reset
          </Button>
          <Button
            startIcon={<Save />}
            variant="contained"
            size="small"
            onClick={saveConfirmDialog.onTrue}
            disabled={!hasChanges}
          >
            Save
          </Button>
        </Box>
      </Box>

      <CustomizableTable
        onSendNotification={handlerSendNotification}
        showCheckbox={selectedStudents.length !== 0}
        tableId="assignTeacherTable"
        noDataText={<>No Division Data Found Search By Organization and Class</>}
        columns={[
          {
            id: 'className',
            label: 'Class',
          },
          {
            id: 'division',
            label: 'Division',
          },
          {
            id: 'classTeacher',
            label: 'Class Teacher',
            render: (value, row: any) => (
              <Autocomplete
                options={getAvailableTeachers(row)}
                value={row.classTeacher}
                onChange={(event, newValue) =>
                  handleTeacherChange(newValue || '', tableData.indexOf(row))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Class Teacher"
                    fullWidth
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
                  />
                )}
                size="small"
                ListboxProps={{
                  style: {
                    maxHeight: '200px',
                    overflowY: 'auto',
                  },
                }}
              />
            ),
          },
        ]}
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
          <Button
            size="small"
            variant="contained"
            startIcon={<Iconify icon={GlobalIcons.submit} />}
            onClick={handleSave}
          >
            Save
          </Button>
        }
      />
    </Box>
  );
};

export default AssignTeacher;
