'use client';

import type { RootState } from 'src/redux/store';

import { StudentApi } from 'src/redux/student';
import React, { useState, useEffect } from 'react';
import { useBoolean } from 'src/hooks/use-boolean';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Button, TextField } from '@mui/material';
import { shikshaMitraToast } from 'src/components/toast';
import { Save, Refresh, Grading } from '@mui/icons-material';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { useGetAllStudentGroupQuery } from 'src/redux/student/student-group/student-group';
import {
  useUpdateStudentGrNumberMutation,
  useLazyGetStudentForGrNumberQuery,
} from 'src/redux/student/studentGrNumber/student-gr-number-api';

import type { IInquiryData } from '../../enrollment/Inquiry';

const GrNoGenerationScreen = ({ division }: { division: string }) => {
  // State to track if manual GR number generation is enabled
  const [isManual, setIsManual] = useState<boolean>(false);

  // Get current board and medium from global state
  const { currentBoard, currentMedium } = useSelector((state: RootState) => state.globalState);

  // Get the division ID from current medium

  const { data: getStudentData, isLoading: isStudentDataLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetAllStudentGroupQuery,
    params: division,
    options: {
      skip: !division,
    },
  });

  // State to store and manage the table data of students
  const [tableData, setTableData] = useState<IInquiryData[]>(getStudentData?.data || []);

  // Update table data when student data changes
  useEffect(() => {
    if (getStudentData?.data) {
      setTableData(getStudentData?.data);
      setInitialData(getStudentData?.data);
    }
  }, [getStudentData]);

  const dispatch = useDispatch();
  const [initialData, setInitialData] = useState<IInquiryData[]>(getStudentData || []);

  // Extract education related IDs from current selections
  const educationBoardId = currentBoard?.id || null;
  const educationMediumId = currentMedium?.id || null;
  const educationMediumStageId = currentMedium?.educationMediumStages[0]?.id || null;

  // API hooks for fetching and updating student GR numbers

  const { data: fetchStudents, isLoading: isStudentGrNumberLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useLazyGetStudentForGrNumberQuery,
    params: division,
    options: {
      skip: !division,
    },
  });

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
      prevData.map((item) => (item.studentId === id ? { ...item, grNo: newValue } : item))
    );
    setSelectedStudents([{ studentId: id, name }]);
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
  const [selectedStudents, setSelectedStudents] = useState<{ studentId: string; name: string }[]>(
    []
  );
  // Controls the visibility of notification dialog
  const sendInstantNotificationDialogValue = useBoolean();

  // Handler for sending notifications to selected students
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
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
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
      </BackPopUpChecked>
      <CustomizableTable
        onSendNotification={handlerSendNotification}
        showCheckbox={selectedStudents.length !== 0}
        isLoading={isStudentDataLoading}
        tableId="gr-no-generation-table"
        noDataText={<>No GR No Data Found </>}
        columns={[
          { id: 'studentName', label: 'Name', align: 'left' },
          {
            id: 'grNo',
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
                  value={row.grNo}
                  onChange={(e) =>
                    handleGrNumberChange(
                      row.studentId,
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
        data={tableData || []}
      />{' '}
    </Box>
  );
};

export default GrNoGenerationScreen;
