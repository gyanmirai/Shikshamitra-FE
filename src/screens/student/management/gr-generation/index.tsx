'use client';

import type { RootState } from 'src/redux/store';
import type { Medium, Division, Standards, Organization } from 'src/types/school';

import { useSelector } from 'react-redux';
import React, { useState, useEffect } from 'react';

import { Box, Button, TextField } from '@mui/material';
import { Save, Refresh, Grading } from '@mui/icons-material';

import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useLazyGetBoardByIdQuery } from 'src/redux/board/boardApi';

import CustomSelect from 'src/components/custom-select';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

const GrNoGenerationScreen = () => {
  const [allMediums, setAllMediums] = useState<Medium[]>([]);
  const [medium, setMedium] = useState<string>('');
  const [allOrganization, setAllOrganization] = useState<Organization[]>([]);
  const [organization, setOrganization] = useState<string>('');
  const [allClass, setAllClass] = useState<Standards[]>([]);
  const [classes, setClass] = useState<string>('');
  const [allDivision, setAllDivision] = useState<Division[]>([]);
  const [division, setDivision] = useState<string>('');
  const [isManual, setIsManual] = useState<boolean>(false);
  const { currentBoard } = useSelector((state: RootState) => state.globalState);
  const [getBoard, { data: boardData }] = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useLazyGetBoardByIdQuery,
  });
  useEffect(() => {
    if (currentBoard?.id) {
      if (boardData) {
        setAllMediums(boardData?.educationMediums || []);
        setMedium(boardData?.educationMediums?.[0]?.id || '');
      } else {
        getBoard(currentBoard.id);
      }
    } else {
      setAllMediums([]);
      setMedium('');
    }
  }, [boardData, currentBoard?.id, getBoard]);

  useEffect(() => {
    setAllMediums(boardData?.educationMediums || []);
    setMedium(boardData?.educationMediums?.[0]?.id || '');
  }, [boardData]);

  useEffect(() => {
    setAllMediums(boardData?.educationMediums || []);
    setMedium(boardData?.educationMediums?.[0]?.id || '');
  }, [boardData]);

  useEffect(() => {
    setAllOrganization(
      allMediums.find((med: any) => med?.id === medium)?.educationMediumStages || []
    );
    setOrganization(
      allMediums.find((med: any) => med?.id === medium)?.educationMediumStages?.[0]?.id || ''
    );
  }, [medium, allMediums]);

  useEffect(() => {
    setAllClass(allOrganization.find((org: any) => org?.id === organization)?.standards || []);
    setClass(
      allOrganization.find((org: any) => org?.id === organization)?.standards?.[0]?.id || ''
    );
  }, [organization, allOrganization]);
  useEffect(() => {
    setAllDivision(allClass.find((org: any) => org?.id === classes)?.divisions || []);
    setDivision(allClass.find((org: any) => org?.id === classes)?.divisions?.[0]?.id || '');
  }, [allClass, classes]);

  const data = [
    { id: 1, srNo: 1, currentGrNo: 'GR001', name: 'John Doe', newGrNo: '' },
    { id: 2, srNo: 2, currentGrNo: 'GR002', name: 'Jane Smith', newGrNo: '' },
    { id: 3, srNo: 3, currentGrNo: 'GR003', name: 'Alice Johnson', newGrNo: '' },
  ];

  return (
    <Box>
      <CustomBreadcrumbs
        heading="Gr.No. Generation"
        links={[{ name: 'Student' }, { name: 'Student Management' }, { name: 'Gr.No. Generation' }]}
        sx={{ px: 1, mb: 2 }}
      />
      <Box display="flex" gap={2} flexWrap="wrap">
        <CustomSelect
          options={allMediums}
          label="Medium"
          value={medium}
          onChange={(val: string | string[]) => {
            setMedium(val as string);
          }}
          labelKey="name"
          valueKey="id"
          formControlProps={{ sx: { maxWidth: '250px', width: '100%' } }}
        />
        <CustomSelect
          options={allOrganization}
          label="Organization"
          value={organization}
          onChange={(val: string | string[]) => setOrganization(val as string)}
          labelKey="name"
          valueKey="id"
          formControlProps={{ sx: { maxWidth: '250px', width: '100%' } }}
          disabled={!medium}
        />
        <CustomSelect
          options={allClass}
          label="Class"
          value={classes}
          onChange={(val: string | string[]) => setClass(val as string)}
          labelKey="name"
          valueKey="id"
          formControlProps={{ sx: { maxWidth: '250px', width: '100%' } }}
          disabled={!organization}
        />
        <CustomSelect
          options={allDivision}
          label="Division"
          value={division}
          onChange={(val: string | string[]) => setDivision(val as string)}
          labelKey="name"
          valueKey="id"
          formControlProps={{ sx: { maxWidth: '250px', width: '100%' } }}
          disabled={!classes}
        />
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, gap: 2 }}>
        <Button startIcon={<Save />} variant="outlined">
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
        columns={[
          { id: 'srNo', label: 'Sr. No.' },
          { id: 'currentGrNo', label: 'Current GR No.' },
          { id: 'name', label: 'Name' },
          {
            id: 'newGrNo',
            label: 'New GR No.',
            render(value, row) {
              return isManual && <TextField size="small" variant="standard" />;
            },
          },
        ]}
        data={data}
      />
    </Box>
  );
};

export default GrNoGenerationScreen;
