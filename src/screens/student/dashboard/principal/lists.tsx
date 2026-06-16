import { Iconify } from 'src/components/iconify';
import { Grid, Card, Stack, Button, CardHeader, Typography } from '@mui/material';

const EmptyCard = ({
  title,
  subheader,
  actionLabel,
  emptyText,
}: {
  title: string;
  subheader?: string;
  actionLabel: string;
  emptyText: string;
}) => (
  <Card>
    <CardHeader
      title={title}
      subheader={subheader}
      action={
        <Button
          size="small"
          color="inherit"
          endIcon={<Iconify icon="eva:arrow-ios-forward-fill" width={18} sx={{ ml: -0.5 }} />}
        >
          {actionLabel}
        </Button>
      }
    />
    <Stack spacing={1} sx={{ p: 3, minHeight: 180, justifyContent: 'center' }}>
      <Typography variant="body2" color="text.secondary" textAlign="center">
        {emptyText}
      </Typography>
    </Stack>
  </Card>
);

const PrincipalLists = () => (
  <Grid container spacing={1}>
    <Grid size={{ xs: 12, md: 6 }}>
      <EmptyCard
        title="Top Performers"
        actionLabel="View all"
        emptyText="No top performer data found."
      />
    </Grid>

    <Grid size={{ xs: 12, md: 6 }}>
      <EmptyCard
        title="Approved/Rejected Leave Today"
        subheader="Student leave requests for today"
        actionLabel="View All Requests"
        emptyText="No student leave request data found."
      />
    </Grid>
  </Grid>
);

export default PrincipalLists;
