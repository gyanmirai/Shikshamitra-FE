
import { useState } from 'react';
import { Scrollbar } from 'src/components/scrollbar';
import {
  Box,
  Grid,
  Card,
  CardContent,
} from '@mui/material';

import type { IHomework } from '../../type';

const HomeworkOverview = ({ homework }: { homework: IHomework }) => {
  const [showFullDescription, setShowFullDescription] = useState(false);
  return (
    <Box sx={{ height: '100%' }}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card
            sx={{
              height: '100%',
              mx: 'auto',
              boxShadow: 'var(--shadows-10)',
              borderRadius: 2,
              overflow: 'hidden',
            }}
          >
            <CardContent sx={{ p: 2 }}>
              {/* Main Info Row */}
              ...
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card
            sx={{
              height: '100%',
              boxShadow: 'var(--shadows-10)',
              borderRadius: 2,
              overflow: 'hidden',
            }}
          >
            <Scrollbar sx={{ height: '100%' }}>
              <CardContent sx={{ p: 2 }}>
                {/* Timeline & Created By */}
                ...
              </CardContent>
            </Scrollbar>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default HomeworkOverview;
