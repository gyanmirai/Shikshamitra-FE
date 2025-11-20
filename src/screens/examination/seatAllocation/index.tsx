'use client';

import type { RootState } from 'src/redux/store';
import type { Division, Standards, Organization } from 'src/types/school';

import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import React, { useState, useEffect } from 'react';
import { useBoolean } from 'src/hooks/use-boolean';
import CustomDialog from 'src/components/customDialog';
import { Box, Button, Typography } from '@mui/material';
import CustomSelect from 'src/components/custom-select';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import SeatAllocationTable from './components/SeatAllocationTable';
import SeatAllocationSection from './components/SeatAllocationSection';

const SeatAllocation = () => {
  const openSeatAllocation = useBoolean();
  const [allClass, setAllClass] = useState<Standards[]>([]);
  const [room, setRoom] = useState<string>('');
  // State to store selected class/standard ID
  const [classes, setClasses] = useState<string>('');
  // State to store all divisions for the selected class
  const [allDivision, setAllDivision] = useState<Division[]>([]);
  // State to store selected division ID
  const [division, setDivision] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [rooms, setRooms] = useState([
    { id: '1', name: 'Room 101' },
    { id: '2', name: 'Room 102' },
    { id: '3', name: 'Room 103' },
    { id: '4', name: 'Room 104' },
    { id: '5', name: 'Room 105' },
  ]);
  const { currentMedium: medium } = useSelector((state: RootState) => state.globalState);

  // Update classes when organization changes
  useEffect(() => {
    // Flatten the list of standards from all stages
    const allClasses =
      medium?.educationMediumStages?.flatMap((stage: Organization) => stage.standards || []) || [];

    setAllClass(allClasses);
    setClasses(allClasses[0]?.name || '');
  }, [medium]);

  useEffect(() => {
    setAllDivision(allClass.find((org: any) => org?.name === classes)?.divisions || []);
    setDivision(allClass.find((org: any) => org?.name === classes)?.divisions?.[0]?.name || '');
  }, [allClass, classes, setDivision]);

  return (
    <Box height="100%" display="flex" flexDirection="column">
      {openSeatAllocation.value ? (
        <CustomBreadcrumbs
          heading="Seat Allocation"
          description="This table lists all scheduled exams eligible for seat allocation. Click 'Allocate Seat' to assign students to exam halls for a specific exam."
          isBack
          onBack={() => {
            // handleClose(null, false);
            openSeatAllocation.onFalse();
          }}
          links={[
            { name: 'Academic', href: '/academic/dashboard' },
            { name: 'Examination', href: '/academic/examination' },
            { name: 'Seat Allocation', href: '/academic/examination/seat-allocation' },
          ]}
          sx={{ mb: 2 }}
        />
      ) : (
        <CustomBreadcrumbs
          heading="Seat Allocation"
          description="This table lists all scheduled exams eligible for seat allocation. Click 'Allocate Seat' to assign students to exam halls for a specific exam."
          links={[
            { name: 'Academic', href: '/academic/dashboard' },
            { name: 'Examination', href: '/academic/examination' },
            { name: 'Seat Allocation' },
          ]}
          sx={{ mb: 2 }}
        />
      )}
      {openSeatAllocation.value ? (
        <CustomDialog
          title="Allocation Details"
          open={openSeatAllocation.value}
          handleClose={openSeatAllocation.onFalse}
          fullScreen
        >
          {/* <SectionCard title="Allocation Details"> */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mt: 2,
              p: 2,
            }}
          >
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <CustomSelect
                options={allDivision}
                label="Division"
                value={division}
                onChange={(val) => setDivision(val as string)}
                labelKey="name"
                valueKey="name"
                formControlProps={{ sx: { minWidth: '250px', width: '100%' } }}
                disabled={!classes}
              />
              <CustomSelect
                options={rooms}
                label="Room"
                value={room}
                onChange={(val) => setRoom(val as string)}
                labelKey="name"
                valueKey="id"
                formControlProps={{ sx: { minWidth: '250px', width: '100%' } }}
                disabled={!division}
              />
              <Typography variant="h6" sx={{ whiteSpace: 'nowrap' }}>
                Class : {selectedClass}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                startIcon={<Iconify icon={GlobalIcons.cancel} />}
                variant="outlined"
                size="small"
                onClick={() => {
                  // draftTimetableDialog.onTrue();
                }}
              >
                Cancel
              </Button>
              <Button
                startIcon={<Iconify icon={GlobalIcons.submit} />}
                variant="contained"
                size="small"
                onClick={() => {
                  // publishTimetableDialog.onTrue();
                }}
              >
                Submit
              </Button>
            </Box>
          </Box>
          {/* </SectionCard> */}
          <SeatAllocationSection division={division} classRoom={room} className={selectedClass} />
        </CustomDialog>
      ) : (
        <>
          {' '}
          <CustomSelect
            options={allClass}
            label="Class"
            value={classes}
            onChange={(val) => setClasses(val as string)}
            labelKey="name"
            valueKey="name"
            formControlProps={{ sx: { maxWidth: '250px', width: '100%', ml: 1 } }}
          />
          <SeatAllocationTable
            openSeatAllocation={openSeatAllocation}
            onSeatAllocate={(className) => {
              setSelectedClass(className);
            }}
          />
        </>
      )}
    </Box>
  );
};

export default SeatAllocation;
