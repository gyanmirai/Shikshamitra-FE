import { OrganizationForm } from './stage-form';
import { OnboardingStandardForm } from './onboarding-standard-form';
import { OnboardingDivisionForm } from './onboarding-division-form';
import { StandardManagementForm } from './standard-management-form';
import { DivisionManagementForm } from './division-management-form';

const close = () => {};

export const academicNamePreviewCases = [
  [
    'stage',
    /Stage name/,
    () => <OrganizationForm mediumId="medium" editData={null} handleClose={close} />,
  ],
  [
    'standard',
    /Class name/,
    () => <StandardManagementForm organizationId="stage" editData={null} handleClose={close} />,
  ],
  [
    'division',
    /Division name/,
    () => (
      <DivisionManagementForm
        classId="standard"
        editData={null}
        showRoomSelection={false}
        handleClose={close}
      />
    ),
  ],
  [
    'onboarding standard',
    /Class Name/,
    () => <OnboardingStandardForm organizationId="stage" handleClose={close} />,
  ],
  [
    'onboarding division',
    /Division Name/,
    () => <OnboardingDivisionForm classId="standard" handleClose={close} />,
  ],
] as const;
