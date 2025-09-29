'use client';

import type { RootState } from 'src/redux/store';
import type { Board, Medium } from 'src/types/school';

import { useSelector } from 'react-redux';
import { useState, useEffect } from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import CustomDialog from 'src/components/customDialog';
import { Box, Button, Typography } from '@mui/material';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useGetStudentChargesQuery } from 'src/redux/finance/ChargeManagement/studentChargeDataApi';

import StudentChargeListTable from './StudentChargeTable';
import ViewStudentAllCharges from './StudentChargesListTable';

import type { IChargeData, IStudentChargeData } from '../ChargesManage/Component/type';

const ChargesList = () => {
  const {
    currentYear,
    currentBoard,
    currentMedium: medium,
    setCurrentMedium: setMedium,
  } = useSelector((state: RootState) => state.globalState);

  const [boards, setBoards] = useState([]);
  const [mediums, setMediums] = useState<Medium[]>([]);
  const [selectedBoard, setSelectedBoard] = useState<string>('');
  const [selectedMedium, setSelectedMedium] = useState<string>('');

  const onViewAllCharges = useBoolean();

  const { data: chargesData, isLoading: boardLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetStudentChargesQuery,
  });
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
          { name: 'Charges', href: '/finance/charge-management/chargesRequest' },
          { name: 'Charges List' },
        ]}
        sx={{ px: 1, mb: 2 }}
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
        data={chargesData}
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
            Are you sure you want to remove charge <strong>{deleteCharge?.category}</strong> for{' '}
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
                message: `Charge : ${deleteCharge?.category} removed successfully.`,
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
