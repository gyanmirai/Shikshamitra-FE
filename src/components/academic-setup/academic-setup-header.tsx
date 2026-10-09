import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { AcademicYearContext, type AcademicYearContextProps } from './academic-year-context';

export const AcademicSetupHeader = (props: AcademicYearContextProps) => (
  <>
    <CustomBreadcrumbs
      heading="Academic hierarchy"
      description="Build the school structure used by admissions, timetables, attendance, exams, and reporting."
      links={[
        { name: 'Institute setup', href: '/setting/academic-setup' },
        { name: 'Academic hierarchy' },
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
