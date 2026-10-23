import type { LabelColor } from 'src/components/label/types';

import React from 'react';
import { Label } from 'src/components/label';
import CustomizableTable from 'src/components/customizabaleTable';
import { Box, Card, Typography, LinearProgress } from '@mui/material';
import facilityAllocation from 'src/json/ResourceManagement/facility/facilityAllocationData.json';
import {
  FacilityStatusType,
  FacilityStatusTypeColor,
  FacilityStatusTypeOptions,
} from 'src/enums/facility-statusType';

const FacilitiesAllocationOverview = () => (
  <Card sx={{ p: 2 }}>
    <Typography variant="h6">Facilities Allocation Overview</Typography>
    <CustomizableTable
      noDataText="No Facility Found. Add Facility"
      isFilter={false}
      isShowedDense={false}
      isSearch={false}
      tableId="facilities-allocation-overview"
      columns={[
        {
          id: 'facility',
          label: 'Facility',
          filterType: 'string' as const,
          isFilter: true,
          isSort: false,
          render(value, row) {
            return (
              <Box>
                <Typography sx={{ fontSize: '16px' }}>{row.facility}</Typography>
                <Typography sx={{ fontSize: '16px', color: 'grey.600' }}>{row.timing}</Typography>
              </Box>
            );
          },
        },
        {
          id: 'status',
          label: 'Status',
          filterType: 'enum' as const,
          enumOptions: FacilityStatusTypeOptions,

          render(value, row) {
            const color = FacilityStatusTypeColor[value as FacilityStatusType] as LabelColor;

            return <Label color={color}>{FacilityStatusType[value]}</Label>;
          },
        },
        {
          id: 'utilization',
          label: 'Utilization',
          filterType: 'number' as const,
          isFilter: true,
          isSort: false,
          render(value, row) {
            return (
              <Box display="flex" alignItems="center" gap={1}>
                <Box
                  sx={{
                    width: '200px',
                    height: '7px',
                    position: 'relative',
                    borderRadius: '12px',
                    bgcolor: '#e0e0e0',
                    overflow: 'hidden',
                  }}
                >
                  <LinearProgress
                    variant="determinate"
                    value={value}
                    color={value < 40 ? 'primary' : value < 70 ? 'warning' : 'error'}
                    sx={{
                      height: '100%',
                      '& .MuiLinearProgress-bar': {
                        transition: 'transform 0.4s linear',
                      },
                    }}
                  />
                </Box>

                <Typography variant="body2" fontWeight={500}>
                  {`${value}%`}
                </Typography>
              </Box>
            );
          },
        },
      ]}
      data={facilityAllocation}
    />
  </Card>
);

export default FacilitiesAllocationOverview;
