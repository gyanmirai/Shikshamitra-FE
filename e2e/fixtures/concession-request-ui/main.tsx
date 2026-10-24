import React from 'react';
import { useFormik } from 'formik';
import { createRoot } from 'react-dom/client';
import { ThemeProvider, useColorScheme } from '@mui/material/styles';
import { Box, Stack, Button, TextField, CssBaseline, Typography } from '@mui/material';
import { Iconify } from 'src/components/iconify';
import { GlobalIcons } from 'src/utils/icons';
import { createTheme } from 'src/theme/create-theme';
import { defaultSettings } from 'src/components/settings/config-settings';

import ValueEntryStep from 'src/screens/finance/Concession/Components/ConcessionSteps/ValueEntryStep';
import ConcessionRequestWorkspace from 'src/screens/finance/Concession/Components/ConcessionRequestWorkspace';
import ConcessionPolicyFields from 'src/screens/finance/Concession/Components/ConcessionPolicyFields';
import { FormBusyRegion } from 'src/components/form-busy-region';
import { validateConcessionInstallments } from 'src/screens/finance/Concession/Components/concessionValueValidation';

import ConcessionDocumentList from 'src/screens/finance/Concession/Components/ConcessionDocumentList';
import ReadOnlyConcessionApprovalView from 'src/screens/finance/ConcessionAdmin/ReadOnlyConcessionApprovalView';
import { context, policy, preview } from './data';

function ThemeToggle() {
  const { mode, setMode } = useColorScheme();
  return (
    <Button size="small" onClick={() => setMode(mode === 'light' ? 'dark' : 'light')}>
      {mode === 'light' ? 'Dark theme' : 'Light theme'}
    </Button>
  );
}

