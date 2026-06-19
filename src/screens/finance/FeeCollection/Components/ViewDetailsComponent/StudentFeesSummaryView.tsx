import { motion } from 'framer-motion';
import { varAlpha } from 'src/theme/styles';
import { Tag, Class, Phone, Person } from '@mui/icons-material';
import { Box, Card, Grid, Typography, CardContent } from '@mui/material';

const itemVariant = (i: number) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.28, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] as const },
});

// Clean local InfoItem with monochrome desaturated style
const InfoItem = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
    <Box
      sx={{
        width: 32,
        height: 32,
        borderRadius: 1,
        bgcolor: (theme) => varAlpha(theme.palette.grey['500Channel'], 0.08),
        color: 'text.secondary',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      {icon}
    </Box>
    <Box sx={{ minWidth: 0 }}>
      <Typography
        variant="caption"
        sx={{ color: 'text.secondary', display: 'block', fontWeight: 500, lineHeight: 1.2 }}
      >
        {label}
      </Typography>
      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary' }}>
        {value || 'N/A'}
      </Typography>
    </Box>
  </Box>
);

export const StudentFeesSummaryView = ({ student }: any) => (
  <Card
    variant="outlined"
    sx={{
      borderRadius: 1.5,
      border: (theme) => `1px solid ${theme.palette.divider}`,
      boxShadow: 'none',
      overflow: 'hidden',
      bgcolor: 'background.paper',
    }}
  >
    {/* Header */}
    <Box
      sx={{
        px: 2,
        py: 1.5,
        borderBottom: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        bgcolor: (theme) => varAlpha(theme.palette.grey['500Channel'], 0.02),
      }}
    >
      <Box>
        <Typography
          variant="subtitle1"
          sx={{ fontWeight: 700, lineHeight: 1.3, color: 'text.primary' }}
        >
          Student Information
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Basic details associated with this student
        </Typography>
      </Box>
    </Box>

    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <motion.div {...itemVariant(0)}>
            <InfoItem
              icon={<Person sx={{ fontSize: 18 }} />}
              label="Name (GR No)"
              value={`${student?.name ?? ''}${student?.grNumber ? ` (${student.grNumber})` : ''}`}
            />
          </motion.div>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <motion.div {...itemVariant(1)}>
            <InfoItem
              icon={<Class sx={{ fontSize: 18 }} />}
              label="Class / Division"
              value={`${student?.standardName ?? ''} / ${student?.divisionName ?? ''}`}
            />
          </motion.div>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <motion.div {...itemVariant(2)}>
            <InfoItem
              icon={<Tag sx={{ fontSize: 18 }} />}
              label="Roll No"
              value={student?.rollNumber}
            />
          </motion.div>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <motion.div {...itemVariant(3)}>
            <InfoItem
              icon={<Phone sx={{ fontSize: 18 }} />}
              label="Contact"
              value={student?.mobileNo}
            />
          </motion.div>
        </Grid>
      </Grid>
    </CardContent>
  </Card>
);
