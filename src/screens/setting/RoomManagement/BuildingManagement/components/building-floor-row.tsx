import type { ReactNode } from 'react';
import type { FormikProps } from 'formik';

import { getIn } from 'formik';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import ShakingTextField from 'src/components/shaking-text-field';
import NumericFormatCustom from 'src/components/custom-numeric-format';
import { Box, Stack, Tooltip, TextField, Typography, IconButton } from '@mui/material';
import { useInstituteFieldPreview } from 'src/components/institute-field-formatting/use-institute-field-preview';

import type { IBuildingFormValues } from '../types';

export type BuildingFloorRowProps = {
  formik: FormikProps<IBuildingFormValues>;
  index: number;
  occupied: boolean;
  readOnly: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
  canRemove: boolean;
  onMove: (destination: number) => void;
  onRemove: () => void;
  dragHandle: ReactNode;
};

export function BuildingFloorRow({
  formik,
  index,
  occupied,
  readOnly,
  canMoveUp,
  canMoveDown,
  canRemove,
  onMove,
  onRemove,
  dragHandle,
}: BuildingFloorRowProps) {
  const floor = formik.values.floors[index];
  const namePreview = useInstituteFieldPreview(
    'buildings',
    'floorName',
    floor.floorName,
    Boolean(floor.id)
  );
  const namePath = `floors.${index}.floorName`;
  const roomsPath = `floors.${index}.totalRoom`;
  const errorFor = (path: string): string | undefined =>
    getIn(formik.touched, path) || formik.submitCount > 0 ? getIn(formik.errors, path) : undefined;
  const nameError = errorFor(namePath);
  const roomsError = errorFor(roomsPath);
  const number = index + 1;
  const actions = [
    {
      label: `Move floor ${number} up`,
      icon: GlobalIcons.moveUp,
      disabled: !canMoveUp,
      onClick: () => onMove(index - 1),
    },
    {
      label: `Move floor ${number} down`,
      icon: GlobalIcons.moveDown,
      disabled: !canMoveDown,
      onClick: () => onMove(index + 1),
    },
    {
      label: `Remove floor ${number}`,
      icon: GlobalIcons.delete,
      disabled: !canRemove,
      onClick: onRemove,
    },
  ];
  return (
    <Box>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        spacing={1}
        sx={{ mb: 1.5 }}
      >
        <Stack direction="row" spacing={0.5} alignItems="center">
          {dragHandle}
          <Typography variant="subtitle2">Floor {number}</Typography>
        </Stack>
        <Stack direction="row" spacing={0.5}>
          {actions.map((action) => (
            <Tooltip title={action.label} key={action.icon}>
              <span>
                <IconButton
                  type="button"
                  size="small"
                  aria-label={action.label}
                  disabled={formik.isSubmitting || action.disabled}
                  onClick={action.onClick}
                  color={action.icon === GlobalIcons.delete ? 'error' : 'default'}
                >
                  <Iconify icon={action.icon} width={18} />
                </IconButton>
              </span>
            </Tooltip>
          ))}
        </Stack>
      </Stack>
      {occupied && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
          Move or delete the assigned rooms to edit this floor.
        </Typography>
      )}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'minmax(0, 2fr) minmax(0, 1fr)' },
          gap: 2,
        }}
      >
        <ShakingTextField error={Boolean(nameError)}>
          <TextField
            required
            fullWidth
            size="small"
            id={`${floor.rowKey}-name`}
            label="Floor name"
            name={namePath}
            value={floor.floorName}
            slotProps={{ input: { readOnly } }}
            onChange={(event) =>
              formik.setFieldValue(namePath, event.target.value.replace(/[^a-zA-Z0-9\s]/g, ''))
            }
            onBlur={formik.handleBlur}
            error={Boolean(nameError)}
            helperText={nameError || namePreview}
          />
        </ShakingTextField>
        <ShakingTextField error={Boolean(roomsError)}>
          <NumericFormatCustom
            required
            fullWidth
            size="small"
            id={`${floor.rowKey}-rooms`}
            label="Total rooms"
            name={roomsPath}
            value={floor.totalRoom}
            prefix=""
            suffix=""
            decimalScale={0}
            allowNegative={false}
            valueIsNumericString
            roundToWholeRupees={false}
            slotProps={{ input: { readOnly } }}
            onValueChange={(values, source) => {
              if (source.source === 'event') formik.setFieldValue(roomsPath, values.value);
            }}
            onBlur={formik.handleBlur}
            error={Boolean(roomsError)}
            helperText={roomsError}
          />
        </ShakingTextField>
      </Box>
    </Box>
  );
}
