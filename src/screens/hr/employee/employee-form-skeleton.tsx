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
      p: { xs: 1, md: 2 },
      mb: 1,
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
    <Grid container spacing={3}>
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
// Step 0 – Personal Information
// ---------------------------------------------------------------------------
export const PersonalInformationSkeleton = () => (
  <Box sx={{ p: 2, width: '100%' }}>
    {/* Basic Details */}
    <SectionSkeleton title fields={0}>
      {/* Avatar */}
      <Grid size={{ xs: 12, md: 3, lg: 2.3 }} sx={{ display: 'flex', justifyContent: 'center' }}>
        <Skeleton variant="circular" width={120} height={120} />
      </Grid>
      {/* First row of text fields */}
      <Grid size={{ xs: 12, md: 9, lg: 9.5 }}>
        <Grid container spacing={3}>
          {/* firstName, middleName, lastName, shortName */}
          {[...Array(4)].map((_, i) => (
            <Grid key={i} size={{ xs: 12, sm: 6, lg: 4 }}>
              <FieldSkeleton />
            </Grid>
          ))}
          {/* dob, religion, castType, familyCast, maritalStatus, bloodGroup */}
          {[...Array(6)].map((_, i) => (
            <Grid key={i + 4} size={{ xs: 12, sm: 6, lg: 4 }}>
              <FieldSkeleton />
            </Grid>
          ))}
          {/* gender radio row */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <Skeleton variant="rounded" height={32} width="60%" />
          </Grid>
        </Grid>
      </Grid>
    </SectionSkeleton>

    {/* Contact Information */}
    <SectionSkeleton fields={3} />

    {/* Professional Details */}
    <SectionSkeleton fields={4} />

    {/* Address Details */}
    <SectionSkeleton fields={7} />
  </Box>
);

// ---------------------------------------------------------------------------
// Step 1 – Family Information
// Repeat a 3-section (Father / Mother / Spouse) address block
// ---------------------------------------------------------------------------
const FamilySectionSkeleton = ({ label }: { label: string }) => (
  <SectionSkeleton title fields={0}>
    {/* section heading */}
    <Grid size={{ xs: 12 }}>
      <Skeleton variant="text" width={120} height={24} />
    </Grid>
    {/* name, occupation, contact */}
    {[...Array(3)].map((_, i) => (
      <Grid key={i} size={{ xs: 12, sm: 6, lg: 4 }}>
        <FieldSkeleton />
      </Grid>
    ))}
    {/* address fields */}
    {[...Array(7)].map((_, i) => (
      <Grid key={i + 3} size={{ xs: 12, sm: 6, lg: 4 }}>
        <FieldSkeleton />
      </Grid>
    ))}
  </SectionSkeleton>
);

export const FamilyInformationSkeleton = () => (
  <Box sx={{ p: 2, width: '100%' }}>
    <FamilySectionSkeleton label="Father" />
    <FamilySectionSkeleton label="Mother" />
    <FamilySectionSkeleton label="Spouse" />
  </Box>
);

// ---------------------------------------------------------------------------
// Step 2 – Additional Details
// ---------------------------------------------------------------------------
export const AdditionalDetailsSkeleton = () => (
  <Box sx={{ p: 2, width: '100%' }}>
    <SectionSkeleton fields={0}>
      {/* bplCardNo, personWithDisability, secondLanguage */}
      {[...Array(3)].map((_, i) => (
        <Grid key={i} size={{ xs: 12, sm: 6, lg: 4 }}>
          <FieldSkeleton />
        </Grid>
      ))}
      {/* library / transport switches */}
      {[...Array(2)].map((_, i) => (
        <Grid key={i + 3} size={{ xs: 12, sm: 6, lg: 4 }}>
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
// Step 3 – Documents
// ---------------------------------------------------------------------------
export const DocumentsSkeleton = () => (
  <Box sx={{ p: 2, width: '100%' }}>
    <SectionSkeleton title fields={0}>
      {/* upload area */}
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
      {/* document list placeholders */}
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
// Step 4 – Work Experience
// ---------------------------------------------------------------------------
const WorkExperienceCardSkeleton = () => (
  <Paper
    elevation={0}
    sx={{
      p: 2,
      mb: 1.5,
      borderRadius: 2,
      border: (theme) => `1px dashed ${alpha(theme.palette.grey[500], 0.2)}`,
    }}
  >
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
      <Skeleton variant="text" width={200} height={24} />
      <Skeleton variant="circular" width={28} height={28} />
    </Box>
    <Grid container spacing={2}>
      {[...Array(6)].map((_, i) => (
        <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
          <FieldSkeleton />
        </Grid>
      ))}
    </Grid>
  </Paper>
);

export const WorkExperienceSkeleton = () => (
  <Box sx={{ p: 2, width: '100%' }}>
    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
      <Skeleton variant="rounded" width={140} height={32} />
    </Box>
    <WorkExperienceCardSkeleton />
    <WorkExperienceCardSkeleton />
  </Box>
);

// ---------------------------------------------------------------------------
// Step 5 – Payroll
// ---------------------------------------------------------------------------
export const PayrollSkeleton = () => (
  <Box sx={{ p: 2, width: '100%' }}>
    {/* Bank + Salary details */}
    <SectionSkeleton fields={0}>
      {/* bankName, branchName, accountHolderName, accountNumber, ifscCode */}
      {[...Array(5)].map((_, i) => (
        <Grid key={i} size={{ xs: 12, sm: 4 }}>
          <FieldSkeleton />
        </Grid>
      ))}
      {/* pfRule, epfNumber, uanNumber, punchId, totalWorkingHourPerMonth */}
      {[...Array(5)].map((_, i) => (
        <Grid key={i + 5} size={{ xs: 12, sm: 4 }}>
          <FieldSkeleton />
        </Grid>
      ))}
    </SectionSkeleton>

    {/* Earning components */}
    <Paper
      elevation={0}
      sx={{
        p: 2,
        mb: 1,
        borderRadius: 2,
        border: (theme) => `1px solid ${alpha(theme.palette.grey[500], 0.16)}`,
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Skeleton variant="rounded" height={24} width={140} sx={{ borderRadius: 0.5 }} />
        <Skeleton variant="rounded" height={32} width={120} />
      </Box>
      {[...Array(2)].map((_, i) => (
        <Skeleton key={i} variant="rounded" height={56} sx={{ mb: 1, borderRadius: 2 }} />
      ))}
    </Paper>

    {/* Deduction components */}
    <Paper
      elevation={0}
      sx={{
        p: 2,
        mb: 1,
        borderRadius: 2,
        border: (theme) => `1px solid ${alpha(theme.palette.grey[500], 0.16)}`,
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Skeleton variant="rounded" height={24} width={160} sx={{ borderRadius: 0.5 }} />
        <Skeleton variant="rounded" height={32} width={120} />
      </Box>
      {[...Array(2)].map((_, i) => (
        <Skeleton key={i} variant="rounded" height={56} sx={{ mb: 1, borderRadius: 2 }} />
      ))}
    </Paper>
  </Box>
);

// ---------------------------------------------------------------------------
// Step 6 – Assign Reporting Manager
// ---------------------------------------------------------------------------
export const ReportingManagerSkeleton = () => (
  <Box sx={{ p: 2, width: '100%' }}>
    <Skeleton variant="rounded" height={40} sx={{ maxWidth: 300 }} />
  </Box>
);

// ---------------------------------------------------------------------------
// Step 7 – Academic Permission
// ---------------------------------------------------------------------------
const AcademicLevelSkeleton = ({ items }: { items: number }) => (
  <Box sx={{ mb: 1 }}>
    {[...Array(items)].map((_, i) => (
      <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.75 }}>
        <Skeleton variant="rounded" width={18} height={18} />
        <Skeleton variant="text" width={`${40 + (i % 3) * 20}%`} height={20} />
      </Box>
    ))}
  </Box>
);

export const AcademicPermissionSkeleton = () => (
  <Box sx={{ p: 2, width: '100%' }}>
    <Grid container spacing={2}>
      {/* Board / Medium / Stage / Standard / Division columns */}
      {['Board', 'Medium', 'Stage', 'Standard', 'Division'].map((label, colIdx) => (
        <Grid key={label} size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}>
          <Paper
            elevation={0}
            sx={{
              p: 1.5,
              borderRadius: 2,
              border: (theme) => `1px solid ${alpha(theme.palette.grey[500], 0.16)}`,
              minHeight: 200,
            }}
          >
            <Skeleton variant="text" width={80} height={22} sx={{ mb: 1.5 }} />
            <Divider sx={{ mb: 1.5, opacity: 0.3 }} />
            <AcademicLevelSkeleton items={4 + (colIdx % 3)} />
          </Paper>
        </Grid>
      ))}
    </Grid>
  </Box>
);

// ---------------------------------------------------------------------------
// Unified export – pick skeleton by step index
// ---------------------------------------------------------------------------
export const StepSkeleton = ({ step }: { step: number }) => {
  switch (step) {
    case 0:
      return <PersonalInformationSkeleton />;
    case 1:
      return <FamilyInformationSkeleton />;
    case 2:
      return <AdditionalDetailsSkeleton />;
    case 3:
      return <DocumentsSkeleton />;
    case 4:
      return <WorkExperienceSkeleton />;
    case 5:
      return <PayrollSkeleton />;
    case 6:
      return <ReportingManagerSkeleton />;
    case 7:
      return <AcademicPermissionSkeleton />;
    default:
      return null;
  }
};
