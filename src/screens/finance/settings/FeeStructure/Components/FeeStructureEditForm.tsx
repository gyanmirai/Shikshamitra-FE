import type { RootState } from 'src/redux/store';

import { Iconify } from 'src/components/iconify';
import { useDispatch, useSelector } from 'react-redux';
import { CustomTabs } from 'src/components/custom-tabs';
import { hasGrantedPermission } from 'src/utils/permissions';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { financePermissions } from 'src/constants/finance-menu';
import { Box, Tab, Alert, Button, Typography } from '@mui/material';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import { useRef, useMemo, useState, useEffect, useCallback } from 'react';

import ClassAccordionPanel from './ClassAccordionPanel';

import type { IFeeStructureEditFormProps } from '../type';

export default function FeeStructureEditForm({
  editData,
  viewOnly = false,
  onBusyChange,
}: IFeeStructureEditFormProps) {
  const dispatch = useDispatch();
  const { permissions } = useSelector((state: RootState) => state.auth);
  const canAdd =
    !viewOnly &&
    hasGrantedPermission(permissions, financePermissions.fees.settings.feeStructureActions.create);
  const classes = useMemo(
    () => (Array.isArray(editData.classes) ? editData.classes : []),
    [editData.classes]
  );
  const [selectedClassId, setSelectedClassId] = useState(classes[0]?.id ?? '');
  const [busy, setBusy] = useState(false);
  const [pendingClassId, setPendingClassId] = useState<string | null>(null);
  const isDirtyRef = useRef(false);
  const handleBusyChange = useCallback(
    (value: boolean) => {
      setBusy(value);
      onBusyChange?.(value);
    },
    [onBusyChange]
  );
  useEffect(
    () => () => {
      dispatch(setIsChanges(false));
    },
    [dispatch]
  );
  useEffect(() => {
    setSelectedClassId((previous) =>
      classes.some((item) => item.id === previous) ? previous : (classes[0]?.id ?? '')
    );
  }, [classes]);
  const handleClassClick = (classId: string) => {
    if (busy || classId === selectedClassId) return;
    if (isDirtyRef.current) setPendingClassId(classId);
    else setSelectedClassId(classId);
  };
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        minHeight: 0,
        minWidth: 0,
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          px: { xs: 1, sm: 2 },
          borderBottom: 1,
          borderColor: 'divider',
          flexShrink: 0,
        }}
      >
        <CustomTabs
          value={selectedClassId || false}
          onChange={(_, value) => handleClassClick(String(value))}
          guardUnsavedChanges={false}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          aria-label="Classes"
          sx={{ flex: 1, minWidth: 0 }}
          slotProps={{ tab: { px: 1.25, minWidth: 56 }, scroller: { p: 0.5 } }}
        >
          {classes.map((item) => (
            <Tab
              key={item.id}
              value={item.id}
              label={item.name}
              disabled={busy}
              id={`fee-structure-class-${item.id}`}
              aria-controls="fee-structure-class-panel"
            />
          ))}
        </CustomTabs>
      </Box>
      <Box
        id="fee-structure-class-panel"
        role="tabpanel"
        aria-labelledby={selectedClassId ? `fee-structure-class-${selectedClassId}` : undefined}
        sx={{
          flex: 1,
          minHeight: 0,
          minWidth: 0,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {!Array.isArray(editData.classes) ? (
          <Alert severity="error">
            The workspace has no scoped class data. Return to Fee Structure and refresh the list.
          </Alert>
        ) : !classes.length ? (
          <Typography variant="body2" color="text.secondary" sx={{ p: 3 }}>
            No classes available.
          </Typography>
        ) : (
          selectedClassId && (
            <ClassAccordionPanel
              key={selectedClassId}
              classId={selectedClassId}
              feeStructureMetaDataId={editData.id}
              viewOnly={viewOnly}
              canAdd={canAdd}
              onDirtyChange={(dirty) => {
                isDirtyRef.current = dirty;
                dispatch(setIsChanges(dirty));
              }}
              onBusyChange={handleBusyChange}
            />
          )
        )}
      </Box>
      <ConfirmDialog
        open={pendingClassId !== null}
        icon="warning"
        onClose={() => setPendingClassId(null)}
        title="Unsaved Changes"
        content="You have unsaved changes in this class. Switching to another class will discard them. Do you want to continue?"
        action={
          <Button
            startIcon={<Iconify icon="mdi:exit-to-app" />}
            variant="contained"
            color="error"
            size="small"
            onClick={() => {
              if (pendingClassId) {
                isDirtyRef.current = false;
                dispatch(setIsChanges(false));
                setSelectedClassId(pendingClassId);
              }
              setPendingClassId(null);
            }}
          >
            Discard & Switch
          </Button>
        }
      />
    </Box>
  );
}
