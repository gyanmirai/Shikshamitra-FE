'use client';

import { alpha } from '@mui/material/styles';
import { Box, Grid, Paper, Divider, Skeleton } from '@mui/material';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const FieldSkeleton = () => <Skeleton variant="rounded" height={40} width="100%" />;

const SectionSkeleton = ({
  title = true,
  fields,
  colSize = 4,
  children,
}: {
  title?: boolean;
  fields?: number;
  colSize?: number;
  children?: React.ReactNode;
}) => (
  <Paper
    elevation={0}
    sx={{
      p: { xs: 2, md: 3 },
      mb: 3,
      borderRadius: 2,
      border: (theme) => `1px solid ${alpha(theme.palette.grey[500], 0.16)}`,
      boxShadow: '0px 4px 20px rgba(0,0,0,0.05)',
    }}
  >
    {title && (
      <>
        <Skeleton variant="text" width={160} height={28} sx={{ mb: 1 }} />
        <Divider sx={{ mb: 2, opacity: 0.3 }} />
      </>
    )}
    <Grid container spacing={2.5}>
      {children ||
        Array.from({ length: fields ?? 3 }).map((_, i) => (
          <Grid key={i} size={{ xs: 12, sm: 6, md: colSize as any }}>
            <FieldSkeleton />
          </Grid>
        ))}
    </Grid>
  </Paper>
);

// ---------------------------------------------------------------------------
// Step 0 – General
// ---------------------------------------------------------------------------
export const GeneralSkeleton = () => (
  <Box sx={{ width: '100%' }}>
    <SectionSkeleton title fields={5} />
    <SectionSkeleton title fields={5} />
    <SectionSkeleton title fields={5} />
    <SectionSkeleton title fields={5} />
    <SectionSkeleton title fields={5} />
    <SectionSkeleton title fields={5} />
  </Box>
);

// ---------------------------------------------------------------------------
// Step 1 – Documents
// ---------------------------------------------------------------------------
export const DocumentsSkeleton = () => (
  <Box sx={{ width: '100%' }}>
    <SectionSkeleton title fields={0}>
      <Grid size={{ xs: 12 }}>
        <Skeleton
          variant="rounded"
          height={160}
          width="100%"
          sx={{
            borderRadius: 2,
            border: (theme) => `2px dashed ${alpha(theme.palette.grey[500], 0.3)}`,
          }}
        />
      </Grid>
      {[...Array(3)].map((_, i) => (
        <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
          <Paper
            elevation={0}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              p: 1.5,
              borderRadius: 1.5,
              border: (theme) => `1px solid ${alpha(theme.palette.grey[500], 0.16)}`,
            }}
          >
            <Skeleton variant="rounded" width={40} height={40} />
            <Box flex={1}>
              <Skeleton variant="text" width="70%" height={18} />
              <Skeleton variant="text" width="40%" height={14} />
            </Box>
            <Skeleton variant="circular" width={28} height={28} />
          </Paper>
        </Grid>
      ))}
    </SectionSkeleton>
  </Box>
);

// ---------------------------------------------------------------------------
// Step 2 – Family Information
// ---------------------------------------------------------------------------
const FamilySectionSkeleton = ({ label }: { label: string }) => (
  <SectionSkeleton title fields={0}>
    <Grid size={{ xs: 12 }}>
      <Skeleton variant="text" width={120} height={24} />
    </Grid>
    {[...Array(3)].map((_, i) => (
      <Grid key={i} size={{ xs: 12, sm: 6, lg: 4 }}>
        <FieldSkeleton />
      </Grid>
    ))}
    {[...Array(7)].map((_, i) => (
      <Grid key={i + 3} size={{ xs: 12, sm: 6, lg: 4 }}>
        <FieldSkeleton />
      </Grid>
    ))}
  </SectionSkeleton>
);

export const FamilyInformationSkeleton = () => (
  <Box sx={{ width: '100%' }}>
    <FamilySectionSkeleton label="Father" />
    <FamilySectionSkeleton label="Mother" />
    <FamilySectionSkeleton label="Guardian" />
  </Box>
);

// ---------------------------------------------------------------------------
// Step 3 – Communication
// ---------------------------------------------------------------------------
export const CommunicationSkeleton = () => (
  <Box sx={{ width: '100%' }}>
    <SectionSkeleton title fields={7} />
    <SectionSkeleton title fields={7} />
    <SectionSkeleton title fields={7} />
  </Box>
);

// ---------------------------------------------------------------------------
// Step 4 – Additional Details
// ---------------------------------------------------------------------------
export const AdditionalDetailsSkeleton = () => (
  <Box sx={{ width: '100%' }}>
    <SectionSkeleton fields={0}>
      {[...Array(6)].map((_, i) => (
        <Grid key={i} size={{ xs: 12, sm: 6, lg: 4 }}>
          <FieldSkeleton />
        </Grid>
      ))}
      {[...Array(4)].map((_, i) => (
        <Grid key={i + 6} size={{ xs: 12, sm: 6, lg: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Skeleton variant="rounded" width={40} height={22} />
            <Skeleton variant="text" width={120} height={22} />
          </Box>
        </Grid>
      ))}
    </SectionSkeleton>
  </Box>
);

// ---------------------------------------------------------------------------
// Step 5 – Medical Records
// ---------------------------------------------------------------------------
export const MedicalRecordsSkeleton = () => (
  <Box sx={{ width: '100%' }}>
    <SectionSkeleton title fields={9} />
  </Box>
);

// ---------------------------------------------------------------------------
// Step 6 – Prev. School Details
// ---------------------------------------------------------------------------
export const PreviousSchoolSkeleton = () => (
  <Box sx={{ width: '100%' }}>
    <SectionSkeleton title fields={8} />
  </Box>
);

// ---------------------------------------------------------------------------
// Step 7 – Bank Details
// ---------------------------------------------------------------------------
export const BankDetailsSkeleton = () => (
  <Box sx={{ width: '100%' }}>
    <SectionSkeleton title fields={5} />
  </Box>
);

// ---------------------------------------------------------------------------
// Unified export – pick skeleton by step index
// ---------------------------------------------------------------------------
export const StepSkeleton = ({ step }: { step: number }) => {
  switch (step) {
    case 0:
      return <GeneralSkeleton />;
    case 1:
      return <DocumentsSkeleton />;
    case 2:
      return <FamilyInformationSkeleton />;
    case 3:
      return <CommunicationSkeleton />;
    case 4:
      return <AdditionalDetailsSkeleton />;
    case 5:
      return <MedicalRecordsSkeleton />;
    case 6:
      return <PreviousSchoolSkeleton />;
    case 7:
      return <BankDetailsSkeleton />;
    default:
      return null;
  }
};
