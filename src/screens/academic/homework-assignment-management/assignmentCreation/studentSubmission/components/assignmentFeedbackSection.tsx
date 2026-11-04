import { useRef, useState } from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import ShakingTextField from 'src/components/shaking-text-field';
import { FormSectionCard } from 'src/components/form-section-card';
import { Menu, Button, MenuItem, TextField, Typography } from '@mui/material';

import type { TStudentGrade } from '../../../homeworkCreation/type';
import type { AssignmentFeedbackFormState } from '../hooks/useAssignmentFeedbackForm';

const FEEDBACK_MAX_LENGTH = 500;

const QUICK_TEMPLATES = [
  'Well done! Keep up the great work.',
  'Good effort! Review the highlighted areas for improvement.',
  'Excellent work! Very detailed and well-organized.',
  'Needs improvement. Please revisit the core concepts.',
  'Great start! Focus on structuring your answers better.',
];

type Props = { isEdit: boolean; data?: TStudentGrade | null; state: AssignmentFeedbackFormState };
export default function AssignmentFeedbackSection({ isEdit, data, state }: Props) {
  const { formik, busy } = state;
  const [templateMenuOpen, setTemplateMenuOpen] = useState(false);
  const templateBtnRef = useRef<HTMLButtonElement>(null);
  const handleTemplateSelect = (template: string) => {
    if (!isEdit) return;
    formik.setFieldValue('feedback', template);
    setTemplateMenuOpen(false);
  };

  return (
    <FormSectionCard
      title="Feedback"
      icon={GlobalIcons.notebook}
      descriptionTooltip="Teacher feedback recorded for this student's assignment."
      sx={{ height: 1, minWidth: 0 }}
      action={
        isEdit ? (
          <>
            <Button
              ref={templateBtnRef}
              type="button"
              size="small"
              variant="outlined"
              color="inherit"
              disabled={busy}
              aria-haspopup="menu"
              aria-expanded={templateMenuOpen}
              startIcon={<Iconify icon={GlobalIcons.edit} />}
              onClick={() => setTemplateMenuOpen(true)}
            >
              Quick templates
            </Button>
            <Menu
              anchorEl={templateBtnRef.current}
              open={templateMenuOpen && !busy}
              onClose={() => setTemplateMenuOpen(false)}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              slotProps={{ paper: { sx: { maxWidth: 320 } } }}
            >
              {QUICK_TEMPLATES.map((template) => (
                <MenuItem
                  key={template}
                  onClick={() => handleTemplateSelect(template)}
                  sx={{ whiteSpace: 'normal' }}
                >
                  {template}
                </MenuItem>
              ))}
            </Menu>
          </>
        ) : undefined
      }
    >
      {isEdit ? (
        <ShakingTextField error={!!(formik.touched.feedback && formik.errors.feedback)}>
          <TextField
            label="Feedback"
            multiline
            size="small"
            rows={4}
            fullWidth
            name="feedback"
            disabled={busy}
            value={formik.values.feedback}
            onBlur={formik.handleBlur}
            onChange={(event) => {
              if (event.target.value.length <= FEEDBACK_MAX_LENGTH) formik.handleChange(event);
            }}
            error={formik.touched.feedback && Boolean(formik.errors.feedback)}
            helperText={
              (formik.touched.feedback && formik.errors.feedback) ||
              `${formik.values.feedback.length} / ${FEEDBACK_MAX_LENGTH} characters`
            }
            inputProps={{ maxLength: FEEDBACK_MAX_LENGTH }}
          />
        </ShakingTextField>
      ) : (
        <Typography
          variant="body2"
          color={data?.feedback ? 'text.primary' : 'text.secondary'}
          sx={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}
        >
          {data?.feedback || 'No feedback has been recorded for this student yet.'}
        </Typography>
      )}
    </FormSectionCard>
  );
}
