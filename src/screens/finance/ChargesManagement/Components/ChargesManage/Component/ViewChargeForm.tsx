import type { LabelColor } from 'src/components/label';
import type { IColumn } from 'src/components/customizabaleTable/types';

import dayjs from 'dayjs';
import React, { useMemo } from 'react';
import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Description } from '@mui/icons-material';
import { InfoItem } from 'src/components/info-item';
import { Scrollbar } from 'src/components/scrollbar';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetChargeByIdQuery } from 'src/redux/finance/ChargeManagement/chargeApi';
import { Box, Grid, Paper, Stack, Button, Divider, Typography, DialogActions } from '@mui/material';
import {
  ChargesPaymentStatus,
  ChargesPaymentStatusColors,
  ChargesPaymentStatusOptions,
} from 'src/enums/fee-charges-status';

import RequestorInfoCard from './ViewChargeComponent/RequestorInfoCard';
import ChargeViewSkeleton from './ViewChargeComponent/ChargeViewSkeleton';
import ChargeViewDetailsCard from './ViewChargeComponent/ChargeDetailsCard';

import type { IChargeData } from './type';

interface Props {
  charge: IChargeData | null;
  isActionShow: boolean;
  onApprove?: () => void;
  onReject?: () => void;
  onCancel?: () => void;
}

const ChargeDetailsCard: React.FC<Props> = ({
  charge,
  isActionShow = false,
  onApprove,
  onReject,
  onCancel,
}) => {
  const studentColumns: IColumn[] = useMemo(
    () => [
      { id: 'studentName', label: 'Student Name', align: 'left' },
      { id: 'grNumber', label: 'GR Number', align: 'left', filterType: 'number' },
      { id: 'rollNumber', label: 'Roll No.', align: 'left', filterType: 'number' },
      { id: 'standardName', label: 'Class', align: 'left' },
      { id: 'divisionName', label: 'Division', align: 'left' },
      {
        id: 'status',
        label: 'Status',
        align: 'left',
        isFilter: true,
        filterType: 'enum',
        enumOptions: ChargesPaymentStatusOptions,
        sticky: true,
        width: 100,
        minWidth: 84,
        maxWidth: 130,
        render(value) {
          const statusValue = value as ChargesPaymentStatus;
          const color = ChargesPaymentStatusColors[statusValue] as LabelColor;
          return <Label color={color}>{ChargesPaymentStatus[statusValue]}</Label>;
        },
      },
    ],
    []
  );

  const { data: selectedCharge, isLoading: isChargeLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetChargeByIdQuery,
    params: { id: charge?.chargeId ?? '' },
    options: { skip: !charge?.chargeId },
  });

  if (isChargeLoading) {
    return <ChargeViewSkeleton />;
  }

  return (
    <Box display="flex" flexDirection="column" height="100%">
      <Scrollbar sx={{ height: '100%', p: 2 }}>
        <Grid container spacing={2}>
          {/* Charge Details and Requestor Info */}
          <Grid size={{ xs: 12, md: 7 }}>
            <ChargeViewDetailsCard charge={selectedCharge} />
          </Grid>
          <Grid size={{ xs: 12, md: 5 }}>
            <RequestorInfoCard charge={selectedCharge} />
          </Grid>

          {/* Approval Details Section */}
          {selectedCharge && (
            <Grid size={{ xs: 12 }}>
              <Paper
                variant="outlined"
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  transition: 'box-shadow 0.2s ease',
                  '&:hover': { boxShadow: 4 },
                }}
              >
                <Stack direction="row" alignItems="center" gap={1} mb={1.5}>
                  <Iconify
                    icon="solar:check-circle-bold-duotone"
                    width={18}
                    sx={{ color: 'primary.main' }}
                  />
                  <Typography variant="subtitle2" fontWeight={700}>
                    Approval Details
                  </Typography>
                </Stack>
                <Divider sx={{ mb: 2 }} />

                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <InfoItem
                      icon={<Iconify icon="solar:user-rounded-bold-duotone" />}
                      label="Approved By"
                      value={selectedCharge?.approvalDetails?.approvedByName || 'Pending'}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <InfoItem
                      icon={<Iconify icon="solar:calendar-bold-duotone" />}
                      label="Approved On"
                      value={
                        selectedCharge?.approvalDetails?.approvedOn
                          ? dayjs(selectedCharge.approvalDetails.approvedOn).format('DD-MM-YYYY')
                          : 'Pending'
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <InfoItem
                      icon={<Description />}
                      label="Approval Notes"
                      value={selectedCharge?.approvalDetails?.approvalNotes || 'N/A'}
                    />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          )}

          {/* Students List Section */}
          {selectedCharge?.students && selectedCharge.students.length > 0 && (
            <Grid size={{ xs: 12 }}>
              <Paper
                variant="outlined"
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  transition: 'box-shadow 0.2s ease',
                  '&:hover': { boxShadow: 4 },
                }}
              >
                <Stack direction="row" alignItems="center" gap={1} mb={2}>
                  <Iconify
                    icon="solar:users-group-rounded-bold-duotone"
                    width={18}
                    sx={{ color: 'primary.main' }}
                  />
                  <Box>
                    <Typography variant="subtitle2" fontWeight={700}>
                      Student List
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Review students for this charge
                    </Typography>
                  </Box>
                </Stack>

                <CustomizableTable
                  tableId="view-charge-student-list"
                  tableTitle="Student List"
                  columns={studentColumns}
                  data={selectedCharge.students}
                  isFilter={false}
                  isLoading={isChargeLoading}
                  noDataText="No students found"
                  wrapperProps={{ minHeight: 320 }}
                />

                <Box sx={{ mt: 2, p: 1, backgroundColor: 'action.hover', borderRadius: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    Total Students: <strong>{selectedCharge.students.length}</strong>
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          )}
        </Grid>
      </Scrollbar>

      <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
        <Button
          variant="outlined"
          onClick={onCancel}
          size="small"
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
        >
          Cancel
        </Button>
      </DialogActions>
    </Box>
  );
};

export default ChargeDetailsCard;
