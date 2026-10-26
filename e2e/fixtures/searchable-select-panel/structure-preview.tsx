import type { SetupDraft } from 'src/redux/initial-setup/types';

import { useFormik } from 'formik';
import { Stack, Typography } from '@mui/material';
import StructureStep from 'src/screens/initial-setup-screen/components/structure-step';

const initialValues: SetupDraft = {
  profile: {
    instituteName: '',
    email: '',
    contactNumber: '',
    address1: '',
    address2: '',
    address3: '',
    city: '',
    state: '',
    country: '',
    postalCode: '',
  },
  yearName: '',
  startDate: null,
  endDate: null,
  boardType: null,
  customBoardName: '',
  medium: 'English',
  stage: 'Primary',
  className: '',
  ageLowerLimit: 3,
  divisionName: '',
  strength: 40,
};

export function StructurePreview() {
  const form = useFormik<SetupDraft>({
    initialValues,
    initialTouched: { className: true, divisionName: true },
    initialErrors: {
      className: 'Class name is required',
      divisionName: 'Division name is required',
    },
    validate: (values) => ({
      ...(values.className.trim() ? {} : { className: 'Class name is required' }),
      ...(values.divisionName.trim() ? {} : { divisionName: 'Division name is required' }),
    }),
    onSubmit: () => undefined,
  });

  return (
    <Stack spacing={1}>
      <StructureStep form={form} />
      <Typography variant="caption" color="text.secondary" data-testid="board-value">
        Board value: {form.values.boardType ?? 'none'}
      </Typography>
    </Stack>
  );
}
