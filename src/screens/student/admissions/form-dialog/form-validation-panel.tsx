import type { CreateUpdateAdmissionForm } from 'src/redux/student/admissions/admission-forms-api';

import { useState } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Popover from '@mui/material/Popover';
import Divider from '@mui/material/Divider';
import { Iconify } from 'src/components/iconify';
import Typography from '@mui/material/Typography';

import { useFormBuilderIssues } from './hooks/use-form-builder-issues';

export { getBuilderIssues } from './form-builder-issues';

type Props = { form: CreateUpdateAdmissionForm; onSelectField?: (fieldId: string) => void };

export function FormValidationPanel({ form, onSelectField }: Props) {
  const issues = useFormBuilderIssues(form);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const open = Boolean(anchorEl);

  return (
    <>
      <Button
        type="button"
        size="small"
        color={issues.length ? 'warning' : 'success'}
        variant="text"
        startIcon={
          <Iconify
            icon={issues.length ? 'mdi:information-outline' : 'mdi:check-circle-outline'}
            width={18}
          />
        }
        endIcon={<Iconify icon="mdi:chevron-down" width={16} />}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? 'form-checks-popover' : undefined}
        onClick={(event) => setAnchorEl(event.currentTarget)}
        sx={{
          minWidth: 0,
          minHeight: { xs: 44, lg: 32 },
          px: 0.5,
          justifyContent: 'flex-start',
          whiteSpace: 'nowrap',
        }}
      >
        {issues.length
          ? `${issues.length} ${issues.length === 1 ? 'check' : 'checks'} to review`
          : 'Form checks passed'}
      </Button>

      <Popover
        id="form-checks-popover"
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        slotProps={{
          paper: {
            sx: {
              width: 360,
              maxWidth: 'calc(100vw - 32px)',
              mt: 0.5,
              borderRadius: 1.5,
            },
          },
        }}
      >
        <Box sx={{ p: 1.5 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Iconify
              icon={issues.length ? 'mdi:information-outline' : 'mdi:check-circle-outline'}
              color={issues.length ? 'warning.main' : 'success.main'}
              width={20}
            />
            <Typography variant="subtitle2">
              {issues.length
                ? `${issues.length} ${issues.length === 1 ? 'item' : 'items'} to review`
                : 'Form checks passed'}
            </Typography>
          </Stack>
          <Divider sx={{ my: 1 }} />
          <Stack spacing={0.5} sx={{ maxHeight: 220, overflowY: 'auto' }}>
            {issues.map((issue, index) =>
              issue.fieldId && onSelectField ? (
                <Button
                  key={issue.message + index}
                  type="button"
                  size="small"
                  color="inherit"
                  startIcon={<Iconify icon="mdi:arrow-right" />}
                  sx={{ justifyContent: 'flex-start', textAlign: 'left' }}
                  onClick={() => {
                    if (issue.fieldId) {
                      onSelectField(issue.fieldId);
                      setAnchorEl(null);
                    }
                  }}
                >
                  {issue.message}
                </Button>
              ) : (
                <Typography key={issue.message + index} variant="body2">
                  {issue.message}
                </Typography>
              )
            )}
            {!issues.length && (
              <Typography variant="body2" color="text.secondary">
                No structural issues were found. You can continue reviewing or save this draft.
              </Typography>
            )}
            <Typography variant="caption" color="text.secondary">
              Review these items before publishing. Save draft keeps your form private.
            </Typography>
          </Stack>
        </Box>
      </Popover>
    </>
  );
}
