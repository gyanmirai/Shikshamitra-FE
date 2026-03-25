import { varAlpha } from 'src/theme/styles';
import { Tag, Class, Phone, Person } from '@mui/icons-material';
import { Box, Card, Grid, Typography, CardContent } from '@mui/material';
import { InfoItem } from 'src/screens/academic/homework-assignment-management/homeworkCreation/component/viewHomeworkDetails';

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

    <CardContent sx={{ p: 1 }}>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <InfoItem
            icon={<Person />}
            label="Name (GR No)"
            value={`${student?.name ?? ''}${student?.grNumber ? ` (${student.grNumber})` : ''}`}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <InfoItem
            icon={<Class />}
            label="Class / Division"
            value={`${student?.className ?? ''}-${student?.division ?? ''}`}
            iconColor="warning.main"
            iconBgColor={(theme) => varAlpha(theme.palette.warning.mainChannel, 0.08)}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <InfoItem
            icon={<Tag />}
            label="Roll No"
            value={student?.rollNumber}
            iconColor="info.main"
            iconBgColor={(theme) => varAlpha(theme.palette.info.mainChannel, 0.08)}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <InfoItem
            icon={<Phone />}
            label="Contact"
            value={student?.contactNumber}
            iconColor="success.main"
            iconBgColor={(theme) => varAlpha(theme.palette.success.mainChannel, 0.08)}
          />
        </Grid>
      </Grid>
    </CardContent>
  </Card>
);
