import { varAlpha } from 'src/theme/styles';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import CustomDialog from 'src/components/customDialog';
import { motion, AnimatePresence } from 'framer-motion';
import { formatNumber } from 'src/utils/formate_number';
import CustomTooltip from 'src/components/custom-tooltip';
import { EmptyContent } from 'src/components/empty-content';
import { useRef, useMemo, useState, useEffect } from 'react';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { FeeStructureClassStatusType } from 'src/enums/fee-structure-statusType';
import { useGetStandardFeeStructureQuery } from 'src/redux/finance/financeFeeStructure';
import {
  Box,
  Grid,
  Chip,
  Card,
  Stack,
  Button,
  Tooltip,
  Skeleton,
  TextField,
  IconButton,
  Typography,
  Autocomplete,
} from '@mui/material';

import FeeStructureCard from './FeeStructureCard';
import FeeGeneralInfoCard from './GeneralFeeInfoCard';
import AddFeeHeadDialogContent from './AddFeeHeadForm';
import AddFeeStructureDialog from './FeeStructureDialog';
import { standardFeeStructureInitialValues } from './FeeStructureInitialValues';

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
  const [, setCurrentClickableClass] = useState<string | null>(null);
  const addFeeHeadDialog = useBoolean();
  const [selectedFeeStructureIndex, setSelectedFeeStructureIndex] = useState<number | null>(null);

  const initializedClassesRef = useRef<Record<string, boolean>>({});

  const classList = useMemo(() => propClassList || [], [propClassList]);

  const {
    data: standardFeeStructure,
    isFetching,
    isLoading,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetStandardFeeStructureQuery,
    params: { standardId: selectedClassId },
    options: { skip: !selectedClassId },
  });

  useEffect(() => {
    if (!selectedClassId && classList.length > 0) {
      setSelectedClassId(classList[0].id);
    }
  }, [selectedClassId, classList]);

  useEffect(() => {
    if (standardFeeStructure && selectedClassId && !isFetching) {
      // Ensure the data fetched matches the selected class to avoid stale data sync
      if (standardFeeStructure.standardId !== selectedClassId) return;

      if (initializedClassesRef.current[selectedClassId]) return;

      const updatedStatus = { ...formik.values.feeStructureClasses };

      // Map API response to the format expected by the form using mapper function
      const mappedData = standardFeeStructureInitialValues(standardFeeStructure);

      updatedStatus[selectedClassId] = mappedData.standardFeeStructures.map(
        (fs: any, idx: number) => ({
          ...fs,
          status:
            idx === 0
              ? FeeStructureClassStatusType.Current
              : fs.feeHeads.length > 0
                ? FeeStructureClassStatusType.Completed
                : FeeStructureClassStatusType.Remaining,
        })
      );

      formik.setFieldValue('feeStructureClasses', updatedStatus);
      initializedClassesRef.current[selectedClassId] = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [standardFeeStructure, selectedClassId, isFetching]);

  return (
    <>
      <Grid container spacing={1}>
        {/* Select Classes Section */}
        <Grid size={{ xs: 12 }}>
          <FeeGeneralInfoCard feeStructure={formik.values} />
        </Grid>

        {/* Active Class Fee Structures */}
        <Grid size={{ xs: 12 }} mt={1}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            pb={selectedClassId ? 2 : 0}
          >
            <Autocomplete
              size="small"
              fullWidth
              options={classList.map((c: any) => c.id)}
              value={selectedClassId || null}
              onChange={(event, classId) => {
                if (classId === null) {
                  setSelectedClassId('');
                  setCurrentClickableClass(null);
                  return;
                }

                setSelectedClassId(classId);
                setCurrentClickableClass(classId);

                const updatedStatus = { ...formik.values.feeStructureClasses };

                // Ensure the selected class exists in the state
                if (!updatedStatus[classId]) {
                  updatedStatus[classId] = [];
                }

                Object.keys(updatedStatus).forEach((clsId) => {
                  updatedStatus[clsId] = updatedStatus[clsId].map((fs: any, idx: any) => {
                    const clsHasData = fs.feeHeads?.length > 0;

                    if (clsId === classId && idx === 0) {
                      return { ...fs, status: FeeStructureClassStatusType.Current };
                    }

                    if (clsHasData) {
                      return { ...fs, status: FeeStructureClassStatusType.Completed };
                    }

                    return { ...fs, status: FeeStructureClassStatusType.Remaining };
                  });
                });

                formik.setFieldValue('feeStructureClasses', updatedStatus);
              }}
              renderInput={(params) => <TextField {...params} label="Class" />}
              getOptionLabel={(option) =>
                classList.find((c: any) => c.id === option)?.name || option
              }
              sx={{ width: '250px' }}
            />

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

          <>
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
                    <Stack spacing={2} mt={2}>
                      <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 1.5 }} />
                      <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 1.5 }} />
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
                                      borderRadius: 1.5,
                                      mb: 2,
                                      border: (theme) =>
                                        `1px solid ${varAlpha(theme.palette.grey['500Channel'], 0.12)}`,
                                      boxShadow: (theme) =>
                                        `0 2px 8px ${varAlpha(theme.palette.grey['500Channel'], 0.08)}`,
                                      overflow: 'visible',
                                    }}
                                    elevation={0}
                                  >
                                    <Box
                                      sx={{
                                        p: 1.5,
                                        pb: 1.5,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        borderBottom: (theme) =>
                                          `1px solid ${varAlpha(theme.palette.grey['500Channel'], 0.1)}`,
                                        bgcolor: (theme) =>
                                          varAlpha(theme.palette.background.neutralChannel, 0.4),
                                      }}
                                    >
                                      <Box display="flex" alignItems="center" gap={2}>
                                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                                          {structure.name || `Fee Structure ${idx + 1}`}
                                        </Typography>
                                        <Chip
                                          label={`Total: ${formatNumber(totalFeeAmount, 'INR')}`}
                                          color="success"
                                          size="small"
                                          variant="soft"
                                          sx={{ fontWeight: 600, borderRadius: 1 }}
                                        />
                                      </Box>

                                      <Box display="flex" alignItems="center" gap={1}>
                                        <Button
                                          variant="outlined"
                                          size="small"
                                          startIcon={<Iconify icon="lucide:plus" />}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedFeeStructureIndex(idx);
                                            addFeeHeadDialog.onTrue();
                                          }}
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
                                          >
                                            <Iconify icon={GlobalIcons.edit} width={18} />
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
                                          >
                                            <Iconify
                                              icon={GlobalIcons.delete}
                                              color="error"
                                              width={18}
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

                    // CASE 2: No fee structures match → show EmptyContent
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
          </>
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
    </>
  );
};

export default FeeStructureStep;
