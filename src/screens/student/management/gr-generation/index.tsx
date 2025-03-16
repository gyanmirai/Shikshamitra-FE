'use client';

import type { RootState } from 'src/redux/store';

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { Box, Button, TextField } from '@mui/material';
import { Save, Refresh, Grading } from '@mui/icons-material';

import {
  useUpdateStudentGrNumberMutation,
  useLazyGetStudentForGrNumberQuery,
} from 'src/redux/student/studentGrNumber/student-gr-number-api';

import CustomizableTable from 'src/components/customizabaleTable';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

const initialValues = [
  { id: 1, srNo: 1, currentGrNo: 'GR001', name: 'John Doe', newGrNo: '' },
  { id: 2, srNo: 2, currentGrNo: 'GR002', name: 'Jane Smith', newGrNo: '' },
  { id: 3, srNo: 3, currentGrNo: 'GR003', name: 'Alice Johnson', newGrNo: '' },
];

const GrNoGenerationScreen = () => {
  const [isManual, setIsManual] = useState<boolean>(false);
  const [startGrNo, setStartGrNo] = useState<number | null>(null);
  const [tableData, setTableData] = useState(initialValues);

  const dispatch = useDispatch();
  const { currentBoard, currentMedium } = useSelector((state: RootState) => state.globalState);

  const educationBoardId = currentBoard?.id || null;
  const educationMediumId = currentMedium?.id || null;
  const educationMediumStageId = currentMedium?.educationMediumStages[0]?.id || null;

  const [fetchStudents, { isLoading }] = useLazyGetStudentForGrNumberQuery();
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
            newGrNo: `GR${String(result + index).padStart(3, '0')}`,
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

  const handleGrNumberChange = (id: number, newValue: string) => {
    setTableData((prevData) =>
      prevData.map((item) => (item.id === id ? { ...item, newGrNo: newValue } : item))
    );
  };

  const handleSave = async () => {
    const requestBody = {
      studentNumbers: tableData.map((item) => ({
        studentId: item.id,
        grNo: item.newGrNo || item.currentGrNo, // Use new GR No if available, else keep the current one
      })),
    };

    console.log('Request body:', requestBody);
    try {
      const response = await updateStudentGrNumbers(requestBody).unwrap();
      console.log('GR Numbers updated successfully:', response);
      alert('GR Numbers updated successfully!');
    } catch (error) {
      console.error('Failed to update GR Numbers:', error);
      alert('Failed to update GR Numbers. Please try again.');
    }
  };

  return (
    <Box>
      <BackPopUpChecked initialValues={initialValues} currentValues={tableData}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mb: 2 }}>
          <Button
            startIcon={<Save />}
            variant="outlined"
            onClick={handleSave}
            disabled={isSaving || !tableData.some((item) => item.newGrNo)}
          >
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
          <Button startIcon={<Grading />} variant="outlined" onClick={handleManualToggle}>
            Manual Generation
          </Button>
          <Button startIcon={<Refresh />} variant="contained" onClick={handleAutoGenerate}>
            {isLoading ? 'Loading...' : 'Auto Generate'}
          </Button>
        </Box>
        <CustomizableTable
          tableId="gr-no-generation-table"
          columns={[
            { id: 'srNo', label: 'Sr. No.' },
            { id: 'currentGrNo', label: 'Current GR No.' },
            { id: 'name', label: 'Name' },
            {
              id: 'newGrNo',
              label: 'New GR No.',
              render(value, row) {
                return isManual ? (
                  <TextField
                    size="small"
                    variant="standard"
                    placeholder="Enter New GR No."
                    value={row.newGrNo}
                    onChange={(e) => handleGrNumberChange(row.id, e.target.value)}
                  />
                ) : (
                  row.newGrNo
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
