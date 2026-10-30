import { parseApiProblemDetail } from 'src/utils/api-problem-details';

// Keep staff wording local to Onboarding. The shared parser serves other modules too.
const messages: Record<string, string> = {
  'Invalid maximumNumber in onboarding settings.':
    'Enter a whole maximum number, or leave it blank for no limit.',
  'Maximum number must not be below the starting number.':
    'Maximum number must be greater than or equal to the starting number.',
  'Student and adult app logins need different saved email addresses.':
    'Use different saved emails for the student and parent / guardian logins.',
  'This email is already used by a conflicting, inactive or restricted account. Existing accounts cannot be merged or repurposed through a profile email change.':
    'This email already has another login or restricted access. Use a different email, or ask your administrator to review it.',
  'This Student email is already used by another account. Correct the saved email or ask authorized staff to review it.':
    'This student email already has another login. Update the saved email, or ask your administrator to review it.',
  'The saved email belongs to a conflicting, inactive or restricted account, or has no accessible verified Parent association. Ask authorized staff to review it.':
    'This email cannot be used for parent access. Ask your administrator to review the existing login and linked children.',
  'The saved email is conflicting, inactive, restricted or has no accessible verified Parent association. Refresh App Login or ask authorized staff to review it.':
    'This email cannot be used for parent access. Refresh App Login, or ask your administrator to review the existing login and linked children.',
  'Explicitly confirm the saved adult and existing Parent account in App Login before linking.':
    'Confirm this person may access the student, then choose Confirm & link parent.',
  'Confirm the current saved adult and existing Parent account before linking.':
    'Confirm this person may access the student, then choose Confirm & link parent.',
  'Confirm the existing saved adult explicitly in App Login after activation.':
    'Activate the student, then confirm and link this parent in App Login.',
  'The reviewed existing adult or linked account changed. Ask authorized staff to review App Login.':
    'The saved adult or linked login has changed. Ask your administrator to review App Login.',
  'The saved adult differs from the reviewed linked Parent account.':
    'A different adult login is linked. Ask your administrator to review App Login.',
  'An adult app-access review is pending. Complete the reviewed access workflow before linking or sending sign-in help.':
    'An adult access review is pending. Complete it before linking or sending sign-in help.',
  'A different adult access choice is already linked. Use the reviewed access repair workflow.':
    'A different adult login is already linked. Ask your administrator to review access.',
  'Guardian app access is already selected. Use the reviewed access repair workflow.':
    'Guardian access is already selected. Ask your administrator to review access.',
  'The reviewed adult selection changed. Use the reviewed access repair workflow.':
    'The saved adult choice has changed. Ask your administrator to review access.',
  'Uses the existing Parent login. Select sign-in help to email secure account access guidance.':
    'This parent uses an existing login. Select them to send sign-in help; their password stays unchanged.',
  'This parent account is already confirmed. Link it before requesting an email change.':
    'Link the confirmed parent before changing the login email.',
  'Identity update permission is required.': 'Ask authorized staff to link this parent.',
  'An identity already uses this email. Only an explicitly confirmed, verified existing guardian portal account may be linked for a sibling.':
    'This email already has an app login. Use a different student email, or ask your administrator to check the existing login.',
  'The saved email changed. Refresh the recipient before sending credentials.':
    'The email has changed. Refresh App Login and check the email before sending.',
  'The saved email changed. Refresh and review the recipient before sending.':
    'The email has changed. Refresh App Login and check the email before sending.',
  'Student app access is not enabled for this case. Review its saved portal-access requirements.':
    'Student login is turned off for this student. Ask your administrator to review App Login settings.',
  'Parent app access is not enabled for this case. Review its saved portal-access requirements.':
    'Parent login is turned off for this student. Ask your administrator to review App Login settings.',
  'This app login is not enabled by the saved onboarding settings.':
    'This login is turned off. Ask your administrator to review App Login settings.',
  'This account is not required by the saved onboarding settings.':
    'This login is not needed under the saved App Login settings.',
  'Uses the existing parent login. No new credentials are needed.':
    "This student uses the parent's existing login. No new password or login email is needed.",
  'Uses existing parent login. No new credentials needed.':
    "This student uses the parent's existing login. No new password or login email is needed.",
  'This student uses the existing parent login. No new credentials are needed.':
    "This student uses the parent's existing login. No new password or login email is needed.",
  'The existing parent will be linked when you save and activate the student.':
    'Save & Activate will link this student to the existing parent login.',
  'Save and activate the student to link the confirmed existing parent. No new credentials are needed.':
    'Save & Activate will link this student to the existing parent login. No new login email is needed.',
  'Confirm this parent through Add sibling in Admissions before linking an existing account.':
    'Confirm this parent using Add sibling in Admissions before linking the login.',
  'Confirm this parent through Add sibling in Admissions, then activate the student to link the existing account.':
    'Confirm this parent using Add sibling in Admissions, then Save & Activate to link the login.',
  'The existing parent account changed. Refresh before linking.':
    'Parent login details have changed. Refresh App Login before linking.',
  'The linked parent differs from the reviewed sibling account.':
    'A different parent login is linked. Ask your administrator to review it.',
  "The existing account link differs or is inactive. Use the identity administrator's reviewed repair workflow.":
    'The linked login has changed or is inactive. Ask your administrator to review it.',
  'A different account owner is already linked. Ask an identity administrator to review it.':
    'A different person is already linked. Ask your administrator to review the login.',
  'An identity administrator must review this account before credentials can be sent.':
    'Ask your administrator to review this login before sending login details.',
  'An authorized identity administrator must prepare this account.':
    'Ask your administrator to prepare this login before sending login details.',
  'An authorized identity administrator must link this existing account.':
    'Ask your administrator to link the existing login.',
  'The saved email cannot be linked automatically. Ask an identity administrator to review it.':
    'This email cannot be linked automatically. Ask your administrator to review the login.',
  'This guardian email already belongs to an account. Ask an identity administrator to use the reviewed access repair workflow.':
    'This email already has a login. Ask your administrator to review the link.',
  'This guardian email already belongs to an account. Use the reviewed access repair workflow.':
    'This email already has a login. Ask your administrator to review the link.',
  'Guardian app access is already selected for this case. Use the reviewed access repair workflow.':
    'Another adult login is already selected. Ask your administrator to review access.',
  'The required portal role has not been configured by an identity administrator.':
    'App login setup is incomplete. Ask your administrator to finish it.',
  "The school's portal role needs to be configured by an identity administrator.":
    'App login setup is incomplete. Ask your administrator to finish it.',
  'Account creation was rejected by the identity policy. Review the email and username with your identity administrator.':
    'The login could not be created. Ask your administrator to check the email and username.',
  'The configured portal role could not be assigned.':
    'App access could not be assigned. Ask your administrator to review the login.',
  'The saved account-owner mobile could not be assigned.':
    'The saved mobile number could not be added to the login. Ask your administrator to review it.',
  'The linked identity must have only the expected portal role.':
    'This login has different access than expected. Ask your administrator to review it.',
  "The email must match the selected person's saved profile. Correct and verify the profile first.":
    'The email does not match the selected person. Refresh App Login and check the saved email.',
  'A matching email address is mandatory. Review the saved account-owner profile and link.':
    'The email does not match the linked login. Ask your administrator to review it.',
  'Link the confirmed parent before requesting a login email change.':
    'Link the confirmed parent before changing the login email.',
  'You do not have permission to send credentials.':
    'You cannot send login details. Ask your administrator for access.',
  'Activate the student first.': 'Activate the student before sending login details.',
  'Complete enrollment activation before sending credentials.':
    'Activate the student before sending login details.',
  "Activate the student's enrollment before sending credentials.":
    'Activate the student before sending login details.',
  'The student must be actively enrolled in the school.':
    'The student must be active before login details can be sent.',
  'Complete and commit the GR number, roll number and division before sending credentials.':
    'Save the division, GR number and roll number before sending login details.',
  'Verify every applicable Offering document before sending credentials.':
    'Review the required admission documents before sending login details.',
  'Validate every required document before sending credentials.':
    'Review the required documents before sending login details.',
  'Credentials are queued for onboarding completion.':
    'Login email is queued until onboarding is complete.',
  'Delivery starts after onboarding completes.':
    'Login email is queued until onboarding is complete.',
  'The school sends credentials after full onboarding completion, including requested app access.':
    'Login email will be sent after onboarding and required app access are complete.',
  'Credentials are already queued.': 'Login email is queued. Check status before sending again.',
  'A credential email is being processed. Refresh its status before sending again.':
    'Login email is being processed. Refresh status before sending again.',
  'Wait two minutes before sending credentials again.':
    'Wait two minutes before sending login details again.',
  'Choose a saved Student or parent account owner.': 'Select the student or parent for this login.',
  'Choose the current saved Father, Mother or Guardian profile.':
    'Select the person whose saved email should be used.',
  'Assign a division before assigning a Roll number.':
    'Select a division before assigning a roll number.',
  'Assign a Division before preparing a Roll number.':
    'Select a division before assigning a roll number.',
  'GR number is locked.':
    'This number is locked. Ask an administrator to unlock it before editing.',
  'Roll number is locked.':
    'This number is locked. Ask an administrator to unlock it before editing.',
  'Load the published GR assignment settings before assigning.':
    'GR settings are unavailable. Reload before assigning a number.',
  'Load the school Roll assignment rule before assigning.':
    'Roll number settings are unavailable. Reload before assigning a number.',
  'Enter a reason for changing the GR number.': 'Explain why this number needs to change.',
  'Enter a reason for changing the Roll number.': 'Explain why this number needs to change.',
  'GR number already exists.':
    'This GR number is already in use or reserved. Enter a different number.',
  'This GR number is already reserved.':
    'This GR number is already in use or reserved. Enter a different number.',
  'This roll number is already assigned or reserved in the selected class/division for this academic year. Enter an unused number, or use Automatic if available.':
    'This roll number is already in use or reserved. Enter a different number.',
  'This onboarding case is cancelled and cannot be activated.':
    'This student setup was cancelled and cannot be activated.',
  'Correct committed identifiers through Student Records.':
    'Update saved student numbers in Student Records.',
};

