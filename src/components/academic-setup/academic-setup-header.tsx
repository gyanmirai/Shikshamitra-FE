import { instituteSetupPaths } from 'src/constants/institute-setup';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { useAcademicSetupContext } from './academic-setup-context';
import { AcademicFieldFormattingPopover } from './academic-field-formatting-popover';
import { AcademicYearContext, type AcademicYearContextProps } from './academic-year-context';

export const AcademicSetupHeader = (props: AcademicYearContextProps) => {
  const { isOnboarding } = useAcademicSetupContext();
  const pageTitle = 'Academic Setup';

  return (
    <>
      <CustomBreadcrumbs
        action={<AcademicFieldFormattingPopover />}
        heading={isOnboarding ? undefined : pageTitle}
        description={
          isOnboarding
            ? undefined
            : 'Build the school structure used by admissions, timetables, attendance, exams, and reporting.'
        }
        links={[
          { name: 'Institute Setup', href: instituteSetupPaths.academicSetup },
          { name: isOnboarding ? 'Academic structure' : pageTitle },
        ]}
        slotProps={{
          action: {},
          heading: { overflowWrap: 'normal', whiteSpace: 'nowrap' },
          moreLink: {},
          breadcrumbs: { width: '100%' },
        }}
        sx={{
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'flex-start', sm: 'center' },
          // gap: 1,
        }}
      />
      <AcademicYearContext {...props} />
    </>
  );
};
