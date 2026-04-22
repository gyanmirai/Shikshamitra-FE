'use client';

import type { RootState } from 'src/redux/store';
import type { Board, Medium } from 'src/types/school';

import { useSelector } from 'react-redux';
import { useState, useEffect } from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Box, Card, Button } from '@mui/material';
import { useBoolean } from 'src/hooks/use-boolean';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useGetConcessionsQuery } from 'src/redux/finance/ConcessionManagement/concessionApi';

import StudentConcessionListTable from './ConcessionListTable';

import type { IConcession, IStudentInfo } from '../type';

const ConcessionList = () => {
  //   const { currentYear } = useSelector((state: RootState) => state.globalState);
  const {
    currentYear,
    // currentBoard,
    // currentMedium: medium,
    // setCurrentMedium: setMedium,
  } = useSelector((state: RootState) => state.globalState);

  // Local state to store filtered boards based on academic year
  const [boards, setBoards] = useState([]);
  const [mediums, setMediums] = useState<Medium[]>([]);
  const [selectedBoard, setSelectedBoard] = useState<string>('');
  const [selectedMedium, setSelectedMedium] = useState<string>('');

  const onViewAllConcession = useBoolean();

  const { data: concessionData } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetConcessionsQuery,
  });
  const publish_modal = useBoolean();

  // State to store th  e selected student concession data
  // null when no student is selected
  const [selectedConcession, setSelectedConcession] = useState<IStudentInfo | null>(null);
  const [deleteConcession, setDeleteConcession] = useState<IConcession | null>(null);

  useEffect(() => {
    // Filter boards based on academic year ID from edit data
    setBoards(currentYear?.boards);
    const board = boards?.find((item: any) => item.id === selectedBoard);
    setMediums((board as unknown as Board)?.educationMediums || []);
  }, [boards, currentYear?.boards, selectedBoard]);

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CustomBreadcrumbs
        heading="Concession List"
        description="View and manage student concession requests."
        links={[
          { name: 'Finance', href: '/finance/dashboard' },
          { name: 'Fees', href: '/finance/concession' },
          { name: 'Concessions', href: '/finance/concession/concessionRequest' },
          { name: 'Concession List' },
        ]}
      />
      <Card sx={{ p: 1.5, mb: 1 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
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
      </Card>
      <StudentConcessionListTable
        data={concessionData}
        onViewAllConcession={(data) => {
          setSelectedConcession(data);
          onViewAllConcession.onTrue();
        }}
      />

      {/* <CustomDialog
        open={onViewAllConcession.value}
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">{`${selectedConcession?.studentName}'s Concession History`}</Typography>
            <CustomTooltip
              arrow
              placement="right"
              sx={{ textAlign: 'justify' }}
              title="View complete history of concession requests and their status for this student"
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
        handleClose={() => {
          setSelectedConcession(null);
          onViewAllConcession.onFalse();
        }}
        maxWidth="md"
      >
        {selectedConcession && (
          <ViewStudentAllConcession
            data={selectedConcession}
            onDelete={(row) => {
              setDeleteConcession(row);
              publish_modal.onTrue();
            }}
          />
        )}
      </CustomDialog> */}

      <ConfirmDialog
        open={publish_modal.value}
        onClose={() => {
          publish_modal.onFalse();
          setDeleteConcession(null);
        }}
        title="Remove Concession"
        content={
          <>
            Are you sure you want to remove concession{' '}
            <strong>{deleteConcession?.concessionName}</strong> for{' '}
            <strong>{selectedConcession?.studentName}</strong>?
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            startIcon={<Iconify icon={GlobalIcons.delete} />}
            onClick={() => {
              publish_modal.onFalse();
              setDeleteConcession(null);
              shikshaMitraToast.success({
                message: `Concession : ${deleteConcession?.concessionName} removed successfully.`,
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

export default ConcessionList;
