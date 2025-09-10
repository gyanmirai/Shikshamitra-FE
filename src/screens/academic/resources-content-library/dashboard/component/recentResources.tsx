'use client';

import React, { useState } from 'react';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { Box, Card, Grid, Button, Tooltip, Typography } from '@mui/material';

const resourcesData = [
  {
    title: 'cricket player list',
    uploadDate: '01-01-2024',
    fileType: 'PDF',
    size: '2.5 MB',
    downloadLink: '/path/to/student-record.pdf',
  },
  {
    title: 'chess competition winner',
    uploadDate: '15-01-2024',
    fileType: 'XLSX',
    size: '1.2 MB',
    downloadLink: '/path/to/attendance-record.xlsx',
  },
];

const RecentResources = () => {
  const [hoveredResource, setHoveredResource] = useState<string | null>(null);

  return (
    <Grid size={{ xs: 12, md: 6 }}>
      <Card
        sx={{
          display: 'flex',
          p: 1,
          width: '100%',
          height: '100%',
        }}
      >
        <Box sx={{ flexGrow: 1 }}>
          <Box sx={{ typography: 'subtitle1' }}>Recent Resources</Box>
          <Scrollbar sx={{ mt: 1.5 }}>
            <Box
              component="ul"
              sx={{
                listStyle: 'none',
                padding: 0,
                height: '150px',
                m: 0.5,
              }}
            >
              {resourcesData.map((resource, index) => (
                <Button
                  key={index}
                  variant="outlined"
                  fullWidth
                  sx={{
                    justifyContent: 'space-between',
                    position: 'relative',
                    overflow: 'hidden',
                    mb: 1,
                  }}
                  onMouseEnter={() => setHoveredResource(resource.title)}
                  onMouseLeave={() => setHoveredResource(null)}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography>{resource.title}</Typography>
                    {hoveredResource === resource.title && (
                      <Typography
                        variant="caption"
                        sx={{
                          ml: 2,
                          color: 'text.secondary',
                        }}
                      >
                        Uploaded: {resource.uploadDate}
                      </Typography>
                    )}
                  </Box>
                  {hoveredResource === resource.title && (
                    <Tooltip title="Download">
                      <Iconify
                        icon="ic:baseline-download"
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                        sx={{
                          position: 'absolute',
                          right: 10,
                          top: '50%',
                          transform: 'translateY(-50%)',
                        }}
                      />
                    </Tooltip>
                  )}
                </Button>
              ))}
            </Box>
          </Scrollbar>
        </Box>
      </Card>
    </Grid>
  );
};

export default RecentResources;
