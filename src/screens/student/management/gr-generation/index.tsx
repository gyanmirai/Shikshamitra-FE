'use client';

import type { RootState } from 'src/redux/store';

import { toast } from 'sonner';
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { Save, Refresh, Grading } from '@mui/icons-material';
import { Box, Button, Checkbox, TextField } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { StudentApi } from 'src/redux/student';
import {
  useUpdateStudentGrNumberMutation,
  useLazyGetStudentForGrNumberQuery,
} from 'src/redux/student/studentGrNumber/student-gr-number-api';

import CustomizableTable from 'src/components/customizabaleTable';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import SendInstantNotificationDialog from 'src/components/send-instant-notification-dialog';

import type { IInquiryData } from '../../enrollment/Inquiry';

const GrNoGenerationScreen = ({
  tableData: studentData,
  isLoading,
}: {
  isLoading: boolean;
  tableData: IInquiryData[];
}) => {
  // State to track if manual GR number generation is enabled
  const [isManual, setIsManual] = useState<boolean>(false);
  // State to store the starting GR number for auto-generation
  const [startGrNo, setStartGrNo] = useState<number | null>(null);
  // State to store and manage the table data of students
  const [tableData, setTableData] = useState<IInquiryData[]>(studentData);

  // Update table data when student data changes
  useEffect(() => {
    setTableData(studentData);
  }, [studentData]);

  const dispatch = useDispatch();
  // Get current board and medium from global state
  const { currentBoard, currentMedium } = useSelector((state: RootState) => state.globalState);

  // Extract education related IDs from current selections
  const educationBoardId = currentBoard?.id || null;
  const educationMediumId = currentMedium?.id || null;
  const educationMediumStageId = currentMedium?.educationMediumStages[0]?.id || null;

  // API hooks for fetching and updating student GR numbers
  const [fetchStudents, { isLoading: isStudentGrNumberLoading }] =
    useLazyGetStudentForGrNumberQuery();
  const [updateStudentGrNumbers, { isLoading: isSaving }] = useUpdateStudentGrNumberMutation();

  // Handle automatic GR number generation
  const handleAutoGenerate = async () => {
    if (!educationBoardId || !educationMediumId || !educationMediumStageId) {
      console.error('Missing required parameters for API call.');
      return;
    }

    try {
      const result = await fetchStudents({
        educationBoardId,
        educationMediumId,
        educationMediumStageId,
      }).unwrap();

      console.log('Students data fetched successfully:', result);

      if (typeof result === 'number') {
        setStartGrNo(result);

        setTableData((prevData) =>
          prevData.map((item, index) => ({
            ...item,
            grNoRecord: result + index,
          }))
        );
      }
    } catch (err) {
      console.error('Failed to fetch student data:', err);
    }
  };

  // Toggle manual GR number generation mode
  const handleManualToggle = () => {
    setIsManual(true);
  };

  // Handle individual GR number changes in manual mode
  const handleGrNumberChange = (id: string, newValue: number) => {
    setTableData((prevData) =>
      prevData.map((item) => (item.id === id ? { ...item, grNoRecord: newValue } : item))
    );
  };

  // Save the updated GR numbers to the backend
  const handleSave = async () => {
    const requestBody = {
      studentNumbers: tableData.map((item) => ({
        studentId: item.id,
        grNo: item.grNoRecord ?? item.tempGrNo, // Use new GR No if available, else keep the current one
      })),
    };

    try {
      const response = await updateStudentGrNumbers({ body: requestBody }).unwrap();

      toast.success('GR Numbers updated successfully!');
      setIsManual(false);
      dispatch(StudentApi.util.invalidateTags(['Student']));
    } catch (error) {
      console.error('Failed to update GR Numbers:', error);
    }
  };

  // State to track selected students for notifications
  const [selectedStudents, setSelectedStudents] = useState<any>([]);
  // Controls the visibility of notification dialog
  const sendInstantNotificationDialogValue = useBoolean();

  // Handler for sending notifications to selected students
  const handlerSendNotification = () => {
    if (!sendInstantNotificationDialogValue.value) {
      sendInstantNotificationDialogValue.onTrue();
    }
  };
  return (
    <Box>
      <BackPopUpChecked initialValues={studentData} currentValues={tableData}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mb: 2 }}>
          <Button
            startIcon={<Save />}
            variant="outlined"
            onClick={handleSave}
            disabled={isSaving || !tableData.some((item) => item.grNoRecord)}
          >
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
          <Button startIcon={<Grading />} variant="outlined" onClick={handleManualToggle}>
            Manual Generation
          </Button>
          <Button startIcon={<Refresh />} variant="contained" onClick={handleAutoGenerate}>
            {isStudentGrNumberLoading ? 'Loading...' : 'Auto Generate'}
          </Button>
        </Box>
        <CustomizableTable
          onSendNotification={handlerSendNotification}
          showCheckbox={selectedStudents.length !== 0}
          tableId="gr-no-generation-table"
          noDataText={<>No GR No Data Found </>}
          searchFieldProps={{
            placeholder: 'Search tempGrNo, name, grNoRecord...',
            label: 'Search tempGrNo, name, grNoRecord...',
            sx: {
              maxWidth: '400px',
              width: '100%',
            },
          }}
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
                    checked={!!tableData?.length && selectedStudents?.length === tableData?.length}
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
            { id: 'tempGrNo', label: 'Current GR No.' },
            { id: 'name', label: 'Name' },
            {
              id: 'grNoRecord',
              label: 'New GR No.',

              render(value, row) {
                return isManual ? (
                  <TextField
                    size="small"
                    variant="standard"
                    placeholder="Enter New GR No."
                    type="number"
                    value={value}
                    onChange={(e) => handleGrNumberChange(row.id, +e.target.value)}
                  />
                ) : (
                  value
                );
              },
            },
          ]}
          data={tableData}
        />{' '}
      </BackPopUpChecked>
      {sendInstantNotificationDialogValue.value && (
        <SendInstantNotificationDialog
          open={sendInstantNotificationDialogValue.value}
          onClose={sendInstantNotificationDialogValue.onFalse}
          data={[]}
          userList={selectedStudents}
        />
      )}
    </Box>
  );
};

export default GrNoGenerationScreen;
