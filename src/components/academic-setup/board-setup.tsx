'use client';

import type { Board } from 'src/types/school';

import { LoadingButton } from '@mui/lab';
import { Add } from '@mui/icons-material';
import { useTabs } from 'src/hooks/use-tabs';
import { useBoolean } from 'src/hooks/use-boolean';
import { useRef, useState, useEffect, useCallback } from 'react';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import {
  useGetBoardsQuery,
  useDeleteBoardMutation,
} from 'src/redux/board/boardApi';
import {
  Tab,
  Box,
  Tabs,
  Button,
  MenuList,
  MenuItem,
  CircularProgress,
} from '@mui/material';

import { Iconify } from '../iconify';
import MediumSetup from './medium-setup';
import { BoardForm } from './board-form';
import CustomDialog from '../customDialog';
import { ConfirmDialog } from '../confirm-dialog';
import ThreeDotsActions from '../three-dots-actions';

import type { EducationMedium } from './medium-setup';

export { BoardForm } from './board-form';

export interface EducationBoard {
  type: number;
  name: string;
  educationalMediums: EducationMedium[];
  educationBoardStages: any[];
  lastModificationTime: string | null;
  lastModifierId: string | null;
  creationTime: string;
  creatorId: string;
  id: string;
  academicYearId: string;
}

interface BoardSetupProps {
  academicYearId: string | number;
}
const BoardSetup = ({ academicYearId }: BoardSetupProps) => {
  const { data: boards, isLoading: isBoardLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetBoardsQuery,
  });

  const [deleteBoard, { isLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useDeleteBoardMutation,
    popupConfig: {
      success: true,
      successMessage: 'Board deleted Successfully',
    },
  });
  const [currentTabs, setCurrentTabs] = useState<EducationBoard[]>([]);
  const [editData, setEditData] = useState<null | EducationBoard>(null);
  const tabs = useTabs('');
  const modal = useBoolean(false);
  const confirm = useBoolean(false);

  const isInitial = useRef<null | string | number>(null);
  useEffect(() => {
    if (boards?.items) {
      const filterItems = boards?.items.filter(
        (i: EducationBoard) => i.academicYearId === academicYearId
      );
      setCurrentTabs(filterItems);
      if (isInitial.current !== academicYearId) {
        tabs.setValue(filterItems?.[0]?.id);
      }
      isInitial.current = academicYearId;
    }
  }, [academicYearId, boards?.items, tabs]);

  const handelAddBoard = async () => {
    modal.onTrue();
  };

  const handleSetTeb = (value: Record<string, any>) => {
    tabs.setValue(value?.data?.id);
  };

  const onCloseDialog = () => {
    modal.onFalse();
    setEditData(null);
  };

  const actions = useCallback(
    ({ popover: pop }: any) => (
      <>
        {' '}
        <MenuList>
          <MenuItem
            onClick={() => {
              confirm.onTrue();
              pop.onClose();
            }}
            sx={{ color: 'error.main' }}
          >
            <Iconify icon="solar:trash-bin-trash-bold" sx={{ height: '16px', width: '16px' }} />
            Delete
          </MenuItem>

          <MenuItem
            onClick={() => {
              modal.onTrue();
              pop.onClose();
            }}
          >
            <Iconify icon="solar:pen-bold" sx={{ height: '16px', width: '16px' }} />
            Edit
          </MenuItem>
        </MenuList>
      </>
    ),
    [confirm, modal]
  );

  return (
    <Box>
      <ConfirmDialog
        open={confirm.value}
        onClose={() => {
          setEditData(null);
          confirm.onFalse();
        }}
        title="Delete"
        content="Are you sure you want to delete?"
        action={
          <LoadingButton
            variant="contained"
            loading={isLoading}
            color="error"
            onClick={async () => {
              await deleteBoard(editData?.id || '');
              confirm.onFalse();
              tabs.setValue('');
              setEditData(null);
              // isInitial.current = true;
            }}
          >
            Yes
          </LoadingButton>
        }
      />
      <CustomDialog
        title={editData ? 'Update Board' : 'Create Board'}
        handleClose={onCloseDialog}
        open={modal.value}
      >
        {modal.value && <BoardForm
          handleClose={onCloseDialog}
          handleSetTeb={handleSetTeb}
          academicYearId={academicYearId}
          editData={editData}
          boards={currentTabs as unknown as Board[]}
        />}
      </CustomDialog>
      <Box
        display="flex"
        alignItems="center"
        gap={1}
        boxShadow="var(--shadows-4)"
        py={currentTabs.length ? 0 : 1}
      >
        <Box flexGrow={1} display="flex" alignItems="center" maxWidth="85%" width="100%">
          {!isBoardLoading ? (
            currentTabs.length > 0 && (
              <Tabs
                value={tabs.value}
                onChange={tabs.onChange}
                variant="scrollable"
                scrollButtons="auto"
                aria-label="scrollable auto tabs example"
                sx={{
                  mb: 2,
                  px: 2,
                  '& .MuiTabs-flexContainer': { gap: 2 },
                }}
              >
                {currentTabs.map((tab: EducationBoard) => (
                  <Tab
                    // sx={{ fontSize: '12px' }}
                    key={tab.id}
                    label={
                      <Box display="flex" justifyContent="center" gap={1} alignItems="center">
                        {tab.name}
                        <ThreeDotsActions
                          onClickThreeDots={() => setEditData(tab)}
                          actions={actions}
                        />
                      </Box>
                    }
                    // icon={tab.icon}
                    value={tab.id}
                  />
                ))}
              </Tabs>
            )
          ) : (
            <CircularProgress size={20} />
          )}
        </Box>
        <Button
          variant="outlined"
          startIcon={<Add />}
          sx={{ maxWidth: '15%', width: '100%' }}
          size="small"
          onClick={handelAddBoard}
        >
          Board
        </Button>
      </Box>
      {tabs.value && <MediumSetup boardId={tabs.value} />}
    </Box>
  );
};

export default BoardSetup;
