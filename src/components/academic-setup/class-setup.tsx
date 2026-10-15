'use client';

import { LoadingButton } from '@mui/lab';
import { useDispatch } from 'react-redux';
import { Add } from '@mui/icons-material';
import { useTabs } from 'src/hooks/use-tabs';
import { useBoolean } from 'src/hooks/use-boolean';
import { boardApi } from 'src/redux/board/boardApi';
import { useRef, useState, useEffect, useCallback } from 'react';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetClassQuery, useDeleteClassMutation } from 'src/redux/class/classApi';
import { Tab, Box, Tabs, Button, MenuList, MenuItem, CircularProgress } from '@mui/material';

import { Iconify } from '../iconify';
import CustomDialog from '../customDialog';
import DivisionSetup from './division-setup';
import { ConfirmDialog } from '../confirm-dialog';
import ThreeDotsActions from '../three-dots-actions';
import { useAcademicSetupContext } from './academic-setup-context';
import { OnboardingStandardForm } from './onboarding-standard-form';
import { StandardManagementForm } from './standard-management-form';

import type { StandardFormProps } from './standard-form-model';

interface IClassSetup {
  id: string;
  creationTime: string;
  creatorId: string;
  lastModificationTime: string;
  lastModifierId: string;
  name: string;
  academicYearId: string;
  educationBoardId: string;
  educationMediumId: string;
  educationMediumStageId: string;
}
interface ClassSetupProps {
  organizationId: string | number;
}

const ClassSetup = ({ organizationId }: ClassSetupProps) => {
  const dispatch = useDispatch();
  const { data: classes, isLoading: isGetLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassQuery,
  });
  const [deleteClass, { isLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useDeleteClassMutation,
    popupConfig: {
      success: true,
      successMessage: 'Class deleted Successfully',
    },
  });

  const [currentTabs, setCurrentTabs] = useState<IClassSetup[]>([]);
  const [editData, setEditData] = useState<null | IClassSetup>(null);
  const tabs = useTabs('');
  const modal = useBoolean(false);
  const confirm = useBoolean(false);

  const isInitial = useRef(organizationId);
  useEffect(() => {
    if (classes?.items) {
      const medium = classes?.items?.filter(
        (i: IClassSetup) => i.educationMediumStageId === organizationId
      );
      setCurrentTabs(medium || []);
      if (isInitial.current !== organizationId) {
        tabs.setValue(medium?.[0]?.id);
      }
      isInitial.current = organizationId;
    }
  }, [organizationId, classes?.items, tabs]);

  const handelAdd = () => {
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
              await deleteClass(editData?.id || '');
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
        title={editData ? 'Update Class' : 'Create Class'}
        handleClose={onCloseDialog}
        open={modal.value}
      >
        <ClassForm
          existingStandards={currentTabs}
          handleClose={onCloseDialog}
          editData={editData}
          organizationId={organizationId}
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
                {currentTabs.map((tab: IClassSetup) => (
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

        <Button variant="outlined" startIcon={<Add />} size="small" onClick={handelAdd}>
          Add Class
        </Button>
      </Box>
      {tabs.value && <DivisionSetup classId={tabs.value} />}
    </Box>
  );
};

export default ClassSetup;

export const ClassForm = (props: StandardFormProps) => {
  const { editData } = props;
  const { isOnboarding } = useAcademicSetupContext();
  return isOnboarding && !editData ? (
    <OnboardingStandardForm {...props} />
  ) : (
    <StandardManagementForm {...props} />
  );
};
