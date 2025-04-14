// AssessmentManagementTable.tsx
import { Box, Switch } from '@mui/material';

import { Label } from 'src/components/label';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import type { IAssessment, IAssessmentManagementTableProps } from './type';

const AssessmentManagementTable = ({
  actions,
  data,
  onEdit,
  onDelete,
  onTogglePublish,
}: IAssessmentManagementTableProps) => (
  <CustomizableTable
    tableId="assessment-management-table"
    columns={[
      { id: 'className', label: 'Class' },
      { id: 'division', label: 'Division' },
      { id: 'subject', label: 'Subject Name', minWidth: '150px', align: 'left' },
      { id: 'assesmentTitle', label: 'Assessment Title', minWidth: '200px', align: 'left' },
      { id: 'examName', label: 'Exam Name', minWidth: '150px', align: 'left' },
      { id: 'assessmentType', label: 'Assessment Type', minWidth: '200px', align: 'left' },
      { id: 'assignmentName', label: 'Assignment Name', minWidth: '200px', align: 'left' },
      {
        id: 'publish',
        label: 'Publish',
        render: (value, row) => (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Switch size="small" checked={value} onChange={() => onTogglePublish(row.id, !value)} />
          </Box>
        ),
      },
      {
        id: 'status',
        label: 'Status',
        render(value) {
          return (
            <Label
              color={
                value === 'Completed'
                  ? 'primary'
                  : value === 'Pending'
                    ? 'error'
                    : value === 'Under Review'
                      ? 'secondary'
                      : 'default'
              }
            >
              {value}
            </Label>
          );
        },
      },
      {
        id: 'actions',
        label: 'Actions',
        isSort: false,
        render(_, row) {
          return (
            <ThreeDotsActions
              actions={(prop) => actions({ ...prop, row })}
              placement="right-top"
              showEditIcon
              showDeleteIcon
              handleEditClick={() => onEdit(row as IAssessment)}
              handleDeleteClick={() => onDelete(row as IAssessment)}
            />
          );
        },
      },
    ]}
    data={data}
  />
);

export default AssessmentManagementTable;
