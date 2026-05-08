import { motion } from 'framer-motion';
import { varAlpha } from 'src/theme/styles';
import { GlobalIcons } from 'src/utils/icons';
import { useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import React, { useRef, useState, useEffect } from 'react';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useLazyGetClassByMediumQuery } from 'src/redux/class/classApi';
import { Box, Card, Button, Typography, DialogActions } from '@mui/material';

import FeeGeneralInfoCard from './GeneralFeeInfoCard';
import ClassAccordionPanel from './ClassAccordionPanel';

import type { IFeeStructureEditFormProps } from '../type';

const FeeStructureEditForm: React.FC<IFeeStructureEditFormProps> = ({ editData, onClose }) => {
  const theme = useTheme();
  const [classList, setClassList] = useState<any[]>([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [pendingClassId, setPendingClassId] = useState<string | null>(null);
  const isDirtyRef = useRef(false);

  const [getClassByMedium, { data: classes }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useLazyGetClassByMediumQuery,
  });

  useEffect(() => {
    if (editData?.mediumId) {
      getClassByMedium(editData.mediumId);
    }
  }, [editData?.mediumId, getClassByMedium]);

  useEffect(() => {
    if (classes?.length > 0) {
      setClassList(classes);
      setSelectedClassId((prev) => prev || classes[0].id);
    }
  }, [classes]);

  return (
    <motion.div
      key="edit-form"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      style={{ height: '100%' }}
    >
      <Box display="flex" flexDirection="column" height="100%">
        <Scrollbar sx={{ p: 2, height: '100%', flex: 1 }}>
          {/* General info summary */}
          <Box mb={2}>
            <FeeGeneralInfoCard feeStructure={editData} />
          </Box>

          {/* ── Horizontal Class Strip ────────────────────────────────── */}
          {classList.length > 0 && (
            <Card
              elevation={0}
              sx={{
                mb: 2,
                border: `1px solid ${varAlpha(theme.palette.grey['500Channel'], 0.12)}`,
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
                  borderBottom: `1px solid ${varAlpha(theme.palette.grey['500Channel'], 0.1)}`,
                  bgcolor: varAlpha(theme.palette.grey['500Channel'], 0.03),
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

              {/* horizontal scrollable class buttons */}
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
                    bgcolor: varAlpha(theme.palette.grey['500Channel'], 0.2),
                    borderRadius: 4,
                  },
                }}
              >
                {classList.map((cls: any) => {
                  const isActive = selectedClassId === cls.id;
                  return (
                    <Box
                      key={cls.id}
                      component="button"
                      type="button"
                      onClick={() => {
                        if (cls.id === selectedClassId) return;
                        if (isDirtyRef.current) {
                          setPendingClassId(cls.id);
                        } else {
                          setSelectedClassId(cls.id);
                        }
                      }}
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
                          : varAlpha(theme.palette.grey['500Channel'], 0.15),
                        bgcolor: isActive
                          ? varAlpha(theme.palette.primary.mainChannel, 0.06)
                          : 'background.paper',
                        transition: 'all 0.18s ease',
                        '&:hover': {
                          borderColor: 'primary.light',
                          bgcolor: varAlpha(theme.palette.primary.mainChannel, 0.04),
                        },
                      }}
                    >
                      <Typography
                        variant="caption"
                        fontWeight={isActive ? 700 : 600}
                        color={isActive ? 'primary.main' : 'text.primary'}
                        noWrap
                      >
                        {cls.name}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            </Card>
          )}

          {/* ── Fee Structures for selected class ────────────────────── */}
          {classList.length === 0 ? (
            <Box
              display="flex"
              alignItems="center"
              gap={1}
              sx={{ color: 'text.disabled', py: 4, justifyContent: 'center' }}
            >
              <Iconify icon="svg-spinners:3-dots-fade" width={20} />
              <Typography variant="body2">Loading classes…</Typography>
            </Box>
          ) : (
            selectedClassId && (
              <ClassAccordionPanel
                key={selectedClassId}
                classId={selectedClassId}
                feeStructureMetaDataId={editData.id}
                onDirtyChange={(dirty) => {
                  isDirtyRef.current = dirty;
                }}
              />
            )
          )}
        </Scrollbar>

        <DialogActions
          sx={{
            p: 2,
            gap: 1,
            borderTop: `1px solid ${theme.palette.divider}`,
            boxShadow: '0 -2px 12px rgba(0,0,0,0.06)',
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
            onClick={() => {
              if (pendingClassId) {
                isDirtyRef.current = false;
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
