import type { Board } from 'src/types/school';
import type { RootState } from 'src/redux/store';
import type { AccessSelection } from 'src/utils/academicHierarchyUtils';

import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Scrollbar } from 'src/components/scrollbar';
import { Box, Card, Grid, Checkbox, Typography, CardHeader } from '@mui/material';
import { compressExplicitAcademicSelection } from 'src/utils/academicHierarchyUtils';

import { AcademicSelectionTreeNode } from './academic-selection-node';
import {
  toggleAcademicSelection,
  buildAcademicSelectionTree,
  buildAcademicSelectionStatus,
} from './academic-selection-model';

import type { AcademicSelectionNode } from './academic-selection-model';

export const BoardScreenStep = ({
  boards,
  academicYearId,
  checkedItem,
  setCheckedItem,
  setSelectedData,
}: {
  boards?: Board[];
  academicYearId?: string;
  checkedItem: AccessSelection;
  setCheckedItem: (selection: AccessSelection) => void;
  setSelectedData: (selection: AccessSelection) => void;
}) => {
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const yearId = academicYearId ?? currentYear?.id;
  // Memoization justification: retain the hierarchy across checkbox-only updates.
  const allBoards = useMemo(
    () => boards?.filter((board) => board.academicYearId === yearId) ?? [],
    [boards, yearId]
  );
  // Memoization justification: the full hierarchy mapping depends only on the year and boards.
  const nodeData = useMemo(() => buildAcademicSelectionTree(allBoards), [allBoards]);
  const statuses = buildAcademicSelectionStatus(nodeData, checkedItem);

  const handleNodeSelect = (node: AcademicSelectionNode) => {
    const updated = toggleAcademicSelection(
      nodeData,
      node,
      checkedItem,
      statuses.get(node.id) === 'full'
    );
    setCheckedItem(updated);
    setSelectedData(compressExplicitAcademicSelection(updated, allBoards));
  };

  return (
    <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ flex: 1, minHeight: 0, height: '100%' }}>
        <Grid container spacing={3} sx={{ height: '100%' }}>
          {nodeData.map((boardNode) => {
            const status = statuses.get(boardNode.id);
            return (
              <Grid size={{ xs: 12, md: 6, lg: 6 }} key={boardNode.id} sx={{ height: '100%' }}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: (theme) => theme.customShadows.z4,
                  }}
                >
                  <CardHeader
                    title={boardNode.name}
                    subheader="Board"
                    action={
                      <Checkbox
                        inputProps={{
                          'aria-label': `Access to ${boardNode.name}`,
                          'aria-checked': status === 'partial' ? 'mixed' : status === 'full',
                        }}
                        checked={status === 'full'}
                        indeterminate={status === 'partial'}
                        onChange={() => handleNodeSelect(boardNode)}
                        disableRipple
                      />
                    }
                    sx={{
                      py: 1.5,
                      px: 2,
                      bgcolor: (theme) => theme.vars.palette.background.neutral,
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                    }}
                  />
                  <Scrollbar>
                    <Box sx={{ p: 2 }}>
                      {boardNode.children?.map((child) => (
                        <AcademicSelectionTreeNode
                          key={child.id}
                          node={child}
                          statuses={statuses}
                          onToggle={handleNodeSelect}
                        />
                      ))}
                      {!boardNode.children?.length && (
                        <Typography
                          variant="caption"
                          color="text.disabled"
                          sx={{ fontStyle: 'italic', pl: 1 }}
                        >
                          No details available
                        </Typography>
                      )}
                    </Box>
                  </Scrollbar>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Box>
    </Box>
  );
};
