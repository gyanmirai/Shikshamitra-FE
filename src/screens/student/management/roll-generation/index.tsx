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
  const [arrangementType, setArrangementType] = useState('');
  const [isManual, setIsManual] = useState(false);
  const [arrangeBy, setArrangeBy] = useState('');
  const [tableData, setTableData] = useState(studentData);
  const [error, setError] = useState<Record<number, string>>({});

  const dispatch = useDispatch();

  const [updateStudentRollNumbers, { isLoading: isSaving }] = useUpdateStudentRollNumberMutation();
  const handleAutoGenerate = () => {
    let filteredData = [...tableData];

    // Step 1: Filter based on Arrangement Type
    if (arrangementType === 'boysFirst') {
      filteredData = filteredData.filter((item) => item.genderType === GenderType.Male);
    } else if (arrangementType === 'girlsFirst') {
      filteredData = filteredData.filter((item) => item.genderType === GenderType.Female);
    }

    // Step 2: Sort based on Arrangement By
    if (arrangeBy === 'name') {
      filteredData.sort((a, b) => a.name.localeCompare(b.name));
    } else if (arrangeBy === 'lastName') {
      filteredData.sort((a, b) => a.lastName.localeCompare(b.lastName));
    } else if (arrangeBy === 'grNo') {
      filteredData.sort((a, b) => a.grNoRecord.toString().localeCompare(b.grNoRecord.toString()));
    }

    // Step 3: Assign Roll Numbers from 1
    filteredData = filteredData.map((item, index) => ({
      ...item,
      rollNo: index + 1, // Assign roll numbers sequentially
    }));

    setTableData(filteredData);
  };

  useEffect(() => {
    if (studentData) {
      setTableData(studentData);
    }
  }, [studentData]);
  const handleRollNoChange = (id: string, newValue: number) => {
    const updatedData = tableData.map((item) =>
      item.id === id ? { ...item, rollNo: newValue } : item
    );

    const rollNumbers = updatedData.map((item) => item.rollNo);
    const duplicateRolls = rollNumbers.filter(
      (num, idx) => num && rollNumbers.indexOf(num) !== idx
    );

    setError((prevError) => ({
      ...prevError,
      [id]: duplicateRolls.includes(newValue) ? 'Duplicate Roll No!' : '',
    }));

    setTableData(updatedData);
  };

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

  const [selectedStudents, setSelectedStudents] = useState<any>([]);
  const sendInstantNotificationDialogValue = useBoolean();

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
