import { LoadingButton } from '@mui/lab';
import { libraryPaths } from 'src/constants/library-menus';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Box, Alert, Stack, Button, LinearProgress } from '@mui/material';

import { BorrowingRulesTable } from './BorrowingRulesTable';
import { BorrowingRulesActions } from './BorrowingRulesActions';
import { useBorrowingRulesEditor } from './useBorrowingRulesEditor';

import type { BorrowingRuleDto, BorrowingRulesValues } from './borrowing-rules';

export function BorrowingRulesEditor({
  items,
  canEdit,
  onSave,
  requestError,
  refreshing = false,
  onRetry,
  showHeader = true,
}: {
  items: BorrowingRuleDto[];
  canEdit: boolean;
  onSave: (values: BorrowingRulesValues) => Promise<void>;
  requestError?: string;
  refreshing?: boolean;
  onRetry?: () => void;
  showHeader?: boolean;
}) {
  const { formik, confirm, setConfirm, error, setError, reviewSave, navigationConfirmation } =
    useBorrowingRulesEditor(items, canEdit, onSave);

  return (
    <Box
      component="form"
      onSubmit={(event) => {
        event.preventDefault();
        reviewSave();
      }}
      sx={{ display: 'flex', flexDirection: 'column', height: 1, minHeight: 0 }}
    >
      {showHeader ? (
        <CustomBreadcrumbs
          heading="Borrowing Rules"
          description="Set the maximum concurrent loans and reservations for student and staff members."
          links={[{ name: 'Library', href: libraryPaths.dashboard }, { name: 'Borrowing Rules' }]}
          action={
            <BorrowingRulesActions
              canEdit={canEdit}
              dirty={formik.dirty}
              busy={formik.isSubmitting}
              onReset={() => setConfirm('reset')}
            />
          }
        />
      ) : (
        <Stack direction="row" justifyContent="flex-end">
          <BorrowingRulesActions
            canEdit={canEdit}
            dirty={formik.dirty}
            busy={formik.isSubmitting}
            onReset={() => setConfirm('reset')}
          />
        </Stack>
      )}
      <Stack spacing={2} sx={{ flex: 1, minHeight: 0, overflow: 'auto', p: 1 }}>
        {refreshing && <LinearProgress aria-label="Refreshing borrowing rules" />}
        {requestError && (
          <Alert
            severity="error"
            action={
              onRetry && (
                <Button size="small" onClick={onRetry}>
                  Retry
                </Button>
              )
            }
          >
            {requestError}
          </Alert>
        )}
        {error && <Alert severity="error">{error}</Alert>}
        {formik.initialValues.rules.some(
          (rule) => rule.maxBooksAtTime === '' || rule.reservationLimit === ''
        ) && (
          <Alert severity="info">
            Complete both limits for each member role before saving. Use 0 only when school policy
            prevents that action.
          </Alert>
        )}
        <BorrowingRulesTable formik={formik} disabled={!canEdit} />
      </Stack>
      {navigationConfirmation}
      <ConfirmDialog
        open={confirm !== null}
        onClose={() => {
          if (!formik.isSubmitting) setConfirm(null);
        }}
        disableEscapeKeyDown={formik.isSubmitting}
        disableCancel={formik.isSubmitting}
        disableBackdropClick={formik.isSubmitting}
        title={confirm === 'reset' ? 'Reset Borrowing Rules?' : 'Save Borrowing Rules?'}
        content={
          confirm === 'reset'
            ? 'Discard these changes and restore the last loaded limits?'
            : 'Apply these borrowing and reservation limits to this academic year?'
        }
        action={
          <LoadingButton
            size="small"
            variant="contained"
            color="inherit"
            loading={formik.isSubmitting}
            onClick={() => {
              if (confirm === 'reset') {
                formik.resetForm();
                setError('');
                setConfirm(null);
              } else formik.submitForm();
            }}
          >
            {confirm === 'reset' ? 'Reset' : 'Save'}
          </LoadingButton>
        }
      />
    </Box>
  );
}
