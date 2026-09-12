import type { ReactNode } from 'react';

import { isValidElement } from 'react';
import Box from '@mui/material/Box';

import { EmptyContent } from '../../empty-content';

interface Props {
  noDataText: ReactNode;
  tableWidth: number;
}

export default function TableEmptyState({ noDataText, tableWidth }: Props) {
  const stickyWidth = tableWidth || '100%';

  // if (isValidElement(noDataText)) {
  //   return <Box sx={{ width: stickyWidth, position: 'sticky', left: 0 }}>{noDataText}</Box>;
  // }

  return (
    <EmptyContent
      title={noDataText}
      sx={{ width: stickyWidth, position: 'sticky', left: 0, p: 0 }}
    />
  );
}