const errorMessages: Record<string, string> = {
  'Students.Onboarding.RollNumberDuplicate':
    'This roll number is already in use or reserved. Enter a different number.',
  'Students.Onboarding.RollNumberInvalid': 'Enter a whole roll number starting from 1.',
  'Students.Onboarding.IdentifierLocked':
    'This number is locked. Ask an administrator to unlock it before editing.',
  'Students.Onboarding.ConcurrencyConflict':
    'Student details have changed. Refresh and review them before saving again.',
  'Students.Records.RollProposalChanged':
    'The next roll number has changed. Refresh and review it before saving.',
  'Students.Onboarding.DivisionFull': 'This division is full. Select another division.',
  'Students.Onboarding.PlacementInvalid':
    'The selected class or division is unavailable. Refresh and select it again.',
  'Students.Onboarding.IdentifierSeriesUnavailable':
    'No GR numbering rule is available. Ask your administrator to publish one.',
  'Students.Onboarding.IdentifierAlreadyAllocated':
    'This GR number is already in use or reserved. Enter a different number.',
  'Students.Onboarding.SeatReservationExpired':
    'The reserved seat has expired. Ask your administrator to review the placement.',
  'Students.Onboarding.RequiredStepsIncomplete':
    'Complete the remaining setup requirements before activating the student.',
  'Students.Onboarding.CaseNotEditable':
    'This student setup cannot be edited. Refresh and review its status.',
  'Students.Onboarding.CoreIdentityIncomplete':
    'Complete the required student details before continuing.',
  'Students.Onboarding.GuardianContactUnverified':
    'Verify the parent contact details before continuing.',
  'Students.Onboarding.DuplicateResolutionRequired':
    'A possible duplicate student was found. Review it before continuing.',
  'Students.Onboarding.WorkflowIncomplete':
    'Complete the remaining admission steps before continuing.',
  'Students.Onboarding.EnrollmentAlreadyExists':
    'This student is already enrolled. Refresh and review the student record.',
  'Students.Onboarding.PolicyScopeInvalid':
    'These settings do not match the selected classes. Review the academic selections.',
};

