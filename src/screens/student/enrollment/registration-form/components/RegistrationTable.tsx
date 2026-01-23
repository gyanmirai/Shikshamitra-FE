import type { IData, IColumn } from 'src/components/customizabaleTable/type';

import React, { useMemo } from 'react';
import { Iconify } from 'src/components/iconify';
import { GenderOptions } from 'src/enums/gender';
import { MenuItem, MenuList, Typography } from '@mui/material';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

export type RegistrationTableProps = {
  data: IData[];
  isLoading?: boolean;
  onMoveToRegistration: (row: IData) => void;
  onOpenNotes: (row: IData) => void;
};

const RegistrationTableComponent: React.FC<RegistrationTableProps> = ({
  data,
  isLoading,
  onMoveToRegistration,
  onOpenNotes,
}) => {
  /**
   * Memoization Justification:
   * Columns contain render functions; stabilizing the array avoids re-renders
   * in the customizable table and prevents re-creation of render closures
   * unless the action handlers change.
   */
  const columns: IColumn[] = useMemo(
    () => [
      {
        id: 'studentName',
        label: 'Student Name',
        minWidth: '180px',
        align: 'left',
        sticky: true,
      },
      {
        id: 'formNo',
        label: 'Form No.',
        minWidth: '100px',
        align: 'left',
        sticky: true,
      },
      {
        id: 'inquiryNo',
        label: 'Inquiry No.',
        align: 'left',
        minWidth: '115px',
        isFilter: true,
        filterType: 'string',
      },
      { id: 'standard', label: 'Class', align: 'left', filterType: 'number' },
      {
        id: 'dobValue',
        label: 'Date of Birth',
        minWidth: '128px',
        align: 'left',
        isFilter: true,
        filterType: 'date',
      },
      { id: 'age', label: 'Age', align: 'left' },
      {
        id: 'doiValue',
        label: 'Date of Inquiry',
        minWidth: '145px',
        align: 'left',
        isDateRangeFilter: true,
        filterType: 'date',
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
        render(value) {
          return value || '-';
        },
      },
      {
        id: 'primaryContactNo',
        label: 'Primary Contact No.',
        minWidth: '180px',
        align: 'left',
      },
      {
        id: 'secondaryContactNo',
        label: 'Secondary Contact No.',
        minWidth: '200px',
        align: 'left',
      },
      {
        id: 'previousSchool',
        label: 'Previous School',
        minWidth: '170px',
        align: 'left',
        render(value) {
          return value || '-';
        },
      },
      {
        id: 'inquiryPreference',
        label: 'Inquiry Preference',
        minWidth: '170px',
        align: 'left',
      },
      {
        id: 'actions',
        label: 'Actions',
        isFilter: false,
        isSort: false,
        sticky: true,
        align: 'left',
        minWidth: 50,
        render(_value, row) {
          return (
            <ThreeDotsActions
              actions={({ popover }) => (
                <MenuList>
                  <MenuItem
                    onClick={(e) => {
                      onMoveToRegistration(row);
                      popover.onClose();
                    }}
                  >
                    <Iconify icon="mdi:arrow-right-circle" />
                    Move to Registration
                  </MenuItem>
                  <MenuItem
                    onClick={(e) => {
                      onOpenNotes(row);
                      e.stopPropagation();
                      popover.onClose();
                    }}
                  >
                    <Iconify icon="clarity:note-edit-line" />
                    Notes
                  </MenuItem>
                </MenuList>
              )}
              placement="right-top"
            />
          );
        },
      },
    ],
    [onMoveToRegistration, onOpenNotes]
  );

  return (
    <CustomizableTable
      isLoading={isLoading}
      noDataText={<Typography variant="body2">No Registration Form Issued Data Found</Typography>}
      tableId="student-registration-form-table"
      columns={columns}
      data={data}
    />
  );
};

/**
 * Memoization Justification:
 * Component is pure and receives stable props when used correctly.
 * Wrapping with React.memo prevents unnecessary re-renders for large data sets
 * and frequent state changes higher in the tree.
 */
export const RegistrationTable = React.memo(RegistrationTableComponent);
