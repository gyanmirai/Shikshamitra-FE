import type { RootState } from 'src/redux/store';

import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { formatNumber } from 'src/utils/formate_number';
import { DialogScrollContent } from 'src/components/customDialog';
import CustomizableTable from 'src/components/customizabaleTable';
import { FormSectionCard } from 'src/components/form-section-card';
import { DetailGrid, DetailField } from 'src/components/detail-view';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { useGetSectionManagementByIdQuery } from 'src/redux/library/settingApi';
import { Alert, Stack, Button, DialogActions, LinearProgress } from '@mui/material';

import SectionCampus from './SectionCampus';

import type { ISection, ISectionDetails } from './type';

export default function ViewShelfData({
  sectionData,
  onClose,
}: {
  sectionData: ISection | null;
  onClose?: () => void;
}) {
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const query = useGetSectionManagementByIdQuery(
    { sectionId: sectionData?.id, academicYearId: currentYear?.id },
    { skip: !sectionData?.id || !currentYear?.id }
  );
  const details = query.currentData as ISectionDetails | undefined;
  return (
    <>
      <DialogScrollContent>
        <Stack spacing={2}>
          {(!sectionData?.id || !currentYear?.id) && (
            <Alert severity="info">Select a section and academic year to view its shelves.</Alert>
          )}
          {query.isFetching && <LinearProgress aria-label="Loading section details" />}
          {query.isError && (
            <Alert severity="error" action={<Button onClick={() => query.refetch()}>Retry</Button>}>
              {parseApiProblemDetail(query.error).detail || 'Could not load this section.'}
            </Alert>
          )}
          {details && (
            <>
              <FormSectionCard
                title="Section Information"
                icon={GlobalIcons.documentIcon}
                descriptionTooltip="Saved section identity and configured shelf count. These values do not describe copy occupancy."
              >
                <DetailGrid>
                  <DetailField label="Section name" value={details.sectionName} />
                  <DetailField label="Section ID" value={details.id} />
                  <DetailField
                    label="Configured shelves"
                    value={formatNumber(details.numberOfShelf)}
                  />
                </DetailGrid>
                {currentYear?.id && details.campusId !== undefined && (
                  <SectionCampus
                    key={`${currentYear.id}:${details.id}`}
                    sectionId={details.id}
                    academicYearId={currentYear.id}
                    campusId={details.campusId}
                    campusName={details.campusName}
                  />
                )}
              </FormSectionCard>
              <FormSectionCard
                title="Shelves"
                icon={GlobalIcons.assigned}
                descriptionTooltip="Actual saved shelf names and IDs. No physical rows or book counts are inferred."
              >
                <Stack spacing={1.5}>
                  <Alert severity="info">Occupancy data is unavailable.</Alert>
                  {details.shelfDetails.length ? (
                    <CustomizableTable
                      tableId={`library-section-shelves-${details.id}`}
                      columns={[
                        {
                          id: 'shelfName',
                          label: 'Shelf name',
                          render: (value) => value || 'Name unavailable',
                        },
                        {
                          id: 'id',
                          label: 'Saved shelf ID',
                          render: (value) => value || 'Unavailable',
                        },
                      ]}
                      data={details.shelfDetails}
                      isSearch={false}
                      isFilter={false}
                      showExport={false}
                      isShowedDense={false}
                    />
                  ) : (
                    <Alert severity="info">No shelves are configured for this section.</Alert>
                  )}
                </Stack>
              </FormSectionCard>
            </>
          )}
        </Stack>
      </DialogScrollContent>
      {onClose && (
        <DialogActions>
          <Button
            variant="outlined"
            color="inherit"
            onClick={onClose}
            startIcon={<Iconify icon={GlobalIcons.cancel} />}
          >
            Close
          </Button>
        </DialogActions>
      )}
    </>
  );
}
