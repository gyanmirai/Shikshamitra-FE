import { it, expect } from 'vitest';

import { studentSetupReturnUrl, getStudentSetupReturnUrl, studentSetupWorkflowReturnUrl, getStudentSetupWorkflowReturnUrl } from './student-setup-return';

it('accepts only the known Student guide workflow return destination', () => {
  expect(getStudentSetupWorkflowReturnUrl(studentSetupWorkflowReturnUrl)).toBe(studentSetupWorkflowReturnUrl);
  [null, '//evil.test', 'https://evil.test/student/setup', '/student/setup?stage=review', '/student/setup/other'].forEach((value) => {
    expect(getStudentSetupWorkflowReturnUrl(value)).toBeUndefined();
  });
});

it('preserves the original safe Student destination through the nested guide return URL', () => {
  const original = '/student/admissions/inquiries?search=family%20one';
  const guide = studentSetupReturnUrl('admission-stages', 'year-a', original);
  expect(new URLSearchParams(guide.split('?')[1]).get('returnTo')).toBe(original);
  expect(getStudentSetupWorkflowReturnUrl(guide)).toBe(guide);
  const forms = `/student/setup?stage=admissions&setting=admission-forms&guideYear=year-a&returnTo=${  encodeURIComponent(original)}`;
  expect(getStudentSetupReturnUrl(forms, 'admission-forms')).toBe(forms);
});

it('rejects external and recursively nested original guide destinations', () => {
  ['https://evil.test', '//evil.test', '/student/setup?stage=review', '/student/admissions/inquiries?returnTo=%2Fstudent%2Fsetup', '/student/../student/setup'].forEach((original) => {
    const value = `/student/setup?stage=admissions&setting=admission-stages&returnTo=${  encodeURIComponent(original)}`;
    expect(getStudentSetupWorkflowReturnUrl(value)).toBeUndefined();
  });
  expect(getStudentSetupWorkflowReturnUrl('/student/setup?stage=admissions&setting=admission-stages&unknown=1')).toBeUndefined();
});
