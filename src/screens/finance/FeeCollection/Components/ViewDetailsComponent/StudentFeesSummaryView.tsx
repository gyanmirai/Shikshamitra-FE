import { motion } from 'framer-motion';
import { varAlpha } from 'src/theme/styles';
import { Tag, Class, Phone, Person } from '@mui/icons-material';
import { Box, Card, Grid, Typography, CardContent } from '@mui/material';
import { InfoItem } from 'src/screens/academic/homework-assignment-management/homeworkCreation/component/viewHomeworkDetails';

const itemVariant = (i: number) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.28, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] as const },
});

export const StudentFeesSummaryView = ({ student }: any) => (
  <Card
    variant="outlined"
    sx={{
      borderRadius: 2,
      boxShadow: (theme) =>
        `0 0 2px 0 ${varAlpha(theme.palette.grey['500Channel'], 0.2)}, 0 12px 24px -4px ${varAlpha(theme.palette.grey['500Channel'], 0.12)}`,
      overflow: 'hidden',
    }}
  >
    {/* Header */}
    <Box
      sx={{
        p: 1,
        borderBottom: '1px dashed',
        borderColor: 'divider',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        bgcolor: (theme) => varAlpha(theme.palette.primary.mainChannel, 0.02),
      }}
    >
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.3 }}>
          Student Information
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Basic details associated with this student
        </Typography>
      </Box>
    </Box>

    <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <motion.div {...itemVariant(0)}>
            <InfoItem
              icon={<Person />}
              label="Name (GR No)"
              value={`${student?.name ?? ''}${student?.grNumber ? ` (${student.grNumber})` : ''}`}
            />
          </motion.div>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <motion.div {...itemVariant(1)}>
            <InfoItem
              icon={<Class />}
              label="Class / Division"
              value={`${student?.standardName ?? ''} / ${student?.divisionName ?? ''}`}
              iconColor="warning.main"
              iconBgColor={(theme) => varAlpha(theme.palette.warning.mainChannel, 0.08)}
            />
          </motion.div>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <motion.div {...itemVariant(2)}>
            <InfoItem
              icon={<Tag />}
              label="Roll No"
              value={student?.rollNumber}
              iconColor="info.main"
              iconBgColor={(theme) => varAlpha(theme.palette.info.mainChannel, 0.08)}
            />
          </motion.div>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <motion.div {...itemVariant(3)}>
            <InfoItem
              icon={<Phone />}
              label="Contact"
              value={student?.mobileNo}
              iconColor="success.main"
              iconBgColor={(theme) => varAlpha(theme.palette.success.mainChannel, 0.08)}
            />
          </motion.div>
        </Grid>
      </Grid>
    </CardContent>
  </Card>
);
