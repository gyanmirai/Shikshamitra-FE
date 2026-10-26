import type { FormikProps } from 'formik';

import { useState } from 'react';
import { FieldArray } from 'formik';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import ShakingTextField from 'src/components/shaking-text-field';
import { FormSectionCard } from 'src/components/form-section-card';
import { Box, Stack, Button, Typography, FormHelperText } from '@mui/material';

import { createBuildingFloor } from './initialValues';
import { BuildingFloorList } from './building-floor-list';

import type { IBuildingFloorValue, IBuildingFormValues } from '../types';

export function BuildingFloorsSection({
  formik,
  onDraggingChange,
}: {
  formik: FormikProps<IBuildingFormValues>;
  onDraggingChange?: (dragging: boolean) => void;
}) {
  const [announcement, setAnnouncement] = useState('');
  const [removals, setRemovals] = useState<{ floor: IBuildingFloorValue; index: number }[]>([]);
  const removed = removals.at(-1);
  const error =
    typeof formik.errors.floors === 'string' && formik.submitCount > 0
      ? formik.errors.floors
      : undefined;
  return (
    <FieldArray name="floors">
      {(helpers) => (
        <ShakingTextField error={Boolean(error)}>
          <FormSectionCard
            icon={GlobalIcons.floors}
            title="Floors"
            actionFullWidthOnMobile
            descriptionTooltip="Add floors individually, drag them by their handles or use the arrows to change their sequence. At least one floor is required. Changes are saved on Submit. A saved floor with assigned rooms cannot be removed."
            action={
              <Button
                id="add-building-floor"
                type="button"
                size="small"
                variant="outlined"
                disabled={formik.isSubmitting}
                startIcon={<Iconify icon={GlobalIcons.addIcon} width={18} />}
                onClick={() => {
                  const floor = createBuildingFloor(formik.values.floors.length + 1);
                  helpers.push(floor);
                  setAnnouncement('Floor added.');
                  requestAnimationFrame(() =>
                    document.getElementById(`${floor.rowKey}-name`)?.focus()
                  );
                }}
              >
                Add floor
              </Button>
            }
          >
            <BuildingFloorList
              formik={formik}
              error={error}
              onDraggingChange={onDraggingChange}
              onMove={(from, to) => {
                helpers.move(from, to);
                setAnnouncement(
                  `${formik.values.floors[from].floorName || `Floor ${from + 1}`} moved to position ${to + 1}.`
                );
              }}
              onRemove={(floor, index) => {
                setRemovals((current) => [...current, { floor, index }]);
                helpers.remove(index);
                setAnnouncement(`${floor.floorName || `Floor ${index + 1}`} removed.`);
                const next = formik.values.floors[index + 1] ?? formik.values.floors[index - 1];
                requestAnimationFrame(() =>
                  document
                    .getElementById(next ? `${next.rowKey}-name` : 'add-building-floor')
                    ?.focus()
                );
              }}
            />
            {removed && (
              <Stack direction="row" spacing={1} alignItems="center" useFlexGap flexWrap="wrap">
                <Typography variant="body2" color="text.secondary">
                  {removed.floor.floorName || 'Floor'} removed.
                </Typography>
                <Button
                  type="button"
                  size="small"
                  disabled={formik.isSubmitting}
                  onClick={() => {
                    helpers.insert(
                      Math.min(removed.index, formik.values.floors.length),
                      removed.floor
                    );
                    setRemovals((current) => current.slice(0, -1));
                    setAnnouncement('Floor restored.');
                    requestAnimationFrame(() =>
                      document.getElementById(`${removed.floor.rowKey}-name`)?.focus()
                    );
                  }}
                >
                  Undo remove
                </Button>
              </Stack>
            )}
            {error && (
              <FormHelperText error id="building-floors-error">
                {error}
              </FormHelperText>
            )}
            <Box
              role="status"
              aria-live="polite"
              sx={{
                position: 'absolute',
                width: 1,
                height: 1,
                overflow: 'hidden',
                clipPath: 'inset(50%)',
              }}
            >
              {announcement}
            </Box>
          </FormSectionCard>
        </ShakingTextField>
      )}
    </FieldArray>
  );
}
