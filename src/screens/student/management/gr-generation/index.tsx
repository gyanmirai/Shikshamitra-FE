'use client';

import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';

import { Box, Button, TextField } from '@mui/material';
import { Save, Refresh, Grading } from '@mui/icons-material';

import CustomizableTable from 'src/components/customizabaleTable';

const GrNoGenerationScreen = () => {
  const [isManual, setIsManual] = useState<boolean>(false);

  const dispatch = useDispatch();

  const data = [
    { id: 1, srNo: 1, currentGrNo: 'GR001', name: 'John Doe', newGrNo: '' },
    { id: 2, srNo: 2, currentGrNo: 'GR002', name: 'Jane Smith', newGrNo: '' },
    { id: 3, srNo: 3, currentGrNo: 'GR003', name: 'Alice Johnson', newGrNo: '' },
  ];
  // useEffect(() => {
  //   if (isManual) {
  //     dispatch(setIsChanges(true));
  //   }
  // }, [dispatch, isManual]);

  const router = useRouter();

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, gap: 2 }}>
        <Button
          onClick={() => {
            // router.push('/student/student-i-card');
            // dispatch(setIsChanges(false));
          }}
          startIcon={<Save />}
          variant="outlined"
        >
          Save
        </Button>
        <Button startIcon={<Grading />} variant="outlined" onClick={() => setIsManual(!isManual)}>
          Manual Generation
        </Button>
        <Button startIcon={<Refresh />} variant="contained">
          Auto Generate
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
              return (
                isManual && (
                  <TextField size="small" variant="standard" placeholder="Enter New GR No." />
                )
              );
            },
          },
        ]}
        data={data}
      />
    </Box>
  );
};

export default GrNoGenerationScreen;
