'use client';

import { Box } from '@mui/material';
import React, { useState } from 'react';
import { useBoolean } from 'src/hooks/use-boolean';
import CustomDialog from 'src/components/customDialog';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import disciplineData from 'src/json/hostel/disciplineIncident/archivedDisciplineIncident.json';

import ViewDetailsComp from './components/viewDetailsComp';
import ArchivedIncidentTable from './components/archivedIncidentTable';

import type { IHostelIncident } from '../logDisciplinaryIncident/type';

const ArchievedIncidents = () => {
  const viewIncidentDialog = useBoolean();
  // Selected incident for editing/viewing
  const [selectedIncident, setSelectedIncident] = useState<IHostelIncident | null>(null);
  // Disciplinary incidents data
  const [incidentData] = useState<IHostelIncident[]>(disciplineData);
  return (
    <Box height="100%" display="flex" flexDirection="column">
      <CustomBreadcrumbs
        heading="Archieved Incident"
        description="View archived disciplinary incidents, including their details, status, and follow-up actions."
        links={[
          { name: 'Hostel Management', href: '/hostel/dashboard' },
          {
            name: 'Disciplinary Actions Tracking & Management',
            href: '/hostel/log-disciplinary-incident',
          },
          { name: 'Archieved Incident', href: '' },
        ]}
        sx={{ mb: 2 }}
      />{' '}
      <ArchivedIncidentTable
        onView={(data) => {
          setSelectedIncident(data);
          viewIncidentDialog.onTrue();
        }}
        editData={selectedIncident}
        setEditData={setSelectedIncident}
        data={incidentData}
      />
      <CustomDialog
        open={viewIncidentDialog.value}
        handleClose={() => {
          viewIncidentDialog.onFalse();
          setSelectedIncident(null);
        }}
        title="View Details"
        maxWidth="md"
      >
        <ViewDetailsComp
          open={viewIncidentDialog}
          onClose={() => {
            viewIncidentDialog.onFalse();
            setSelectedIncident(null);
          }}
          editData={selectedIncident}
        />
      </CustomDialog>
    </Box>
  );
};

export default ArchievedIncidents;
