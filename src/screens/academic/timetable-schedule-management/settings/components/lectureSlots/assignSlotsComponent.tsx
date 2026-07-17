'use client';

import type { RootState } from 'src/redux/store';
import type { Standards, Organization } from 'src/types/school';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { LoadingButton } from '@mui/lab';
import { useSelector } from 'react-redux';
import { useState, useEffect } from 'react';
import { alpha } from '@mui/material/styles';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import ShakingTextField from 'src/components/shaking-text-field';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { Box, Chip, Stack, Button, Typography } from '@mui/material';
import {
  useGetLectureSlotsQuery,
  useAssignLectureSlotToClassesMutation,
} from 'src/redux/academicAPI/timetableApi/lectureSlotsApi';

interface AssignSlotsProps {
  onClose: (e: any, isSubmit: boolean) => void;
  lectureSlotId?: string;
  sourceClassName?: string;
}

const hasClassShift = (standard: Standards) =>
  Boolean(standard.shiftId && standard.shift?.startTime && standard.shift?.endTime);

const AssignSlots = ({ onClose, lectureSlotId, sourceClassName }: AssignSlotsProps) => {
  const [allClass, setAllClass] = useState<Standards[]>([]);
  // Get current board, medium and medium setter from global state
  const { currentMedium: medium } = useSelector((state: RootState) => state.globalState);

  // Fetch all existing lecture slots to know which classes are already configured
  const { data: allSlotsData } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetLectureSlotsQuery,
    params: { AcademicMediumId: medium?.id },
    options: { skip: !medium?.id },
  });

  const [assignLectureSlot, { isLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAssignLectureSlotToClassesMutation,
  });

  // Update classes when organization changes
  useEffect(() => {
    const allClasses =
      medium?.educationMediumStages?.flatMap((stage: Organization) => stage.standards || []) || [];
    setAllClass(allClasses);
  }, [medium]);

  // StandardIds that already have a lecture slot configured — these should be disabled in the dropdown
  const configuredStandardIds: string[] = (allSlotsData?.items ?? []).map(
    (slot: any) => slot.standardId
  );
  const missingShiftStandardIds = allClass
    .filter((standard) => !hasClassShift(standard))
    .map((standard) => standard.id);
  const disabledStandardIds = Array.from(
    new Set([...configuredStandardIds, ...missingShiftStandardIds])
  );

  const formik = useFormik({
    initialValues: {
      classNames: [] as string[],
    },
    validationSchema: Yup.object({
      classNames: Yup.array().min(1, 'Please select at least one class'),
    }),
    onSubmit: async (values) => {
      const res = await assignLectureSlot({
        lectureSlotId,
        body: { selectedStandardIds: values.classNames },
      });
      if (res.data) {
        shikshaMitraToast.success({
          message: 'Slots assigned successfully.',
        });
        onClose?.(null, true);
      }
    },
  });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
      {/* Scrollable content area */}
      <Scrollbar sx={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        <Box sx={{ px: { xs: 2, sm: 3 }, pt: 2.5, pb: 14 }}>
          {/* From → To flow indicator */}
          {sourceClassName && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                mb: 2.5,
                p: 2,
                borderRadius: 2,
                bgcolor: (theme) =>
                  alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.12 : 0.06),
                border: '1px solid',
                borderColor: (theme) => alpha(theme.palette.primary.main, 0.2),
              }}
            >
              <Box
                sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.3 }}
              >
                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                  Copy from
                </Typography>
                <Chip
                  label={sourceClassName}
                  size="small"
                  color="primary"
                  variant="filled"
                  sx={{ fontWeight: 700, fontSize: '0.82rem', height: 26 }}
                />
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    width: '100%',
                    gap: 0.5,
                  }}
                >
                  <Box
                    sx={{
                      flex: 1,
                      height: '2px',
                      bgcolor: 'primary.main',
                      opacity: 0.4,
                      borderRadius: 1,
                    }}
                  />
                  <Iconify
                    icon="mdi:arrow-right"
                    sx={{ color: 'primary.main', width: 20, height: 20 }}
                  />
                  <Box
                    sx={{
                      flex: 1,
                      height: '2px',
                      bgcolor: 'primary.main',
                      opacity: 0.4,
                      borderRadius: 1,
                    }}
                  />
                </Box>
                <Typography
                  variant="caption"
                  color="primary.main"
                  fontWeight={600}
                  sx={{ mt: 0.3 }}
                >
                  Assign slots to
                </Typography>
              </Box>

              <Box
                sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.3 }}
              >
                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                  Copy to
                </Typography>
                {formik.values.classNames.length === 0 ? (
                  <Chip
                    label="Not selected"
                    size="small"
                    variant="outlined"
                    sx={{
                      fontWeight: 500,
                      fontSize: '0.78rem',
                      height: 26,
                      color: 'text.disabled',
                      borderStyle: 'dashed',
                    }}
                  />
                ) : (
                  <Box
                    sx={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 0.5,
                      justifyContent: 'center',
                      maxWidth: 200,
                    }}
                  >
                    {formik.values.classNames.map((id) => {
                      const cls = allClass.find((c: any) => c.id === id);
                      return (
                        <Chip
                          key={id}
                          label={cls?.name ?? id}
                          size="small"
                          color="success"
                          variant="filled"
                          sx={{ fontWeight: 700, fontSize: '0.82rem', height: 26 }}
                        />
                      );
                    })}
                  </Box>
                )}
              </Box>
            </Box>
          )}

          <Box
            sx={{
              borderRadius: 2.5,
              border: '1px solid',
              borderColor: 'divider',
              p: { xs: 2, sm: 2.5 },
              bgcolor: 'background.paper',
              backgroundImage: (theme) =>
                `linear-gradient(180deg, ${alpha(
                  theme.palette.primary.main,
                  theme.palette.mode === 'dark' ? 0.08 : 0.04
                )} 0%, ${alpha(theme.palette.background.paper, 0)} 70%)`,
              transition: 'box-shadow 200ms ease, border-color 200ms ease',
              '&:hover': {
                borderColor: (theme) => alpha(theme.palette.primary.main, 0.4),
                boxShadow: (theme) =>
                  `0 4px 18px ${alpha(
                    theme.palette.primary.main,
                    theme.palette.mode === 'dark' ? 0.18 : 0.08
                  )}`,
              },
            }}
          >
            <Typography variant="subtitle1" fontWeight={600} mb={0.5}>
              Select Target Classes
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={2.5}>
              Choose one or more classes to assign this lecture slot configuration to.
            </Typography>

            <Stack spacing={0}>
              <ShakingTextField
                error={formik.touched.classNames && Boolean(formik.errors.classNames)}
              >
                <CustomSelect
                  options={allClass}
                  value={formik.values.classNames}
                  onChange={(val) => {
                    formik.setFieldValue('classNames', val);
                  }}
                  label="Class"
                  multiple
                  labelKey="name"
                  valueKey="id"
                  formControlProps={{ fullWidth: true, sx: { minWidth: '200px' } }}
                  error={formik.touched.classNames && Boolean(formik.errors.classNames)}
                  helperText={
                    formik.touched.classNames && typeof formik.errors.classNames === 'string'
                      ? formik.errors.classNames
                      : undefined
                  }
                  disabledValues={disabledStandardIds}
                  disabledLabel="Already configured or shift missing"
                />
              </ShakingTextField>
              {missingShiftStandardIds.length > 0 && (
                <Typography
                  variant="caption"
                  color="warning.main"
                  sx={{ mt: 1, display: 'block' }}
                >
                  Classes without a school shift are disabled. First assign the school shift to the
                  class, then assign lecture slots.
                </Typography>
              )}
            </Stack>
          </Box>
        </Box>
      </Scrollbar>

      {/* Sticky footer — same pattern as FormFooter */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          bgcolor: (theme) => theme.vars.palette.background.paper,
          backdropFilter: 'saturate(180%) blur(10px)',
          WebkitBackdropFilter: 'saturate(180%) blur(10px)',
          borderTop: '1px solid',
          borderColor: 'divider',
          px: { xs: 2, sm: 3 },
          py: 1.5,
          display: 'flex',
          gap: 1,
          justifyContent: 'flex-end',
          alignItems: 'center',
          zIndex: 10,
          boxShadow: (theme) =>
            `0 -6px 20px ${alpha(theme.palette.common.black, theme.palette.mode === 'dark' ? 0.4 : 0.06)}`,
        }}
      >
        <Button
          variant="text"
          size="small"
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
          onClick={() => onClose?.(null, false)}
        >
          Cancel
        </Button>
        <LoadingButton
          startIcon={<Iconify icon={GlobalIcons.submit} />}
          size="small"
          variant="contained"
          loading={isLoading}
          onClick={() => formik.handleSubmit()}
        >
          Assign Slots
        </LoadingButton>
      </Box>
    </Box>
  );
};

export default AssignSlots;
