import { varAlpha } from 'src/theme/styles';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { useMemo, useState, useEffect } from 'react';
import CustomDialog from 'src/components/customDialog';
import { motion, AnimatePresence } from 'framer-motion';
import { formatNumber } from 'src/utils/formate_number';
import CustomTooltip from 'src/components/custom-tooltip';
import { EmptyContent } from 'src/components/empty-content';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import {
  Box,
  Grid,
  Chip,
  Card,
  Stack,
  Button,
  Tooltip,
  Skeleton,
  IconButton,
  Typography,
} from '@mui/material';

import FeeStructureCard from './FeeStructureCard';
import FeeGeneralInfoCard from './GeneralFeeInfoCard';
import AddFeeHeadDialogContent from './AddFeeHeadForm';
import AddFeeStructureDialog from './FeeStructureDialog';
import { useFeeStructureClassData } from './useFeeStructureClassData';

const FeeStructureStep = ({
  formik,
  classList: propClassList,
}: {
  formik: any;
  classList?: any[];
}) => {
  const [editFeeStructure, setEditFeeStructure] = useState<{
    classId: string;
    index: number;
  } | null>(null);
  const deleteFeeStructureDialog = useBoolean();
  const [selectedFeeStructure, setSelectedFeeStrcture] = useState<any>(null);
  const addNewFeeStructureDialog = useBoolean();
  const [selectedClassId, setSelectedClassId] = useState('');
  const addFeeHeadDialog = useBoolean();
  const [selectedFeeStructureIndex, setSelectedFeeStructureIndex] = useState<number | null>(null);

  // Class-switch guard: pending navigation
  const [pendingClassId, setPendingClassId] = useState<string | null>(null);
  const [showSwitchConfirm, setShowSwitchConfirm] = useState(false);

  /**
   * Memoization Justification:
   * `propClassList || []` produces a new array reference on every render when
   * propClassList is undefined, causing the classList useEffect to re-run infinitely.
   * useMemo stabilizes the reference.
   */
  const classList = useMemo(() => propClassList || [], [propClassList]);

  const { isFetching, isLoading, currentClassHasUnsavedChanges, resetClassSnapshot } =
    useFeeStructureClassData(formik, selectedClassId);

  useEffect(() => {
    if (!selectedClassId && classList.length > 0) {
      setSelectedClassId(classList[0].id);
    }
  }, [selectedClassId, classList]);

  const doSwitchToClass = (classId: string) => {
    // Clear snapshot so the hook re-fetches and re-initializes formik for this class.
    // Reset formik to hold ONLY the incoming class so submit targets exactly one class.
    resetClassSnapshot(classId);
    formik.setFieldValue('feeStructureClasses', { [classId]: [] });
    setSelectedClassId(classId);
  };

  const handleClassSelect = (classId: string | null) => {
    if (!classId || classId === selectedClassId) return;

    // Guard: if current class has unsaved data, prompt before switching
    if (currentClassHasUnsavedChanges()) {
      setPendingClassId(classId);
      setShowSwitchConfirm(true);
      return;
    }
    doSwitchToClass(classId);
  };

  return (
    <>
      <Grid container spacing={1.5}>
        {/* General Info Card */}
        <Grid size={{ xs: 12 }}>
          <FeeGeneralInfoCard feeStructure={formik.values} />
        </Grid>

        {/* ── Class Overview Strip ── */}
        {classList.length > 0 && (
          <Grid size={{ xs: 12 }}>
            <Card
              elevation={0}
              sx={{
                border: (theme) => `1px solid ${varAlpha(theme.palette.grey['500Channel'], 0.12)}`,
                borderRadius: 2,
                overflow: 'hidden',
              }}
            >
              {/* strip header */}
              <Box
                sx={{
                  px: 2,
                  py: 1.25,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottom: (theme) =>
                    `1px solid ${varAlpha(theme.palette.grey['500Channel'], 0.1)}`,
                  bgcolor: (theme) => varAlpha(theme.palette.grey['500Channel'], 0.03),
                }}
              >
                <Box display="flex" alignItems="center" gap={1}>
                  <Iconify
                    icon="solar:buildings-3-bold-duotone"
                    width={18}
                    color="text.secondary"
                  />
                  <Typography
                    variant="caption"
                    fontWeight={600}
                    color="text.secondary"
                    letterSpacing={0.5}
                    textTransform="uppercase"
                  >
                    Classes Overview
                  </Typography>
                </Box>
                <Typography variant="caption" color="text.disabled">
                  {classList.length} class{classList.length !== 1 ? 'es' : ''}
                </Typography>
              </Box>

              {/* horizontal scrollable chips */}
              <Box
                sx={{
                  px: 2,
                  py: 1.5,
                  display: 'flex',
                  gap: 1,
                  overflowX: 'auto',
                  flexWrap: 'nowrap',
                  '&::-webkit-scrollbar': { height: 4 },
                  '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
                  '&::-webkit-scrollbar-thumb': {
                    bgcolor: (theme) => varAlpha(theme.palette.grey['500Channel'], 0.2),
                    borderRadius: 4,
                  },
                }}
              >
                {classList.map((cls: any) => {
                  const structures = formik.values.feeStructureClasses[cls.id] || [];
                  const totalAmount = structures.reduce(
                    (sum: number, s: any) =>
                      sum +
                      (s.feeHeads || []).reduce(
                        (fhSum: number, fh: any) => fhSum + (fh.amount || 0),
                        0
                      ),
                    0
                  );
                  const isActive = selectedClassId === cls.id;
                  const hasData = structures.length > 0;

                  return (
                    <Box
                      key={cls.id}
                      component="button"
                      type="button"
                      onClick={() => handleClassSelect(cls.id)}
                      sx={{
                        flexShrink: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        gap: 0.25,
                        px: 1.5,
                        py: 1,
                        minWidth: 110,
                        borderRadius: 1.5,
                        cursor: 'pointer',
                        border: '1.5px solid',
                        borderColor: isActive
                          ? 'primary.main'
                          : (theme) => varAlpha(theme.palette.grey['500Channel'], 0.15),
                        bgcolor: isActive
                          ? (theme) => varAlpha(theme.palette.primary.mainChannel, 0.06)
                          : 'background.paper',
                        transition: 'all 0.18s ease',
                        '&:hover': {
                          borderColor: 'primary.light',
                          bgcolor: (theme) => varAlpha(theme.palette.primary.mainChannel, 0.04),
                        },
                      }}
                    >
                      <Box
                        display="flex"
                        alignItems="center"
                        justifyContent="space-between"
                        width="100%"
                        gap={0.5}
                      >
                        <Typography
                          variant="caption"
                          fontWeight={isActive ? 700 : 600}
                          color={isActive ? 'primary.main' : 'text.primary'}
                          noWrap
                        >
                          {cls.name}
                        </Typography>
                        {hasData && (
                          <Box
                            sx={{
                              minWidth: 18,
                              height: 18,
                              borderRadius: '50%',
                              bgcolor: isActive
                                ? 'primary.main'
                                : (theme) => varAlpha(theme.palette.grey['500Channel'], 0.2),
                              color: isActive ? 'white' : 'text.secondary',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: 10,
                              fontWeight: 700,
                              flexShrink: 0,
                            }}
                          >
                            {structures.length}
                          </Box>
                        )}
                      </Box>
                      <Typography variant="caption" color="text.disabled" fontSize={10}>
                        {hasData ? formatNumber(totalAmount, 'INR') : 'Not configured'}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            </Card>
          </Grid>
        )}

        {/* Active Class Fee Structures */}
        <Grid size={{ xs: 12 }}>
          {/* toolbar: add button */}
          <Box
            display="flex"
            justifyContent="flex-end"
            alignItems="center"
            mb={selectedClassId ? 1.5 : 0}
          >
            {selectedClassId && (
              <Button
                variant="contained"
                size="small"
                startIcon={<Iconify icon="lucide:plus" />}
                onClick={() => addNewFeeStructureDialog.onTrue()}
              >
                Fee Structure
              </Button>
            )}
          </Box>

          {selectedClassId && (
            <>
              {isFetching || isLoading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18 }}
                >
                  <Stack spacing={1.5}>
                    <Skeleton variant="rectangular" height={96} sx={{ borderRadius: 2 }} />
                    <Skeleton variant="rectangular" height={96} sx={{ borderRadius: 2 }} />
                  </Stack>
                </motion.div>
              ) : (
                (() => {
                  const feeStructures = formik.values.feeStructureClasses[selectedClassId] || [];

                  // CASE 1: Render actual fee structures
                  if (feeStructures.length > 0) {
                    return (
                      <Box>
                        <AnimatePresence>
                          {feeStructures.map((structure: any, idx: number) => {
                            const totalFeeAmount =
                              structure.feeHeads?.reduce(
                                (sum: number, item: any) => sum + (item.amount || 0),
                                0
                              ) || 0;

                            return (
                              <motion.div
                                key={structure._id ?? `${selectedClassId}-${idx}`}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.97 }}
                                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                              >
                                <Card
                                  sx={{
                                    borderRadius: 2,
                                    mb: 1.5,
                                    border: (theme) =>
                                      `1px solid ${varAlpha(theme.palette.grey['500Channel'], 0.12)}`,
                                    boxShadow: (theme) =>
                                      `0 1px 6px ${varAlpha(theme.palette.grey['500Channel'], 0.07)}`,
                                    overflow: 'visible',
                                  }}
                                  elevation={0}
                                >
                                  {/* card header */}
                                  <Box
                                    sx={{
                                      px: 2,
                                      py: 1.25,
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'space-between',
                                      borderBottom: (theme) =>
                                        `1px solid ${varAlpha(theme.palette.grey['500Channel'], 0.08)}`,
                                      bgcolor: (theme) =>
                                        varAlpha(theme.palette.grey['500Channel'], 0.03),
                                    }}
                                  >
                                    <Box display="flex" alignItems="center" gap={1.5}>
                                      {/* index badge */}
                                      <Box
                                        sx={{
                                          width: 28,
                                          height: 28,
                                          borderRadius: 1,
                                          bgcolor: (theme) =>
                                            varAlpha(theme.palette.primary.mainChannel, 0.1),
                                          color: 'primary.main',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          fontWeight: 700,
                                          fontSize: 12,
                                          flexShrink: 0,
                                        }}
                                      >
                                        {idx + 1}
                                      </Box>
                                      <Typography variant="subtitle2" fontWeight={700}>
                                        {structure.name || `Fee Structure ${idx + 1}`}
                                      </Typography>
                                      <Chip
                                        label={`Total: ${formatNumber(totalFeeAmount, 'INR')}`}
                                        color="success"
                                        size="small"
                                        variant="soft"
                                        sx={{ fontWeight: 600, borderRadius: 1, fontSize: 11 }}
                                      />
                                      {structure.feeHeads?.length > 0 && (
                                        <Chip
                                          label={`${structure.feeHeads.length} fee head${structure.feeHeads.length !== 1 ? 's' : ''}`}
                                          size="small"
                                          variant="soft"
                                          color="default"
                                          sx={{ fontWeight: 500, borderRadius: 1, fontSize: 11 }}
                                        />
                                      )}
                                    </Box>

                                    <Box display="flex" alignItems="center" gap={0.5}>
                                      <Button
                                        variant="outlined"
                                        size="small"
                                        startIcon={<Iconify icon="lucide:plus" width={14} />}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setSelectedFeeStructureIndex(idx);
                                          addFeeHeadDialog.onTrue();
                                        }}
                                        sx={{ fontSize: 12 }}
                                      >
                                        Fee Head
                                      </Button>

                                      <Tooltip title="Update Fee Structure">
                                        <IconButton
                                          size="small"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setEditFeeStructure({
                                              classId: selectedClassId,
                                              index: idx,
                                            });
                                          }}
                                          sx={{
                                            borderRadius: 1,
                                            '&:hover': {
                                              bgcolor: (theme) =>
                                                varAlpha(theme.palette.primary.mainChannel, 0.08),
                                            },
                                          }}
                                        >
                                          <Iconify icon={GlobalIcons.edit} width={16} />
                                        </IconButton>
                                      </Tooltip>

                                      <Tooltip title="Delete Fee Structure">
                                        <IconButton
                                          size="small"
                                          color="error"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            deleteFeeStructureDialog.onTrue();
                                            setSelectedFeeStrcture(structure);
                                          }}
                                          sx={{
                                            borderRadius: 1,
                                            '&:hover': {
                                              bgcolor: (theme) =>
                                                varAlpha(theme.palette.error.mainChannel, 0.08),
                                            },
                                          }}
                                        >
                                          <Iconify
                                            icon={GlobalIcons.delete}
                                            color="error"
                                            width={16}
                                          />
                                        </IconButton>
                                      </Tooltip>
                                    </Box>
                                  </Box>

                                  <Box sx={{ p: 0 }}>
                                    <FeeStructureCard
                                      className={selectedClassId}
                                      feeItems={structure.feeHeads || []}
                                      structureIndex={idx}
                                      formik={formik}
                                      onAddFeeHead={() => {
                                        setSelectedFeeStructureIndex(idx);
                                        addFeeHeadDialog.onTrue();
                                      }}
                                    />
                                  </Box>
                                </Card>
                              </motion.div>
                            );
                          })}
                        </AnimatePresence>
                      </Box>
                    );
                  }

                  // CASE 2: No fee structures → show EmptyContent
                  return (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <EmptyContent
                        filled
                        title="No Fee Structure Created For This Class"
                        description="Click the 'Fee Structure' button above to create a new fee structure for this class."
                        sx={{ mt: 2, py: 10 }}
                      />
                    </motion.div>
                  );
                })()
              )}
            </>
          )}
        </Grid>
      </Grid>

      {/* Add New */}
      <CustomDialog
        open={addNewFeeStructureDialog.value}
        handleClose={addNewFeeStructureDialog.onFalse}
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">Add Fee Structure</Typography>
            <CustomTooltip
              arrow
              placement="right"
              sx={{ textAlign: 'justify' }}
              title="Create a new fee structure by defining fee items and their amounts. This helps organize class-wise fee collection by grouping related fee components together into a structured format."
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
      >
        <AddFeeStructureDialog
          formik={formik}
          className={selectedClassId}
          onClose={addNewFeeStructureDialog.onFalse}
        />
      </CustomDialog>

      {/* Edit Existing */}
      <CustomDialog
        open={!!editFeeStructure}
        handleClose={() => setEditFeeStructure(null)}
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">Update Fee Structure</Typography>
            <CustomTooltip
              arrow
              placement="right"
              sx={{ textAlign: 'justify' }}
              title="Modify an existing fee structure by updating fee items and their amounts. You can adjust the structure name, add/remove fee items, and update amounts as needed."
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
      >
        {editFeeStructure && (
          <AddFeeStructureDialog
            formik={formik}
            className={editFeeStructure.classId}
            editIndex={editFeeStructure.index}
            onClose={() => setEditFeeStructure(null)}
          />
        )}
      </CustomDialog>

      {/* Delete Fee Structure Confirm */}
      <ConfirmDialog
        open={deleteFeeStructureDialog.value}
        icon="error"
        onClose={() => {
          deleteFeeStructureDialog.onFalse();
          setTimeout(() => {
            setSelectedFeeStrcture(null);
          }, 200);
        }}
        title="Delete"
        content={
          <>
            Are you sure you want to delete fee structure{' '}
            <strong>{selectedFeeStructure?.name}</strong>?
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            size="small"
            onClick={() => {
              if (selectedFeeStructure) {
                const updated = { ...formik.values.feeStructureClasses };

                // Find classId that contains this structure
                const classId = Object.keys(updated).find((clsId) =>
                  updated[clsId].some((fs: any) => fs === selectedFeeStructure)
                );

                if (classId) {
                  updated[classId] = updated[classId].filter(
                    (fs: any) => fs !== selectedFeeStructure
                  );

                  // Update formik values
                  formik.setFieldValue('feeStructureClasses', updated);
                }
              }

              deleteFeeStructureDialog.onFalse();
              setSelectedFeeStrcture(null);
            }}
          >
            Yes
          </Button>
        }
      />

      {/* Add Fee Head Dialog */}
      <CustomDialog
        open={addFeeHeadDialog.value}
        handleClose={() => {
          addFeeHeadDialog.onFalse();
          setSelectedFeeStructureIndex(null);
        }}
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">Add Fee Head</Typography>
            <CustomTooltip
              arrow
              placement="right"
              sx={{ textAlign: 'justify' }}
              title="Add fee heads to this class's fee structure. You can specify the amount, and whether it's a one-time or optional fee."
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
      >
        {selectedFeeStructureIndex !== null && (
          <AddFeeHeadDialogContent
            formik={formik}
            className={selectedClassId}
            feeStructureIndex={selectedFeeStructureIndex}
            onClose={() => {
              addFeeHeadDialog.onFalse();
              setSelectedFeeStructureIndex(null);
            }}
          />
        )}
      </CustomDialog>

      {/* Unsaved Changes — Class Switch Confirm */}
      <ConfirmDialog
        open={showSwitchConfirm}
        icon="warning"
        onClose={() => {
          setShowSwitchConfirm(false);
          setPendingClassId(null);
        }}
        title="Unsaved Changes"
        content={
          <>
            The current class has <strong>unsaved changes</strong>. If you switch without saving,
            all changes will be lost. Do you want to proceed?
          </>
        }
        action={
          <Button
            variant="contained"
            color="warning"
            size="small"
            onClick={() => {
              setShowSwitchConfirm(false);
              if (pendingClassId) {
                doSwitchToClass(pendingClassId);
                setPendingClassId(null);
              }
            }}
          >
            Discard &amp; Switch
          </Button>
        }
      />
    </>
  );
};

export default FeeStructureStep;
