import type { AdmissionForm } from 'src/redux/student/admissions/admission-forms-api';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import { useMemo, useState } from 'react';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import { Iconify } from 'src/components/iconify';
import Typography from '@mui/material/Typography';
import ButtonBase from '@mui/material/ButtonBase';
import DialogActions from '@mui/material/DialogActions';
import { useDebounceEffect } from 'src/hooks/use-debounce';
import CircularProgress from '@mui/material/CircularProgress';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { useGetAdmissionFormsQuery } from 'src/redux/student/admissions/admission-forms-api';

import {
  getSystemAdmissionFormTemplate,
  SYSTEM_ADMISSION_FORM_TEMPLATES,
  ADMISSION_FORM_TEMPLATE_CATEGORIES,
  type AdmissionFormTemplateCategory,
  type SystemAdmissionFormTemplateId,
} from '../admission-form-template-catalog';

type Selection =
  { source: 'system'; id: SystemAdmissionFormTemplateId } | { source: 'school'; id: string };

type Props = {
  open: boolean;
  applying: boolean;
  onClose: () => void;
  onUseSystemTemplate: (id: SystemAdmissionFormTemplateId) => void;
  onUseSchoolForm: (form: AdmissionForm) => void;
};

function TemplateListItem({
  selected,
  title,
  description,
  icon,
  meta,
  onClick,
}: {
  selected: boolean;
  title: string;
  description: string;
  icon: string;
  meta: string;
  onClick: () => void;
}) {
  return (
    <ButtonBase
      aria-pressed={selected}
      onClick={onClick}
      sx={{
        width: 1,
        minHeight: 88,
        p: 1.5,
        gap: 1.5,
        textAlign: 'left',
        alignItems: 'flex-start',
        border: 1,
        borderColor: selected ? 'primary.main' : 'divider',
        borderRadius: 1.5,
        bgcolor: selected ? 'action.selected' : 'background.paper',
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
          width: 40,
          height: 40,
          display: 'grid',
          placeItems: 'center',
          flexShrink: 0,
          borderRadius: 1,
          bgcolor: 'action.hover',
          color: selected ? 'primary.main' : 'text.secondary',
        }}
      >
        <Iconify icon={icon} width={22} />
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="subtitle2">{title}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
          {description}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.75, display: 'block' }}>
          {meta}
        </Typography>
      </Box>
    </ButtonBase>
  );
}

