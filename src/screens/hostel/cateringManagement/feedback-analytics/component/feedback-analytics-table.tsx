import type { LabelColor } from 'src/components/label/types';

import React from 'react';

import { Box } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import data from 'src/json/hostel/cateringManagement/feedback-data.json';
import {
  FeedBackComplaintStatusType,
  FeedBackComplaintStatusColors,
  FeedBackComplaintStatusOptions,
} from 'src/enums/meal-feedback-complaint-status';

import { Label } from 'src/components/label/label';
import CustomDialog from 'src/components/customDialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import FeedbackAnalyticsViewDialog from './feedback-analytics-view';

import type { IFeedbackAnalyticsForMeal } from '../feedback-analytics-interface';

const FeedbackAnalyticsTable = () => {
  const [selectedReview, setSelectedReview] = React.useState<IFeedbackAnalyticsForMeal>();
  const viewDetailsDialog = useBoolean();
  return (
    <Box>
      <CustomizableTable
        searchFieldProps={{
          placeholder: 'Search by Meal Name, Rating...',
          label: 'Search by Meal Name, Rating...',
        }}
        noDataText="No Feedback Found"
        tableId="feedback-analytics-table"
        columns={[
          { id: 'mealDay', label: 'Meal Day' },

          { id: 'mealType', label: 'Meal Type' },
          { id: 'mealName', label: 'Meal Name' },
          { id: 'overallMealRating', label: 'Rating' },
          {
            id: 'overallComplaintStatus',
            label: 'Status',
            filterType: 'enum',
            enumOptions: FeedBackComplaintStatusOptions,
            minWidth: '130px',
            align: 'left',
            render(value, row) {
              const color = FeedBackComplaintStatusColors[
                value as FeedBackComplaintStatusType
              ] as LabelColor;
              return <Label color={color}>{FeedBackComplaintStatusType[value]}</Label>;
            },
          },
          {
            id: 'action',
            label: 'Actions',
            minWidth: 80,
            isSort: false,
            sticky: true,
            isFilter: false,
            render(value, row) {
              return (
                <ThreeDotsActions
                  showThreeDots={false}
                  placement="right-top"
                  showViewIcon
                  handleViewClick={() => {
                    setSelectedReview(row as IFeedbackAnalyticsForMeal);
                    viewDetailsDialog.onTrue();
                    // onClick(row as IPreVisitorLog, 'view');
                  }}
                />
              );
            },
          },
        ]}
        data={data}
      />
      {selectedReview && viewDetailsDialog.value && (
        <CustomDialog
          maxWidth="lg"
          title={`${selectedReview.mealDay} ${selectedReview.mealType} Feedback Details`}
          open={viewDetailsDialog.value}
          handleClose={() => {
            viewDetailsDialog.onFalse();
          }}
        >
          <FeedbackAnalyticsViewDialog data={selectedReview} />
        </CustomDialog>
      )}
    </Box>
  );
};

export default FeedbackAnalyticsTable;
