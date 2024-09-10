'use client';

import type { Medium } from 'src/types/school';
import type { RootState } from 'src/redux/store';

import { useSelector } from 'react-redux';
import React, { useState, useEffect } from 'react';

import Grid from '@mui/material/Unstable_Grid2/Grid2';
import { Box, Divider, Typography, CardHeader, ListItemText } from '@mui/material';

import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useLazyGetBoardByIdQuery } from 'src/redux/board/boardApi';

import CustomSelect from 'src/components/custom-select';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Carousel, useCarousel, CarouselArrowBasicButtons } from 'src/components/carousel';

const StudentAttendanceDashboardScreen = () => {
  const [allMediums, setAllMediums] = useState<Medium[]>([]);
  const [medium, setMedium] = useState<string>('');
  const carousel = useCarousel({
    align: 'start',
    slideSpacing: '16px',
    slidesToShow: { xs: 2, sm: 3, md: 4, lg: 4 },
  });
  const { currentBoard } = useSelector((state: RootState) => state.globalState);
  const [getBoard, { data: boardData }] = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useLazyGetBoardByIdQuery,
  });
  useEffect(() => {
    if (currentBoard?.id) {
      if (boardData) {
        setAllMediums(boardData?.educationMediums || []);
        setMedium(boardData?.educationMediums?.[0]?.id || '');
      } else {
        getBoard(currentBoard.id);
      }
    } else {
      setAllMediums([]);
      setMedium('');
    }
  }, [boardData, currentBoard?.id, getBoard]);
  return (
    <Box>
      <CustomBreadcrumbs
        heading="Dashboard"
        links={[{ name: 'Student' }, { name: 'Attendance' }, { name: 'Dashboard' }]}
        sx={{ px: 1, mb: 2 }}
      />

      <CustomSelect
        options={allMediums}
        label="Medium"
        value={medium}
        onChange={(val: string | string[]) => {
          setMedium(val as string);
        }}
        labelKey="name"
        valueKey="id"
        formControlProps={{ sx: { maxWidth: '250px', width: '100%' } }}
      />
      <Divider sx={{ my: 2 }} />
      <Grid container spacing={3}>
        <Grid xs={12}>
          <CardHeader
            title="Daily Tracking"
            //   subheader={subheader}
            action={<CarouselArrowBasicButtons {...carousel.arrows} />}
            sx={{ p: 0, mb: 3 }}
          />

          <Carousel carousel={carousel}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((item) => (
              <Box
                sx={{
                  bgcolor: 'background.neutral',
                  height: '200px',
                  width: '200px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRadius: 2,
                }}
              >
                <Box>
                  <Typography textAlign="center" fontWeight={500}>
                    Class {item}
                  </Typography>

                  <Box
                    display="flex"
                    gap="12px"
                    flexWrap="wrap"
                    mt={1}
                    bgcolor="white"
                    p={1}
                    borderRadius={2}
                  >
                    {['A', 'B', 'C', 'D'].map((div) => (
                      <ListItemText
                        primary={div}
                        secondary="95%"
                        sx={{ textAlign: 'center' }}
                        secondaryTypographyProps={{
                          sx: { fontSize: '14px', color: 'primary.main' },
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              </Box>
            ))}
          </Carousel>
        </Grid>
      </Grid>
    </Box>
  );
};

export default StudentAttendanceDashboardScreen;
