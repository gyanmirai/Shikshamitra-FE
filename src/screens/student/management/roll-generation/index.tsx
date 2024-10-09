'use client';

import React, { useState } from 'react';

import { Box, Button } from '@mui/material';
import { Save, Refresh } from '@mui/icons-material';

import CustomSelect from 'src/components/custom-select';
import CustomizableTable from 'src/components/customizabaleTable';

const RollNoGenerationScreen = () => {
  const [arrangementType, setArrangementType] = useState('');
  const [arrangeBy, setArrangeBy] = useState('');

  const data = [
    { id: 1, surname: 'Doe', srNo: 1, grNo: 'GR001', name: 'John', rollNo: '' },
    { id: 2, surname: 'Smith', srNo: 2, grNo: 'GR002', name: 'Jane', rollNo: '' },
    { id: 3, surname: 'Johnson', srNo: 3, grNo: 'GR003', name: 'Alice', rollNo: '' },
  ];

  return (
    <Box>
      <Box display="flex" gap={2} flexWrap="wrap">
        <CustomSelect
          options={[
            { id: 'mix', name: 'Mix' },
            { id: 'boysFirst', name: 'Boys First' },
            { id: 'girlsFirst', name: 'Girls First' },
          ]}
          label="Arrangement Type"
          value={arrangementType}
          onChange={(val: string | string[]) => setArrangementType(val as string)}
          labelKey="name"
          valueKey="id"
          formControlProps={{ sx: { maxWidth: '250px', width: '100%' } }}
          // disabled={!division}
        />
        <CustomSelect
          options={[
            { id: 'surname', name: 'Surname' },
            { id: 'name', name: 'Name' },
            { id: 'grNo', name: 'GR.No.' },
          ]}
          label="Arrangement By"
          value={arrangeBy}
          onChange={(val: string | string[]) => setArrangeBy(val as string)}
          labelKey="name"
          valueKey="id"
          formControlProps={{ sx: { maxWidth: '250px', width: '100%' } }}
          disabled={!arrangementType}
        />
      </Box>
      {arrangeBy && (
        <>
          {' '}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, gap: 2 }}>
            <Button startIcon={<Save />} variant="outlined">
              Save
            </Button>
            {/* <Button
              startIcon={<Grading />}
              variant="outlined"
              onClick={() => setIsManual(!isManual)}
            >
              Manual Generation
            </Button> */}
            <Button startIcon={<Refresh />} variant="contained">
              Auto Generate
            </Button>
          </Box>
          <CustomizableTable
            columns={[
              { id: 'srNo', label: 'Sr. No.' },
              { id: 'grNo', label: 'GR No.' },
              { id: 'name', label: 'Name' },
              { id: 'surname', label: 'Surname' },
              {
                id: 'rollNo',
                label: 'Roll No.',
              },
            ]}
            data={data}
          />{' '}
        </>
      )}
    </Box>
  );
};

export default RollNoGenerationScreen;
