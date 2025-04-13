import type { TabComponentType } from 'src/screens/hr/leave-request';

import { Box } from '@mui/material';

import ExamTypeSettings from './examTypeSetting/examTypeSetting';
import AssessmentTypeSettings from './assessmentTypeSetting/assessmentTypeSetting';

const SettingType = (props: TabComponentType) => (
  <Box>
    <ExamTypeSettings />
    <AssessmentTypeSettings />
  </Box>
);

export default SettingType;
