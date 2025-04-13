'use client';

import React, { useState } from 'react';

import { Add } from '@mui/icons-material';
import { Box, Card, Button } from '@mui/material';

import examTableData from 'src/json/examination/examTableData.json';

import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import NewExamForm from './components/examFormComponent';
import ScheduledExamTable from './components/scheduleExamTable';

import type { TabComponentType } from '../../hr/leave-request';

const ScheduleExam = (props: TabComponentType) => {
  const [open, setOpen] = useState(false);
  const [examData, setExamData] = useState(examTableData);
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
  return (
    <Box>
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
                ? () => {
                    setOpen(false);
                  }
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
        <Card>
          <NewExamForm
            // onSubmit={handleSubmit}
            onClose={() => {
              setOpen(false);
            }}
          />
        </Card>
      ) : (
        <ScheduledExamTable data={examData} />
      )}
    </Box>
  );
};

export default ScheduleExam;

// Mock data for scheduled exams with subject, date and time information
const Exams = [
  { subject: 'Mathematics', date: '15-10-2024', time: '10:00' },
  { subject: 'Physics', date: '15-10-2024', time: '14:00' },
];