function Fixture() {
  const [mode, setMode] = React.useState(
    new URLSearchParams(window.location.search).get('mode') || 'policy'
  );
  const [review, setReview] = React.useState(false);
  const [documents, setDocuments] = React.useState<any[]>(() =>
    new URLSearchParams(window.location.search).get('documents') === 'ready'
      ? ['income-proof', 'identity-proof'].map((documentId) => ({
          documentId,
          url: `/synthetic-${documentId}.pdf`,
          fileName: `Synthetic ${documentId}.pdf`,
          status: 1,
        }))
      : []
  );
  const [busy, setBusy] = React.useState(false);
  const formik = useFormik({
    initialValues: {
      concessionTypeId: 'sibling',
      concessionTypeIds: ['sibling'],
      selectedFeeHeads: { sibling: ['school', 'tuition'] },
      dueFeeEntries: {} as Record<string, string>,
      valueEntries: {},
    },
    onSubmit: () => undefined,
  });
  const currentPolicy: typeof policy = {
    ...policy,
    policyName: mode === 'policy' ? 'Nikhil Test Concession · 50%' : 'Sibling policy',
    policyCode: 'CON',
    valueSource: mode === 'policy' ? 'PolicyFixed' : policy.valueSource,
    calculationMethod: mode === 'fixed' ? 'FixedAmount' : 'Percentage',
    percentageValue: 50,
    maximumFixedAmount: 11111,
  };
  const uiContext = {
    ...context,
    feeHeads: [
      { feeHeadId: 'school', feeHeadName: 'General School Fees', eligibleOutstanding: 30000 },
      { feeHeadId: 'tuition', feeHeadName: 'General Tuition Fee', eligibleOutstanding: 20000 },
    ],
    eligibleDueFees: [
      ...context.eligibleDueFees.map((line, index) => ({
        ...line,
        dueFeeId: 'school-' + index,
        feeHeadId: 'school',
        feeHeadName: 'General School Fees',
        originalAmount: 15000,
        eligibleConcessionAmount: 15000,
        outstandingAmount: 15000,
      })),
      ...context.eligibleDueFees.map((line) => ({
        ...line,
        feeHeadName: 'General Tuition Fee',
        originalAmount: 10000,
        eligibleConcessionAmount: 10000,
        outstandingAmount: 10000,
      })),
    ],
  };
  const selected = uiContext.feeHeads.filter((head) =>
    formik.values.selectedFeeHeads.sibling.includes(head.feeHeadId)
  );
  const hasInvalidValues =
    Object.keys(
      validateConcessionInstallments(
        formik.values.selectedFeeHeads.sibling,
        formik.values.dueFeeEntries,
        uiContext,
        currentPolicy
      )
    ).length > 0;
  const total = selected.reduce((sum, head) => sum + head.eligibleOutstanding, 0);
  const feeHeadConcessions = selected.map((head) => {
    const discountAmount =
      mode === 'policy'
        ? head.eligibleOutstanding / 2
        : uiContext.eligibleDueFees
            .filter((line) => line.feeHeadId === head.feeHeadId)
            .reduce((sum, line) => {
              const value = Number(formik.values.dueFeeEntries[line.dueFeeId] || 0);
              return (
                sum +
                (mode === 'fixed' ? value : Math.round(line.eligibleConcessionAmount * value) / 100)
              );
            }, 0);
    return {
      feeHeadId: head.feeHeadId,
      feeHeadName: head.feeHeadName,
      annualBaseAmount: head.eligibleOutstanding,
      basedOn: 1,
      amount: 0,
      discountAmount,
      netAmount: head.eligibleOutstanding - discountAmount,
    };
  });
  const discount = feeHeadConcessions.reduce((sum, head) => sum + head.discountAmount, 0);
  const result = selected.length
    ? {
        ...preview,
        totalEligibleBase: total,
        totalConcessionAmount: discount,
        netPayable: total - discount,
        feeHeadConcessions,
      }
    : null;
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
          <Button size="small" onClick={() => setReview(!review)}>
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
              containerType: 'inline-size',
            }}
          >
            <Stack spacing={2}>
              <Stack direction="row" gap={1} flexWrap="wrap">
                {['percentage', 'fixed', 'policy'].map((value) => (
                  <Button
                    size="small"
                    disabled={busy}
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
              <Button size="small" onClick={() => setBusy(!busy)}>
                {busy ? 'End saving preview' : 'Preview saving lock'}
              </Button>
              <FormBusyRegion busy={busy} label="Saving concession request…">
                <ConcessionRequestWorkspace
                  policyFields={
                    <ConcessionPolicyFields
                      policies={[currentPolicy]}
                      types={[{ id: 'sibling', name: 'General School Nikhil' }]}
                      policyVersionId={currentPolicy.concessionPolicyVersionId}
                      typeId="sibling"
                      onPolicyChange={() => undefined}
                      onTypeChange={() => undefined}
                      onPolicyBlur={() => undefined}
                      onTypeBlur={() => undefined}
                      policyDisabled={busy}
                      typeDisabled={busy}
                    />
                  }
                  feeHeads={uiContext.feeHeads.map((head) => ({
                    ...head,
                    amount: head.eligibleOutstanding,
                  }))}
                  installments={uiContext.eligibleDueFees}
                  selectedIds={formik.values.selectedFeeHeads.sibling}
                  onToggle={(id) =>
                    formik.setFieldValue(
                      'selectedFeeHeads.sibling',
                      formik.values.selectedFeeHeads.sibling.includes(id)
                        ? formik.values.selectedFeeHeads.sibling.filter((value) => value !== id)
                        : [...formik.values.selectedFeeHeads.sibling, id]
                    )
                  }
                  policy={currentPolicy}
                  preview={hasInvalidValues ? null : result}
                  missingDocumentNames={['Income proof', 'Identity proof'].filter(
                    (name, index) =>
                      !documents.some(
                        (document) =>
                          document.documentId === (index ? 'identity-proof' : 'income-proof')
                      )
                  )}
                  valueFields={
                    selected.length > 0 ? (
                      <ValueEntryStep
                        formik={formik}
                        showPolicyFixedDetails={false}
                        concessionTypes={[{ id: 'sibling', name: 'General School Nikhil' }]}
                        requestContext={uiContext}
                        policy={currentPolicy}
                        preview={result ?? undefined}
                      />
                    ) : undefined
                  }
                  documents={
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
                  }
                  remarks={
                    <TextField
                      fullWidth
                      size="small"
                      multiline
                      rows={2}
                      label="Remarks (optional)"
                    />
                  }
                />
              </FormBusyRegion>
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
            <Button
              disabled={busy}
              variant="outlined"
              size="small"
              startIcon={<Iconify icon={GlobalIcons.cancel} />}
            >
              Cancel
            </Button>
            <Button
              disabled={busy}
              variant="outlined"
              size="small"
              startIcon={<Iconify icon="solar:diskette-bold" />}
            >
              Save draft
            </Button>
            <Button
              variant="contained"
              size="small"
              startIcon={<Iconify icon={GlobalIcons.submit} />}
              disabled={busy || documents.length !== 2 || !discount || hasInvalidValues}
            >
              Submit and approve
            </Button>
          </Stack>
        )}
      </Box>
    </ThemeProvider>
  );
}
createRoot(document.getElementById('root')!).render(<Fixture />);
