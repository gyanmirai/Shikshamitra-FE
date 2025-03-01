'use client';

import React, { useState } from 'react';

import { Box, Button, TextField } from '@mui/material';
import { Save, Refresh, Grading } from '@mui/icons-material';

import { useUpdateStudentRollNumberMutation } from 'src/redux/student/roll-number/roll-number-api';

import CustomSelect from 'src/components/custom-select';
import CustomizableTable from 'src/components/customizabaleTable';

const initialData = [
  { id: 1, surname: 'Akbari', srNo: 1, grNo: 'GR001', name: 'Parth', rollNo: '', gender: 'Male' },
  { id: 2, surname: 'Guhsar', srNo: 2, grNo: 'GR002', name: 'Hiren', rollNo: '', gender: 'Female' },
  { id: 3, surname: 'Ram', srNo: 2, grNo: 'GR002', name: 'Jeet', rollNo: '', gender: 'Female' },
  { id: 4, surname: 'Jignesh', srNo: 2, grNo: 'GR002', name: 'Hiren', rollNo: '', gender: 'Male' },
];

const RollNoGenerationScreen = () => {
  const [arrangementType, setArrangementType] = useState('');
  const [isManual, setIsManual] = useState(false);
  const [arrangeBy, setArrangeBy] = useState('');
  const [tableData, setTableData] = useState(initialData);
  const [error, setError] = useState<Record<number, string>>({});

  const [updateStudentRollNumbers, { isLoading: isSaving }] = useUpdateStudentRollNumberMutation();
  const handleAutoGenerate = () => {
    let filteredData = [...initialData];

    // Step 1: Filter based on Arrangement Type
    if (arrangementType === 'boysFirst') {
      filteredData = filteredData.filter((item) => item.gender === 'Male');
    } else if (arrangementType === 'girlsFirst') {
      filteredData = filteredData.filter((item) => item.gender === 'Female');
    }

    // Step 2: Sort based on Arrangement By
    if (arrangeBy === 'name') {
      filteredData.sort((a, b) => a.name.localeCompare(b.name));
    } else if (arrangeBy === 'surname') {
      filteredData.sort((a, b) => a.surname.localeCompare(b.surname));
    } else if (arrangeBy === 'grNo') {
      filteredData.sort((a, b) => a.grNo.localeCompare(b.grNo));
    }

    // Step 3: Assign Roll Numbers from 1
    filteredData = filteredData.map((item, index) => ({
      ...item,
      rollNo: (index + 1).toString(), // Assign roll numbers sequentially
    }));

    setTableData(filteredData);
  };

  const handleRollNoChange = (id: number, newValue: string) => {
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
      const response = await updateStudentRollNumbers(requestBody).unwrap();
      console.log('GR Numbers updated successfully:', response);
      alert('GR Numbers updated successfully!');
    } catch (err) {
      console.error('Failed to update GR Numbers:', err);
      alert('Failed to update GR Numbers. Please try again.');
    }
  };

  return (
    <Box>
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
              disabled={isSaving}
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
          tableId="roll-no-generation-table"
          columns={[
            { id: 'srNo', label: 'Sr. No.' },
            { id: 'grNo', label: 'GR No.' },
            { id: 'name', label: 'Name' },
            { id: 'surname', label: 'Surname' },
            {
              id: 'rollNo',
              label: 'Roll No.',
              minWidth: 250,
              render(value, row) {
                return (
                  <TextField
                    size="small"
                    variant="standard"
                    value={row.rollNo}
                    onChange={(e) => handleRollNoChange(row.id, e.target.value)}
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
    </Box>
  );
};

export default RollNoGenerationScreen;
