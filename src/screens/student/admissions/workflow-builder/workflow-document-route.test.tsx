import type { AdmissionWorkflowStage } from 'src/redux/student/admissions/admission-workflows-api';

import { addIcon } from '@iconify/react';
import { it, vi, expect, describe } from 'vitest';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { render, screen, waitFor } from '@testing-library/react';
import { defaultSettings } from 'src/components/settings/config-settings';
import {
  DEFAULT_DOCUMENT_POLICY,
  createDocumentRequirement,
} from 'src/redux/student/admissions/admission-document-policy';

import { AdmissionWorkflowTransitionDrawer } from '../admission-workflow-transition-drawer';

['close', 'content-save-outline'].forEach((name) => {
  addIcon(`mdi:${name}`, { body: '<path d="M0 0h16v16H0z"/>', width: 16, height: 16 });
});
const source: AdmissionWorkflowStage = {
  id: 'documents-1',
  code: 'DOCUMENTS',
  name: 'Document verification',
  stageType: 5,
  displayOrder: 0,
  isRequired: true,
  allowManualSkip: false,
  isEntryStage: false,
  isTerminalStage: false,
  configurationJson: JSON.stringify({
    documentVerification: {
      ...DEFAULT_DOCUMENT_POLICY,
      requirements: [createDocumentRequirement('BIRTH_CERTIFICATE', 'Birth certificate')],
    },
  }),
};
const destination: AdmissionWorkflowStage = {
  ...source,
  id: 'offer-1',
  code: 'OFFER',
  name: 'Offer',
  stageType: 11,
  displayOrder: 1,
  isEntryStage: false,
  configurationJson: undefined,
};
const otherStage = { ...destination, id: 'review-1', code: 'REVIEW', name: 'Staff review' };
function setup(conditionRuleJson?: string) {
  const onSave = vi.fn();
  render(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <AdmissionWorkflowTransitionDrawer
        open
        stages={[source, destination, otherStage]}
        readOnly={false}
        transition={{
          id: 'transition-1',
          fromStageId: source.id,
          toStageId: destination.id,
          priority: 0,
          isDefault: !conditionRuleJson,
          conditionRuleJson,
        }}
        onClose={vi.fn()}
        onSave={onSave}
      />
    </ThemeProvider>
  );
  return { user: userEvent.setup(), onSave };
}

describe('document outcome route interactions', { timeout: 15000 }, () => {
  it('serializes a waiver route using authoritative document facts', async () => {
    const { user, onSave } = setup();
    await user.click(screen.getByRole('combobox', { name: 'Continue after document review' }));
    await user.click(screen.getByRole('option', { name: 'A document waiver was used' }));
    await waitFor(() =>
      expect(screen.queryByRole('listbox', { hidden: true })).not.toBeInTheDocument()
    );
    expect(screen.queryByRole('textbox', { name: 'Application field *' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Save path' }));
    await waitFor(() => expect(onSave).toHaveBeenCalledOnce());
    expect(onSave.mock.calls[0][0].isDefault).toBe(false);
    expect(JSON.parse(onSave.mock.calls[0][0].conditionRuleJson)).toEqual({
      field: 'documents.waivedCount',
      operator: 'GreaterThan',
      value: '0',
    });
  });
  it('reopens a verified route and restores the ordinary default route', async () => {
    const { user, onSave } = setup(
      '{"field":"documents.status","operator":"Equals","value":"verified"}'
    );
    expect(
      screen.getByRole('combobox', { name: 'Continue after document review' })
    ).toHaveTextContent('Required documents resolved');
    await user.click(screen.getByRole('combobox', { name: 'Continue after document review' }));
    await user.click(
      screen.getByRole('option', { name: 'Required documents resolved (default route)' })
    );
    await waitFor(() =>
      expect(screen.queryByRole('listbox', { hidden: true })).not.toBeInTheDocument()
    );
    await user.click(screen.getByRole('button', { name: 'Save path' }));
    await waitFor(() => expect(onSave).toHaveBeenCalledOnce());
    expect(onSave.mock.calls[0][0]).toMatchObject({
      isDefault: true,
      conditionRuleJson: undefined,
    });
  });
  it.each([
    ['{"field":"documents.status","operator":"Equals","value":"verified"}'],
    ['{"field":"application.CATEGORY","operator":"Equals","value":"transfer"}'],
  ] as const)('keeps the path attached to its document stage: %s', async (condition) => {
    const { user, onSave } = setup(condition);
    expect(screen.getByRole('heading', { name: 'Document verification' })).toBeInTheDocument();
    expect(screen.queryByRole('combobox', { name: 'From stage *' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Save path' }));
    await waitFor(() => expect(onSave).toHaveBeenCalledOnce());
    expect(onSave.mock.calls[0][0].fromStageId).toBe(source.id);
    expect(onSave.mock.calls[0][0].isDefault).toBe(false);
    expect(JSON.parse(onSave.mock.calls[0][0].conditionRuleJson)).toEqual(JSON.parse(condition));
  });
});
