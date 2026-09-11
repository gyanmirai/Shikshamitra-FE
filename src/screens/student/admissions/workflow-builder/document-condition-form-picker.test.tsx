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
  it('fetches only the chosen form detail and uses the explicitly selected answer source', async () => {
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
    await user.click(await screen.findByRole('option', { name: 'Previous school (Registration)' }));
    expect(screen.getByRole('status')).toHaveTextContent('application.PREVIOUS_SCHOOL');
    await chooseDocumentOption(user, 'Answer source', 'Inquiry answer');
    await user.clear(screen.getByRole('combobox', { name: 'Applicant answer or fact' }));
    await user.click(screen.getByRole('combobox', { name: 'Applicant answer or fact' }));
    await user.click(await screen.findByRole('option', { name: 'Previous school (Registration)' }));
    expect(screen.getByRole('status')).toHaveTextContent('inquiry.student.previousSchool');
    expect(requests).toEqual(['form-a']);
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
