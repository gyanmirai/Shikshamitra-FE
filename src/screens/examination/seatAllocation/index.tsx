'use client';

import type { RootState } from 'src/redux/store';
import type { Standards, Organization } from 'src/types/school';

import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import React, { useState, useEffect } from 'react';
import { useBoolean } from 'src/hooks/use-boolean';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import { Box, Paper, Button, Typography } from '@mui/material';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import {
  useGetExamRoomsQuery,
  useGetExamDivisionsQuery,
  useSaveSeatAllocationMutation,
} from 'src/redux/academicAPI/ExaminationApi/ScheduleExamApi/seat-allocationApi';

import SeatAllocationTable from './components/SeatAllocationTable';
import SeatAllocationSection from './components/SeatAllocationSection';

import type { IDroppedData, IExamAllocation } from './type';

const SeatAllocation = () => {
  const { currentMedium } = useSelector((state: RootState) => state.globalState);

  const openSeatAllocation = useBoolean();
  const [allClass, setAllClass] = useState<Standards[]>([]);
  const [room, setRoom] = useState<string>('');
  // classes stores the selected standard UUID
  const [classes, setClasses] = useState<string>('');
  const [division, setDivision] = useState<string>('');

  const [selectedExam, setSelectedExam] = useState<IExamAllocation | null>(null);
  const [droppedData, setDroppedData] = useState<IDroppedData>({ roomId: '', students: [] });

  const [saveSeatAllocation, { isLoading: isSaving }] = useSaveSeatAllocationMutation();

  const {
    data: examDivisionsData,
    isLoading,
    isFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetExamDivisionsQuery,
    params: { examId: selectedExam?.examId, standardId: classes },
    options: {
      skip: !selectedExam?.examId || !classes, // Skip the query if examId or classes is not selected
    },
  });

  const {
    data: examRoomsData,
    isLoading: examRoomsLoading,
    isFetching: examRoomsFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetExamRoomsQuery,
    params: { examId: selectedExam?.examId, divisionId: division },
    options: {
      skip: !selectedExam?.examId || !division, // Skip the query if examId or division is not selected
    },
  });

  useEffect(() => {
    // Flatten the list of standards from all stages
    const allClasses =
      currentMedium?.educationMediumStages?.flatMap(
        (stage: Organization) => stage.standards || []
      ) || [];

    setAllClass(allClasses);
    setClasses(allClasses[0]?.id || '');
  }, [currentMedium]);

  const handleSubmit = async () => {
    if (!selectedExam?.examId || droppedData.students.length === 0) return;
    await saveSeatAllocation({ examId: selectedExam.examId, body: droppedData });
    openSeatAllocation.onFalse();
  };

  return (
    <Box height="100%" display="flex" flexDirection="column">
      {openSeatAllocation.value ? (
        <CustomBreadcrumbs
          heading="Seating Plan"
          description="This table lists all scheduled exams eligible for seat allocation. Click 'Allocate Seat' to assign students to exam halls for a specific exam."
          isBack
          onBack={() => {
            openSeatAllocation.onFalse();
          }}
          links={[
            { name: 'Academic', href: '/academic/dashboard' },
            { name: 'Examination', href: '/academic/examination' },
            { name: 'Seating Plan', href: '/academic/examination/seat-allocation' },
          ]}
        />
      ) : (
        <CustomBreadcrumbs
          heading="Seating Plan"
          description="This table lists all scheduled exams eligible for seat allocation. Click 'Allocate Seat' to assign students to exam halls for a specific exam."
          links={[
            { name: 'Academic', href: '/academic/dashboard' },
            { name: 'Examination', href: '/academic/examination' },
            { name: 'Seating Plan' },
          ]}
        />
      )}
      {openSeatAllocation.value ? (
        <CustomDialog
          title="Allocation Details"
          open={openSeatAllocation.value}
          handleClose={openSeatAllocation.onFalse}
          fullScreen
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              p: 2,
            }}
          >
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <CustomSelect
                options={examDivisionsData?.items || []}
                label="Division"
                value={division}
                isLoading={isLoading || isFetching}
                onChange={(val) => setDivision(val as string)}
                labelKey="name"
                valueKey="id"
                formControlProps={{ sx: { minWidth: '250px', width: '100%' } }}
                disabled={!classes}
              />
              <CustomSelect
                options={examRoomsData?.items || []}
                label="Room"
                value={room}
                isLoading={examRoomsLoading || examRoomsFetching}
                onChange={(val) => setRoom(val as string)}
                labelKey="roomName"
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
                onClick={openSeatAllocation.onFalse}
              >
                Cancel
              </Button>
              <Button
                startIcon={<Iconify icon={GlobalIcons.submit} />}
                variant="contained"
                size="small"
                disabled={isSaving}
                onClick={handleSubmit}
              >
                Submit
              </Button>
            </Box>
          </Box>
          <SeatAllocationSection
            division={division}
            classRoom={room}
            selectedExam={selectedExam}
            setDroppedData={setDroppedData}
          />
        </CustomDialog>
      ) : (
        <>
          <Paper sx={{ boxShadow: 'var(--shadows-4)', p: 1, mb: 1 }}>
            <CustomSelect
              options={allClass}
              label="Class"
              value={classes}
              onChange={(val) => setClasses(val as string)}
              labelKey="name"
              valueKey="id"
              formControlProps={{ sx: { maxWidth: '250px', width: '100%' } }}
            />
          </Paper>
          <SeatAllocationTable
            openSeatAllocation={openSeatAllocation}
            onSeatAllocate={(examData) => {
              setSelectedExam(examData);
              setDivision('');
              setRoom('');
              setDroppedData({ roomId: '', students: [] });
            }}
            classId={classes}
          />
        </>
      )}
    </Box>
  );
};

export default SeatAllocation;
