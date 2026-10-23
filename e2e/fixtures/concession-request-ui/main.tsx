import React from 'react';
import { useFormik } from 'formik';
import { createRoot } from 'react-dom/client';
import { ThemeProvider, useColorScheme } from '@mui/material/styles';
import { Box, Stack, Button, CssBaseline, Typography } from '@mui/material';
import { createTheme } from 'src/theme/create-theme';
import { defaultSettings } from 'src/components/settings/config-settings';
import { FormSectionCard } from 'src/components/form-section-card';
import ValueEntryStep from 'src/screens/finance/Concession/Components/ConcessionSteps/ValueEntryStep';
import ConcessionImpactSummary from 'src/screens/finance/Concession/Components/ConcessionImpactSummary';
import ConcessionFeeHeadSelection from 'src/screens/finance/Concession/Components/ConcessionFeeHeadSelection';
import ConcessionDocumentList from 'src/screens/finance/Concession/Components/ConcessionDocumentList';
import ReadOnlyConcessionApprovalView from 'src/screens/finance/ConcessionAdmin/ReadOnlyConcessionApprovalView';
import { context, policy, preview } from './data';

function ThemeToggle() {
  const { mode, setMode } = useColorScheme();
  return (
    <Button onClick={() => setMode(mode === 'light' ? 'dark' : 'light')}>
      {mode === 'light' ? 'Dark theme' : 'Light theme'}
    </Button>
  );
}

function Fixture() {
  const [mode, setMode] = React.useState('percentage');
  const [review, setReview] = React.useState(false);
  const [documents, setDocuments] = React.useState<any[]>([]);
  const formik = useFormik({
    initialValues: {
      concessionTypeId: 'sibling',
      concessionTypeIds: ['sibling'],
      selectedFeeHeads: { sibling: ['tuition'] },
      dueFeeEntries: {} as Record<string, string>,
      valueEntries: {},
    },
    onSubmit: () => undefined,
  });
  const currentPolicy: typeof policy = {
    ...policy,
    valueSource: mode === 'policy' ? 'PolicyFixed' : policy.valueSource,
    calculationMethod: mode === 'fixed' ? 'FixedAmount' : 'Percentage',
    percentageValue: 8,
    maximumFixedAmount: 1111,
  };
  const discount =
    mode === 'policy'
      ? 400
      : context.eligibleDueFees.reduce((sum, line) => {
          const value = Number(formik.values.dueFeeEntries[line.dueFeeId] || 0);
          return (
            sum +
            (mode === 'fixed' ? value : Math.round(line.eligibleConcessionAmount * value) / 100)
          );
        }, 0);
  const result = { ...preview, totalConcessionAmount: discount, netPayable: 5000 - discount };
  return (
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <CssBaseline />
      <Box
        sx={{
          height: '100dvh',
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          bgcolor: 'background.default',
        }}
      >
        <Stack direction="row" flexWrap="wrap" gap={1} sx={{ p: 1.5 }}>
          <Typography component="h1" variant="subtitle1" fontWeight={700} sx={{ flex: 1 }}>
            Concession request · synthetic data
          </Typography>
          <ThemeToggle />
          <Button onClick={() => setReview(!review)}>
            {review ? 'Request form' : 'Approval review'}
          </Button>
        </Stack>
        {review ? (
          <ReadOnlyConcessionApprovalView
            selectedItem={
              {
                studentConcessionTypeRequestId: 'synthetic',
                concessionTypeName: 'Sibling tuition concession',
              } as any
            }
            mode="Approve"
            onBack={() => setReview(false)}
          />
        ) : (
          <Box
            sx={{
              flex: 1,
              minHeight: 0,
              overflowY: 'auto',
              p: 1.5,
              '& .MuiCard-root': { boxShadow: 'none' },
            }}
          >
            <Stack spacing={1.5}>
              <Stack direction="row" gap={1} flexWrap="wrap">
                {['percentage', 'fixed', 'policy'].map((value) => (
                  <Button
                    key={value}
                    variant={mode === value ? 'contained' : 'outlined'}
                    onClick={() => {
                      formik.resetForm();
                      setMode(value);
                    }}
                  >
                    {value}
                  </Button>
                ))}
              </Stack>
              <FormSectionCard
                title="Fee Heads"
                icon="mdi:format-list-bulleted"
                descriptionTooltip="Select fee heads and expand their installment breakdown."
                action={
                  <Typography variant="body2">
                    Selected eligible total:{' '}
                    {formik.values.selectedFeeHeads.sibling.length ? '₹ 5,000' : '₹ 0'}
                  </Typography>
                }
              >
                <ConcessionFeeHeadSelection
                  feeHeads={context.feeHeads.map((head) => ({
                    ...head,
                    amount: head.eligibleOutstanding,
                  }))}
                  installments={context.eligibleDueFees.map((line, index) => ({
                    ...line,
                    installmentLabel: `${index ? 'Jul' : 'Jun'} 2026`,
                  }))}
                  selectedIds={formik.values.selectedFeeHeads.sibling}
                  onToggle={(id) =>
                    formik.setFieldValue(
                      'selectedFeeHeads.sibling',
                      formik.values.selectedFeeHeads.sibling.includes(id) ? [] : [id]
                    )
                  }
                />
              </FormSectionCard>
              <FormSectionCard
                title="Concession Values"
                icon="mdi:calculator"
                descriptionTooltip="Enter values for the selected installments."
              >
                <ValueEntryStep
                  formik={formik}
                  concessionTypes={[{ id: 'sibling', name: 'Sibling tuition concession' }]}
                  requestContext={context}
                  policy={currentPolicy}
                  preview={mode === 'policy' ? preview : undefined}
                />
              </FormSectionCard>
              <ConcessionImpactSummary
                preview={result}
                concessionName="Sibling tuition concession"
                selectedFeeHeadCount={1}
              />
              <FormSectionCard
                title="Documents"
                icon="mdi:file-document-outline"
                descriptionTooltip="Upload supporting evidence for this request."
              >
                <ConcessionDocumentList
                  concessionId="sibling"
                  concessionName="Sibling tuition concession"
                  submittedDocuments={documents}
                  onSave={setDocuments}
                  requirements={[
                    {
                      documentId: 'income-proof',
                      documentName: 'Income proof',
                      isRequired: true,
                      acceptedFormats: [4, 2],
                      maxFileSizeBytes: 2 * 1024 * 1024,
                    },
                    {
                      documentId: 'identity-proof',
                      documentName: 'Identity proof',
                      isRequired: true,
                      acceptedFormats: [4, 2],
                      maxFileSizeBytes: 2 * 1024 * 1024,
                    },
                  ]}
                />
              </FormSectionCard>
            </Stack>
          </Box>
        )}
        {!review && (
          <Stack
            direction="row"
            justifyContent="flex-end"
            gap={1}
            sx={{ p: 1.5, borderTop: 1, borderColor: 'divider', bgcolor: 'background.paper' }}
          >
            <Button variant="outlined">Save draft</Button>
              <Button variant="contained" disabled={documents.length !== 2 || !discount}>
              Submit and approve
            </Button>
          </Stack>
        )}
      </Box>
    </ThemeProvider>
  );
}
createRoot(document.getElementById('root')!).render(<Fixture />);
