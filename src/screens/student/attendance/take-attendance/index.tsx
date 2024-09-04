'use client';

import type { Medium, Division, Standards, Organization } from 'src/types/school';

import useLocalStorage from 'use-local-storage';
import React, { useState, useEffect } from 'react';

import { Box, Avatar, Button, Divider, Typography, DialogActions } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useLazyGetBoardByIdQuery } from 'src/redux/board/boardApi';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

const TakeAttendanceScreen = () => {
  const dialog = useBoolean();
  const [allMediums, setAllMediums] = useState<Medium[]>([]);
  const [medium, setMedium] = useState<string>('');
  const [allOrganization, setAllOrganization] = useState<Organization[]>([]);
  const [organization, setOrganization] = useState<string>('');
  const [allClass, setAllClass] = useState<Standards[]>([]);
  const [classes, setClass] = useState<string>('');
  const [allDivision, setAllDivision] = useState<Division[]>([]);
  const [division, setDivision] = useState<string>('');
  const [currentBoard] = useLocalStorage<Record<string, any>>('board', {});
  const [getBoard, { data: boardData }] = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useLazyGetBoardByIdQuery,
  });
  useEffect(() => {
    if (currentBoard?.id) {
      getBoard(currentBoard.id);
    }
  }, [currentBoard, getBoard]);

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

  // Dummy data for the table
  const dummyData = [
    { rollNo: '1', name: 'John Doe', grNo: 'GR001', attendance: 'Present' },
    { rollNo: '2', name: 'Jane Smith', grNo: 'GR002', attendance: 'Absent' },
    { rollNo: '3', name: 'Alice Johnson', grNo: 'GR003', attendance: 'Present' },
    { rollNo: '4', name: 'Bob Williams', grNo: 'GR004', attendance: 'Present' },
    { rollNo: '5', name: 'Charlie Brown', grNo: 'GR005', attendance: 'Absent' },
  ];

  return (
    <Box>
      <CustomBreadcrumbs
        heading="Take Attendance"
        links={[{ name: 'Student' }, { name: 'Attendance' }, { name: 'Take Attendance' }]}
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

      <Divider sx={{ my: 2 }} />

      <Box display="flex" alignItems="center" justifyContent="flex-end">
        <Button
          size="small"
          startIcon={<Iconify icon="material-symbols:save" />}
          variant="contained"
          onClick={dialog.onTrue}
        >
          Save
        </Button>
      </Box>

      {division && (
        <CustomizableTable
          columns={[
            { id: 'rollNo', label: 'Roll No' },
            { id: 'grNo', label: 'Gr No' },
            {
              id: 'name',
              label: 'Name',
              render(value, row) {
                return (
                  <Box display="flex" alignItems="center" gap={1}>
                    <Avatar title={value} />
                    {value}
                  </Box>
                );
              },
            },
            {
              id: 'attendance',
              label: 'Attendance',
              isSort: false,
              render(value, row) {
                return (
                  <Label variant="soft" color={value === 'Present' ? 'success' : 'error'}>
                    {value}
                  </Label>
                );
              },
            },
          ]}
          data={dummyData}
        />
      )}
      <CustomDialog
        title="Attendance Confirmation"
        open={dialog.value}
        handleClose={dialog.onFalse}
      >
        <Box p={2}>
          <Typography variant="h6" component="span" fontWeight={400} fontSize="14px">
            Are you sure you want to mark as absent to these roll no Students<b> 1, 2, 5</b> ?
          </Typography>
        </Box>
        <DialogActions>
          <Button onClick={dialog.onFalse} color="error" variant="outlined">
            Cancel
          </Button>
          <Button onClick={dialog.onFalse} color="primary" variant="contained">
            Confirm
          </Button>
        </DialogActions>
      </CustomDialog>
    </Box>
  );
};
export default TakeAttendanceScreen;
