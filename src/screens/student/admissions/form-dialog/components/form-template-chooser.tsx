import type { AdmissionForm } from 'src/redux/student/admissions/admission-forms-api';

import { useState } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { Iconify } from 'src/components/iconify';
import ButtonBase from '@mui/material/ButtonBase';
import Typography from '@mui/material/Typography';

import { FormTemplateLibraryDialog } from './form-template-library-dialog';

import type { SystemAdmissionFormTemplateId } from '../admission-form-template-catalog';

export type AdmissionFormStarter = 'blank' | SystemAdmissionFormTemplateId;

type Props = {
  onSelect: (starter: AdmissionFormStarter) => void;
  onSelectSchoolForm: (form: AdmissionForm) => Promise<boolean>;
  applyingSchoolForm?: boolean;
};

const STARTERS: Array<{
  id: AdmissionFormStarter;
  title: string;
  description: string;
  detail: string;
  action: string;
  icon: string;
}> = [
  {
    id: 'blank',
    title: 'Blank form',
    description: 'Start small and add only the fields your school needs.',
    detail: 'Includes one editable section and one text field.',
    action: 'Start blank',
    icon: 'mdi:file-outline',
  },
  {
    id: 'admission-application',
    title: 'Admission application',
    description: 'Start with the recommended application for most schools.',
    detail: 'Includes student, guardian, address, academic history, and declaration sections.',
    action: 'Use recommended',
    icon: 'mdi:file-document-edit-outline',
  },
  {
    id: 'student-registration',
    title: 'Student registration',
    description: 'Start with a comprehensive school registration form.',
    detail: 'Includes student, family, address, document, medical, school, and bank details.',
    action: 'Use template',
    icon: 'mdi:clipboard-text-outline',
  },
];

export function FormTemplateChooser({
  onSelect,
  onSelectSchoolForm,
  applyingSchoolForm = false,
}: Props) {
  const [libraryOpen, setLibraryOpen] = useState(false);
  const selectSystemTemplate = (id: SystemAdmissionFormTemplateId) => {
    onSelect(id);
    setLibraryOpen(false);
  };
  const selectSchoolForm = async (form: AdmissionForm) => {
    if (await onSelectSchoolForm(form)) setLibraryOpen(false);
  };
  return (
    <Stack spacing={1.5}>
      <Box>
        <Typography variant="subtitle1">Choose a starting point</Typography>
        <Typography variant="body2" color="text.secondary">
          You can change every section and field in the next step.
        </Typography>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' },
          gap: 1.5,
        }}
      >
        {STARTERS.map((starter) => (
          <Paper key={starter.id} variant="outlined" sx={{ overflow: 'hidden', borderRadius: 1.5 }}>
            <ButtonBase
              aria-label={`${starter.action}: ${starter.title}`}
              onClick={() => onSelect(starter.id)}
              sx={{ width: 1, height: 1, p: 2, textAlign: 'left', alignItems: 'flex-start' }}
            >
              <Stack spacing={1.25} sx={{ width: 1 }}>
                <Stack direction="row" spacing={1.25} alignItems="flex-start">
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      display: 'grid',
                      flexShrink: 0,
                      placeItems: 'center',
                      borderRadius: 1,
                      bgcolor: 'action.hover',
                      color: 'text.secondary',
                    }}
                  >
                    <Iconify icon={starter.icon} width={22} />
                  </Box>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="subtitle2">{starter.title}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {starter.description}
                    </Typography>
                  </Box>
                </Stack>

                <Typography variant="caption" color="text.secondary">
                  {starter.detail}
                </Typography>
                <Stack direction="row" spacing={0.75} alignItems="center">
                  <Typography variant="button" color="text.primary">
                    {starter.action}
                  </Typography>
                  <Iconify icon="mdi:arrow-right" width={18} />
                </Stack>
              </Stack>
            </ButtonBase>
          </Paper>
        ))}
      </Box>
      <Button
        fullWidth
        variant="outlined"
        startIcon={<Iconify icon="mdi:view-grid-plus-outline" />}
        endIcon={<Iconify icon="mdi:arrow-right" />}
        onClick={() => setLibraryOpen(true)}
        sx={{ minHeight: 44, justifyContent: 'space-between' }}
      >
        Browse all templates and school forms
      </Button>
      <FormTemplateLibraryDialog
        open={libraryOpen}
        applying={applyingSchoolForm}
        onClose={() => setLibraryOpen(false)}
        onUseSystemTemplate={selectSystemTemplate}
        onUseSchoolForm={selectSchoolForm}
      />
    </Stack>
  );
}
