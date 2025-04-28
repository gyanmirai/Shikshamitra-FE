import type { LabelColor } from 'src/components/label/types';

import React, { useState } from 'react';

import { useBoolean } from 'src/hooks/use-boolean';

import data from 'src/json/ResourceManagement/incidentReport/incidentReportData.json';
import {
  IncidentReportStatusType,
  IncidentReportStatusTypeColor,
  IncidentReportStatusTypeOptions,
} from 'src/enums/incident-report-statusType';

import { Label } from 'src/components/label/label';
import CustomDialog from 'src/components/customDialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import ViewIncidentReportDialog from './view-incident-report-log';

import type { IIncidentResourceStatusFormValues } from '../incident-resource-interface';

const IncidentReportTable = () => {
  const viewIncidentReportDialog = useBoolean();
  const [selectedItem, setSelectedItem] = useState<IIncidentResourceStatusFormValues>();
  return (
    <>
      <CustomizableTable
        searchFieldProps={{
          placeholder: 'Search by Resource Name',
          label: 'Search by Resource Name',
          sx: {
            maxWidth: '400px',
            width: '100%',
          },
        }}
        noDataText={<>No Resource Loss/Damage Reported </>}
        tableId="resource-loss-damage-table-teacher"
        columns={[
          { id: 'resourceName', label: 'Resource Name' },
          { id: 'incidentType', label: 'Type of Incident' },
          {
            label: 'Status',
            id: 'status',
            minWidth: '100px',
            filterType: 'enum',
            enumOptions: IncidentReportStatusTypeOptions,
            render(value, row) {
              const color = IncidentReportStatusTypeColor[
                value as IncidentReportStatusType
              ] as LabelColor;

              return <Label color={color}>{IncidentReportStatusType[value]}</Label>;
            },
          },
          {
            id: 'action',
            label: 'Actions',
            align: 'left',
            minWidth: 100,
            sticky: true,
            isFilter: false,
            isSort: false,
            render(value, row) {
              return (
                <ThreeDotsActions
                  placement="right-top"
                  showViewIcon
                  showThreeDots={false}
                  handleViewClick={() => {
                    setSelectedItem(row as IIncidentResourceStatusFormValues);
                    viewIncidentReportDialog.onTrue();
                  }}
                />
              );
            },
          },
        ]}
        data={data}
      />
      {/* <ResourceLossDamageTableTeacher /> */}
      {viewIncidentReportDialog.value && (
        <CustomDialog
          maxWidth="md"
          title="Report Loss/Damage"
          open={viewIncidentReportDialog.value}
          handleClose={viewIncidentReportDialog.onFalse}
        >
          <ViewIncidentReportDialog
            onClose={() => {
              viewIncidentReportDialog.onFalse();
            }}
            data={{} as IIncidentResourceStatusFormValues}
            isEdit={false}
          />
        </CustomDialog>
      )}
    </>
  );
};

export default IncidentReportTable;
