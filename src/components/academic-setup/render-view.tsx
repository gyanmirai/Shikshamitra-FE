import type {
  Board,
  Medium,
  Division,
  Standards,
  AcademicYear,
  Organization,
} from 'src/types/school';

import React from 'react';

import { Card, Tooltip, Typography } from '@mui/material';

import { Label } from '../label';
import { Iconify } from '../iconify';

const typeIcon = {
  'Education Board': 'octicon:mortar-board-24',
  Standard: 'healthicons:i-training-class-24px',
  Division: 'hugeicons:license-third-party',
  Medium: 'bxs:layer',
  Organization: 'clarity:organization-solid',
  'Academic Year': 'iwwa:year',
};

const informationText = {
  'Education Board':
    'The education board determines the curriculum and examination guidelines for students, such as CBSE, ICSE, or State Board.',
  Standard:
    'A standard represents the academic level a student is enrolled in, such as standard 1, standard 2, etc.',
  Division:
    'A division is a section within a standard that helps in better classroom management, such as A, B, C, etc.',
  Medium:
    'The medium of instruction specifies the language used for teaching, such as English, Hindi, or regional languages.',
  Organization:
    'An organization represents the school or educational institute managing the academic and administrative functions. such as Pre-Primary,Primary ',
  'Academic Year':
    'The academic year defines the start and end dates of school operations, ensuring proper scheduling for classes, exams, and admissions.',
};

type IRenderViewProps = (Board | Division | Medium | Organization | Standards | AcademicYear) & {
  type: 'Education Board' | 'Standard' | 'Division' | 'Medium' | 'Organization' | 'Academic Year';
  description?: React.ReactNode;
  nameValue?: React.ReactNode | string;
  RenderThreeDotsAction?: (props: IRenderViewProps) => React.ReactElement<any>;
};

const RenderView = (props: IRenderViewProps) => {
  const { name, description, type, RenderThreeDotsAction, nameValue } = props;
  return (
    <Card
      sx={{
        p: 2,
        minWidth: 180,
        borderRadius: 1.5,
        textAlign: 'left',
        position: 'relative',
        display: 'inline-flex',
        flexDirection: 'column',
        '& *': {
          userSelect: 'none',
        },
        //   ...sx,
      }}
    >
      {RenderThreeDotsAction && RenderThreeDotsAction(props)}
      <Tooltip title={informationText[type]} placement="right" arrow>
        <Iconify
          icon="lucide:info"
          sx={{ position: 'absolute', bottom: 10, right: 10, cursor: 'pointer' }}
          color="info.main"
        />
      </Tooltip>

      <Typography variant="subtitle1" noWrap mb={0.5}>
        <Label color="primary"> {type}</Label>
      </Typography>
      {/* <Avatar
      alt=""
      src="https://assets.minimals.cc/public/assets/images/mock/avatar/avatar-2.webp"
      sx={{ mr: 2, mb: 2, width: 48, height: 48 }}
    /> */}
      <Iconify
        icon={typeIcon[type]}
        //   color="success.main"
        sx={{ mr: 2, mb: 0.5, width: 32, height: 32 }}
      />
      <Typography variant="subtitle1" noWrap sx={{ mb: 0.5, pt: 1 }}>
        {nameValue || name}
      </Typography>

      {type === 'Standard' && (
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          <Typography component="span" variant="caption">
            {' '}
            Total Divisions : {((props as Standards).divisions as Standards['divisions'])?.length}
          </Typography>
        </Typography>
      )}

      {type === 'Division' && (
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          <Typography component="span" variant="caption">
            {' '}
            Strength : {(props as Division).strength}
          </Typography>
        </Typography>
      )}

      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
        <Typography component="span" variant="caption">
          {' '}
          {description}
        </Typography>
      </Typography>
    </Card>
  );
};

export default RenderView;
