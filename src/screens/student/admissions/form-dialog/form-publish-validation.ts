import type { CreateUpdateAdmissionForm } from 'src/redux/student/admissions/admission-forms-api';

import { getBuilderIssueTarget } from './form-builder-issue-navigation';
import {
  getAddressDependencyChecks,
  addressDependencyErrorCodes,
} from './form-address-dependencies';
import {
  summarizeAdmissionFormIssues,
  formatAdmissionFormValidationError,
} from '../form-list/form-validation-errors';

import type { BuilderIssueTarget } from './form-builder-issue-navigation';

export class SavedAdmissionFormValidationError extends Error {
  readonly target?: BuilderIssueTarget;

  constructor(errors: string[], form: CreateUpdateAdmissionForm) {
    const fields = form.sections.flatMap((section) => section.fields);
    const { missing } = getAddressDependencyChecks(form);
    let target: BuilderIssueTarget | undefined;
    const messages = errors.map((issue) => {
      const [code, owner] = issue.split(':', 2);
      const field = owner && fields.find((item) => item.code.toUpperCase() === owner.toUpperCase());
      // Older API versions report a missing address dependency as an invalid rule reference.
      const legacyAddress =
        field && code === 'Admissions.FormInvalidRuleReference'
          ? missing.find((item) => item.field.id === field.id)
          : undefined;
      const issueCode = legacyAddress ? addressDependencyErrorCodes[legacyAddress.kind] : code;
      const missingAddress =
        issueCode === addressDependencyErrorCodes.state ||
        issueCode === addressDependencyErrorCodes.city;
      if (field && !target && (missingAddress || issueCode === addressDependencyErrorCodes.order)) {
        target = getBuilderIssueTarget(form, {
          fieldId: field.id,
          settingPath: missingAddress ? '.validationJson' : undefined,
        });
      }
      const label = (field && field.label.trim()) || undefined;
      return formatAdmissionFormValidationError(
        legacyAddress ? `${issueCode}:${owner}` : issue,
        label ||
          (owner && !Object.values(addressDependencyErrorCodes).some((key) => key === issueCode)
            ? 'This question'
            : undefined)
      );
    });
    const guidance =
      summarizeAdmissionFormIssues(messages) || 'Review the form checks before publishing.';
    super(`Draft saved, but not published. ${guidance}`);
    this.target = target;
  }
}
