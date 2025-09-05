'use client';

import type { RootState } from 'src/redux/store';

import { GenderType } from 'src/enums/gender';
import { StudentApi } from 'src/redux/student';
import React, { useState, useEffect } from 'react';
import { useBoolean } from 'src/hooks/use-boolean';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Button, TextField } from '@mui/material';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import { Save, Refresh, Grading } from '@mui/icons-material';
import CustomizableTable from 'src/components/customizabaleTable';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import SendInstantNotificationDialog from 'src/components/send-instant-notification-dialog';
import { useUpdateStudentRollNumberMutation } from 'src/redux/student/roll-number/roll-number-api';

import type { IInquiryData } from '../../enrollment/Inquiry';

const RollNoGenerationScreen = ({
  tableData: studentData,
  isLoading,
}: {
  isLoading: boolean;
  tableData: IInquiryData[];
}) => {
  // State for controlling how students are arranged (e.g., boys first, girls first)
  const [arrangementType, setArrangementType] = useState('');
  // State to store selected students for notifications and bulk actions
  // Each student has an id and name property
  const [selectedStudents, setSelectedStudents] = useState<{ id: string; name: string }[]>([]);
  // State to toggle between automatic and manual roll number assignment
  const [isManual, setIsManual] = useState(false);
  const [initialData, setInitialData] = useState<IInquiryData[]>(studentData);

  // State for controlling the sorting criteria (e.g., by name, by GR number)
  const [arrangeBy, setArrangeBy] = useState('');

  // State to store and manage the student data table
  const [tableData, setTableData] = useState(studentData);

  // State to store validation errors for roll numbers
  const [error, setError] = useState<Record<number, string>>({});

  // Redux dispatch hook for dispatching actions
  const dispatch = useDispatch();

  // RTK Query mutation hook for updating student roll numbers in the backend
  const [_updateStudentRollNumbers, { isLoading: isSaving }] = useUpdateStudentRollNumberMutation();

  /**
   * Automatically generates roll numbers based on selected arrangement type and criteria
   */
  const handleAutoGenerate = () => {
    let filteredData = [...tableData];

    // Filter students based on gender arrangement preference
    if (arrangementType === 'boysFirst') {
      filteredData = filteredData.filter((item) => item.genderType === GenderType.Male);
    } else if (arrangementType === 'girlsFirst') {
      filteredData = filteredData.filter((item) => item.genderType === GenderType.Female);
    }

    // Sort students based on selected criteria (name, lastName, or GR number)
    if (arrangeBy === 'firstName') {
      filteredData.sort((a, b) => a.name.localeCompare(b.name));
    } else if (arrangeBy === 'lastName') {
      filteredData.sort((a, b) => a.lastName.localeCompare(b.lastName));
    } else if (arrangeBy === 'grNo') {
      filteredData.sort((a, b) =>
        (a.grNoRecord?.toString() || '').localeCompare(b.grNoRecord?.toString() || '')
      );
    }

    // Assign sequential roll numbers starting from 1
    filteredData = filteredData.map((item, index) => ({
      ...item,
      rollNo: index + 1,
    }));

    setTableData(filteredData);
  };

  // Update table data when studentData prop changes
  useEffect(() => {
    if (studentData) {
      setTableData(studentData);
      setInitialData(studentData);
    }
  }, [studentData]);

  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);

  // Handle roll number change for a specific student
  const handleRollNoChange = (id: string, name: string, newValue: number | null) => {
    // Update the roll number for the specified student
    const updatedData = tableData.map((item) =>
      item.id === id ? { ...item, rollNo: newValue } : item
    );

    // Check for duplicate roll numbers
    const rollNumbers = updatedData.map((item) => item.rollNo);
    const duplicateRolls = rollNumbers.filter(
      (num, idx) => num && rollNumbers.indexOf(num) !== idx
    );

    // Set error message if duplicate roll number is found
    setError((prevError) => ({
      ...prevError,
      [id]: duplicateRolls.includes(newValue) ? 'Duplicate Roll No!' : '',
    }));

    setSelectedStudents([{ id, name }]);

    // Update the table data with new roll numbers
    setTableData(updatedData);
  };

  // Save updated roll numbers to the server
  const handleSave = async () => {
    // Prepare request body with student IDs and roll numbers
    const requestBody = {
      studentNumbers: tableData.map((item) => ({
        studentId: item.id,
        rollNo: item.rollNo,
      })),
    };
    try {
      shikshaMitraToast.success({
        message: `Roll Number ${
          selectedStudents.length === 1
            ? `of student ${selectedStudents[0].name}`
            : `of ${requestBody.studentNumbers.length} students`
        } updated successfully`,
      });

      setInitialData(tableData);
      setIsManual(false);
      dispatch(StudentApi.util.invalidateTags(['Student']));
    } catch (err) {
      console.error('Failed to update GR Numbers:', err);
    }
  };

  const sendInstantNotificationDialogValue = useBoolean();

  // Handler for opening notification dialog
  const handlerSendNotification = () => {
    if (!sendInstantNotificationDialogValue.value) {
      sendInstantNotificationDialogValue.onTrue();
    }
  };
  return (
    <Box>
      <BackPopUpChecked initialValues={initialData} currentValues={tableData}>
        <Box display="flex" justifyContent="space-between" alignItems="center" width="100%" mb={2}>
          <Box display="flex" gap={2} ml={1}>
            <CustomSelect
              options={[
                { id: 'mix', name: 'Mix' },
                { id: 'boysFirst', name: 'Boys First' },
                { id: 'girlsFirst', name: 'Girls First' },
              ]}
              label="Arrangement Type"
              value={arrangementType}
              onChange={(val) => setArrangementType(val as string)}
              labelKey="name"
              valueKey="id"
              formControlProps={{ sx: { width: '250px' } }}
            />
            <CustomSelect
              options={[
                { id: 'firstName', name: 'First Name' },
                { id: 'lastName', name: 'Last Name' },
              ]}
              label="Arrangement By"
              value={arrangeBy}
              onChange={(val) => setArrangeBy(val as string)}
              labelKey="name"
              valueKey="id"
              formControlProps={{ sx: { width: '250px' } }}
              disabled={!arrangementType}
            />
          </Box>

          {arrangeBy && (
            <Box display="flex" gap={2}>
              <Button
                startIcon={<Grading />}
                variant="outlined"
                onClick={() => setIsManual(!isManual)}
                size="small"
              >
                Manual Generation
              </Button>
              <Button
                size="small"
                startIcon={<Refresh />}
                variant="outlined"
                onClick={handleAutoGenerate}
              >
                Auto Generate
              </Button>
              <Button
                startIcon={<Save />}
                variant="contained"
                onClick={handleSave}
                disabled={isSaving || !isChanges}
                size="small"
              >
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
            </Box>
          )}
        </Box>

        {arrangeBy && (
          <CustomizableTable
            onSendNotification={handlerSendNotification}
            showCheckbox={selectedStudents.length !== 0}
            noDataText={<>No Roll Genaration Data Found </>}
            tableId="roll-no-generation-table"
            columns={[
              { id: 'grNoRecord', label: 'GR No.' },
              { id: 'name', label: 'Name' },
              {
                id: 'rollNo',
                label: 'Roll No.',
                isFilter: false,
                isSort: false,
                minWidth: 250,
                align: 'left',
                render(value, row) {
                  return (
                    <TextField
                      size="small"
                      variant="standard"
                      type="number"
                      value={row.rollNo}
                      inputProps={{ min: 0 }}
                      onChange={(e) =>
                        handleRollNoChange(
                          row.id,
                          row.name,
                          e.target.value ? +e.target.value : null
                        )
                      }
                      error={Boolean(error[row.id])}
                      helperText={error[row.id]}
                      disabled={!isManual}
                    />
                  );
                },
              },
            ]}
            data={tableData}
          />
        )}

        {sendInstantNotificationDialogValue.value && (
          <SendInstantNotificationDialog
            open={sendInstantNotificationDialogValue.value}
            onClose={sendInstantNotificationDialogValue.onFalse}
            data={[]}
            userList={selectedStudents}
          />
        )}
      </BackPopUpChecked>
    </Box>
  );
};

export default RollNoGenerationScreen;
