import type { CreateUpdateAdmissionForm } from 'src/redux/student/admissions/admission-forms-api';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { Iconify } from 'src/components/iconify';
import ButtonBase from '@mui/material/ButtonBase';
import Typography from '@mui/material/Typography';
import { Scrollbar } from 'src/components/scrollbar';

import { getAdmissionFormStepGroups } from '../form-step-groups';

type Props = {
  form: CreateUpdateAdmissionForm;
  selectedSectionId: string | null;
  onSelectSection: (sectionId: string) => void;
};

export function FormBuilderOutline({ form, selectedSectionId, onSelectSection }: Props) {
  const isStepper = form.layoutType === 1;
  const groups = isStepper
    ? getAdmissionFormStepGroups(form.sections)
    : [
        {
          id: 'single-page-sections',
          code: 'SECTIONS',
          name: 'Sections',
          displayOrder: 0,
          sections: form.sections.map((section, sectionIndex) => ({ section, sectionIndex })),
        },
      ];

  return (
    <Stack sx={{ height: 1, minHeight: 0, bgcolor: 'background.paper' }}>
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography component="h3" variant="h6">
          Outline
        </Typography>
      </Box>

      <Scrollbar fillContent sx={{ flex: 1, minHeight: 0 }}>
        <Stack spacing={2} sx={{ p: 1.5 }}>
          {groups.map((group, groupIndex) => (
            <Stack key={group.id} spacing={0.75}>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ px: 0.75 }}>
                {isStepper && (
                  <Box
                    sx={{
                      width: 24,
                      height: 24,
                      display: 'grid',
                      flexShrink: 0,
                      placeItems: 'center',
                      borderRadius: '50%',
                      typography: 'caption',
                      color: 'text.secondary',
                      bgcolor: 'action.hover',
                    }}
                  >
                    {groupIndex + 1}
                  </Box>
                )}
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="subtitle2" sx={{ overflowWrap: 'anywhere' }}>
                    {isStepper ? group.name : 'Sections'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {group.sections.length} {group.sections.length === 1 ? 'section' : 'sections'}
                  </Typography>
                </Box>
              </Stack>

              <Stack spacing={0.5}>
                {group.sections.map(({ section }) => {
                  const selected = section.id === selectedSectionId;
                  return (
                    <ButtonBase
                      key={section.id}
                      aria-pressed={selected}
                      onClick={() => onSelectSection(section.id)}
                      sx={{
                        width: 1,
                        minHeight: 44,
                        px: 1,
                        py: 0.75,
                        gap: 1,
                        textAlign: 'left',
                        borderRadius: 1,
                        justifyContent: 'flex-start',
                        bgcolor: selected ? 'action.selected' : 'transparent',
                        '&:hover': { bgcolor: 'action.hover' },
                        '&:focus-visible': {
                          outline: 2,
                          outlineColor: 'text.primary',
                          outlineOffset: 1,
                        },
                      }}
                    >
                      <Iconify
                        icon="mdi:form-select"
                        width={18}
                        sx={{
                          flexShrink: 0,
                          color: 'text.secondary',
                        }}
                      />
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body2" fontWeight={selected ? 600 : 400}>
                          {section.name || 'Untitled section'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {section.fields.length} {section.fields.length === 1 ? 'field' : 'fields'}
                        </Typography>
                      </Box>
                      <Iconify
                        icon="mdi:chevron-right"
                        width={18}
                        sx={{ flexShrink: 0, color: 'text.disabled' }}
                      />
                    </ButtonBase>
                  );
                })}
              </Stack>
            </Stack>
          ))}
        </Stack>
      </Scrollbar>
    </Stack>
  );
}
