import React from 'react';
import { Grid } from '@mui/system';
import { Card, Avatar, Typography, CardContent } from '@mui/material';

import type { ITransportApplicationPayload } from '../type';

const TransportMemberProfile = ({
  selectedMember,
  fromViewScreen = false,
}: {
  selectedMember: ITransportApplicationPayload | null;
  fromViewScreen: boolean;
}) => (
  <Card variant="outlined" sx={{ boxShadow: 'var(--shadows-8)', p: 2 }}>
    <CardContent sx={{ padding: '0 !important' }}>
      <Grid container spacing={2}>
        {/* Avatar */}
        <Grid
          size={{ xs: 12, md: 2 }}
          sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <Avatar src={selectedMember?.avatarUrl} sx={{ width: 80, height: 80 }} />
        </Grid>

        {/* Details */}
        <Grid size={{ xs: 12, md: 10 }}>
          <Grid container spacing={1}>
            <Grid size={{ xs: 12, md: 3 }}>
              <Typography fontWeight={600}>Member Name</Typography>
              <Typography>{selectedMember?.name}</Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <Typography fontWeight={600}>Member ID</Typography>
              <Typography>{selectedMember?.studentId}</Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <Typography fontWeight={600}>Email</Typography>
              <Typography>{selectedMember?.contactNo || 'N/A'}</Typography>
            </Grid>
            {fromViewScreen && (
              <>
                <Grid size={{ xs: 12, md: 3 }}>
                  <Typography fontWeight={600}>Stop</Typography>
                  <Typography>{selectedMember?.searchStop || 'N/A'}</Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <Typography fontWeight={600}>Is Exit</Typography>
                  <Typography>
                    {fromViewScreen ? (selectedMember?.isStopExist ? 'Yes' : 'No') : 'N/A'}
                  </Typography>
                </Grid>
              </>
            )}

            {selectedMember?.role === 'Student' && (
              <>
                <Grid size={{ xs: 12, md: 3 }}>
                  <Typography fontWeight={600}>Class/Division</Typography>
                  <Typography>
                    {selectedMember?.class || 'N/A'} - {selectedMember?.division || 'N/A'}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <Typography fontWeight={600}>Roll No.</Typography>
                  <Typography>{selectedMember?.rollNo || 'N/A'}</Typography>
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <Typography fontWeight={600}>GR No.</Typography>
                  <Typography>{selectedMember?.grNo || 'N/A'}</Typography>
                </Grid>
              </>
            )}

            <Grid size={{ xs: 12, md: 3 }}>
              <Typography fontWeight={600}>Phone</Typography>
              <Typography>{selectedMember?.contactNo || 'N/A'}</Typography>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <Typography fontWeight={600}>Role</Typography>
              <Typography>{selectedMember?.role}</Typography>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </CardContent>
  </Card>
);

export default TransportMemberProfile;
