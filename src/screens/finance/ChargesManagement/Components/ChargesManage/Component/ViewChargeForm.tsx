import type { LabelColor } from 'src/components/label';
import type { IColumn } from 'src/components/customizabaleTable/types';

import dayjs from 'dayjs';
import React, { useMemo } from 'react';
import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { formatNumber } from 'src/utils/formate_number';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { Box, Stack, Alert, Button, DialogActions } from '@mui/material';
import { DetailGrid, DetailField, DetailSection } from 'src/components/detail-view';
import { useGetChargeByIdQuery } from 'src/redux/finance/ChargeManagement/chargeApi';
import {
  ChargesPaymentStatus,
  ChargesPaymentStatusColors,
  ChargeWorkflowStatusOptions,
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
        id: 'collectedAmount',
        label: 'Collected',
        align: 'left',
        filterType: 'number',
        render: (value) => formatNumber(value, 'INR'),
      },
      {
        id: 'waivedAmount',
        label: 'Waived',
        align: 'left',
        filterType: 'number',
        render: (value) => formatNumber(value, 'INR'),
      },
      {
        id: 'outstandingAmount',
        label: 'Outstanding',
        align: 'left',
        filterType: 'number',
        render: (value) => formatNumber(value, 'INR'),
      },
      {
        stickyPosition: 'right',
        id: 'workflowStatus',
        label: 'Status',
        align: 'left',
        sticky: true,
        render: (value) => {
          const option = ChargeWorkflowStatusOptions.find((item) => item.value === value);
          return <Label color={option?.color ?? 'default'}>{option?.label ?? 'Unknown'}</Label>;
        },
      },
      {
        stickyPosition: 'right',
        id: 'status',
        label: 'Approval',
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

  const {
    data: selectedCharge,
    isLoading: isChargeLoading,
    isError,
    refetch,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetChargeByIdQuery,
    params: { id: charge?.chargeId ?? '' },
    options: { skip: !charge?.chargeId },
  });

  if (isChargeLoading) {
    return <ChargeViewSkeleton />;
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      <Scrollbar sx={{ flex: 1, minHeight: 0, p: 2 }}>
        {isError ? (
          <Alert
            severity="error"
            action={
              <Button size="small" onClick={refetch}>
                Retry
              </Button>
            }
          >
            Charge details could not be loaded.
          </Alert>
        ) : selectedCharge ? (
          <Stack spacing={2}>
            <ChargeViewDetailsCard charge={selectedCharge} />
            <RequestorInfoCard charge={selectedCharge} />
            <DetailSection title="Approval Details" icon="mdi:check-circle-outline">
              <DetailGrid desktopColumns={4}>
                <DetailField
                  label="Approved by"
                  value={selectedCharge.approvalDetails?.approvedByName || 'Pending'}
                />
                <DetailField
                  label="Approved on"
                  value={
                    selectedCharge.approvalDetails?.approvedOn
                      ? dayjs(selectedCharge.approvalDetails.approvedOn).format('DD-MM-YYYY')
                      : 'Pending'
                  }
                />
                <DetailField
                  label="Approval notes"
                  value={selectedCharge.approvalDetails?.approvalNotes}
                />
              </DetailGrid>
            </DetailSection>
            {selectedCharge.students?.length > 0 && (
              <DetailSection
                helpText="Students included in this charge, with collection and approval status."
                title="Student List"
                icon="mdi:account-group-outline"
              >
                <CustomizableTable
                  tableId="view-charge-student-list"
                  tableTitle="Student List"
                  columns={studentColumns}
                  data={selectedCharge.students}
                  isFilter={false}
                  isLoading={isChargeLoading}
                  noDataText="No students found"
                  wrapperProps={{ sx: { height: 'auto', flex: 'unset' } }}
                  tableContainerProps={{ sx: { height: 'auto' } }}
                />
              </DetailSection>
            )}
          </Stack>
        ) : (
          <Box>Charge details are unavailable.</Box>
        )}
      </Scrollbar>
      <DialogActions sx={{ px: 2, py: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>
        <Button
          variant="outlined"
          onClick={onCancel}
          size="small"
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
        >
          Close
        </Button>
      </DialogActions>
    </Box>
  );
};

export default ChargeDetailsCard;
