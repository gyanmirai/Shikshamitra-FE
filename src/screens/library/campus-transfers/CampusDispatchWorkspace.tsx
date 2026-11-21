'use client';

import type { CustodyCopy } from 'src/redux/library/custody-api';

import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';
import { useFormik, setNestedObjectValues } from 'formik';
import { Box, Alert, Stack, Button } from '@mui/material';
import { libraryPaths } from 'src/constants/library-menus';
import { FormBusyRegion } from 'src/components/form-busy-region';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useFormikErrorFocus } from 'src/hooks/use-formik-error-focus';
import { useUnsavedNavigation } from 'src/hooks/use-unsaved-navigation';
import {
  useGetTransferLocationsQuery,
  useLazyFindTransferCopiesQuery,
  useRecordCampusDispatchMutation,
  usePreviewCampusDispatchMutation,
} from 'src/redux/library/campus-transfer-api';

import { dispatchSchema } from './campus-transfer-validation';
import { StockCopyPicker } from '../circulation/StockCopyPicker';
import { useCampusTransferAccess } from './useCampusTransferAccess';
import { StockActionReview } from '../circulation/StockActionReview';
import CampusDispatchFields, { initialDispatch } from './CampusDispatchFields';
import { useReviewedStockAction } from '../circulation/useReviewedStockAction';

export default function CampusDispatchWorkspace() {
  const router = useRouter();
  const { canDispatch } = useCampusTransferAccess();
  const formik = useFormik({
    initialValues: { ...initialDispatch, copies: [] as CustodyCopy[] },
    validationSchema: dispatchSchema,
    onSubmit: (): Promise<void> => action.commit(),
  });
  useFormikErrorFocus(formik);
  const options = useGetTransferLocationsQuery(undefined, {
    skip: !canDispatch,
    refetchOnMountOrArgChange: true,
  });
  const [findCopies] = useLazyFindTransferCopiesQuery();
  const [previewDispatch] = usePreviewCampusDispatchMutation();
  const [recordDispatch] = useRecordCampusDispatchMutation();
  const sections = options.isError ? [] : (options.currentData ?? []);
  const canRoute = new Set(sections.map((row) => row.location.campusId)).size >= 2;
  const { copies: chosen, ...fields } = formik.values;
  const { sourceSectionId, destinationSectionId, destinationShelfId, reason } = fields;
  const destination = sections.find((row) => row.location.sectionId === destinationSectionId);
  const source = sections.find((row) => row.location.sectionId === sourceSectionId);
  const validRoute =
    source &&
    destination &&
    source.location.campusId !== destination.location.campusId &&
    destination.shelves.some((row) => row.id === destinationShelfId);
  const action = useReviewedStockAction({
    input: { ...fields, reason: reason.trim(), copyIds: chosen.map((copy) => copy.copyId) },
    allowed: canDispatch,
    previewRequest: (value) => previewDispatch(value).unwrap(),
    commitRequest: (value) => recordDispatch(value).unwrap(),
    workflow: 'campus transfer',
    staleCode: 'Library:CampusTransfers:010106',
  });
  const guard = useUnsavedNavigation(formik.dirty && !action.saved, {
    guardContextChanges: true,
    blockNavigation: action.busy,
    push: router.push,
    description: action.uncertain
      ? 'The outcome is unconfirmed. Retry this dispatch or check the transfer register.'
      : undefined,
  });
  const leave = () => guard.requestNavigation(() => router.push(libraryPaths.campusTransfers));
  const disabled = action.busy || action.uncertain;
  const review = async () => {
    const errors = await formik.validateForm();
    await formik.setTouched(setNestedObjectValues(errors, true), false);
    if (!Object.keys(errors).length && validRoute) await action.preview();
  };
  return (
    <Box sx={{ height: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
      <CustomBreadcrumbs
        heading="Dispatch Campus Transfer"
        isBack
        onBack={leave}
        backDisabled={action.busy}
        sx={{ px: 1 }}
        links={[
          { name: 'Library', href: libraryPaths.dashboard },
          { name: 'Campus Transfers', href: libraryPaths.campusTransfers, onClick: leave },
          { name: 'Dispatch' },
        ]}
      />
      <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto', p: 1 }}>
        <FormBusyRegion
          busy={action.busy || options.isFetching}
          showOverlay={false}
          label="Reviewing campus transfer"
        >
          <Stack spacing={2}>
            {action.error && <Alert severity="error">{action.error}</Alert>}
            {action.saved ? (
              <Alert
                severity="success"
                action={
                  <Button
                    component={RouterLink}
                    href={`${libraryPaths.campusTransfers}/${action.saved.id}`}
                    color="inherit"
                  >
                    Open transfer
                  </Button>
                }
              >
                {action.saved.copyCount} copies dispatched.
              </Alert>
            ) : options.isError ? (
              <Alert
                severity="error"
                action={<Button onClick={() => options.refetch()}>Retry</Button>}
              >
                Could not load campus locations.
              </Alert>
            ) : !options.isFetching && !canRoute ? (
              <Alert severity="info">
                Assign library sections at two active campuses in Section Management before
                dispatching copies.
              </Alert>
            ) : (
              <>
                <CampusDispatchFields
                  value={fields}
                  error={(field) => (formik.touched[field] ? formik.errors[field] : undefined)}
                  blur={(field) => formik.setFieldTouched(field, true)}
                  sections={sections}
                  disabled={disabled || !canRoute}
                  change={(next) => {
                    formik.setValues({
                      ...next,
                      copies: next.sourceSectionId === sourceSectionId ? chosen : [],
                    });
                  }}
                />
                <StockCopyPicker
                  key={sourceSectionId}
                  title="Copies to dispatch"
                  search={(search) => findCopies({ search, sourceSectionId }).unwrap()}
                  value={chosen}
                  onChange={(value) => formik.setFieldValue('copies', value)}
                  disabled={disabled || !source}
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
        sx={{
          p: 1,
          borderTop: 1,
          borderColor: 'divider',
          justifyContent: 'flex-end',
          flexWrap: 'wrap',
          gap: 1,
        }}
      >
        <Button size="small" variant="outlined" onClick={leave} disabled={action.busy}>
          {action.saved ? 'Back to transfers' : 'Cancel'}
        </Button>
        {!action.saved && canRoute && (
          <>
            <Button size="small" variant="outlined" disabled={disabled} onClick={review}>
              Preview dispatch
            </Button>
            <Button
              size="small"
              variant="contained"
              disabled={!action.canCommit}
              onClick={() => formik.submitForm()}
            >
              {action.uncertain ? 'Retry unchanged dispatch' : 'Dispatch reviewed copies'}
            </Button>
          </>
        )}
      </Stack>
      {guard.confirmation}
    </Box>
  );
}
