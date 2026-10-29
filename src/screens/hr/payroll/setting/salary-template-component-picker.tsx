import type { SalaryTemplateComponentCatalogItem } from 'src/redux/hr/salary-template-api';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { useRef, useState, useEffect, useCallback } from 'react';
import ShakingTextField from 'src/components/shaking-text-field';
import { FormSectionCard } from 'src/components/form-section-card';
import { useUnsavedNavigation } from 'src/hooks/use-unsaved-navigation';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { Box, Alert, Button, DialogActions, LinearProgress } from '@mui/material';

type Props = {
  kind: 'EARNING' | 'DEDUCTION';
  options: SalaryTemplateComponentCatalogItem[];
  allComponentsAdded: boolean;
  canCreate: boolean;
  createHref: string;
  onCreate?: () => void;
  blocked: boolean;
  refresh: () => Promise<void>;
  onSubmit: (component: SalaryTemplateComponentCatalogItem) => void;
  onClose: () => void;
};

export default function SalaryTemplateComponentPicker({
  kind,
  options,
  allComponentsAdded,
  canCreate,
  createHref,
  onCreate,
  blocked,
  refresh,
  onSubmit,
  onClose,
}: Props) {
  const componentKind = kind === 'EARNING' ? 'earning' : 'deduction';
  const [refreshing, setRefreshing] = useState(true);
  const [refreshError, setRefreshError] = useState(false);
  const queued = useRef(true);
  const pending = useRef(false);
  const submitted = useRef(false);
  const mounted = useRef(false);
  const leftSetup = useRef(false);
  const blockedRef = useRef(blocked);
  blockedRef.current = blocked;
  const selectionRef = useRef<HTMLInputElement>(null);

  const reload = useCallback(async () => {
    if (blockedRef.current) {
      queued.current = true;
      setRefreshing(true);
      return;
    }
    if (pending.current) return;
    queued.current = false;
    pending.current = true;
    setRefreshing(true);
    setRefreshError(false);
    try {
      await refresh();
    } catch {
      if (mounted.current) setRefreshError(true);
    } finally {
      pending.current = false;
      if (mounted.current) setRefreshing(false);
    }
  }, [refresh]);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (!blocked && queued.current) reload();
  }, [blocked, reload]);

  useEffect(() => {
    if (onCreate) return undefined;
    const leave = () => {
      leftSetup.current = true;
    };
    const resume = () => {
      if (!leftSetup.current || document.visibilityState === 'hidden') return;
      leftSetup.current = false;
      reload();
    };
    const visibility = () => {
      if (document.visibilityState === 'hidden') leave();
      else resume();
    };
    window.addEventListener('blur', leave);
    window.addEventListener('focus', resume);
    document.addEventListener('visibilitychange', visibility);
    return () => {
      window.removeEventListener('blur', leave);
      window.removeEventListener('focus', resume);
      document.removeEventListener('visibilitychange', visibility);
    };
  }, [onCreate, reload]);

  const formik = useFormik({
    initialValues: { componentId: '' },
    validationSchema: Yup.object({
      componentId: Yup.string()
        .required('Choose a payroll component.')
        .test('available', 'Choose an available payroll component.', (id) =>
          options.some((option) => option.componentId === id)
        ),
    }),
    onSubmit: async ({ componentId }) => {
      if (
        blockedRef.current ||
        pending.current ||
        queued.current ||
        refreshError ||
        submitted.current
      )
        return;
      const component = options.find((option) => option.componentId === componentId);
      if (component) {
        submitted.current = true;
        onSubmit(component);
      }
    },
  });
  const { componentId } = formik.values;
  const { setFieldValue } = formik;
  useEffect(() => {
    if (
      !refreshing &&
      !refreshError &&
      componentId &&
      !options.some((option) => option.componentId === componentId)
    ) {
      setFieldValue('componentId', '', false);
    }
  }, [componentId, options, refreshing, refreshError, setFieldValue]);

  const { requestNavigation, confirmation } = useUnsavedNavigation(formik.dirty, {
    blockNavigation: blocked || formik.isSubmitting,
    renderConfirmation: (keepEditing, discard) => (
      <ConfirmDialog
        open
        title="Discard Unsaved Changes?"
        icon="warning"
        content="Discard this component selection? Your salary template entries will stay here."
        cancelText="Keep editing"
        onClose={keepEditing}
        disableBackdropClick
        action={
          <Button
            type="button"
            size="small"
            variant="contained"
            color="error"
            startIcon={<Iconify icon={GlobalIcons.delete} />}
            onClick={discard}
          >
            Discard changes
          </Button>
        }
      />
    ),
  });
  const requestClose = () => requestNavigation(onClose);
  const showError = Boolean(
    (formik.touched.componentId || formik.submitCount) && formik.errors.componentId
  );
  const unavailable = blocked || refreshing || refreshError || formik.isSubmitting;
  useEffect(() => {
    if (formik.submitCount && showError && !unavailable) selectionRef.current?.focus();
  }, [formik.submitCount, showError, unavailable]);

  return (
    <>
      <CustomDialog
        open
        title={`Add ${kind === 'EARNING' ? 'Earning' : 'Deduction'} Component`}
        titleInfo="Choose an existing payroll component to configure its rule in this salary template."
        handleClose={requestClose}
        disableClose={blocked || formik.isSubmitting}
        guardUnsavedChanges={false}
        formProps={{
          noValidate: true,
          onSubmit: (event) => {
            event.preventDefault();
            event.stopPropagation();
            if (!unavailable) formik.submitForm();
          },
        }}
      >
        <DialogScrollContent>
          <FormSectionCard
            title="Component Details"
            icon={GlobalIcons.documentIcon}
            descriptionTooltip="Only active components not already added to this template are available."
          >
            <Box sx={{ display: 'grid', gap: 2 }} aria-busy={refreshing}>
              {refreshing && (
                <LinearProgress aria-label="Loading payroll components" color="inherit" />
              )}
              {refreshError ? (
                <Alert
                  severity="error"
                  action={
                    <Button
                      type="button"
                      size="small"
                      color="inherit"
                      startIcon={<Iconify icon={GlobalIcons.refresh} />}
                      onClick={() => reload()}
                      disabled={blocked}
                    >
                      Retry
                    </Button>
                  }
                >
                  Unable to load payroll components. Your entries are still here. Try again.
                </Alert>
              ) : !refreshing && options.length === 0 ? (
                <Alert
                  severity="info"
                  variant="outlined"
                  sx={{
                    bgcolor: 'background.paper',
                    color: 'text.primary',
                    borderColor: 'divider',
                    '& .MuiAlert-icon': { color: 'text.secondary' },
                  }}
                >
                  {allComponentsAdded
                    ? `All available ${componentKind} components are already added to this template. Edit the existing rules or create another component.`
                    : `No active ${componentKind} components are available. Create ${kind === 'EARNING' ? 'an earning' : 'a deduction'} component first, then return to add its salary rule.`}
                  {!canCreate && ' Ask your HR administrator to create the component.'}
                </Alert>
              ) : null}
              <ShakingTextField error={showError}>
                <CustomSelect
                  name="componentId"
                  label="Payroll component"
                  required
                  size="small"
                  fullWidth
                  isSearch
                  options={options}
                  labelKey="name"
                  valueKey="componentId"
                  value={
                    options.some((option) => option.componentId === componentId) ? componentId : ''
                  }
                  onChange={(value) => {
                    formik.setFieldValue('componentId', value);
                  }}
                  onBlur={() => {
                    formik.setFieldTouched('componentId', true);
                  }}
                  inputRef={selectionRef}
                  disabled={unavailable}
                  error={showError}
                  helperText={showError ? formik.errors.componentId : undefined}
                  noOptionsMessage={`No available ${componentKind} components`}
                />
              </ShakingTextField>
              {canCreate &&
                (onCreate ? (
                  <Button
                    type="button"
                    size="small"
                    color="inherit"
                    sx={{ justifySelf: 'start' }}
                    startIcon={<Iconify icon={GlobalIcons.addIcon} />}
                    disabled={unavailable}
                    onClick={() => requestNavigation(onCreate)}
                  >
                    Create {componentKind} component
                  </Button>
                ) : (
                  <Button
                    size="small"
                    color="inherit"
                    sx={{ justifySelf: 'start', textAlign: 'left' }}
                    startIcon={<Iconify icon={GlobalIcons.addIcon} />}
                    href={createHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    disabled={unavailable}
                    onClick={() => {
                      leftSetup.current = true;
                    }}
                  >
                    Create {componentKind} component (new tab)
                  </Button>
                ))}
            </Box>
          </FormSectionCard>
        </DialogScrollContent>
        <DialogActions>
          <Button
            type="button"
            size="small"
            color="inherit"
            variant="outlined"
            startIcon={<Iconify icon={GlobalIcons.cancel} />}
            onClick={requestClose}
            disabled={blocked || formik.isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            size="small"
            color="inherit"
            variant="contained"
            startIcon={<Iconify icon={GlobalIcons.submit} />}
            loading={formik.isSubmitting}
            disabled={unavailable || !options.some((option) => option.componentId === componentId)}
          >
            Submit
          </Button>
        </DialogActions>
      </CustomDialog>
      {confirmation}
    </>
  );
}
