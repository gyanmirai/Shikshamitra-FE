'use client';

import type { RootState } from 'src/redux/store';

import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { Add } from '@mui/icons-material';
import { Box, Card, Button } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import examTableData from 'src/json/examination/examTableData.json';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';

import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import NewExamForm from './components/examFormComponent';
import ScheduledExamTable from './components/scheduleExamTable';

import type { IScheduledExam } from './type';
import type { TabComponentType } from '../../hr/leave-request';

const ScheduleExam = (props: TabComponentType) => {
  const [open, setOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState<IScheduledExam | null>(null);
  const [examData, setExamData] = useState(examTableData);
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  const deleteDialog = useBoolean();
  const dispatch = useDispatch();
  // Dynamic breadcrumb navigation links based on current view (form or list)
  const links = open
    ? [
        { name: 'Academic and Assignment', href: '/academic/dashboard' },
        { name: 'Examination', href: '/academic/examinationDashboard' },
        { name: 'Schedule Exam' },
        { name: 'Exam Form' },
      ]
    : [
        { name: 'Academic and Assignment', href: '/academic/dashboard' },
        { name: 'Examination', href: '/academic/examinationDashboard' },
        { name: 'Schedule Exam' },
      ];

  const handleDelete = (id: string | undefined) => {
    const updatedExamData = examData.filter((exam) => exam.id !== id);
    setExamData(updatedExamData);
    deleteDialog.onFalse();
    setSelectedExam(null);
  };

  const handleClose = (_e: any, isSubmit?: boolean) => {
    if (isSubmit || (isChanges && window.confirm('Are u sure to leave this page ?'))) {
      setOpen(false);
      dispatch(setIsChanges(false));
      setSelectedExam(null);
    } else if (!isChanges) {
      setOpen(false);
      setSelectedExam(null);
    }
  };

  return (
    <Box height="100%" display="flex" flexDirection="column">
      <CustomBreadcrumbs
        heading="Schedule Exam"
        description={
          open
            ? 'Create or update exam details, including the exam title, date, duration, and assigned subjects. Easily manage exam schedules and make adjustments as needed.'
            : 'View and manage all scheduled exams, including exam details, assigned subjects, and timings. Add new exams, update existing ones, or remove them as necessary.'
        }
        links={links}
        sx={{ px: 1, mb: 2 }}
        action={
          <Button
            size="small"
            startIcon={open ? <Iconify icon="eva:arrow-back-fill" /> : <Add />}
            variant="contained"
            onClick={
              open
                ? () => handleClose(null, false)
                : () => {
                    setOpen(true);
                  }
            }
          >
            {open ? 'Back' : 'Scheudle Exam'}
          </Button>
        }
      />
      {open ? (
        <Card sx={{ height: '100%', boxShadow: 'var(--shadows-4)' }}>
          <NewExamForm
            // onSubmit={handleSubmit}
            onClose={() => {
              setOpen(false);
            }}
          />
        </Card>
      ) : (
        <ScheduledExamTable
          onDelete={(data) => {
            setSelectedExam(data);
            deleteDialog.onTrue();
          }}
          openDialog={open}
          setOpenDialog={setOpen}
          editData={selectedExam}
          setEditData={setSelectedExam}
          data={examData}
        />
      )}
      <ConfirmDialog
        open={deleteDialog.value}
        onClose={() => {
          deleteDialog.onFalse();
          setSelectedExam(null);
        }}
        title="Delete"
        content="Are you sure want to delete?"
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              handleDelete(selectedExam?.id);
            }}
          >
            Delete
          </Button>
        }
      />
    </Box>
  );
};

export default ScheduleExam;
