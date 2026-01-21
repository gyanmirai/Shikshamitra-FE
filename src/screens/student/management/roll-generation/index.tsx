'use client';

import type { RootState } from 'src/redux/store';

import { StudentApi } from 'src/redux/student';
import { useBoolean } from 'src/hooks/use-boolean';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Button, TextField } from '@mui/material';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import React, { useMemo, useState, useEffect } from 'react';
import { Save, Refresh, Grading } from '@mui/icons-material';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { useGetAllStudentGroupQuery } from 'src/redux/student/student-group/student-group';
import SendInstantNotificationDialog from 'src/components/send-instant-notification-dialog';
import {
  useUpdateStudentRollNumberMutation,
  useLazyGetRollNumberProjectionsQuery,
} from 'src/redux/student/roll-number/roll-number-api';

import type { IInquiryData } from '../../enrollment/Inquiry/type';

const RollNoGenerationScreen = ({ division }: { division: string }) => {
  // State for controlling how students are arranged (e.g., boys first, girls first)
  const [arrangementType, setArrangementType] = useState('');
  // State to store selected students for notifications and bulk actions
  // Each student has a studentId and name property
  const [selectedStudents, setSelectedStudents] = useState<{ studentId: string; name: string }[]>(
    []
  );
  // State to toggle between automatic and manual roll number assignment
  const [isManual, setIsManual] = useState(false);

  // State for controlling the sorting criteria (e.g., by name, by GR number)
  const [arrangeBy, setArrangeBy] = useState('');

  // State to store and manage the student data table
  const [tableData, setTableData] = useState<IInquiryData[]>([]);
  const [initialData, setInitialData] = useState<IInquiryData[]>([]);

  // State to store validation errors for roll numbers
  const [error, setError] = useState<Record<number, string>>({});

  // Redux dispatch hook for dispatching actions
  const dispatch = useDispatch();

  const {
    data: getStudentData,
    isLoading: isStudentDataLoading,
    isFetching: isStudentDataFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetAllStudentGroupQuery,
    params: division,
    options: {
      skip: !division,
    },
  });

  const [fetchRollNumberProjections, { isLoading: isProjectionsLoading }] =
    useLazyGetRollNumberProjectionsQuery();

  const [updateRollNumbers, { isLoading: isSaving }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateStudentRollNumberMutation,
  });

  /**
   * Automatically generates roll numbers based on selected arrangement type and criteria
   */
  const handleAutoGenerate = async () => {
    try {
      const result = await fetchRollNumberProjections({
        divisionId: division,
        arrangementType: arrangementType === 'mix' ? 0 : arrangementType === 'boysFirst' ? 1 : 2,
        arrangementBy: arrangeBy === 'firstName' ? 0 : 1,
      }).unwrap();

      if (result?.data && Array.isArray(result.data)) {
        setTableData(result.data);
        shikshaMitraToast.success({
          message: 'Roll numbers generated successfully',
        });
      } else {
        shikshaMitraToast.error({
          message: 'Invalid response from server',
        });
      }
    } catch (err: any) {
      console.error('Failed to fetch roll number projections:', err);
      shikshaMitraToast.error({
        message: err?.data?.message || 'Failed to generate roll numbers',
      });
    }
  };

  // Update table data when student data changes
  useEffect(() => {
    if (getStudentData?.data) {
      setTableData(getStudentData.data);
      setInitialData(getStudentData.data);
    }
  }, [getStudentData]);

  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);

  const hasStudentsWithoutRollNo = useMemo(
    () => tableData.some((student) => student.rollNo === null || student.rollNo === undefined),
    [tableData]
  );

  // Handle roll number change for a specific student
  const handleRollNoChange = (studentId: string, name: string, newValue: number | null) => {
    // Update the roll number for the specified student
    const updatedData = tableData.map((item) =>
      item.studentId === studentId ? { ...item, rollNo: newValue } : item
    );

    // Check for duplicate roll numbers
    const rollNumbers = updatedData.map((item) => item.rollNo);
    const duplicateRolls = rollNumbers.filter(
      (num, idx) => num && rollNumbers.indexOf(num) !== idx
    );

    // Set error message if duplicate roll number is found
    setError((prevError) => ({
      ...prevError,
      [studentId]: duplicateRolls.includes(newValue) ? 'Duplicate Roll No!' : '',
    }));

    setSelectedStudents([{ studentId, name }]);

    // Update the table data with new roll numbers
    setTableData(updatedData);
  };

  // Save updated roll numbers to the server
  const handleSave = async () => {
    if (!division) {
      console.error('Division ID is required.');
      return;
    }

    // Prepare request body with student IDs and roll numbers
    const requestBody = tableData.map((item) => ({
      studentId: item.studentId,
      rollNo: item.rollNo,
    }));

    try {
      await updateRollNumbers({ divisionId: division, body: requestBody }).unwrap();

      shikshaMitraToast.success({
        message: `Roll Number ${
          selectedStudents.length === 1
            ? `of student ${selectedStudents[0].name}`
            : `of ${requestBody.length} students`
        } updated successfully`,
      });

      setInitialData(tableData);
      setIsManual(false);
      dispatch(StudentApi.util.invalidateTags(['Student']));
    } catch (err) {
      console.error('Failed to update Roll Numbers:', err);
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
    <Box
      sx={{ height: '100%', display: 'flex', flexDirection: 'column', flexGrow: 1, minHeight: 0 }}
    >
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
                disabled={
                  isProjectionsLoading ||
                  !hasStudentsWithoutRollNo ||
                  !arrangementType ||
                  !arrangeBy
                }
              >
                {isProjectionsLoading ? 'Loading...' : 'Auto Generate'}
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
            isLoading={isStudentDataLoading || isStudentDataFetching}
            showCheckbox={selectedStudents.length !== 0}
            noDataText={<>No Roll Genaration Data Found </>}
            tableId="roll-no-generation-table"
            columns={[
              { id: 'grNo', label: 'GR No.' },
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
                          row.studentId,
                          row.name,
                          e.target.value ? +e.target.value : null
                        )
                      }
                      error={Boolean(error[row.studentId])}
                      helperText={error[row.studentId]}
                      disabled={!isManual}
                    />
                  );
                },
              },
            ]}
            data={tableData || []}
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
