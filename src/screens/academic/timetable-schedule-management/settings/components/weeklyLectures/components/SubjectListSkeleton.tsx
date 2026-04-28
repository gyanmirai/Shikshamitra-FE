import { memo } from 'react';
import { Box, Skeleton } from '@mui/material';

const SKELETON_ROW_COUNT = 5;

/**
 * Loading skeleton for the subject-lectures table rows.
 *
 * `React.memo` is justified: this component is rendered inside a Grid item
 * whose parent re-renders on every formik keystroke. Memoizing avoids
 * recreating 5 skeleton rows on each typed character.
 */
function SubjectListSkeletonImpl() {
  return (
    <Box display="flex" flexDirection="column" gap={1}>
      {Array.from({ length: SKELETON_ROW_COUNT }).map((_, i) => (
        // Static skeleton list, key by index is acceptable.
        // eslint-disable-next-line react/no-array-index-key
        <Box key={i} display="flex" alignItems="center" gap={2} px={1}>
          <Skeleton variant="rounded" width={24} height={24} />
          <Skeleton variant="text" sx={{ flex: 1 }} height={40} />
          <Skeleton variant="rounded" width={120} height={40} />
        </Box>
      ))}
    </Box>
  );
}

export const SubjectListSkeleton = memo(SubjectListSkeletonImpl);
