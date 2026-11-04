import type { CreateUpdateAdmissionForm } from 'src/redux/student/admissions/admission-forms-api';

import Box from '@mui/material/Box';
import List from '@mui/material/List';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import ListItem from '@mui/material/ListItem';
import { Iconify } from 'src/components/iconify';
import Typography from '@mui/material/Typography';

import { useFormBuilderIssues } from '../hooks/use-form-builder-issues';

type Props = { form: CreateUpdateAdmissionForm; onEditFields: () => void };

export function FormReviewChecks({ form, onEditFields }: Props) {
  const issues = useFormBuilderIssues(form);
  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
      <Stack direction="row" alignItems="flex-start" spacing={1}>
        <Iconify
          icon={issues.length ? 'mdi:information-outline' : 'mdi:check-circle-outline'}
          sx={{ mt: 0.5, color: issues.length ? 'warning.main' : 'success.main' }}
        />
        <Box>
          <Typography variant="subtitle1">
            {issues.length
              ? `${issues.length} ${issues.length === 1 ? 'item' : 'items'} to review before publishing`
              : 'Form Checks Passed'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {issues.length
              ? 'Review These Items Before Publishing. Your Form Stays Private When Saved as a Draft.'
              : 'No Issues Found in This Review. The Form Will Be Checked Again Before Publishing.'}
          </Typography>
        </Box>
      </Stack>
      {!!issues.length && (
        <>
          <List dense disablePadding sx={{ mt: 1 }}>
            {issues.map((issue, index) => (
              <ListItem key={`${issue.message}-${index}`} sx={{ py: 0.5, pl: 3.5 }}>
                <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>
                  {issue.message}
                </Typography>
              </ListItem>
            ))}
          </List>
          <Button
            size="small"
            color="inherit"
            onClick={onEditFields}
            sx={{ mt: 1, minHeight: 44 }}
            startIcon={<Iconify icon="mdi:arrow-left" />}
          >
            Return to Builder
          </Button>
        </>
      )}
    </Paper>
  );
}
