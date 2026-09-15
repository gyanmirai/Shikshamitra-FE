import type {
  AcademicAiReportClarificationAnswer,
  AcademicAiReportClarificationQuestion,
} from 'src/redux/academicAPI/AcademicReportApi';

import { useFormik } from 'formik';
import { LoadingButton } from '@mui/lab';
import { Iconify } from 'src/components/iconify';
import { Box, Chip, Stack, Paper, TextField, Typography } from '@mui/material';

interface Props {
  questions: AcademicAiReportClarificationQuestion[];
  onSubmit: (answers: AcademicAiReportClarificationAnswer[]) => void | Promise<void>;
}

export function AiReportClarification({ questions, onSubmit }: Props) {
  const formik = useFormik({
    initialValues: Object.fromEntries(questions.map((question) => [question.id, ''])),
    onSubmit: async (values) => {
      await onSubmit(
        questions.map((question) => ({
          question: question.question,
          answer: values[question.id]?.trim() || question.recommendedOption,
        }))
      );
    },
  });
  const canContinue = questions.every(
    (question) => Boolean(formik.values[question.id]?.trim()) || Boolean(question.recommendedOption)
  );

  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }} aria-live="polite">
      <Stack spacing={2}>
        <Stack direction="row" spacing={1} alignItems="flex-start">
          <Iconify icon="solar:question-circle-bold" color="primary.main" />
          <Box>
            <Typography variant="subtitle2">A few details will improve this report</Typography>
            <Typography variant="caption" color="text.secondary">
              The agent only asks when an answer changes the data or layout.
            </Typography>
          </Box>
        </Stack>

        {questions.map((question) => (
          <Stack key={question.id} spacing={1}>
            <Typography variant="body2" fontWeight={600}>
              {question.question}
            </Typography>
            {question.options.length > 0 && (
              <Stack direction="row" useFlexGap flexWrap="wrap" gap={0.75}>
                {question.options.map((option) => (
                  <Chip
                    key={option}
                    clickable
                    color={formik.values[question.id] === option ? 'primary' : 'default'}
                    variant={formik.values[question.id] === option ? 'filled' : 'outlined'}
                    label={`${option}${option === question.recommendedOption ? ' · Recommended' : ''}`}
                    onClick={() => formik.setFieldValue(question.id, option)}
                  />
                ))}
              </Stack>
            )}
            <TextField
              fullWidth
              size="small"
              name={question.id}
              placeholder={question.recommendedOption || 'Type your answer'}
              value={formik.values[question.id]}
              onChange={formik.handleChange}
              inputProps={{ maxLength: 500 }}
            />
          </Stack>
        ))}

        <LoadingButton
          size="small"
          variant="contained"
          disabled={!canContinue}
          startIcon={<Iconify icon="solar:arrow-right-linear" />}
          onClick={() => formik.handleSubmit()}
          sx={{ alignSelf: 'flex-end' }}
        >
          Continue planning
        </LoadingButton>
      </Stack>
    </Paper>
  );
}
