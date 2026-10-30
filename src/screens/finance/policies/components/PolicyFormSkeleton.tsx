import { Box, Stack, Skeleton } from '@mui/material';

import FinanceFormSkeleton, {
  FinanceSkeletonFields,
  FinanceSkeletonSection,
} from '../../components/FinanceFormSkeleton';

export default function PolicyFormSkeleton({
  policy,
  activeEdit = false,
  rowCount = 3,
}: {
  policy: 'proration' | 'refund';
  activeEdit?: boolean;
  rowCount?: number;
}) {
  return (
    <FinanceFormSkeleton label={`Loading ${policy} policy`}>
      <FinanceSkeletonSection>
        <FinanceSkeletonFields
          fields={[
            { columns: 7 },
            { columns: 5 },
            { columns: 7, height: 60 },
            { columns: 5, height: 60, toggle: true },
            ...(activeEdit ? [{ height: 60 }] : []),
          ]}
        />
      </FinanceSkeletonSection>
      <FinanceSkeletonSection
        action={
          policy === 'proration' ? <Skeleton variant="rounded" width={76} height={24} /> : undefined
        }
      >
        {policy === 'proration' ? (
          <>
            <FinanceSkeletonFields fields={[{}]} />
            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" aria-hidden="true">
              <Skeleton width={112} height={30} />
              {[88, 104, 72].map((width) => (
                <Skeleton key={width} variant="rounded" width={width} height={30} />
              ))}
            </Stack>
            <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 1.5 }} aria-hidden="true">
              {Array.from({ length: Math.min(5, Math.max(1, rowCount)) }, (_, index) => (
                <Stack
                  key={index}
                  direction="row"
                  spacing={2}
                  alignItems="center"
                  sx={{ p: 1.5, '& + &': { borderTop: 1, borderColor: 'divider' } }}
                >
                  <Stack spacing={0.75} sx={{ flex: 1, minWidth: 0 }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Skeleton width="40%" height={20} />
                      <Skeleton variant="rounded" width={68} height={20} />
                    </Stack>
                    <Skeleton width="70%" height={16} />
                  </Stack>
                  <Skeleton variant="circular" width={24} height={24} />
                </Stack>
              ))}
            </Box>
          </>
        ) : (
          <FinanceSkeletonFields fields={[{}, { columns: 6 }, { columns: 6 }]} />
        )}
      </FinanceSkeletonSection>
      {policy === 'refund' && (
        <>
          <FinanceSkeletonSection>
            <FinanceSkeletonFields fields={[{}, {}]} />
          </FinanceSkeletonSection>
        </>
      )}
    </FinanceFormSkeleton>
  );
}
