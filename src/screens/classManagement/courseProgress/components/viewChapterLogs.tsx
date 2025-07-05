import type { TimelineType } from 'src/components/timeline-view';

import React from 'react';

import { Scrollbar } from 'src/components/scrollbar';
import { CustomizedTimeline } from 'src/components/timeline-view';

import type { ICourseDetail } from '../type';

const CHAPTER_PROGRESS_TIMELINE: TimelineType[] = [
  {
    key: 1,
    title: 'Chapter Assigned',
    des: 'The chapter was assigned to students.',
    time: '2025-05-25 09:00 AM',
    color: 'success',
    progress: 0,
    teacher: 'Mr. Smith',
  },
  {
    key: 2,
    title: '10% Completed',
    des: 'Initial reading and introduction done.',
    time: '2025-05-26 10:30 AM',
    color: 'success',
    progress: 10,
    teacher: 'Ms. Johnson',
  },
  {
    key: 3,
    title: '50% Completed',
    des: 'Half of the chapter explained in class.',
    time: '2025-05-27 11:00 AM',
    color: 'success',
    progress: 50,
    teacher: 'Mr. Smith',
  },
  {
    key: 4,
    title: '80% Completed',
    des: 'Practice questions were solved.',
    time: '2025-05-28 12:15 PM',
    color: 'success',
    progress: 80,
    teacher: 'Ms. Lee',
  },
  {
    key: 5,
    title: '100% Completed',
    des: 'Chapter fully completed and reviewed.',
    time: '2025-05-29 02:00 PM',
    color: 'success',
    progress: 100,
    teacher: 'Mr. Smith',
  },
];

interface ViewChapterLogsProps {
  onClose: (e: any, isSubmit: false) => void;
  selectedChapter: ICourseDetail | null;
}

const ViewChapterLogs = ({ onClose, selectedChapter }: ViewChapterLogsProps) => (
  <Scrollbar sx={{ height: '550px' }}>
    <CustomizedTimeline data={selectedChapter?.logs?.slice().reverse()} />
  </Scrollbar>
);

export default ViewChapterLogs;
