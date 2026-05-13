import { Iconify } from 'src/components/iconify';
import { alpha, useTheme } from '@mui/material/styles';
import { Box, Grid, Card, Stack, Avatar, Typography } from '@mui/material';

import type { IStudentFee } from '../../Components/type';

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  student: IStudentFee | null;
  academicYear?: string;
  feeStructureName?: string;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface MetaItemProps {
  icon: string;
  label: string;
  value?: string | number | null;
}

const MetaItem = ({ icon, label, value }: MetaItemProps) => (
  <Box
    sx={{
      px: 1,
      py: 0.5,
      borderRadius: 1.5,
      transition: '0.2s ease',
    }}
  >
    <Typography
      variant="caption"
      sx={{
        color: 'text.secondary',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: 0.4,
        fontSize: '0.68rem',
        mb: 0.6,
        display: 'block',
      }}
    >
      {label}
    </Typography>

    <Stack direction="row" spacing={0.8} alignItems="center">
      <Iconify icon={icon} width={15} sx={{ color: 'text.secondary' }} />

      <Typography variant="body2" fontWeight={700} color="text.primary" noWrap>
        {value}
      </Typography>
    </Stack>
  </Box>
);

// ─── Component ────────────────────────────────────────────────────────────────

const StudentInfoPreviewCard = ({ student, academicYear, feeStructureName }: Props) => {
  const theme = useTheme();

  if (!student) return null;

  const initials = (student.name || 'S')
    .split(' ')
    .slice(0, 2)
    .map((w: string) => w[0]?.toUpperCase())
    .join('');

  const classLabel = [student.className || '10', student.division ? `Div ${student.division}` : '']
    .filter(Boolean)
    .join(' · ');

  return (
    <Card
      sx={{
        p: 1.5,
        borderRadius: 1.5,
        boxShadow: 'var(--shadows-4)',
      }}
    >
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={3}
        alignItems={{ xs: 'flex-start', md: 'center' }}
        justifyContent="space-between"
      >
        {/* Left Section */}
        <Stack direction="row" alignItems="center" spacing={1.8}>
          <Avatar
            sx={{
              width: 52,
              height: 52,
              fontWeight: 700,
              fontSize: '1rem',
              bgcolor: alpha(theme.palette.primary.main, 0.12),
              color: 'primary.main',
              border: `1.5px solid ${alpha(theme.palette.primary.main, 0.2)}`,
              flexShrink: 0,
            }}
          >
            {initials}
          </Avatar>

          <Box>
            <Typography variant="subtitle1" fontWeight={700} color="text.primary" lineHeight={1.2}>
              {student.name || 'Aarav Sharma'}
            </Typography>

            <Typography variant="body2" color="text.secondary" fontWeight={500} mt={0.5}>
              {student.grNumber || student.rollNumber || 'GR-001'}
            </Typography>
          </Box>
        </Stack>

        {/* Right Meta Grid */}
        <Box
          sx={{
            flex: 1,
            width: '100%',
            maxWidth: 700,
          }}
        >
          <Grid container spacing={3}>
            <Grid size={{ xs: 6, sm: 4, md: 3 }}>
              <MetaItem
                icon="solar:user-id-bold"
                label="Admission No."
                value={student.grNumber || student.rollNumber || 'GR-001'}
              />
            </Grid>

            <Grid size={{ xs: 6, sm: 4, md: 3 }}>
              <MetaItem icon="solar:book-bold" label="Class & Division" value={classLabel} />
            </Grid>

            <Grid size={{ xs: 6, sm: 4, md: 3 }}>
              <MetaItem
                icon="solar:calendar-bold"
                label="Academic Year"
                value={academicYear || '2025–26'}
              />
            </Grid>

            {feeStructureName && (
              <Grid size={{ xs: 6, sm: 4, md: 3 }}>
                <MetaItem
                  icon="solar:document-text-bold"
                  label="Fee Structure"
                  value={feeStructureName}
                />
              </Grid>
            )}
          </Grid>
        </Box>
      </Stack>
    </Card>
  );
};

export default StudentInfoPreviewCard;
