'use client';

import type { RootState } from 'src/redux/store';
import type { CustodyHandoffInput } from 'src/redux/library/custody-api';

import * as Yup from 'yup';
import { useSelector } from 'react-redux';
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';
import { Box, Alert, Stack, Button } from '@mui/material';
import { useFormik, setNestedObjectValues } from 'formik';
import { libraryPaths } from 'src/constants/library-menus';
import { FormBusyRegion } from 'src/components/form-busy-region';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useUnsavedNavigation } from 'src/hooks/use-unsaved-navigation';
import {
  useGetCustodyOptionsQuery,
  useLazyFindCustodyCopiesQuery,
  useCommitCustodyHandoffMutation,
  usePreviewCustodyHandoffMutation,
} from 'src/redux/library/custody-api';

import { useCustodyAccess } from './useCustodyAccess';
import { CustodyHandoffFields } from './CustodyHandoffFields';
import { StockCopyPicker } from '../circulation/StockCopyPicker';
import { StockActionReview } from '../circulation/StockActionReview';
import { useReviewedStockAction } from '../circulation/useReviewedStockAction';

import type { CustodyFields } from './CustodyHandoffFields';

const initialValues: CustodyFields = {
  academicYearId: '',
  employeeId: '',
  standardId: '',
  roomId: '',
  purpose: '',
  handedOffOn: '',
  expectedReturnOn: '',
  copies: [],
};
const schema = Yup.object({
  employeeId: Yup.string().required('Choose a custodian.'),
  purpose: Yup.string()
    .trim()
    .required('Enter the purpose of this handoff.')
    .max(500, 'Use up to 500 characters.'),
  handedOffOn: Yup.string().required('Enter the date the copies were handed off.'),
  copies: Yup.array().min(1, 'Choose at least one copy.').max(100, 'Choose up to 100 copies.'),
  expectedReturnOn: Yup.string().test(
    'date-order',
    'Expected return must be on or after the handoff.',
    function valid(value) {
      return !value || !this.parent.handedOffOn || value >= this.parent.handedOffOn;
    }
  ),
});

export default function CustodyHandoffWorkspace() {
  const router = useRouter();
  const { canHandoff } = useCustodyAccess();
  const currentYear = useSelector(
    (state: RootState) => (state.globalState.currentYear as { id?: string })?.id
  );
  const formik = useFormik({ initialValues, validationSchema: schema, onSubmit: () => undefined });
  const { copies: chosen, ...fields } = formik.values;
  const year = formik.values.academicYearId || currentYear || '';
  const options = useGetCustodyOptionsQuery(year, {
    skip: !canHandoff || !year,
    refetchOnMountOrArgChange: true,
  });
  const [previewRequest] = usePreviewCustodyHandoffMutation();
  const [commitRequest] = useCommitCustodyHandoffMutation();
  const [searchCopies] = useLazyFindCustodyCopiesQuery();
  const input: CustodyHandoffInput = {
    ...fields,
    academicYearId: year,
    standardId: formik.values.standardId || null,
    roomId: formik.values.roomId || null,
    expectedReturnOn: formik.values.expectedReturnOn || null,
    copyIds: chosen.map((copy) => copy.copyId),
  };
  const action = useReviewedStockAction({
    input,
    allowed: canHandoff && Boolean(options.currentData) && !options.isError,
    previewRequest: (request) => previewRequest(request).unwrap(),
    commitRequest: (command) => commitRequest(command).unwrap(),
  });
  const guard = useUnsavedNavigation(formik.dirty && !action.saved, {
    guardContextChanges: true,
    blockNavigation: action.busy,
    push: router.push,
    description: action.uncertain
      ? 'The handoff outcome is unconfirmed. Retry unchanged here or review the custody register.'
      : undefined,
  });
  const leave = () => guard.requestNavigation(() => router.push(libraryPaths.custody));
  const disabled = action.busy || action.uncertain;
  const preview = async () => {
    const errors = await formik.validateForm();
    await formik.setTouched(setNestedObjectValues(errors, true), false);
    if (!Object.keys(errors).length) await action.preview();
  };
  return (
    <>
      <Box sx={{ height: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        <CustomBreadcrumbs
          heading="Hand Off Classroom Copies"
          isBack
          onBack={leave}
          backDisabled={action.busy}
          links={[
            { name: 'Library', href: libraryPaths.dashboard },
            { name: 'Classroom Custody', href: libraryPaths.custody, onClick: leave },
            { name: 'Hand Off Copies' },
          ]}
          sx={{ px: 1 }}
        />
        <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto', p: 1 }}>
          <FormBusyRegion
            busy={action.busy}
            showOverlay={false}
            label="Reviewing classroom handoff"
          >
            <Stack spacing={2}>
              {action.error && <Alert severity="error">{action.error}</Alert>}
              {action.saved ? (
                <Alert
                  severity="success"
                  action={
                    <Button
                      component={RouterLink}
                      href={`${libraryPaths.custody}/${encodeURIComponent(action.saved.id)}`}
                      color="inherit"
                      size="small"
                    >
                      View handoff
                    </Button>
                  }
                >
                  {action.saved.copyCount} copies recorded in the custody of{' '}
                  {action.saved.custodian}.
                </Alert>
              ) : (
                <>
                  <CustodyHandoffFields
                    formik={formik}
                    year={year}
                    options={options}
                    disabled={disabled}
                  />
                  <StockCopyPicker
                    title="Copies to hand off"
                    search={(term) => searchCopies(term).unwrap()}
                    value={chosen}
                    onChange={(selection) => formik.setFieldValue('copies', selection)}
                    disabled={disabled || !options.currentData || options.isError}
                    error={
                      formik.touched.copies && typeof formik.errors.copies === 'string'
                        ? formik.errors.copies
                        : undefined
                    }
                  />
                  <StockActionReview review={action.review} />
                </>
              )}
            </Stack>
          </FormBusyRegion>
        </Box>
        <Stack
          direction="row"
          spacing={1}
          justifyContent="flex-end"
          flexWrap="wrap"
          sx={{ p: 1, borderTop: 1, borderColor: 'divider', rowGap: 1 }}
        >
          <Button
            variant="outlined"
            size="small"
            color="inherit"
            disabled={action.busy}
            onClick={leave}
          >
            {action.saved ? 'Back to custody' : 'Cancel'}
          </Button>
          {!action.saved && (
            <>
              <Button
                variant="outlined"
                size="small"
                color="inherit"
                disabled={disabled || !options.currentData || options.isError}
                onClick={preview}
              >
                Preview handoff
              </Button>
              <Button
                variant="contained"
                size="small"
                color="inherit"
                disabled={!action.canCommit}
                onClick={action.commit}
              >
                {action.uncertain ? 'Retry unchanged handoff' : 'Hand off reviewed copies'}
              </Button>
            </>
          )}
        </Stack>
      </Box>
      {guard.confirmation}
    </>
  );
}