const technicalMessage =
  /\b(?:\w*exception|npgsql|stacktrace|identity|provisioning|concurrency|snapshot|sql|database|fetch_error|parsing_error|abp)\b|(?:[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})|(?:system\.[a-z]+)|\b(?:AbpIdentity|Students|Volo)\.[a-z]|failed to fetch|one or more (?:business rules|validation errors)|something went wrong|business rule violated|^offline$|^network error$/i;

/** Translate known reasons without guessing which PortalAccountInvalid check failed. */
export function getOnboardingMessage(message: string | null | undefined, fallback: string): string {
  const text = message?.trim();
  if (!text || text.startsWith('{') || text.startsWith('[')) return fallback;
  return messages[text] || (technicalMessage.test(text) ? fallback : text);
}

/** Presentation only: keep codes, payloads, permissions and backend validation untouched. */
export function getOnboardingErrorMessage(error: unknown, fallback: string): string {
  const problem = parseApiProblemDetail(error);
  const code = problem.errorCode?.replace(/:/g, '.');
  // A fee command can fail during Save & Activate; preserve its owning message unchanged.
  if (code?.startsWith('Finance.')) return problem.detail;
  const status = error && typeof error === 'object' && 'status' in error ? error.status : undefined;
  if (status === 401 || status === 403) {
    return 'You cannot make this change. Ask your administrator for access.';
  }
  return (
    messages[problem.detail] ||
    (code && errorMessages[code]) ||
    getOnboardingMessage(problem.detail, fallback)
  );
}
