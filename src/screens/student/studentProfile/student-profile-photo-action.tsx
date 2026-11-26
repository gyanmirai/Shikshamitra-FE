import { useState } from 'react';
import { Button } from '@mui/material';
import { Iconify } from 'src/components/iconify';
import { useGetStudentRecordPhotoQuery } from 'src/redux/student/records/student-record-photo-api';

import { StudentRecordPhotoDialog } from '../records/student-record-photo-dialog';

export function StudentProfilePhotoAction({ studentId }: { studentId: string }) {
  const [open, setOpen] = useState(false);
  const photo = useGetStudentRecordPhotoQuery(studentId);
  const missing = photo.error && 'status' in photo.error && photo.error.status === 404;
  const hasPhoto = !photo.isError && Boolean(photo.currentData?.size);
  const label = hasPhoto ? 'Replace photo' : missing ? 'Upload photo' : 'Manage photo';
  const title = hasPhoto ? 'Replace Photo' : missing ? 'Upload Photo' : 'Manage Photo';
  return (
    <>
      <Button
        size="small"
        color="inherit"
        variant="outlined"
        startIcon={<Iconify icon="mdi:camera-outline" />}
        onClick={() => setOpen(true)}
      >
        {label}
      </Button>
      {open && (
        <StudentRecordPhotoDialog
          studentId={studentId}
          title={title}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
