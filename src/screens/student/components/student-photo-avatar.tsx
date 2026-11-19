'use client';

import type { AvatarProps } from '@mui/material';
import type { RootState } from 'src/redux/store';

import { Avatar } from '@mui/material';
import { useSelector } from 'react-redux';
import { createSelector } from '@reduxjs/toolkit';
import { useRef, useState, useEffect } from 'react';
import { studentPermissions } from 'src/constants/student-menu';
import { hasGrantedPermission } from 'src/utils/permissions';
import { useGetStudentRecordPhotoQuery } from 'src/redux/student/records/student-record-photo-api';

type Props = Pick<AvatarProps, 'alt' | 'children' | 'sx' | 'variant'> & {
  studentId?: string | null;
  hasPhoto?: boolean;
  lazy?: boolean;
};

const selectCanReadPhoto = createSelector(
  [(state: RootState) => state.auth?.permissions],
  (permissions) => hasGrantedPermission(permissions, studentPermissions.records.studentList)
);

export default function StudentPhotoAvatar({
  studentId,
  hasPhoto,
  lazy = false,
  ...avatarProps
}: Props) {
  const canReadPhoto = useSelector(selectCanReadPhoto);
  const avatarRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [preview, setPreview] = useState<{ blob: Blob; url: string }>();
  const eligible = Boolean(studentId) && hasPhoto !== false && canReadPhoto;
  const shouldObserve = eligible && lazy && !visible;

  useEffect(() => {
    const element = avatarRef.current;
    if (!shouldObserve || !element) return undefined;
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return undefined;
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true);
        observer.disconnect();
      }
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [shouldObserve]);

  const canLoad = eligible && (!lazy || visible);
  const { currentData, isError } = useGetStudentRecordPhotoQuery(studentId ?? '', {
    skip: !canLoad,
  });
  const blob =
    canLoad && !isError && currentData?.size && currentData.type.startsWith('image/')
      ? currentData
      : undefined;

  useEffect(() => {
    if (!blob) {
      setPreview(undefined);
      return undefined;
    }

    const url = URL.createObjectURL(blob);
    setPreview({ blob, url });
    return () => URL.revokeObjectURL(url);
  }, [blob]);

  return (
    <Avatar
      {...avatarProps}
      ref={avatarRef}
      src={preview?.blob === blob ? preview?.url : undefined}
    />
  );
}
