import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { CustomPopover } from 'src/components/custom-popover';
import { FormSectionHeader } from 'src/components/form-section-card/section-header';
import { Box, Alert, Stack, Button, Typography, IconButton, DialogActions } from '@mui/material';

import { AcademicFieldFormattingFields } from './academic-field-formatting-fields';
import { AcademicFieldFormattingPreview } from './academic-field-formatting-preview';
import { useAcademicFieldFormattingSettings } from './use-academic-field-formatting-settings';

import type { AcademicFieldFormatting } from './academic-field-formatting-model';

type Props = { anchorEl: HTMLElement; settings: AcademicFieldFormatting; onClose: () => void };

export function AcademicFieldFormattingForm({ anchorEl, settings, onClose }: Props) {
  const editor = useAcademicFieldFormattingSettings(settings, onClose);
  return (
    <>
      <CustomPopover
        open
        anchorEl={anchorEl}
        onClose={editor.close}
        slotProps={{
          arrow: { placement: 'top-right' },
          paper: {
            id: 'academic-field-formatting',
            role: 'dialog',
            'aria-labelledby': 'academic-field-formatting-title',
            sx: { width: { xs: 'calc(100vw - 32px)', sm: 550 }, maxWidth: 'calc(100vw - 32px)' },
          },
        }}
      >
        <Box
          component="form"
          onSubmit={editor.formik.handleSubmit}
          aria-busy={editor.isSaving}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            maxHeight: 'calc(100dvh - 48px)',
            overflow: 'hidden',
            borderRadius: 'inherit',
          }}
        >
          <Box sx={{ px: 2, py: 1.5, borderBottom: 1, borderColor: 'divider', flexShrink: 0 }}>
            <FormSectionHeader
              title="Field Formatting"
              icon={GlobalIcons.academicTextCase}
              descriptionTooltip="Choose the text case used when new academic names are saved for this school."
              titleTypographyProps={{ id: 'academic-field-formatting-title' }}
              action={
                <IconButton
                  size="small"
                  aria-label="Close Field Formatting"
                  disabled={editor.isSaving}
                  onClick={editor.close}
                >
                  <Iconify icon={GlobalIcons.cancel} />
                </IconButton>
              }
            />
          </Box>
          <Stack spacing={2} sx={{ p: 2, overflowY: 'auto', minHeight: 0 }}>
            {editor.error && <Alert severity="error">{editor.error}</Alert>}
            <AcademicFieldFormattingFields
              selectedFields={editor.selectedFields}
              mode={editor.mode}
              disabled={editor.isSaving}
              onFieldsChange={editor.selectFields}
              onModeChange={editor.applyMode}
            />
            {editor.mode !== null && (
              <AcademicFieldFormattingPreview
                value={editor.example}
                mode={editor.mode}
                disabled={editor.isSaving}
                onChange={editor.setExample}
              />
            )}
            <Typography variant="caption" color="text.secondary">
              Applies to new entries after saving. Existing saved values keep their current format.
            </Typography>
          </Stack>
          <DialogActions sx={{ p: 2, borderTop: 1, borderColor: 'divider', flexShrink: 0 }}>
            <Typography variant="caption" color="text.secondary" sx={{ mr: 'auto' }}>
              {editor.formik.dirty ? 'Unsaved changes' : 'Current school settings'}
            </Typography>
            <Button
              type="button"
              size="small"
              variant="outlined"
              disabled={editor.isSaving}
              onClick={editor.close}
              startIcon={<Iconify icon={GlobalIcons.cancel} />}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="small"
              variant="contained"
              loading={editor.isSaving}
              disabled={!editor.formik.dirty || editor.isSaving}
              startIcon={<Iconify icon={GlobalIcons.submit} />}
            >
              Submit
            </Button>
          </DialogActions>
        </Box>
      </CustomPopover>
      {editor.confirmation}
    </>
  );
}
