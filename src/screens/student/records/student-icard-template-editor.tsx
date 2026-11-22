'use client';

import type { IdCardTemplate } from 'src/redux/student/records/student-record-documents-api';

import { useRef, useState, useEffect } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import CustomStepper from 'src/components/custom-stepper';
import { StudentFeedback } from 'src/components/student-feedback';
import { FormSectionCard } from 'src/components/form-section-card';
import { Box, Grid, Stack, Button, Typography } from '@mui/material';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import {
  useCreateRecordIdTemplateMutation,
  useUpdateRecordIdTemplateMutation,
} from 'src/redux/student/records/student-record-documents-api';

import { StudentCardPreview } from './components/student-card-preview';
import { StudentICardDesigner } from './components/student-icard-designer';
import { StudentICardTemplateStep } from './components/student-icard-template-step';
import {
  getStudentICardLayout,
  applyStudentICardDesign,
  createStudentICardTemplate,
  getStudentICardDesignErrors,
  getStudentICardPrintSettings,
} from './student-icard-design';

const steps = ['Template', 'Designer'];

type Props = {
  initialTemplate: IdCardTemplate | null;
  canEdit: boolean;
  onClose: () => void;
  onSaved: () => void;
  onBusyChange: (busy: boolean) => void;
  onDirtyChange: (dirty: boolean) => void;
};

export default function StudentICardTemplateEditor({
  initialTemplate,
  canEdit,
  onClose,
  onSaved,
  onBusyChange,
  onDirtyChange,
}: Props) {
  const [initialDraft] = useState(() => initialTemplate ?? createStudentICardTemplate());
  const [draft, setDraft] = useState(initialDraft);
  const [nameTouched, setNameTouched] = useState(false);
  const [designerOpen, setDesignerOpen] = useState(false);
  const [brandingBusy, setBrandingBusy] = useState(false);
  const [error, setError] = useState('');
  const saving = useRef(false);
  const [create, createState] = useCreateRecordIdTemplateMutation();
  const [update, updateState] = useUpdateRecordIdTemplateMutation();
  const saveBusy = createState.isLoading || updateState.isLoading;
  const busy = brandingBusy || saveBusy;
  const nameError = nameTouched && !draft.name.trim();
  const dirty = JSON.stringify(draft) !== JSON.stringify(initialDraft);

  useEffect(() => {
    onBusyChange(busy);
  }, [busy, onBusyChange]);
  useEffect(() => {
    onDirtyChange(dirty);
  }, [dirty, onDirtyChange]);

  const patchDraft = (patch: Partial<IdCardTemplate>) => {
    setDraft((current) => ({ ...current, ...patch }));
    setError('');
  };

  const openDesigner = () => {
    const name = draft.name.trim();
    setNameTouched(true);
    if (!name) return;
    if (draft.schemaVersion !== 2) {
      patchDraft(
        applyStudentICardDesign(
          draft,
          getStudentICardLayout(draft),
          getStudentICardPrintSettings(draft)
        )
      );
    }
    setDesignerOpen(true);
  };

  const save = async () => {
    if (!canEdit || busy || saving.current) return;
    const name = draft.name.trim();
    if (!name) {
      setNameTouched(true);
      setDesignerOpen(false);
      return;
    }
    const designErrors = getStudentICardDesignErrors(draft);
    const validationError = !draft.schoolName.trim()
      ? 'Enter a school name.'
      : !draft.fields.length
        ? 'Choose at least one card field.'
        : designErrors[0];
    if (validationError) {
      openDesigner();
      setError(validationError);
      return;
    }

    const body = { ...draft, name };
    delete body.selection;
    delete body.selectionRestricted;
    saving.current = true;
    onBusyChange(true);
    try {
      if (draft.id) await update({ id: draft.id, body }).unwrap();
      else await create(body).unwrap();
      shikshaMitraToast.success({ message: 'I-Card template saved.' });
      onSaved();
    } catch (failure: unknown) {
      const problem = parseApiProblemDetail(failure);
      shikshaMitraToast.error({
        message:
          problem.errorCode === 'ShikshaMitra:IdentityCard:InvalidConfiguration'
            ? problem.detail
            : 'The template could not be saved. Try again or reopen the template if it has changed.',
      });
    } finally {
      saving.current = false;
      onBusyChange(false);
    }
  };

  return (
    <Stack spacing={designerOpen ? 1 : 2} sx={{ height: 1, minHeight: 0, minWidth: 0 }}>
      <Box sx={{ display: { xs: 'none', sm: 'block' }, flexShrink: 0 }}>
        <CustomStepper
          steps={steps}
          activeStep={designerOpen ? 1 : 0}
          ariaLabel="I-Card template steps"
          density={designerOpen ? 'compact' : 'standard'}
        />
      </Box>
      <Typography variant="subtitle2" sx={{ display: { sm: 'none' } }} aria-live="polite">
        {designerOpen ? 'Step 2 of 2: Designer' : 'Step 1 of 2: Template'}
      </Typography>
      {error && (
        <StudentFeedback
          notificationKey="STUDENT-ICARD-TEMPLATE-VALIDATION"
          presentation="persistent"
          severity="error"
        >
          {error}
        </StudentFeedback>
      )}
      <Box
        component="fieldset"
        disabled={!canEdit || busy}
        sx={{
          flex: 1,
          minHeight: 0,
          minWidth: 0,
          overflowY: designerOpen ? 'hidden' : 'auto',
          border: 0,
          m: 0,
          p: 0,
        }}
      >
        {designerOpen ? (
          <StudentICardDesigner
            template={draft}
            disabled={!canEdit || busy}
            onBusyChange={setBrandingBusy}
            onChange={patchDraft}
          />
        ) : (
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 7 }} sx={{ minWidth: 0 }}>
              <StudentICardTemplateStep
                template={draft}
                nameError={nameError}
                onNameBlur={() => setNameTouched(true)}
                onChange={patchDraft}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 5 }} sx={{ minWidth: 0 }}>
              <FormSectionCard title="Template Preview">
                <Box
                  sx={{
                    mx: 'auto',
                    width: 1,
                    maxWidth: draft.orientation === 'Vertical' ? 205 : 420,
                  }}
                >
                  <StudentCardPreview template={draft} previewLegacyBack />
                </Box>
              </FormSectionCard>
            </Grid>
          </Grid>
        )}
      </Box>
      <Stack
        direction="row"
        justifyContent="space-between"
        spacing={1}
        sx={{ flexShrink: 0, pt: 1, borderTop: 1, borderColor: 'divider' }}
      >
        <Button
          variant="outlined"
          disabled={busy}
          onClick={designerOpen ? () => setDesignerOpen(false) : onClose}
        >
          {designerOpen ? 'Back' : 'Cancel'}
        </Button>
        <Stack direction="row" spacing={1}>
          <Button
            variant={designerOpen ? 'contained' : 'outlined'}
            disabled={!canEdit || busy}
            loading={saveBusy}
            onClick={save}
          >
            Save
          </Button>
          {!designerOpen && (
            <Button variant="contained" disabled={!canEdit || busy} onClick={openDesigner}>
              Next
            </Button>
          )}
        </Stack>
      </Stack>
    </Stack>
  );
}
