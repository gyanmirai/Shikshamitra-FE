import type {
  InstituteFieldFormatting,
  InstituteFormattingScope,
} from 'src/redux/InstituteSetup/institute-field-formatting-api';

import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { CustomPopover } from 'src/components/custom-popover';
import { FormSectionHeader } from 'src/components/form-section-card/section-header';
import { Box, Alert, Stack, Button, Typography, IconButton, DialogActions } from '@mui/material';
import { AcademicFieldFormattingFields } from 'src/components/academic-setup/academic-field-formatting-fields';
import { AcademicFieldFormattingPreview } from 'src/components/academic-setup/academic-field-formatting-preview';

import { useFormattingEditor } from './use-formatting-editor';
import { INSTITUTE_FORMATTING_CONFIG } from './formatting-config';

type Props = {
  id: string;
  scope: InstituteFormattingScope;
  anchorEl: HTMLElement;
  settings: InstituteFieldFormatting;
  onClose: () => void;
};

export function InstituteFormattingForm({ id, scope, anchorEl, settings, onClose }: Props) {
  const editor = useFormattingEditor(scope, settings, onClose);
  return (
    <>
      <CustomPopover
        open
        anchorEl={anchorEl}
        onClose={editor.close}
        slotProps={{
          arrow: { placement: 'top-right' },
          paper: {
            id,
            role: 'dialog',
            'aria-labelledby': `${id}-title`,
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
              descriptionTooltip="Choose how text in new entries is saved for this school."
              titleTypographyProps={{ id: `${id}-title` }}
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
              fields={INSTITUTE_FORMATTING_CONFIG[scope].fields}
              field={editor.field}
              mode={editor.formik.values[editor.field]}
              disabled={editor.isSaving}
              onFieldChange={editor.selectField}
              onModeChange={(mode) => editor.formik.setFieldValue(editor.field, mode)}
            />
            <AcademicFieldFormattingPreview
              scope={scope}
              value={editor.example}
              mode={editor.formik.values[editor.field]}
              disabled={editor.isSaving}
              onChange={editor.setExample}
            />
            <Typography variant="caption" color="text.secondary">
              Applies to new entries after saving. Existing saved values keep their current format.
              {scope === 'schoolIdentity' &&
                ' New or changed signature details use the selected format.'}
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
