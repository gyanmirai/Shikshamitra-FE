'use client';

import { toast } from 'sonner';
import { useDispatch } from 'react-redux';
import React, { useState, useEffect } from 'react';

import { Save, Refresh, Grading } from '@mui/icons-material';
import { Box, Button, Checkbox, TextField } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { GenderType } from 'src/enums/gender';
import { StudentApi } from 'src/redux/student';
import { useUpdateStudentRollNumberMutation } from 'src/redux/student/roll-number/roll-number-api';

import CustomSelect from 'src/components/custom-select';
import CustomizableTable from 'src/components/customizabaleTable';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import SendInstantNotificationDialog from 'src/components/send-instant-notification-dialog';

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

  // State to toggle between automatic and manual roll number assignment
  const [isManual, setIsManual] = useState(false);

  // State for controlling the sorting criteria (e.g., by name, by GR number)
  const [arrangeBy, setArrangeBy] = useState('');

  // State to store and manage the student data table
  const [tableData, setTableData] = useState(studentData);

  // State to store validation errors for roll numbers
  const [error, setError] = useState<Record<number, string>>({});

  // Redux dispatch hook for dispatching actions
  const dispatch = useDispatch();

  // RTK Query mutation hook for updating student roll numbers in the backend
  const [updateStudentRollNumbers, { isLoading: isSaving }] = useUpdateStudentRollNumberMutation();

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
    if (arrangeBy === 'name') {
      filteredData.sort((a, b) => a.name.localeCompare(b.name));
    } else if (arrangeBy === 'lastName') {
      filteredData.sort((a, b) => a.lastName.localeCompare(b.lastName));
    } else if (arrangeBy === 'grNo') {
      filteredData.sort((a, b) => a.grNoRecord.toString().localeCompare(b.grNoRecord.toString()));
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
    }
  }, [studentData]);

  // Handle roll number change for a specific student
  const handleRollNoChange = (id: string, newValue: number) => {
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

    console.log('Request body:', requestBody);
    try {
      // Send API request to update roll numbers
      const response = await updateStudentRollNumbers({ body: requestBody }).unwrap();

      // Show success message and reset state
      toast.success('Roll Numbers updated successfully!');
      setIsManual(false);
      dispatch(StudentApi.util.invalidateTags(['Student']));
    } catch (err) {
      console.error('Failed to update GR Numbers:', err);
    }
  };

  // State for managing selected students and notification dialog
  const [selectedStudents, setSelectedStudents] = useState<any>([]);
  const sendInstantNotificationDialogValue = useBoolean();

  // Handler for opening notification dialog
  const handlerSendNotification = () => {
    if (!sendInstantNotificationDialogValue.value) {
      sendInstantNotificationDialogValue.onTrue();
    }
  };
  return (
    <Box>
      <BackPopUpChecked initialValues={studentData} currentValues={tableData}>
        <Box display="flex" justifyContent="space-between" alignItems="center" width="100%" mb={2}>
          <Box display="flex" gap={2}>
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
              formControlProps={{ sx: { width: '200px' } }}
            />
            <CustomSelect
              options={[
                { id: 'surname', name: 'Surname' },
                { id: 'name', name: 'Name' },
                { id: 'grNo', name: 'GR.No.' },
              ]}
              label="Arrangement By"
              value={arrangeBy}
              onChange={(val) => setArrangeBy(val as string)}
              labelKey="name"
              valueKey="id"
              formControlProps={{ sx: { width: '200px' } }}
              disabled={!arrangementType}
            />
          </Box>

          {arrangeBy && (
            <Box display="flex" gap={2}>
              <Button
                startIcon={<Save />}
                variant="outlined"
                onClick={handleSave}
                disabled={isSaving || !tableData.some((item) => item.rollNo)}
              >
                {isSaving ? 'Saving...' : 'Save'}
              </Button>

              <Button
                startIcon={<Grading />}
                variant="outlined"
                onClick={() => setIsManual(!isManual)}
              >
                Manual Generation
              </Button>
              <Button startIcon={<Refresh />} variant="contained" onClick={handleAutoGenerate}>
                Auto Generate
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
            searchFieldProps={{
              placeholder: 'Search by GR No, Name, Roll No',
              label: 'Search by GR No, Name, Roll No',
              sx: {
                maxWidth: '400px',
                width: '100%',
              },
            }}
            columns={[
              {
                id: 'checkBox',
                align: 'left',
                minWidth: '60px',
                isSort: false,
                isFilter: false,
                label: '',
                sticky: true,
                renderColumn() {
                  return (
                    <Checkbox
                      checked={
                        !!tableData?.length && selectedStudents?.length === tableData?.length
                      }
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedStudents(tableData || []);
                        } else {
                          setSelectedStudents([]);
                        }
                      }}
                    />
                  );
                },
                render(value, row) {
                  return (
                    <Checkbox
                      checked={!!selectedStudents.some((i: any) => i.id === row.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedStudents([...selectedStudents, row]);
                        } else {
                          setSelectedStudents(selectedStudents.filter((i: any) => i.id !== row.id));
                        }
                      }}
                    />
                  );
                },
              },
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
                      onChange={(e) => handleRollNoChange(row.id, +e.target.value)}
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
