'use client';

import type { RootState } from 'src/redux/store';

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { Box, Button, TextField } from '@mui/material';
import { Save, Refresh, Grading } from '@mui/icons-material';

import { useBoolean } from 'src/hooks/use-boolean';

import { StudentApi } from 'src/redux/student';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import {
  useUpdateStudentGrNumberMutation,
  useLazyGetStudentForGrNumberQuery,
} from 'src/redux/student/studentGrNumber/student-gr-number-api';

import { shikshaMitraToast } from 'src/components/toast';
import CustomizableTable from 'src/components/customizabaleTable';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import SendInstantNotificationDialog from 'src/components/send-instant-notification-dialog';

import type { IInquiryData } from '../../enrollment/Inquiry';

const GrNoGenerationScreen = ({ tableData: studentData }: { tableData: IInquiryData[] }) => {
  // State to track if manual GR number generation is enabled
  const [isManual, setIsManual] = useState<boolean>(false);

  // State to store and manage the table data of students
  const [tableData, setTableData] = useState<IInquiryData[]>(studentData);

  // Update table data when student data changes
  useEffect(() => {
    setTableData(studentData);
    setInitialData(studentData);
  }, [studentData]);

  const dispatch = useDispatch();
  // Get current board and medium from global state
  const { currentBoard, currentMedium } = useSelector((state: RootState) => state.globalState);
  const [initialData, setInitialData] = useState<IInquiryData[]>(studentData);

  // Extract education related IDs from current selections
  const educationBoardId = currentBoard?.id || null;
  const educationMediumId = currentMedium?.id || null;
  const educationMediumStageId = currentMedium?.educationMediumStages[0]?.id || null;

  // API hooks for fetching and updating student GR numbers
  const [fetchStudents, { isLoading: isStudentGrNumberLoading }] =
    useLazyGetStudentForGrNumberQuery();
  const [updateStudentGrNumbers, { isLoading: isSaving }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateStudentGrNumberMutation,
  });

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

      if (typeof result === 'number') {
        let lastNum = result;
        setTableData((prevData) =>
          prevData.map((item, index) => ({
            ...item,
            grNoRecord:
              item.grNoRecord ??
              (() => {
                lastNum += 1;
                return lastNum;
              })(),
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

  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);

  // Handle individual GR number changes in manual mode
  const handleGrNumberChange = (id: string, name: string, newValue: number | null) => {
    setTableData((prevData) =>
      prevData.map((item) => (item.id === id ? { ...item, grNoRecord: newValue } : item))
    );
    setSelectedStudents([{ id, name }]);
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
      await updateStudentGrNumbers({ body: requestBody }).unwrap();

      shikshaMitraToast.success({
        message: `GR Number ${
          selectedStudents.length === 1
            ? `of student ${selectedStudents[0].name}`
            : `of ${requestBody.studentNumbers.length} students`
        } updated successfully`,
      });
      setInitialData(tableData);
      setIsManual(false);
      dispatch(StudentApi.util.invalidateTags(['Student']));
    } catch (error) {
      console.error('Failed to update GR Numbers:', error);
    }
  };

  // State to track selected students for notifications
  const [selectedStudents, setSelectedStudents] = useState<{ id: string; name: string }[]>([]);
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
      <BackPopUpChecked initialValues={initialData} currentValues={tableData}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mb: 2 }}>
          <Button
            size="small"
            startIcon={<Grading />}
            variant="outlined"
            onClick={handleManualToggle}
            // sx={{ width: '180px' }}
          >
            Manual Generation
          </Button>
          <Button
            size="small"
            startIcon={<Refresh />}
            variant="outlined"
            onClick={handleAutoGenerate}
            // sx={{ width: '180px' }}
          >
            {isStudentGrNumberLoading ? 'Loading...' : 'Auto Generate'}
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
        <CustomizableTable
          onSendNotification={handlerSendNotification}
          showCheckbox={selectedStudents.length !== 0}
          tableId="gr-no-generation-table"
          noDataText={<>No GR No Data Found </>}
          columns={[
            // { id: 'srNo', label: 'Sr. No.' },
            // {
            //   id: 'checkBox',
            //   align: 'left',
            //   sticky: true,
            //   minWidth: '60px',
            //   isSort: false,
            //   isFilter: false,
            //   label: '',
            //   renderColumn() {
            //     return (
            //       <Checkbox
            //         checked={!!tableData?.length && selectedStudents?.length === tableData?.length}
            //         onChange={(e) => {
            //           if (e.target.checked) {
            //             setSelectedStudents(tableData || []);
            //           } else {
            //             setSelectedStudents([]);
            //           }
            //         }}
            //       />
            //     );
            //   },
            //   render(value, row) {
            //     return (
            //       <Checkbox
            //         checked={!!selectedStudents.some((i: any) => i.id === row.id)}
            //         onChange={(e) => {
            //           if (e.target.checked) {
            //             setSelectedStudents([...selectedStudents, row]);
            //           } else {
            //             setSelectedStudents(selectedStudents.filter((i: any) => i.id !== row.id));
            //           }
            //         }}
            //       />
            //     );
            //   },
            // },
            // { id: 'tempGrNo', label: 'Current GR No.', align: 'left' },
            { id: 'name', label: 'Name', align: 'left' },
            {
              id: 'grNoRecord',
              label: 'New GR No.',
              align: 'left',
              isFilter: false,
              isSort: false,
              render(value, row) {
                return isManual ? (
                  <TextField
                    size="small"
                    variant="standard"
                    // placeholder="Enter New GR No."
                    type="number"
                    inputProps={{ min: 0 }}
                    value={row.grNoRecord}
                    onChange={(e) =>
                      handleGrNumberChange(
                        row.id,
                        row.name,
                        e.target.value ? +e.target.value : null
                      )
                    }
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
