import type { AdmissionForm } from 'src/redux/student/admissions/admission-forms-api';

import { it, vi, expect } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { AdmissionFormCloneDialog } from './admission-form-clone-dialog';
import { renderDocumentUi } from './document-verification/document-ui-test-fixture';

vi.mock('src/components/iconify', () => ({Iconify: () => null}));
const source = {id:'form-version', name:'Registration', version:2, description:'Saved description'} as AdmissionForm;
it('preserves an edited clone until the staff member explicitly discards it', async () => {
 const user = userEvent.setup(); const onClose = vi.fn();
 renderDocumentUi(<AdmissionFormCloneDialog source={source} saving={false} onClose={onClose} onSave={vi.fn()} />);
 const name=screen.getByRole('textbox', {name:/Form name/});
 await user.clear(name); await user.type(name,'Independent draft');
 await user.click(screen.getByRole('button', {name:'Cancel'}));
 expect(await screen.findByText('Discard Unsaved Changes?')).toBeVisible();
 expect(onClose).not.toHaveBeenCalled();
 await user.click(screen.getByRole('button',{name:'Keep editing'}));
 expect(name).toHaveValue('Independent draft');
 await user.click(screen.getByRole('button',{name:'Cancel'}));
 await user.click(screen.getByRole('button',{name:'Discard changes'}));
 expect(onClose).toHaveBeenCalledTimes(1);
});
it('blocks duplicate clone submission and exit while the actual write is pending', async () => {
 const user=userEvent.setup(); const onClose=vi.fn(); const onSave=vi.fn(()=>new Promise<boolean>(()=>{}));
 renderDocumentUi(<AdmissionFormCloneDialog source={source} saving={false} onClose={onClose} onSave={onSave}/>);
 await user.click(screen.getByRole('button',{name:'Submit'}));
 expect(onSave).toHaveBeenCalledTimes(1);
 expect(screen.getByRole('button',{name:'Submit'})).toBeDisabled();
 expect(screen.getByRole('button',{name:'Cancel'})).toBeDisabled();
 expect(screen.getByRole('button',{name:'close'})).toBeDisabled();
 expect(onClose).not.toHaveBeenCalled();
});
