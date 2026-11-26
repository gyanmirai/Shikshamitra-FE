import { useRef } from 'react';
import { Avatar } from '@mui/material';
import { useInView } from 'framer-motion';
import { useGetRecordIdPhotoQuery } from 'src/redux/student/records/student-record-documents-api';

export function StudentICardRosterAvatar({
  studentId,
  studentName,
  hasPhoto,
}: {
  studentId: string;
  studentName: string;
  hasPhoto?: boolean;
}) {
  const avatar = useRef<HTMLDivElement>(null);
  const canObserve = Boolean(hasPhoto) && typeof IntersectionObserver !== 'undefined';
  const visible = useInView(avatar, { once: true });
  const photo = useGetRecordIdPhotoQuery(studentId, {
    skip: !hasPhoto || (canObserve && !visible),
  });
  const names = studentName.trim().split(/\s+/);
  const initials = names[0].charAt(0) + (names.length > 1 ? names.at(-1)!.charAt(0) : '');

  return (
    <Avatar
      ref={canObserve ? avatar : undefined}
      aria-hidden
      alt=""
      src={hasPhoto && !photo.isError ? photo.currentData?.imageData : undefined}
      sx={{
        width: 32,
        height: 32,
        flexShrink: 0,
        bgcolor: 'background.neutral',
        color: 'text.secondary',
        fontSize: 12,
      }}
    >
      {initials || '—'}
    </Avatar>
  );
}
