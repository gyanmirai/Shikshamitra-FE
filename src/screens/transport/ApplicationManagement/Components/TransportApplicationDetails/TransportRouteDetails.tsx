import React, { useState } from 'react';
import { useTheme } from '@mui/material/styles';
import { Scrollbar } from 'src/components/scrollbar';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { Box, Grid, Paper, TableRow, TableCell, Typography } from '@mui/material';
import { SectionCard } from 'src/screens/hr/employee/employee-form-fields/InformationFields';
import { useGetRouteStopDataQuery } from 'src/redux/transport/vehicle-management/routeStopApi';

import RouteStopDetails from './RouteStopDetails';

import type { ITransportApplicationPayload } from '../../type';

const TransportApplicationRouteDetail = ({
  onClose,
  selectedApplication,
  formik,
}: {
  onClose?: (e: any, isSubmit: boolean) => void;
  selectedApplication: ITransportApplicationPayload | null;
  formik: any;
}) => {
  const { data: routeData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetRouteStopDataQuery,
  });
  const [selectedRoute, setSelectedRoute] = useState<any>(formik.values.selectedRoute);
  console.log('routeData---', routeData);
  console.log('selectedRoute---', selectedRoute);
  console.log('formik.value---', formik.values);

  const theme = useTheme();
  return (
    <Grid container spacing={1} mt={2}>
      <>
        <Grid size={{ xs: 3 }} height="100%">
          <SectionCard title={`Suggested Routes : ${routeData?.length}`}>
            <Scrollbar>
              {routeData?.length ? (
                routeData.map((route: any, index: any) => (
                  <Box
                    mt={1}
                    p={0.5}
                    display="flex"
                    flexDirection="column"
                    gap={1}
                    key={index}
                    onClick={() => {
                      setSelectedRoute(route);
                      formik.setFieldValue('selectedRoute', route);
                    }}
                    sx={{
                      cursor: 'pointer',
                    }}
                  >
                    <Paper
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        p: 1,
                        justifyContent: 'space-between',
                        transition: 'all 0.3s ease-in-out',
                        border:
                          formik.values.selectedRoute?.routeId === route.routeId
                            ? `2px solid ${theme.palette.primary.main}`
                            : '2px solid transparent',
                      }}
                      elevation={6}
                    >
                      <Box display="flex" flexDirection="column">
                        <Typography variant="h6">{route.routeName}</Typography>
                        <Typography variant="caption">
                          Capacity : {route.students}/{route.capacity}
                        </Typography>
                      </Box>
                    </Paper>
                  </Box>
                ))
              ) : (
                <TableRow>
                  <TableCell sx={{ height: '50px' }}>
                    <Box className="loader" height={24} />
                  </TableCell>
                </TableRow>
              )}
            </Scrollbar>
          </SectionCard>
        </Grid>
        <Grid size={{ xs: 9 }} height="100%">
          <RouteStopDetails formik={formik} />
        </Grid>
      </>
      {isLoading && <>Loading</>}
    </Grid>
  );
};
export default TransportApplicationRouteDetail;
