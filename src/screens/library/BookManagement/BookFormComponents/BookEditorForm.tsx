import type { RootState } from 'src/redux/store';
import type { CatalogueConfiguration } from 'src/redux/library/catalogue-configuration-types';

import { Box } from '@mui/material';
import { useSelector } from 'react-redux';
import { useState, useEffect } from 'react';
import { hasGrantedPermission } from 'src/utils/permissions';
import { CustomStepperWithFormik } from 'src/components/custom-stepper';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

import { useBookEditor } from './useBookEditor';
import { BookEditorBody } from './BookEditorBody';

import type { BookFormValues } from '../Components/type';

export function BookEditorForm({
  initialValues,
  academicYearId,
  onClose,
  onBusyChange,
  configuration,
  externalBusy = false,
  contextBlocked = false,
}: {
  initialValues: BookFormValues;
  academicYearId?: string;
  onClose: (event: unknown, submitted: boolean) => void;
  onBusyChange?: (busy: boolean) => void;
  configuration: CatalogueConfiguration;
  externalBusy?: boolean;
  contextBlocked?: boolean;
}) {
  const { permissions } = useSelector((state: RootState) => state.auth);
  const canAdd = hasGrantedPermission(permissions, 'Library.AllBooks.Add');
  const canUpdate = hasGrantedPermission(permissions, 'Library.AllBooks.Update');
  const state = useBookEditor(
    initialValues,
    academicYearId,
    canAdd,
    canUpdate,
    onClose,
    configuration
  );
  const {
    formik,
    activeStep,
    setActiveStep,
    busy,
    completed,
    reloadId,
    canWrite,
    saveCurrent,
    validationSchema,
  } = state;
  const [childBusy, setChildBusy] = useState(false);
  const blocked = busy || childBusy || externalBusy;
  const disabled = blocked || contextBlocked || Boolean(reloadId) || !canWrite;
  useEffect(() => {
    onBusyChange?.(blocked);
    return () => onBusyChange?.(false);
  }, [blocked, onBusyChange]);
  const save = async (
    values: BookFormValues,
    advance: boolean,
    setLoading: (value: boolean) => void
  ) => {
    if (blocked || contextBlocked) return;
    setLoading(true);
    try {
      await saveCurrent(values, advance);
    } finally {
      setLoading(false);
    }
  };

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <Box
        sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}
        aria-busy={blocked}
      >
        <CustomStepperWithFormik
          steps={['General Information', 'Manage Copies']}
          activeStep={activeStep}
          initialValues={initialValues}
          formikInstance={formik}
          validationSchema={validationSchema}
          validateForwardStepClick
          validateFinalStep
          showSaveButton={Boolean(formik.values.id) && !completed}
          nextButtonLabel={formik.values.id ? 'Save & next' : 'Next'}
          finalButtonLabel={
            reloadId ? 'Reload saved copies' : completed && !formik.dirty ? 'Done' : 'Submit'
          }
          saveButtonProps={{ disabled: disabled || !formik.dirty, loading: busy }}
          saveAndNextButtonProps={{
            disabled:
              blocked ||
              contextBlocked ||
              (!canWrite && !(completed && !formik.dirty) && !reloadId),
            loading: busy,
          }}
          backButtonProps={{ disabled: blocked || Boolean(reloadId) }}
          onCancel={() => {
            if (!blocked) onClose(null, false);
          }}
          handleBack={() => setActiveStep(Math.max(0, activeStep - 1))}
          isStepClickable={(step) => !blocked && !reloadId && step <= activeStep}
          onStepClick={(step) => {
            if (!blocked && !reloadId && step < activeStep) setActiveStep(step);
          }}
          handleNext={(_, values: BookFormValues, _formik, setLoading) =>
            save(values, true, setLoading)
          }
          onSave={(_, values: BookFormValues, _formik, setLoading) =>
            save(values, false, setLoading)
          }
          renderItem={() => (
            <BookEditorBody
              state={state}
              disabled={disabled}
              printDisabled={blocked || Boolean(reloadId)}
              onBusyChange={setChildBusy}
            />
          )}
        />
      </Box>
    </BackPopUpChecked>
  );
}
