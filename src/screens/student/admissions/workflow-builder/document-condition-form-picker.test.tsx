import { useState } from 'react';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { it, vi, expect, describe } from 'vitest';
import userEvent from '@testing-library/user-event';
import { screen, waitFor } from '@testing-library/react';

import { chooseDocumentOption } from './document-editor-test-fixture';
import { renderDocumentUi } from '../document-verification/document-ui-test-fixture';
import { DocumentConditionFormPicker } from './components/document-condition-form-picker';
import { conditionFormList, conditionFormDetail } from './document-condition-test-fixture';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});
function Picker() {
  const [json, setJson] = useState('{"field":"","operator":"Equals","value":"yes"}');
  return (
    <>
      <DocumentConditionFormPicker forms={conditionFormList} json={json} onChange={setJson} />
      <output>{json}</output>
    </>
  );
}
describe('published form condition choices', { timeout: 15000 }, () => {
  it('fetches only the chosen application form and excludes inquiry rule options', async () => {
    const requests: string[] = [];
    mswServer.use(
      http.get('*/api/student/enrollment/admissions/forms/:id', ({ params }) => {
        requests.push(String(params.id));
        return HttpResponse.json(conditionFormDetail);
      })
    );
    const user = userEvent.setup();
    renderDocumentUi(<Picker />);
    expect(requests).toEqual([]);
    await chooseDocumentOption(user, 'Published form for answer choices', 'Registration · v2');
    await waitFor(() => expect(requests).toEqual(['form-a']));
    await user.click(screen.getByRole('combobox', { name: 'Applicant answer or fact' }));
    expect(screen.queryByRole('option', { name: /Information only/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'Inquiry status' })).not.toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'Inquiry source' })).not.toBeInTheDocument();
    await user.click(await screen.findByRole('option', { name: 'Previous school (Registration)' }));
    expect(screen.getByRole('status')).toHaveTextContent('application.PREVIOUS_SCHOOL');
    expect(screen.queryByRole('combobox', { name: 'Answer source' })).not.toBeInTheDocument();
    expect(requests).toEqual(['form-a']);
  });

  it('keeps a nested legacy inquiry rule unchanged until explicitly replaced', async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    renderDocumentUi(
      <DocumentConditionFormPicker
        forms={conditionFormList}
        json={JSON.stringify({ operator: 'ANY', conditions: [
          { field: 'application.category', operator: 'Equals', value: 'General' },
          { operator: 'ALL', conditions: [{ field: 'inquiry.source', operator: 'Equals', value: 'Website' }] },
        ] })}
        onChange={change}
      />
    );
    expect(change).not.toHaveBeenCalled();
    expect(screen.queryByRole('combobox', { name: 'Applicant answer or fact' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Replace inquiry condition' }));
    expect(change).toHaveBeenCalledWith(JSON.stringify({ field: '', operator: 'Equals', value: '' }));
  });

  it('excludes inquiry forms from published answer choices', async () => {
    const user = userEvent.setup();
    renderDocumentUi(
      <DocumentConditionFormPicker
        forms={[...conditionFormList, { ...conditionFormList[0], id: 'inquiry-form', name: 'Fair inquiry', purpose: 0 }]}
        onChange={vi.fn()}
      />
    );
    await user.click(screen.getByRole('combobox', { name: 'Published form for answer choices' }));
    expect(screen.queryByRole('option', { name: /Fair inquiry/ })).not.toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Registration · v2' })).toBeInTheDocument();
  });

  it('preserves an explicit blank-answer condition while retrying a failed form detail request', async () => {
    let requests = 0;
    mswServer.use(
      http.get('*/api/student/enrollment/admissions/forms/form-a', () => {
        requests += 1;
        return requests === 1
          ? HttpResponse.json({}, { status: 503 })
          : HttpResponse.json(conditionFormDetail);
      })
    );
    const user = userEvent.setup();
    const change = vi.fn();
    renderDocumentUi(
      <DocumentConditionFormPicker
        forms={conditionFormList}
        json='{"field":"application.PREVIOUS_SCHOOL","operator":"IsEmpty"}'
        onChange={change}
      />
    );
    expect(screen.queryByRole('textbox', { name: 'Comparison value' })).not.toBeInTheDocument();
    expect(screen.getByText(/explicitly saved blank/)).toBeInTheDocument();
    await chooseDocumentOption(user, 'Published form for answer choices', 'Registration · v2');
    await user.click(await screen.findByRole('button', { name: 'Retry' }));
    await waitFor(() => expect(requests).toBe(2));
    expect(change).not.toHaveBeenCalled();
    await waitFor(() =>
      expect(screen.getByRole('combobox', { name: 'Applicant answer or fact' })).toHaveValue(
        'Previous school (Registration)'
      )
    );
  });
});
