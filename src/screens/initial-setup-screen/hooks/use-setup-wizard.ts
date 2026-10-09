import type { InitialSetup } from 'src/redux/initial-setup/types';

import { useFormik } from 'formik';

import { useSetupExit } from './use-setup-exit';
import { useSetupAutosave } from './use-setup-autosave';
import { useSetupPersistence } from './use-setup-persistence';
import { setupSchema, setupStepRequest } from '../services/setup-model';

export function useSetupWizard(initial: InitialSetup, onReload: () => Promise<InitialSetup>) {
  const persistence = useSetupPersistence(initial);
  const { progress, blocking, saving, error, conflict, command } = persistence;
  const step = progress.currentStep;
  const form = useFormik({
    initialValues: initial.draft,
    validationSchema: setupSchema(step),
    validateOnChange: false,
    onSubmit: async (draft) => {
      const request = setupStepRequest(step, draft);
      try {
        const result = await command(request.action, request.input, draft);
        if (result) form.resetForm({ values: result.draft });
      } catch {
        /* Persistence exposes the error and retains entered values. */
      }
    },
  });
  useSetupAutosave(
    form.values,
    step,
    blocking || conflict || Boolean(error) || progress.isCompleted,
    persistence.savedDraft,
    persistence.autosave
  );
  async function navigate(target: number) {
    try {
      const result = await command(
        'draft',
        { currentStep: target, draft: form.values },
        form.values
      );
      if (result) form.resetForm({ values: result.draft });
    } catch {
      /* Entries remain available for retry. */
    }
  }
  async function reload() {
    if (
      JSON.stringify(form.values) !== persistence.savedDraft.current &&
      !window.confirm('Reload saved setup? Your unsaved entries will be replaced.')
    )
      return;
    try {
      const response = await onReload();
      persistence.adopt(response);
      form.resetForm({ values: response.draft });
    } catch {
      /* Keep the current conflict and draft until reload succeeds. */
    }
  }
  const exit = useSetupExit(async () => {
    await command('draft', { currentStep: step, draft: form.values }, form.values);
  });
  async function next() {
    await form.submitForm();
    document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
  }
  return {
    progress,
    blocking,
    saving,
    error,
    conflict,
    command,
    form,
    step,
    navigate,
    reload,
    exit,
    next,
    savedDraft: persistence.savedDraft,
  };
}
