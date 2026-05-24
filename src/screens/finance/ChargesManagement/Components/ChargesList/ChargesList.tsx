'use client';

import type { RootState } from 'src/redux/store';
import type { Board, Medium } from 'src/types/school';

import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { useMemo, useState, useEffect } from 'react';
import CustomDialog from 'src/components/customDialog';
import { Box, Button, Typography } from '@mui/material';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { ChargesPaymentStatus } from 'src/enums/fee-charges-status';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useGetChargesQuery } from 'src/redux/finance/ChargeManagement/chargeApi';

import StudentChargeListTable from './StudentChargeTable';
import ViewStudentAllCharges from './StudentChargesListTable';

import type { IChargeData, IStudentChargeData } from '../ChargesManage/Component/type';

const ChargesList = () => {
  const { currentYear } = useSelector((state: RootState) => state.globalState);

  const [boards, setBoards] = useState([]);
  const [mediums, setMediums] = useState<Medium[]>([]);
  const [selectedBoard, setSelectedBoard] = useState<string>('');
  const [selectedMedium, setSelectedMedium] = useState<string>('');

  const onViewAllCharges = useBoolean();

  const skipQuery = !selectedBoard || !selectedMedium || !currentYear?.id;

  const baseParams = {
    academicYearId: currentYear?.id,
    boardId: selectedBoard,
    educationMediumId: selectedMedium,
    pageSize: 100,
  };

  // Backend status param is non-nullable int (default 0).
  // Fetch all three statuses in parallel and merge to build full charge history.
  const { data: pendingData, isLoading: pendingLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetChargesQuery,
    params: { ...baseParams, status: ChargesPaymentStatus.Pending },
    options: { skip: skipQuery },
  });

  const { data: approvedData, isLoading: approvedLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetChargesQuery,
    params: { ...baseParams, status: ChargesPaymentStatus.Approved },
    options: { skip: skipQuery },
  });

  const { data: rejectedData, isLoading: rejectedLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetChargesQuery,
    params: { ...baseParams, status: ChargesPaymentStatus.Rejected },
    options: { skip: skipQuery },
  });

  const isLoading = pendingLoading || approvedLoading || rejectedLoading;

  // Group all charges by studentId to produce per-student rows
  const studentChargesList = useMemo<IStudentChargeData[]>(() => {
    const allItems: IChargeData[] = [
      ...(pendingData?.items || []),
      ...(approvedData?.items || []),
      ...(rejectedData?.items || []),
    ];

    const map = new Map<string, IStudentChargeData>();
    allItems.forEach((charge: IChargeData) => {
      if (!map.has(charge.studentId)) {
        map.set(charge.studentId, {
          studentId: charge.studentId,
          studentName: charge.studentName || '',
          grNumber: charge.grNumber,
          rollNumber: charge.rollNumber,
          standardName: charge.standardName,
          divisionName: charge.divisionName,
          charges: [],
        });
      }
      map.get(charge.studentId)!.charges.push(charge);
    });

    return Array.from(map.values());
  }, [pendingData?.items, approvedData?.items, rejectedData?.items]);

  const publish_modal = useBoolean();
  const [selectedCharge, setSelectedCharge] = useState<IStudentChargeData | null>(null);
  const [deleteCharge, setDeleteCharge] = useState<IChargeData | null>(null);

  useEffect(() => {
    setBoards(currentYear?.boards);
    const board = boards?.find((item: any) => item.id === selectedBoard);
    setMediums((board as unknown as Board)?.educationMediums || []);
  }, [boards, currentYear?.boards, selectedBoard]);

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CustomBreadcrumbs
        heading="Charges List"
        description="View and manage student charges."
        links={[
          { name: 'Finance', href: '/finance/dashboard' },
          { name: 'Fees', href: '/finance/charge-management' },
          { name: 'Charges', href: '/finance/charge-management/chargesRequest' },
          { name: 'Charges List' },
        ]}
      />

      <Box sx={{ display: 'flex', gap: 2, mb: 1, ml: 1 }}>
        <CustomSelect
          label="Board"
          options={boards || []}
          labelKey="name"
          valueKey="id"
          value={selectedBoard}
          onChange={(value) => {
            setSelectedBoard(value as string);
            setSelectedMedium('');
          }}
          formControlProps={{ sx: { maxWidth: '248px', width: '100%' } }}
        />
        <CustomSelect
          label="Medium"
          options={mediums || []}
          labelKey="name"
          disabled={!selectedBoard}
          valueKey="id"
          value={selectedMedium}
          onChange={(value) => setSelectedMedium(value as string)}
          formControlProps={{ sx: { maxWidth: '248px', width: '100%' } }}
        />
      </Box>

      <StudentChargeListTable
        data={studentChargesList}
        isLoading={isLoading}
        onViewAllCharges={(data) => {
          setSelectedCharge(data);
          onViewAllCharges.onTrue();
        }}
      />

      <CustomDialog
        open={onViewAllCharges.value}
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">{`${selectedCharge?.studentName}'s Charges History`}</Typography>
            <CustomTooltip
              arrow
              placement="right"
              sx={{ textAlign: 'justify' }}
              title="View complete history of charges assigned to this student"
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
        handleClose={() => {
          setSelectedCharge(null);
          onViewAllCharges.onFalse();
        }}
        maxWidth="md"
      >
        {selectedCharge && (
          <ViewStudentAllCharges
            data={selectedCharge}
            onDelete={(row) => {
              setDeleteCharge(row);
              publish_modal.onTrue();
            }}
          />
        )}
      </CustomDialog>

      <ConfirmDialog
        open={publish_modal.value}
        onClose={() => {
          publish_modal.onFalse();
          setDeleteCharge(null);
        }}
        title="Remove Charge"
        content={
          <>
            Are you sure you want to remove charge <strong>{deleteCharge?.categoryName}</strong> for{' '}
            <strong>{selectedCharge?.studentName}</strong>?
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            startIcon={<Iconify icon={GlobalIcons.delete} />}
            onClick={() => {
              publish_modal.onFalse();
              setDeleteCharge(null);
              shikshaMitraToast.success({
                message: `Charge : ${deleteCharge?.categoryName} removed successfully.`,
              });
            }}
            size="small"
          >
            Remove
          </Button>
        }
      />
    </Box>
  );
};

export default ChargesList;
