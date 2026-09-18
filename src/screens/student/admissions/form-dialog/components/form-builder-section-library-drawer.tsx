import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import { useMemo, useState } from 'react';
import Drawer from '@mui/material/Drawer';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import { Iconify } from 'src/components/iconify';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import ButtonBase from '@mui/material/ButtonBase';
import { Scrollbar } from 'src/components/scrollbar';

import {
  ADMISSION_FORM_SECTION_TEMPLATES,
  type AdmissionFormSectionTemplateId,
} from '../admission-form-section-template-catalog';
import {
  getSystemAdmissionFormTemplate,
  ADMISSION_FORM_TEMPLATE_CATEGORIES,
  type AdmissionFormTemplateCategory,
} from '../admission-form-template-catalog';

type Props = {
  open: boolean;
  targetLabel?: string;
  onClose: () => void;
  onAddSection: (templateId: AdmissionFormSectionTemplateId) => void;
};

export function FormBuilderSectionLibraryDrawer({
  open,
  targetLabel,
  onClose,
  onAddSection,
}: Props) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<AdmissionFormTemplateCategory | 'All'>('All');
  const [selectedId, setSelectedId] = useState<AdmissionFormSectionTemplateId>('student-details');
  const normalizedSearch = search.trim().toLowerCase();
  const templates = ADMISSION_FORM_SECTION_TEMPLATES.filter(
    (template) =>
      (category === 'All' || template.category === category) &&
      (!normalizedSearch ||
        [template.title, template.description, template.category].some((value) =>
          value.toLowerCase().includes(normalizedSearch)
        ))
  );
  const selected =
    ADMISSION_FORM_SECTION_TEMPLATES.find((template) => template.id === selectedId) ?? templates[0];
  const selectedFields = useMemo(() => {
    if (!selected) return [];
    return (
      getSystemAdmissionFormTemplate(selected.sourceTemplateId).sections.find(
        (section) => section.code === selected.sourceSectionCode
      )?.fields ?? []
    );
  }, [selected]);
  const addSection = () => {
    if (!selected) return;
    onAddSection(selected.id);
    onClose();
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      aria-labelledby="admission-form-section-library-title"
      sx={{ zIndex: (theme) => theme.zIndex.modal + 1 }}
      PaperProps={{ sx: { width: { xs: 1, sm: 520 }, maxWidth: 1 } }}
    >
      <Stack sx={{ height: 1, minHeight: 0 }}>
        <Stack
          direction="row"
          alignItems="flex-start"
          justifyContent="space-between"
          spacing={1}
          sx={{ p: 2 }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography id="admission-form-section-library-title" variant="h6">
              Add a ready-made section
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Add a complete group of editable fields
              {targetLabel ? ` beside ${targetLabel}` : ''}.
            </Typography>
          </Box>
          <IconButton aria-label="Close section library" onClick={onClose}>
            <Iconify icon="mdi:close" />
          </IconButton>
        </Stack>
        <Divider />

        <Stack spacing={1.5} sx={{ p: 2, flexShrink: 0 }}>
          <TextField
            fullWidth
            size="small"
            label="Search section templates"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            InputProps={{
              startAdornment: <Iconify icon="mdi:magnify" width={20} sx={{ mr: 1 }} />,
            }}
          />
          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
            {(['All', ...ADMISSION_FORM_TEMPLATE_CATEGORIES] as const).map((item) => (
              <Chip
                key={item}
                clickable
                size="small"
                label={item}
                variant={category === item ? 'filled' : 'outlined'}
                color={category === item ? 'primary' : 'default'}
                onClick={() => setCategory(item)}
              />
            ))}
          </Stack>
        </Stack>

        <Scrollbar fillContent sx={{ flex: 1, minHeight: 0 }}>
          <Stack spacing={1} sx={{ px: 2, pb: 2 }}>
            {templates.map((template) => {
              const isSelected = template.id === selected?.id;
              return (
                <ButtonBase
                  key={template.id}
                  aria-pressed={isSelected}
                  onClick={() => setSelectedId(template.id)}
                  sx={{
                    width: 1,
                    minHeight: 76,
                    p: 1.5,
                    gap: 1.25,
                    alignItems: 'flex-start',
                    textAlign: 'left',
                    border: 1,
                    borderColor: isSelected ? 'primary.main' : 'divider',
                    borderRadius: 1.5,
                    bgcolor: isSelected ? 'action.selected' : 'background.paper',
                    '&:hover': { bgcolor: 'action.hover' },
                    '&:focus-visible': {
                      outline: 2,
                      outlineColor: 'primary.main',
                      outlineOffset: 2,
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      display: 'grid',
                      placeItems: 'center',
                      flexShrink: 0,
                      borderRadius: 1,
                      bgcolor: 'action.hover',
                      color: isSelected ? 'primary.main' : 'text.secondary',
                    }}
                  >
                    <Iconify icon={template.icon} width={20} />
                  </Box>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="subtitle2">{template.title}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {template.description}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {template.fieldCount} {template.fieldCount === 1 ? 'field' : 'fields'}
                    </Typography>
                  </Box>
                </ButtonBase>
              );
            })}
            {!templates.length && (
              <Box sx={{ py: 4, textAlign: 'center' }}>
                <Typography variant="subtitle2">No sections found</Typography>
                <Typography variant="body2" color="text.secondary">
                  Try another search or category.
                </Typography>
              </Box>
            )}

            {selected && (
              <Box sx={{ p: 2, borderRadius: 1.5, bgcolor: 'background.neutral' }}>
                <Typography variant="subtitle2">Included fields</Typography>
                <Stack spacing={0.5} sx={{ mt: 1 }}>
                  {selectedFields.map((field) => (
                    <Stack key={field.code} direction="row" spacing={1} alignItems="center">
                      <Iconify
                        icon="mdi:check-circle-outline"
                        width={17}
                        sx={{ color: 'success.main' }}
                      />
                      <Typography variant="body2">{field.label}</Typography>
                    </Stack>
                  ))}
                </Stack>
              </Box>
            )}
          </Stack>
        </Scrollbar>
        <Divider />
        <Stack direction="row" justifyContent="flex-end" spacing={1} sx={{ p: 2 }}>
          <Button variant="outlined" startIcon={<Iconify icon="mdi:close" />} onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="contained"
            startIcon={<Iconify icon="mdi:plus" />}
            disabled={!selected}
            onClick={addSection}
          >
            Add section
          </Button>
        </Stack>
      </Stack>
    </Drawer>
  );
}
