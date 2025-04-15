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
  // State variables for managing roll number generation
  const [arrangementType, setArrangementType] = useState('');
  const [isManual, setIsManual] = useState(false);
  const [arrangeBy, setArrangeBy] = useState('');
  const [tableData, setTableData] = useState(studentData);
  const [error, setError] = useState<Record<number, string>>({});

  const dispatch = useDispatch();

  // Mutation hook for updating student roll numbers
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

  // Update table data when student data changes
  useEffect(() => {
    if (studentData) {
      setTableData(studentData);
    }
  }, [studentData]);

  /**
   * Handles manual roll number changes and validates for duplicates
   * @param id - Student ID
   * @param newValue - New roll number value
   */
  const handleRollNoChange = (id: string, newValue: number) => {
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

    setTableData(updatedData);
  };

  /**
   * Saves the updated roll numbers to the backend
   */
  const handleSave = async () => {
    const requestBody = {
      studentNumbers: tableData.map((item) => ({
        studentId: item.id,
        rollNo: item.rollNo,
      })),
    };

    console.log('Request body:', requestBody);
    try {
      const response = await updateStudentRollNumbers({ body: requestBody }).unwrap();

      toast.success('Roll Numbers updated successfully!');
      setIsManual(false);
      dispatch(StudentApi.util.invalidateTags(['Student']));
    } catch (err) {
      console.error('Failed to update GR Numbers:', err);
    }
  };

  // State and handlers for instant notification feature
  const [selectedStudents, setSelectedStudents] = useState<any>([]);
  const sendInstantNotificationDialogValue = useBoolean();

  /**
   * Opens the instant notification dialog when triggered
   * Used to send notifications to selected students
   */
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
            columns={[
              // { id: 'srNo', label: 'Sr. No.' },
              {
                id: 'checkBox',
                align: 'left',
                minWidth: '60px',
                isSort: false,
                isFilter: false,
                label: '',
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
              // { id: 'surname', label: 'Surname' },
              {
                id: 'rollNo',
                label: 'Roll No.',
                minWidth: 250,
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
