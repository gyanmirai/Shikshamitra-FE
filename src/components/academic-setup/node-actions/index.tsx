import type { Board, Medium, Division, Standards, Organization } from 'src/types/school';

import { Stack } from '@mui/material';

import type { AcademicSetupNode } from '../academic-setup-model';

import { BoardActions } from './board-actions';
import { MediumActions } from './medium-actions';
import { StageActions } from './stage-actions';
import { DivisionActions } from './division-actions';
import { StandardActions } from './standard-actions';

export const AcademicNodeActions = ({ node }: { node: AcademicSetupNode }) => {
  let actions: React.ReactNode = null;

  if (node.type === 'Education Board') {
    actions = <BoardActions board={node.data as Board} parents={node.parentsData} />;
  } else if (node.type === 'Medium') {
    actions = <MediumActions medium={node.data as Medium} parents={node.parentsData} />;
  } else if (node.type === 'Organization') {
    actions = <StageActions stage={node.data as Organization} parents={node.parentsData} />;
  } else if (node.type === 'Standard') {
    actions = <StandardActions standard={node.data as Standards} parents={node.parentsData} />;
  } else if (node.type === 'Division') {
    actions = <DivisionActions division={node.data as Division} parents={node.parentsData} />;
  }

  return actions ? (
    <Stack direction="row" alignItems="center" spacing={0.5} sx={{ flexShrink: 0 }}>
      {actions}
    </Stack>
  ) : null;
};
