import type { TabComponentType } from 'src/screens/hr/leave-request';

import { Box } from '@mui/material';

import ExamTypeSettings from './exam-type-setting/examTypeSetting';
import AssessmentTypeSettings from './assessment-type-setting/assessmentTypeSetting';

const SettingType = (props: TabComponentType) => (
  <Box>
    <ExamTypeSettings />
    <AssessmentTypeSettings />
  </Box>
);

export default SettingType;
