/** Recovery messages for APIs that return an unlocalized concession rule code. */
const MESSAGES: Record<string, string> = {
  'Finance:Concession:010004':
    'Upload the required supporting documents before submitting this concession request.',
  'Finance:Concession:010010':
    'A pending concession request already exists for this concession type in this academic year. Review the existing request.',
  'Finance:Concession:010017':
    'One or more supporting documents are invalid for this concession type. Review the required documents and upload them again.',
  'Finance:Concession:010018':
    'This action is not allowed in the concession request’s current status. Refresh and review the request.',
  'Finance:Concession:010019':
    'No eligible fee balance remains for this concession policy. Refresh and review the selected fees.',
  'Finance:Concession:010020':
    'The selected installments or balances changed after the preview. Review the refreshed amounts and submit again.',
  'Finance:Concession:010021':
    'This submission key was already used with different details. Reopen the request and review the saved values before retrying.',
  'Finance:Concession:010022':
    'More than one fee assignment is available for this student. Select the applicable fee assignment before continuing.',
  'Finance:Concession:010023':
    'This legacy concession request needs repair before it can be changed. Contact support with the request reference.',
  'Finance:Concession:010024':
    'A supporting document is not available to this request. Upload the required documents again.',
  'Finance:Concession:010025':
    'The saved concession configuration snapshot is invalid. Reopen the request and review its policy and fee selection.',
  'Finance:Concession:010028':
    'A supporting document upload has expired. Upload the affected document again before saving.',
  'Finance:Concession:010032':
    'Concession amount must be a whole rupee. Enter ₹1 or more for the affected installment.',
  'Finance:Concession:010033':
    'This concession request cannot be edited in its current status. Only draft requests can be edited.',
  'Finance:Concession:010034':
    'This student already has an approved benefit for this concession type in this academic year. Another benefit cannot be requested or approved.',
  'Finance:Concession:020002':
    'The selected student is not available in this academic context. Refresh the student selection.',
  'Finance:Concession:020003':
    'The selected concession type is unavailable. Select an available concession type before continuing.',
  'Finance:Concession:020005':
    'The selected student, fees and policy do not belong to the same academic scope. Review the selection.',
  'Finance:Concession:020006':
    'One or more selected fees are not eligible for this policy and fee assignment. Refresh and review the selected fees.',
  'Finance:Concession:030002':
    'The request version is missing. Reopen the concession request before trying again.',
  'Finance:Concession:030003':
    'The concession request or fee balances changed. Reopen the request, review the latest values and try again.',
};

export function concessionRequestErrorMessage(code: unknown, data?: Record<string, unknown>) {
  if (typeof code !== 'string') return undefined;
  if (code === 'Finance:Concession:010018' || code === 'Finance:Concession:010033') {
    const status = data?.Status;
    // Only known workflow states are suitable for interpolating into recovery text.
    if (
      typeof status === 'string' &&
      [
        'Draft',
        'Pending',
        'Approved',
        'Rejected',
        'Cancelled',
        'PartiallyReversed',
        'Reversed',
      ].includes(status)
    ) {
      return code.endsWith('010033')
        ? `This concession request cannot be edited because its status is ${status}. Only draft requests can be edited.`
        : `This action is not allowed because the concession request’s status is ${status}. Refresh and review the request.`;
    }
  }
  return MESSAGES[code];
}
