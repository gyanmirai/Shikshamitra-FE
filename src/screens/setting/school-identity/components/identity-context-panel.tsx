import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import { Iconify } from 'src/components/iconify';
import { RouterLink } from 'src/routes/components';
import LinearProgress from '@mui/material/LinearProgress';
import { EmptyContent } from 'src/components/empty-content';
import { FormSectionCard } from 'src/components/form-section-card';

import { IdentityContextFields } from './identity-context-fields';

import type { SchoolIdentityWorkspace } from '../hooks/use-school-identity';

export function IdentityContextPanel({ workspace }: { workspace: SchoolIdentityWorkspace }) {
  const {
    yearsQuery,
    boardsQuery,
    years,
    boards,
    selectedYear,
    boardId,
    mediumId,
    organizationId,
    valid,
  } = workspace;
  const loading = yearsQuery.isLoading || boardsQuery.isLoading;
  const failed = yearsQuery.isError || boardsQuery.isError;
  const hasBoards = boards.some((board) => board.academicYearId === selectedYear);
  return (
    <FormSectionCard
      icon="mdi:layers-outline"
      title="Document Context"
      titleTypographyProps={{ id: 'identity-context-heading' }}
      descriptionTooltip="Choose a year and board, then a medium and organization (academic stage) for more specific images. All mediums shows board settings; All organizations shows medium settings. Each level inherits images unless you set an override."
      actionFullWidthOnMobile
      action={
        workspace.currentBoard && !loading && !failed ? (
          <Button variant="outlined" onClick={workspace.selectCurrentContext}>
            Use current context
          </Button>
        ) : undefined
      }
    >
      {loading ? (
        <LinearProgress aria-label="Loading academic options" />
      ) : failed ? (
        <Alert
          severity="error"
          action={
            <Button
              onClick={() => {
                yearsQuery.refetch();
                boardsQuery.refetch();
              }}
            >
              Retry
            </Button>
          }
        >
          Academic options could not be loaded.
        </Alert>
      ) : !years.length ? (
        <Alert severity="info">No academic years are available for your access.</Alert>
      ) : (
        <>
          <IdentityContextFields
            years={years}
            boards={boards}
            yearId={selectedYear}
            boardId={boardId}
            mediumId={mediumId}
            organizationId={organizationId}
            onChange={workspace.selectContext}
          />
          {!valid ? (
            <EmptyContent
              title={
                hasBoards
                  ? boardId
                    ? 'Select a valid document context'
                    : 'Select a board to review its images'
                  : 'No boards in this academic year'
              }
              description={
                hasBoards
                  ? 'Review the inherited logo, letterhead and signature before configuring an override.'
                  : 'Choose another academic year or review the shared school defaults.'
              }
              action={
                <Button
                  component={RouterLink}
                  href={workspace.tabHref(0)}
                  scroll={false}
                  startIcon={<Iconify icon="mdi:school-outline" />}
                >
                  View school defaults
                </Button>
              }
              sx={{ py: 2, mt: 2 }}
            />
          ) : null}
        </>
      )}
    </FormSectionCard>
  );
}
