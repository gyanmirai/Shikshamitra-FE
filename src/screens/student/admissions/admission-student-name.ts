/** Student names may consist of a single name. Custom and adult-name questions retain their rules. */
export function isOptionalStudentNamePart(field: {
  bindingType?: number;
  bindingKey?: string | null;
}) {
  return (
    field.bindingType === 0 &&
    ['Applicant.MiddleName', 'Applicant.LastName'].includes(field.bindingKey ?? '')
  );
}
