import type { LabelColor } from 'src/components/label';
import type { UseBooleanReturn } from 'src/hooks/use-boolean';
import type { IColumn } from 'src/components/customizabaleTable/types';

import dayjs from 'dayjs';
import React, { useMemo } from 'react';
import { Label } from 'src/components/label';
import { GenderOptions } from 'src/enums/gender';
import Typography from '@mui/material/Typography';
import CustomTooltip from 'src/components/custom-tooltip';
import {
  FollowUpStatusType,
  FollowUpStatusTypeColors,
  FollowUpStatusTypeOptions,
} from 'src/enums/inquiry-status-type';

import { InquiryActions } from '../components/InquiryActions';

import type { IInquiryResponse } from '../type';

interface UseInquiryTableColumnsProps {
  inquiryDialog: UseBooleanReturn;
  issueRegistrationFormDialog: UseBooleanReturn;
  followUpDialog: UseBooleanReturn;
  setEditData: (data: IInquiryResponse | null) => void;
}

/**
 * Purpose:
 * Defines the column structure and render logic for the Inquiry Table.
 *
 * Performance Notes:
 * - Memoizes columns configuration to avoid unnecessary re-creation on every render.
 *
 * Architectural Notes:
 * - strictly typed `IColumn` definitions.
 * - Delegate complex rendering (Actions) to sub-components.
 */
export const useInquiryTableColumns = ({
  inquiryDialog,
  issueRegistrationFormDialog,
  followUpDialog,
  setEditData,
}: UseInquiryTableColumnsProps) => {
  const columns: IColumn[] = useMemo(
    () => [
      {
        id: 'inquiryNo',
        label: 'Inquiry No.',
        sticky: true,
        minWidth: '110px',
        filterType: 'string',
        align: 'left',
      },
      {
        id: 'studentName',
        label: 'Student Name',
        minWidth: '150px',
        align: 'left',
        sticky: true,
        filterType: 'string',
      },
      { id: 'standard', label: 'Class', align: 'left', filterType: 'string' },
      {
        id: 'dobValue',
        label: 'Date of Birth',
        minWidth: '8vw',
        align: 'left',
        filterType: 'date',
      },
      { id: 'age', label: 'Age', align: 'left', minWidth: '120px', filterType: 'string' },
      {
        id: 'doiValue',
        label: 'Date of Inquiry',
        filterType: 'date',
        minWidth: '10vw',
        align: 'left',
        isDateRangeFilter: true,
      },
      {
        id: 'genderValue',
        label: 'Gender',
        align: 'left',
        filterType: 'enum',
        enumOptions: GenderOptions,
      },
      {
        id: 'address',
        label: 'Address',
        minWidth: '200px',
        align: 'left',
        filterType: 'string',
        render: (value: unknown) => {
          const addressText = value as string;
          if (!addressText) return '-';

          return (
            <CustomTooltip title={addressText} placement="top" arrow>
              <Typography
                variant="body2"
                sx={{
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'normal',
                }}
              >
                {addressText}
              </Typography>
            </CustomTooltip>
          );
        },
      },
      {
        id: 'primaryContactNo',
        label: 'Primary Contact No.',
        minWidth: '180px',
        align: 'left',
        filterType: 'string',
      },
      {
        id: 'secondaryContactNo',
        label: 'Secondary Contact No.',
        minWidth: '200px',
        align: 'left',
        filterType: 'string',
      },
      {
        id: 'previousSchool',
        label: 'Previous School',
        minWidth: '150px',
        align: 'left',
        filterType: 'string',
        render(value: string) {
          return value || '-';
        },
      },
      {
        id: 'inquiryPreference',
        label: 'Inquiry Preference',
        minWidth: '11vw',
        align: 'left',
        filterType: 'string',
      },
      {
        id: 'nextReminderDate',
        label: 'Next Reminder Date',
        minWidth: '180px',
        align: 'left',
        filterType: 'date',
        render: (value: unknown) => {
          if (!value) return '-';
          const validDate = dayjs(value as string);
          return validDate.isValid() ? validDate.format('DD-MM-YYYY') : '-';
        },
      },
      {
        id: 'inquiryStatus',
        label: 'Status',
        filterType: 'enum',
        enumOptions: FollowUpStatusTypeOptions,
        minWidth: '100px',
        align: 'left',
        sticky: true,
        render: (value: unknown) => {
          // Strict casting for enum value
          const statusValue = value as FollowUpStatusType;
          const color = FollowUpStatusTypeColors[statusValue] as LabelColor;
          return <Label color={color}>{FollowUpStatusType[statusValue]}</Label>;
        },
      },
      {
        id: 'actions',
        label: 'Actions',
        isFilter: false,
        isSort: false,
        sticky: true,
        render: (_: unknown, row: unknown) => (
          <InquiryActions
            row={row as IInquiryResponse}
            inquiryDialog={inquiryDialog}
            issueRegistrationFormDialog={issueRegistrationFormDialog}
            followUpDialog={followUpDialog}
            setEditData={setEditData}
          />
        ),
      },
    ],
    [inquiryDialog, setEditData, followUpDialog, issueRegistrationFormDialog]
  );

  return columns;
};
