import type { RootState } from 'src/redux/store';

import { motion } from 'framer-motion';
import { varAlpha } from 'src/theme/styles';
import { GlobalIcons } from 'src/utils/icons';
import { useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { useDispatch, useSelector } from 'react-redux';
import { hasGrantedPermission } from 'src/utils/permissions';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { financePermissions } from 'src/constants/finance-menu';
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import {
  Box,
  Alert,
  Button,
  Skeleton,
  Typography,
  ListItemText,
  DialogActions,
  ListItemButton,
} from '@mui/material';

import ClassAccordionPanel from './ClassAccordionPanel';

import type { IFeeStructureEditFormProps } from '../type';

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
const FeeStructureEditForm: React.FC<IFeeStructureEditFormProps> = ({
  editData,
  onClose,
  viewOnly = false,
}) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const { permissions } = useSelector((state: RootState) => state.auth);
  const canAdd =
    !viewOnly &&
    hasGrantedPermission(
      permissions,
      financePermissions.fees.settings.feeStructureActions.create
    );
  useEffect(
    () => () => {
      dispatch(setIsChanges(false));
    },
    [dispatch]
  );
  const [classList, setClassList] = useState<any[]>([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [pendingClassId, setPendingClassId] = useState<string | null>(null);
  const isDirtyRef = useRef(false);

  // Ref to the panel's "add new draft" handler — registered by ClassAccordionPanel
  const addNewFnRef = useRef<(() => void) | null>(null);

  const handleRegisterAddNew = useCallback((fn: () => void) => {
    addNewFnRef.current = fn;
  }, []);

  const { classes } = editData;
  const isLoadingClasses = false;
  const isFetchingClasses = false;
  const classesError = !Array.isArray(classes);

  useEffect(() => {
    if (Array.isArray(classes)) {
      setClassList(classes);
      setSelectedClassId((prev) =>
        classes.some((item) => item.id === prev) ? prev : (classes[0]?.id ?? '')
      );
    }
  }, [classes]);

  // Helper to switch class (with dirty guard)
  const handleClassClick = (classId: string) => {
    if (classId === selectedClassId) return;
    if (isDirtyRef.current) {
      setPendingClassId(classId);
    } else {
      setSelectedClassId(classId);
    }
  };

  return (
    <motion.div
      key="edit-form"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      style={{ height: '100%' }}
    >
      {/* ── Outer flex column: fills the card height ─────────────────────── */}
      <Box display="flex" flexDirection="column" height="100%" overflow="hidden">
        {/* ── Main two-panel area (fills all remaining space) ───────────── */}
        <Box
          display="flex"
          flexDirection={{ xs: 'column', md: 'row' }}
          flex={1}
          minHeight={0}
          overflow="hidden"
        >
          {/* ══════════════════════════════════════════════════════════════
              LEFT SIDEBAR — clean class navigation (Report panel style)
          ══════════════════════════════════════════════════════════════ */}
          <Box
            sx={{
              width: { xs: '100%', md: 150 },
              maxHeight: { xs: 140, md: 'none' },
              flexShrink: 0,
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              borderRight: `1px solid ${theme.palette.divider}`,
              bgcolor: 'background.paper',
              overflow: 'hidden',
            }}
          >
            {/* Sidebar heading */}
            <Box
              sx={{
                px: 2,
                py: 1.5,
                borderBottom: `1px solid ${theme.palette.divider}`,
              }}
            >
              <Typography
                variant="caption"
                fontWeight={700}
                letterSpacing={0.6}
                textTransform="uppercase"
                color="text.secondary"
              >
                Classes
              </Typography>
            </Box>

            {/* Scrollable class list — matches Report LeftPanel pattern */}
            <Box
              sx={{
                flex: 1,
                overflowY: 'auto',
                px: 1,
                py: 0.75,
                '&::-webkit-scrollbar': { width: 4 },
                '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
                '&::-webkit-scrollbar-thumb': {
                  bgcolor: varAlpha(theme.palette.grey['500Channel'], 0.16),
                  borderRadius: 4,
                },
              }}
            >
              {isLoadingClasses || isFetchingClasses
                ? [1, 2, 3, 4, 5].map((i) => (
                  <Box key={i} sx={{ px: 1, py: 0.5 }}>
                    <Skeleton variant="text" width="75%" height={32} />
                  </Box>
                ))
                : classList.map((cls: any) => {
                  const isActive = selectedClassId === cls.id;
                  return (
                    <ListItemButton
                      key={cls.id}
                      selected={isActive}
                      onClick={() => handleClassClick(cls.id)}
                      sx={{
                        borderRadius: 1,
                        mb: 0.25,
                        py: 0.75,
                        px: 1.5,
                        borderLeft: '3px solid transparent',
                        '&.Mui-selected': {
                          bgcolor: varAlpha(theme.palette.primary.mainChannel, 0.08),
                          borderLeftColor: 'primary.main',
                          '&:hover': {
                            bgcolor: varAlpha(theme.palette.primary.mainChannel, 0.12),
                          },
                        },
                        '&:not(.Mui-selected):hover': {
                          bgcolor: varAlpha(theme.palette.grey['500Channel'], 0.05),
                          borderLeftColor: varAlpha(theme.palette.primary.mainChannel, 0.3),
                        },
                        transition: 'background-color 0.15s ease, color 0.15s ease',
                      }}
                    >
                      <ListItemText
                        primary={cls.name}
                        primaryTypographyProps={{
                          variant: 'body2',
                          fontWeight: isActive ? 700 : 500,
                          color: isActive ? 'primary.main' : 'text.secondary',
                          noWrap: true,
                        }}
                      />
                      {isActive && (
                        <Box
                          sx={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            bgcolor: 'primary.main',
                            flexShrink: 0,
                            ml: 1,
                          }}
                        />
                      )}
                    </ListItemButton>
                  );
                })}

              {/* Empty state */}
              {!isLoadingClasses && !isFetchingClasses && classList.length === 0 && (
                <Box sx={{ px: 2, py: 3, textAlign: 'center' }}>
                  <Typography variant="caption" color="text.disabled">
                    No classes found
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>

          {/* ══════════════════════════════════════════════════════════════
              RIGHT CONTENT AREA
          ══════════════════════════════════════════════════════════════ */}
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              minWidth: 0,
              height: '100%',
              overflow: 'hidden',
            }}
          >
            {/* ── Sticky right-panel header ─────────────────────────────── */}
            <Box
              sx={{
                flexShrink: 0,
                px: 2.5,
                py: 1.25,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: `1px solid ${theme.palette.divider}`,
                bgcolor: 'background.paper',
                zIndex: 2,
              }}
            >
              {/* Left: fee structure name */}
              <Box>
                <Typography variant="subtitle1" fontWeight={700} lineHeight={1.3}>
                  {editData?.name || 'Fee Structure'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {editData?.academicYearName
                    ? `Academic Year: ${editData.academicYearName}`
                    : 'Configure fee structures by class'}
                </Typography>
              </Box>

              {/* Right: Add Fee Structure button */}
              {canAdd && (
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<Iconify icon={GlobalIcons.addIcon} />}
                  onClick={() => addNewFnRef.current?.()}
                  disabled={!selectedClassId}
                  sx={{
                    borderRadius: 1.5,
                    fontWeight: 700,
                    px: 2,
                    flexShrink: 0,
                    '&.Mui-disabled': { opacity: 0.45 },
                  }}
                >
                  Add Fee Structure
                </Button>
              )}
            </Box>

            {/* ── Scrollable content ────────────────────────────────────── */}
            <Box
              sx={{
                flex: 1,
                overflowY: 'auto',
                overflowX: 'hidden',
                overscrollBehavior: 'contain',
                minHeight: 0,
                px: 2.5,
                pt: 2,
                pb: 3,
                '&::-webkit-scrollbar': { width: 5 },
                '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
                '&::-webkit-scrollbar-thumb': {
                  bgcolor: varAlpha(theme.palette.grey['500Channel'], 0.16),
                  borderRadius: 4,
                },
              }}
            >
              {/* Fee Structures for selected class */}
              {isLoadingClasses || isFetchingClasses ? (
                <Box
                  display="flex"
                  alignItems="center"
                  gap={1}
                  sx={{ color: 'text.disabled', py: 6, justifyContent: 'center' }}
                >
                  <Iconify icon="svg-spinners:3-dots-fade" width={20} />
                  <Typography variant="body2">Loading classes…</Typography>
                </Box>
              ) : classesError ? (
                <Alert severity="error">
                  The workspace has no scoped class data. Return to Fee Structure and refresh the
                  list.
                </Alert>
              ) : classes?.length === 0 ? (
                <Box
                  display="flex"
                  alignItems="center"
                  gap={1}
                  sx={{ color: 'text.disabled', py: 6, justifyContent: 'center' }}
                >
                  <Typography variant="body2">No classes available.</Typography>
                </Box>
              ) : (
                selectedClassId && (
                  <ClassAccordionPanel
                    key={selectedClassId}
                    classId={selectedClassId}
                    feeStructureMetaDataId={editData.id}
                    viewOnly={viewOnly}
                    onDirtyChange={(dirty) => {
                      isDirtyRef.current = dirty;
                      dispatch(setIsChanges(dirty));
                    }}
                    onRegisterAddNew={handleRegisterAddNew}
                  />
                )
              )}
            </Box>

            {/* ── Footer close action ───────────────────────────────────── */}
            <DialogActions
              sx={{
                px: 2.5,
                py: 1.25,
                gap: 1,
                flexShrink: 0,
                borderTop: `1px solid ${theme.palette.divider}`,
                bgcolor: 'background.paper',
              }}
            >
              <Button
                startIcon={<Iconify icon={GlobalIcons.cancel} />}
                onClick={() => onClose(null, false)}
                variant="outlined"
                size="small"
                color="inherit"
              >
                Close
              </Button>
            </DialogActions>
          </Box>
        </Box>
      </Box>

      {/* Confirm discard changes when switching classes */}
      <ConfirmDialog
        open={pendingClassId !== null}
        icon="warning"
        onClose={() => setPendingClassId(null)}
        title="Unsaved Changes"
        content="You have unsaved changes in this class. Switching to another class will discard them. Do you want to continue?"
        action={
          <Button
            variant="contained"
            color="error"
            size="small"
            startIcon={<Iconify icon={GlobalIcons.cancel} />}
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
    </motion.div>
  );
};

export default FeeStructureEditForm;
