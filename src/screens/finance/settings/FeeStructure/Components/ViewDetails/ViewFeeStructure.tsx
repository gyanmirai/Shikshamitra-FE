import React from 'react';
import { motion } from 'framer-motion';
import { varAlpha } from 'src/theme/styles';
import { useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { EmptyContent } from 'src/components/empty-content';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useLazyGetClassByMediumQuery } from 'src/redux/class/classApi';
import { FeeStructureLockStatusType } from 'src/enums/finance-fee-structure-status';
import { useGetStandardFeeStructureQuery } from 'src/redux/finance/financeFeeStructure';
import { Box, Chip, Skeleton, Typography, ListItemButton } from '@mui/material';

import FeeStructureViewCard from './FeeStructureViewCard';
import FeeStructureSkeleton from './FeeStructureSkeleton';
import ViewBasicDetailsOfStructure from './ViewBasicDetailsOfStructure';
import { standardFeeStructureInitialValues } from '../FeeStructureInitialValues';

import type { IFeeStructure } from '../../type';

// ─── Per-class lock/total summary cache ──────────────────────────────────────
// Keeps the last known counts per classId so the sidebar stays populated
// even when the user navigates to a different class.
type ClassSummary = { total: number; locked: number };

const ViewFeeStructure = ({
  open,
  onClose,
  data: feeStructure,
}: {
  open: any;
  onClose: () => void;
  data: IFeeStructure | null;
}) => {
  const theme = useTheme();
  const [selectedClassId, setSelectedClassId] = React.useState<string | null>(null);

  // Per-class summary cache: { [classId]: { total, locked } }
  const [classSummaryMap, setClassSummaryMap] = React.useState<Record<string, ClassSummary>>({});

  const [
    getClassByMedium,
    { data: classes, isLoading: isLoadingClasses, isFetching: isLoadingClassesFetching },
  ] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useLazyGetClassByMediumQuery,
  });

  const { data: standardFeeStructure, isFetching } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetStandardFeeStructureQuery,
    params: { standardId: selectedClassId },
    options: { skip: !feeStructure?.id || !selectedClassId },
  });

  const mappedFeeStructures = React.useMemo(() => {
    if (!standardFeeStructure) return [];
    return standardFeeStructureInitialValues(standardFeeStructure).feeStructureClasses ?? [];
  }, [standardFeeStructure]);

  // Update the summary cache whenever mappedFeeStructures refreshes for the active class
  React.useEffect(() => {
    if (!selectedClassId || isFetching) return;
    const total = mappedFeeStructures.length;
    const locked = mappedFeeStructures.filter(
      (s: any) => s.status === FeeStructureLockStatusType.Locked
    ).length;
    setClassSummaryMap((prev) => ({
      ...prev,
      [selectedClassId]: { total, locked },
    }));
  }, [mappedFeeStructures, selectedClassId, isFetching]);

  React.useEffect(() => {
    if (feeStructure?.mediumId) {
      getClassByMedium(feeStructure.mediumId);
    }
  }, [feeStructure?.mediumId, getClassByMedium]);

  React.useEffect(() => {
    if (classes && classes.length > 0 && !selectedClassId) {
      setSelectedClassId(classes[0].id);
    }
  }, [classes, selectedClassId]);

  if (!feeStructure) return null;

  const isClassListLoading = isLoadingClassesFetching || isLoadingClasses;
  const selectedClassName = classes?.find((c: any) => c.id === selectedClassId)?.name || '';
  const activeSummary = selectedClassId ? classSummaryMap[selectedClassId] : undefined;

  return (
    <motion.div
      key="view-fee-structure"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
    >
      {/* ── Top: Basic Details Banner ─────────────────────────────────────── */}
      <ViewBasicDetailsOfStructure feeStructure={feeStructure} />

      {/* ── Main Two-Panel Area ───────────────────────────────────────────── */}
      <Box
        display="flex"
        flex={1}
        minHeight={0}
        overflow="hidden"
        sx={{
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 2,
          bgcolor: 'background.paper',
          boxShadow: `0 1px 8px ${varAlpha(theme.palette.grey['500Channel'], 0.06)}`,
        }}
      >
        {/* ══════════════════════════════════════════════════════════════════
            LEFT SIDEBAR — Class Navigator (matches Edit Fee Structure style)
        ══════════════════════════════════════════════════════════════════ */}
        <Box
          sx={{
            width: 200,
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            borderRight: `1px solid ${theme.palette.divider}`,
            bgcolor: 'background.paper',
            overflow: 'hidden',
          }}
        >
          {/* Sidebar header */}
          <Box
            sx={{
              px: 2,
              py: 1.5,
              borderBottom: `1px solid ${theme.palette.divider}`,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <Iconify
              icon="solar:notebook-bold-duotone"
              width={16}
              sx={{ color: 'primary.main', flexShrink: 0 }}
            />
            <Box>
              <Typography
                variant="caption"
                fontWeight={700}
                letterSpacing={0.6}
                textTransform="uppercase"
                color="text.secondary"
                display="block"
              >
                Class Navigator
              </Typography>
              <Typography variant="caption" color="text.disabled" fontSize={10}>
                Select a class to view fees
              </Typography>
            </Box>
          </Box>

          {/* Scrollable class list */}
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
            {isClassListLoading
              ? [1, 2, 3, 4, 5, 6].map((i) => (
                  <Box key={i} sx={{ px: 1, py: 0.5 }}>
                    <Skeleton variant="text" width="70%" height={28} />
                    <Skeleton variant="text" width="50%" height={18} />
                  </Box>
                ))
              : (classes || []).map((cls: any) => {
                  const isActive = selectedClassId === cls.id;
                  const summary = classSummaryMap[cls.id];
                  const isLoadingThis = isActive && isFetching;

                  return (
                    <ListItemButton
                      key={cls.id}
                      selected={isActive}
                      onClick={() => setSelectedClassId(cls.id)}
                      sx={{
                        borderRadius: 1.5,
                        mb: 0.25,
                        py: 1,
                        px: 1.5,
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        position: 'relative',
                        transition: 'background-color 0.15s ease, border-color 0.15s ease',
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
                      }}
                    >
                      {/* Class name row */}
                      <Box
                        display="flex"
                        alignItems="center"
                        justifyContent="space-between"
                        width="100%"
                        gap={1}
                      >
                        <Typography
                          variant="body2"
                          fontWeight={isActive ? 700 : 500}
                          color={isActive ? 'primary.main' : 'text.secondary'}
                          noWrap
                          sx={{ flex: 1 }}
                        >
                          {cls.name}
                        </Typography>
                        {isActive && (
                          <Box
                            sx={{
                              width: 6,
                              height: 6,
                              borderRadius: '50%',
                              bgcolor: 'primary.main',
                              flexShrink: 0,
                            }}
                          />
                        )}
                      </Box>

                      {/* Lock count badge */}
                      {isLoadingThis ? (
                        <Skeleton variant="text" width={60} height={16} sx={{ mt: 0.25 }} />
                      ) : summary ? (
                        <Box display="flex" alignItems="center" gap={1} mt={0.25}>
                          <Iconify
                            icon="mdi:lock-outline"
                            width={11}
                            sx={{
                              color:
                                summary.locked === summary.total && summary.total > 0
                                  ? 'success.main'
                                  : 'text.disabled',
                              flexShrink: 0,
                            }}
                          />
                          <Typography
                            variant="caption"
                            fontSize={10}
                            fontWeight={500}
                            color={
                              summary.locked === summary.total && summary.total > 0
                                ? 'success.main'
                                : 'text.disabled'
                            }
                            noWrap
                          >
                            {summary.locked} / {summary.total} Locked
                          </Typography>
                        </Box>
                      ) : (
                        <Typography variant="caption" fontSize={10} color="text.disabled" mt={0.25}>
                          Not loaded
                        </Typography>
                      )}
                    </ListItemButton>
                  );
                })}

            {/* Empty state */}
            {!isClassListLoading && (classes || []).length === 0 && (
              <Box sx={{ px: 2, py: 3, textAlign: 'center' }}>
                <Typography variant="caption" color="text.disabled">
                  No classes found
                </Typography>
              </Box>
            )}
          </Box>
        </Box>

        {/* ══════════════════════════════════════════════════════════════════
            RIGHT CONTENT AREA — Fee Structure Details
        ══════════════════════════════════════════════════════════════════ */}
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
          {/* ── Sticky right-panel header ──────────────────────────────────── */}
          <Box
            sx={{
              flexShrink: 0,
              px: 2.5,
              py: 1.25,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: `1px solid ${theme.palette.divider}`,
              bgcolor: varAlpha(theme.palette.grey['500Channel'], 0.02),
            }}
          >
            <Box display="flex" alignItems="center" gap={1}>
              <Iconify
                icon="solar:bill-list-bold-duotone"
                width={20}
                sx={{ color: 'primary.main', flexShrink: 0 }}
              />
              <Box>
                <Typography variant="subtitle1" fontWeight={700} lineHeight={1.3}>
                  {selectedClassName ? `${selectedClassName} Fee Structures` : 'Fee Structures'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {activeSummary
                    ? `${activeSummary.locked} Locked / ${activeSummary.total} Total Fee Structures`
                    : 'Division-wise fee heads and amounts'}
                </Typography>
              </Box>
            </Box>

            {/* Lock progress chips */}
            {activeSummary && activeSummary.total > 0 && (
              <Box display="flex" alignItems="center" gap={1}>
                <Chip
                  icon={<Iconify icon="mdi:lock-outline" width={12} />}
                  label={`${activeSummary.locked} / ${activeSummary.total} Locked`}
                  size="small"
                  color={activeSummary.locked === activeSummary.total ? 'success' : 'default'}
                  variant="soft"
                  sx={{ fontWeight: 600, fontSize: 11, borderRadius: 1 }}
                />
              </Box>
            )}
          </Box>

          {/* ── Scrollable fee structure content ──────────────────────────── */}
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
            {!selectedClassId ? (
              <Box
                display="flex"
                alignItems="center"
                justifyContent="center"
                sx={{ py: 10, color: 'text.disabled' }}
              >
                <Typography variant="body2">Select a class to view fee structures</Typography>
              </Box>
            ) : isFetching ? (
              <FeeStructureSkeleton />
            ) : mappedFeeStructures.length > 0 ? (
              mappedFeeStructures.map((structure: any, idx: number) => (
                <FeeStructureViewCard
                  key={idx}
                  className={selectedClassId}
                  feeStructure={structure}
                />
              ))
            ) : (
              <EmptyContent
                filled
                title="No Fee Structure Created For This Class"
                description="This class currently has no fee structures configured."
                sx={{ mt: 2, py: 10 }}
              />
            )}
          </Box>
        </Box>
      </Box>
    </motion.div>
  );
};

export default ViewFeeStructure;
