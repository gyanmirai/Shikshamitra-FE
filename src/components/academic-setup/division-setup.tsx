'use client';

import { LoadingButton } from '@mui/lab';
import { useDispatch } from 'react-redux';
import { Add } from '@mui/icons-material';
import { useTabs } from 'src/hooks/use-tabs';
import { useBoolean } from 'src/hooks/use-boolean';
import { boardApi } from 'src/redux/board/boardApi';
import { useRef, useState, useEffect, useCallback } from 'react';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { Tab, Box, Tabs, Button, MenuList, MenuItem, CircularProgress } from '@mui/material';
import { useGetDivisionQuery, useDeleteDivisionMutation } from 'src/redux/division/divisionApi';

import { Iconify } from '../iconify';
import CustomDialog from '../customDialog';
import { ConfirmDialog } from '../confirm-dialog';
import ThreeDotsActions from '../three-dots-actions';
import { useAcademicSetupContext } from './academic-setup-context';
import { OnboardingDivisionForm } from './onboarding-division-form';
import { DivisionManagementForm } from './division-management-form';

import type { DivisionFormProps } from './division-management-form';

interface IDivision {
  id: string;
  creationTime: string;
  creatorId: string;
  lastModificationTime: string;
  lastModifierId: string;
  name: string;
  strength: number;
  roomNo?: string;
  standardId: string;
}
interface DivisionSetupProps {
  classId: string | number;
}

const DivisionSetup = ({ classId }: DivisionSetupProps) => {
  const dispatch = useDispatch();
  const { data: divisions, isLoading: isGetLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetDivisionQuery,
  });
  const [deleteDivision, { isLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useDeleteDivisionMutation,
    popupConfig: {
      success: true,
      successMessage: 'Division deleted Successfully',
    },
  });

  const [currentTabs, setCurrentTabs] = useState<IDivision[]>([]);
  const [editData, setEditData] = useState<null | IDivision>(null);
  const tabs = useTabs('');
  const modal = useBoolean(false);
  const confirm = useBoolean(false);

  const isInitial = useRef(classId);
  useEffect(() => {
    if (divisions?.items) {
      const medium = divisions?.items?.filter((i: IDivision) => i.standardId === classId);
      setCurrentTabs(medium || []);
      if (isInitial.current !== classId) {
        tabs.setValue(medium?.[0]?.id);
      }
      isInitial.current = classId;
    }
  }, [classId, divisions?.items, tabs]);

  const handelAdd = async () => {
    modal.onTrue();
  };

  // const handleSetTeb = (value: Record<string, any>) => {
  //   tabs.setValue(value?.data?.id);
  // };

  const onCloseDialog = () => {
    modal.onFalse();
    setEditData(null);
  };

  const actions = useCallback(
    ({ popover }: any) => (
      <MenuList>
        <MenuItem
          onClick={() => {
            confirm.onTrue();
            popover.onClose();
          }}
          sx={{ color: 'error.main' }}
        >
          <Iconify icon="solar:trash-bin-trash-bold" sx={{ height: '16px', width: '16px' }} />
          Delete
        </MenuItem>

        <MenuItem
          onClick={() => {
            modal.onTrue();
            popover.onClose();
          }}
        >
          <Iconify icon="solar:pen-bold" sx={{ height: '16px', width: '16px' }} />
          Edit
        </MenuItem>
      </MenuList>
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
              await deleteDivision(editData?.id || '');
              dispatch(boardApi.util.invalidateTags([{ type: 'Board' }]));
              confirm.onFalse();
              setEditData(null);
              // isInitial.current = true;
            }}
          >
            Yes
          </LoadingButton>
        }
      />
      <CustomDialog
        title={editData ? 'Update Division' : 'Create Division'}
        handleClose={onCloseDialog}
        open={modal.value}
      >
        <DivisionForm
          classId={classId}
          handleClose={onCloseDialog}
          editData={editData}
          existingDivisions={currentTabs}
        />
      </CustomDialog>
      <Box
        display="flex"
        alignItems="center"
        gap={1}
        boxShadow="var(--shadows-4)"
        py={currentTabs.length ? 0 : 1}
      >
        <Box flexGrow={1} display="flex" alignItems="center">
          {!isGetLoading ? (
            currentTabs.length > 0 && (
              <Tabs
                value={tabs.value}
                onChange={tabs.onChange}
                sx={{
                  mb: 2,
                  '& .MuiTabs-flexContainer': { gap: 2 },
                  flexGrow: 1,
                }}
              >
                {currentTabs.map((tab: IDivision) => (
                  <Tab
                    // sx={{ fontSize: '12px' }}
                    key={tab.id}
                    label={
                      <Box display="flex" justifyContent="center" gap={1} alignItems="center">
                        {tab.name} - {tab.strength}
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

        <Button variant="outlined" startIcon={<Add />} size="small" onClick={handelAdd}>
          Add Division
        </Button>
      </Box>
    </Box>
  );
};

export default DivisionSetup;

export const DivisionForm = (props: DivisionFormProps) => {
  const { editData } = props;
  const { isOnboarding } = useAcademicSetupContext();
  return isOnboarding && !editData ? (
    <OnboardingDivisionForm {...props} />
  ) : (
    <DivisionManagementForm {...props} showRoomSelection={!isOnboarding} />
  );
};