export function FormTemplateLibraryDialog({
  open,
  applying,
  onClose,
  onUseSystemTemplate,
  onUseSchoolForm,
}: Props) {
  const [source, setSource] = useState<'system' | 'school'>('system');
  const [category, setCategory] = useState<AdmissionFormTemplateCategory | 'All'>('All');
  const [searchInput, setSearchInput] = useState('');
  const [schoolSearch, setSchoolSearch] = useState('');
  const [selection, setSelection] = useState<Selection>({
    source: 'system',
    id: 'admission-application',
  });

  useDebounceEffect(() => setSchoolSearch(searchInput.trim()), 350, [searchInput]);

  const schoolForms = useGetAdmissionFormsQuery(
    {
      search: schoolSearch || undefined,
      skipCount: 0,
      maxResultCount: 50,
    },
    { skip: !open || source !== 'school' }
  );
  const normalizedSearch = searchInput.trim().toLowerCase();
  const systemTemplates = useMemo(
    () =>
      SYSTEM_ADMISSION_FORM_TEMPLATES.filter((template) => {
        const categoryMatches = category === 'All' || template.category === category;
        const searchMatches =
          !normalizedSearch ||
          [template.title, template.description, template.bestFor, template.category].some(
            (value) => value.toLowerCase().includes(normalizedSearch)
          );
        return categoryMatches && searchMatches;
      }),
    [category, normalizedSearch]
  );
  const selectedSystem =
    selection.source === 'system'
      ? SYSTEM_ADMISSION_FORM_TEMPLATES.find((item) => item.id === selection.id)
      : undefined;
  const selectedSchool =
    selection.source === 'school'
      ? schoolForms.data?.items.find((item) => item.id === selection.id)
      : undefined;
  const selectedSystemSections = useMemo(
    () => (selectedSystem ? getSystemAdmissionFormTemplate(selectedSystem.id).sections : []),
    [selectedSystem]
  );
  const selectedTitle = selectedSystem?.title ?? selectedSchool?.name;
  const selectedDescription = selectedSystem?.description ?? selectedSchool?.description;
  const selectedSections = selectedSystemSections.length
    ? selectedSystemSections
    : (selectedSchool?.sections ?? []);
  const selectedFieldCount = selectedSystem
    ? selectedSystem.fieldCount
    : selectedSections.reduce((count, section) => count + section.fields.length, 0);
  const chooseSource = (value: 'system' | 'school') => {
    setSource(value);
    setSearchInput('');
    if (value === 'system') setSelection({ source: 'system', id: 'admission-application' });
    else setSelection({ source: 'school', id: '' });
  };
  const useSelected = () => {
    if (selection.source === 'system') onUseSystemTemplate(selection.id);
    else if (selectedSchool) onUseSchoolForm(selectedSchool);
  };

  return (
    <CustomDialog
      open={open}
      handleClose={onClose}
      title="Choose a form template"
      maxWidth="lg"
      hasForm={false}
      guardUnsavedChanges={false}
      disableClose={applying}
      paperProps={{ sx: { height: { xs: '100dvh', sm: 'min(820px, 92dvh)' } } }}
    >
      <DialogScrollContent
        sx={{ p: 0, minHeight: 0 }}
        scrollBarProps={{ fillContent: true, sx: { flex: 1, minHeight: 0 } }}
      >
        <Stack sx={{ minHeight: 1 }}>
          <Box sx={{ px: { xs: 2, sm: 3 }, pt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Start with a proven structure or reuse a form already saved by your school. You can
              edit every section and field before saving.
            </Typography>
            <Tabs
              value={source}
              onChange={(_, value: 'system' | 'school') => chooseSource(value)}
              aria-label="Template source"
              sx={{ mt: 1.5 }}
            >
              <Tab value="system" label="Ready-made templates" />
              <Tab value="school" label="Your school forms" />
            </Tabs>
          </Box>
          <Divider />

          <Stack spacing={1.5} sx={{ px: { xs: 2, sm: 3 }, py: 2 }}>
            <TextField
              fullWidth
              size="small"
              label={source === 'system' ? 'Search templates' : 'Search your school forms'}
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              InputProps={{
                startAdornment: <Iconify icon="mdi:magnify" width={20} sx={{ mr: 1 }} />,
                endAdornment:
                  source === 'school' && schoolForms.isFetching ? (
                    <CircularProgress size={18} aria-label="Searching school forms" />
                  ) : undefined,
              }}
            />
            {source === 'system' && (
              <Stack
                direction="row"
                spacing={1}
                useFlexGap
                flexWrap="wrap"
                aria-label="Template categories"
              >
                {(['All', ...ADMISSION_FORM_TEMPLATE_CATEGORIES] as const).map((item) => (
                  <Chip
                    key={item}
                    label={item}
                    clickable
                    variant={category === item ? 'filled' : 'outlined'}
                    color={category === item ? 'primary' : 'default'}
                    onClick={() => setCategory(item)}
                  />
                ))}
              </Stack>
            )}
          </Stack>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: 'minmax(0, 1fr)',
                md: 'minmax(0, 1.15fr) minmax(300px, 0.85fr)',
              },
              gap: 0,
              minHeight: 430,
              borderTop: 1,
              borderColor: 'divider',
            }}
          >
            <Stack spacing={1.25} sx={{ p: { xs: 2, sm: 3 }, minWidth: 0 }}>
              {source === 'system' &&
                systemTemplates.map((template) => (
                  <TemplateListItem
                    key={template.id}
                    selected={selection.source === 'system' && selection.id === template.id}
                    title={template.title}
                    description={template.description}
                    icon={template.icon}
                    meta={`${template.sectionCount} sections · ${template.fieldCount} fields · About ${template.estimatedMinutes} min`}
                    onClick={() => setSelection({ source: 'system', id: template.id })}
                  />
                ))}
              {source === 'system' && !systemTemplates.length && (
                <Alert severity="info">No templates match this search and category.</Alert>
              )}
              {source === 'school' && schoolForms.isLoading && (
                <Stack alignItems="center" spacing={1} sx={{ py: 6 }} aria-busy="true">
                  <CircularProgress size={28} aria-label="Loading school forms" />
                  <Typography variant="body2" color="text.secondary">
                    Loading your school forms…
                  </Typography>
                </Stack>
              )}
              {source === 'school' && schoolForms.isError && (
                <Alert
                  severity="error"
                  action={
                    <Button color="inherit" size="small" onClick={() => schoolForms.refetch()}>
                      Retry
                    </Button>
                  }
                >
                  Your school forms could not be loaded. Try again.
                </Alert>
              )}
              {source === 'school' &&
                schoolForms.data?.items.map((form) => (
                  <TemplateListItem
                    key={form.id}
                    selected={selection.source === 'school' && selection.id === form.id}
                    title={form.name}
                    description={
                      form.description || 'Reuse this saved school form as a new editable draft.'
                    }
                    icon="mdi:school-outline"
                    meta={`${form.sectionCount} ${form.sectionCount === 1 ? 'section' : 'sections'} · Version ${form.version}`}
                    onClick={() => setSelection({ source: 'school', id: form.id })}
                  />
                ))}
              {source === 'school' &&
                schoolForms.data &&
                schoolForms.data.totalCount > schoolForms.data.items.length && (
                  <Typography variant="caption" color="text.secondary">
                    Showing the first {schoolForms.data.items.length} of{' '}
                    {schoolForms.data.totalCount} forms. Search by name or code to find another
                    form.
                  </Typography>
                )}
              {source === 'school' &&
                schoolForms.data &&
                !schoolForms.isFetching &&
                !schoolForms.data.items.length && (
                  <Alert severity="info">
                    {schoolSearch
                      ? 'No school forms match this search.'
                      : 'No saved school forms are available yet. Start with a ready-made template.'}
                  </Alert>
                )}
            </Stack>

            <Box
              component="aside"
              aria-label="Template preview"
              sx={{
                minWidth: 0,
                p: { xs: 2, sm: 3 },
                borderLeft: { md: 1 },
                borderTop: { xs: 1, md: 0 },
                borderColor: 'divider',
                bgcolor: 'background.neutral',
              }}
            >
              {selectedTitle ? (
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="overline" color="text.secondary">
                      Preview
                    </Typography>
                    <Typography variant="h6">{selectedTitle}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      {selectedDescription || 'A saved form from your school.'}
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                    <Chip
                      size="small"
                      label={`${selectedSections.length || selectedSchool?.sectionCount || 0} sections`}
                    />
                    <Chip size="small" label={`${selectedFieldCount} fields`} />
                    {selectedSystem && (
                      <Chip
                        size="small"
                        variant="outlined"
                        label={`About ${selectedSystem.estimatedMinutes} min`}
                      />
                    )}
                  </Stack>
                  {selectedSystem?.bestFor && (
                    <Box>
                      <Typography variant="subtitle2">Best for</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {selectedSystem.bestFor}
                      </Typography>
                    </Box>
                  )}
                  <Box>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      Included sections
                    </Typography>
                    {selectedSections.length ? (
                      <Stack spacing={0.75}>
                        {selectedSections.map((section, index) => (
                          <Stack
                            key={`${section.code}-${index}`}
                            direction="row"
                            spacing={1}
                            alignItems="center"
                          >
                            <Iconify
                              icon="mdi:check-circle-outline"
                              width={18}
                              sx={{ color: 'success.main', flexShrink: 0 }}
                            />
                            <Typography variant="body2">
                              {section.name} · {section.fields.length}{' '}
                              {section.fields.length === 1 ? 'field' : 'fields'}
                            </Typography>
                          </Stack>
                        ))}
                      </Stack>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Select this form to load its complete structure before creating your copy.
                      </Typography>
                    )}
                  </Box>
                  {selectedSchool && (
                    <Alert severity="info">
                      The original school form and its published versions will not be changed.
                    </Alert>
                  )}
                </Stack>
              ) : (
                <Stack spacing={1} alignItems="center" sx={{ py: 6, textAlign: 'center' }}>
                  <Iconify
                    icon="mdi:file-search-outline"
                    width={36}
                    sx={{ color: 'text.disabled' }}
                  />
                  <Typography variant="subtitle2">Select a form to preview</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Review its purpose and structure before creating your draft.
                  </Typography>
                </Stack>
              )}
            </Box>
          </Box>
        </Stack>
      </DialogScrollContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button
          variant="outlined"
          startIcon={<Iconify icon="mdi:close" />}
          onClick={onClose}
          disabled={applying}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          startIcon={
            applying ? <CircularProgress size={18} color="inherit" /> : <Iconify icon="mdi:check" />
          }
          disabled={!selectedTitle || applying}
          onClick={useSelected}
        >
          {selection.source === 'school' ? 'Use school form' : 'Use template'}
        </Button>
      </DialogActions>
    </CustomDialog>
  );
}
