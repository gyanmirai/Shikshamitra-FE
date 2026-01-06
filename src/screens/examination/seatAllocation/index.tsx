'use client';

import type { RootState } from 'src/redux/store';
import type { Medium, Standards, Organization } from 'src/types/school';

import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import React, { useState, useEffect } from 'react';
import { useBoolean } from 'src/hooks/use-boolean';
import CustomDialog from 'src/components/customDialog';
import { Box, Button, Typography } from '@mui/material';
import CustomSelect from 'src/components/custom-select';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import {
  useGetExamRoomsQuery,
  useGetExamDivisionsQuery,
} from 'src/redux/academicAPI/ExaminationApi/ScheduleExamApi/seat-allocationApi';

import SeatAllocationTable from './components/SeatAllocationTable';
import SeatAllocationSection from './components/SeatAllocationSection';

import type { IDroppedData, IExamAllocation } from './type';

const SeatAllocation = () => {
  const { currentMedium } = useSelector((state: RootState) => state.globalState);

  const openSeatAllocation = useBoolean();
  const [allClass, setAllClass] = useState<Standards[]>([]);
  const [room, setRoom] = useState<string>('');
  // State to store selected class/standard ID
  const [classes, setClasses] = useState<string>('');
  const [division, setDivision] = useState<string>('');

  // const [selectedClass, setSelectedClass] = useState('');
  const [selectedExam, setSelectedExam] = useState<IExamAllocation | null>(null);

  const {
    data: examDivisionsData,
    isLoading,
    isFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetExamDivisionsQuery,
    params: { academicMediumId: (currentMedium as Medium)?.id, classId: selectedExam?.classId },
  }); // Update classes when organization changes
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [droppedData, setDroppedData] = useState<IDroppedData>({ roomId: '', students: [] });
  const {
    data: examRoomsData,
    isLoading: examRoomsLoading,
    isFetching: examRoomsFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetExamRoomsQuery,
    params: { examId: selectedExam?.id, divisionId: division },
  }); // Update classes when organization changes

  useEffect(() => {
    // Flatten the list of standards from all stages
    const allClasses =
      currentMedium?.educationMediumStages?.flatMap(
        (stage: Organization) => stage.standards || []
      ) || [];

    setAllClass(allClasses);
    setClasses(allClasses[0]?.name || '');
  }, [currentMedium]);

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
                options={examDivisionsData?.data?.divisions || []}
                label="Division"
                value={division}
                isLoading={isLoading || isFetching}
                onChange={(val) => setDivision(val as string)}
                labelKey="name"
                valueKey="name"
                formControlProps={{ sx: { minWidth: '250px', width: '100%' } }}
                disabled={!classes}
              />
              <CustomSelect
                options={examRoomsData?.data?.rooms || []}
                label="Room"
                value={room}
                isLoading={examRoomsLoading || examRoomsFetching}
                onChange={(val) => setRoom(val as string)}
                labelKey="name"
                valueKey="id"
                formControlProps={{ sx: { minWidth: '250px', width: '100%' } }}
                disabled={!division}
              />
              <Typography variant="h6" sx={{ whiteSpace: 'nowrap' }}>
                Exam : {selectedExam?.examName}
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
          <SeatAllocationSection
            division={division}
            classRoom={room}
            selectedExam={selectedExam}
            setDroppedData={setDroppedData}
          />
        </CustomDialog>
      ) : (
        <>
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
            onSeatAllocate={(examData) => {
              setSelectedExam(examData);
            }}
            classId={classes}
          />
        </>
      )}
    </Box>
  );
};

export default SeatAllocation;
