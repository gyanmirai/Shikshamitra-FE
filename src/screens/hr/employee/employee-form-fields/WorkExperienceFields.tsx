import WorkExperiences from '../work-experiance';

import type { FieldsType } from './types';

export const WorkExperienceFields: FieldsType[] = [
  {
    type: '',
    label: 'Company Name',
    name: 'companyName',
    placeholder: 'Enter Company Name',
    renderComp: (props) => <WorkExperiences {...props} />,
  },
];
