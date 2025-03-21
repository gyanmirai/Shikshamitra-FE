'use client';

import type { RootState } from 'src/redux/store';

import { toast } from 'sonner';
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { Box, Button, TextField } from '@mui/material';
import { Save, Refresh, Grading } from '@mui/icons-material';

import { StudentApi } from 'src/redux/student';
import {
  useUpdateStudentGrNumberMutation,
  useLazyGetStudentForGrNumberQuery,
} from 'src/redux/student/studentGrNumber/student-gr-number-api';

import CustomizableTable from 'src/components/customizabaleTable';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

import type { IInquiryData } from '../../enrollment/Inquiry';

const GrNoGenerationScreen = ({
  tableData: studentData,
  isLoading,
}: {
  isLoading: boolean;
  tableData: IInquiryData[];
}) => {
  const [isManual, setIsManual] = useState<boolean>(false);
  const [startGrNo, setStartGrNo] = useState<number | null>(null);
  const [tableData, setTableData] = useState<IInquiryData[]>(studentData);

  useEffect(() => {
    setTableData(studentData);
  }, [studentData]);

  const dispatch = useDispatch();
  const { currentBoard, currentMedium } = useSelector((state: RootState) => state.globalState);

  const educationBoardId = currentBoard?.id || null;
  const educationMediumId = currentMedium?.id || null;
  const educationMediumStageId = currentMedium?.educationMediumStages[0]?.id || null;

  const [fetchStudents, { isLoading: isStudentGrNumberLoading }] =
    useLazyGetStudentForGrNumberQuery();
  const [updateStudentGrNumbers, { isLoading: isSaving }] = useUpdateStudentGrNumberMutation();

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

  const handleManualToggle = () => {
    setIsManual(true);
  };

  const handleGrNumberChange = (id: string, newValue: number) => {
    setTableData((prevData) =>
      prevData.map((item) => (item.id === id ? { ...item, grNoRecord: newValue } : item))
    );
  };

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
          tableId="gr-no-generation-table"
          columns={[
            // { id: 'srNo', label: 'Sr. No.' },
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
        />
      </BackPopUpChecked>
    </Box>
  );
};

export default GrNoGenerationScreen;
