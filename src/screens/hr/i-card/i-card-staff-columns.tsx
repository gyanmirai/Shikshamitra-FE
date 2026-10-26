import type { IColumn } from 'src/components/customizabaleTable/types';

import { Label } from 'src/components/label';
import { Box, Stack, Checkbox, Typography } from '@mui/material';

export type EmployeeICardRow = {
  id: string;
  fullName?: string | null;
  employeeIdentifier?: string | null;
  designation?: string | null;
  department?: string | null;
  organizationNames?: string[] | null;
  mobileNo?: string | null;
  bloodGroup?: string | null;
  address?: string | null;
  thumbnailPicture?: string | null;
};

export function createICardStaffColumns({
  allVisibleSelected,
  someVisibleSelected,
  selectedEmployeeIds,
  toggleEmployeeSelection,
  toggleVisibleSelection,
}: {
  allVisibleSelected: boolean;
  someVisibleSelected: boolean;
  selectedEmployeeIds: string[];
  toggleEmployeeSelection: (row: EmployeeICardRow) => void;
  toggleVisibleSelection: (checked: boolean) => void;
}): IColumn[] {
  return [
    {
      label: (
        <Checkbox
          size="small"
          inputProps={{ 'aria-label': 'Select visible staff' }}
          checked={allVisibleSelected}
          indeterminate={!allVisibleSelected && someVisibleSelected}
          onChange={(event) => toggleVisibleSelection(event.target.checked)}
          onClick={(event) => event.stopPropagation()}
        />
      ),
      id: 'select',
      width: 72,
      minWidth: 64,
      maxWidth: 72,
      isSort: false,
      sticky: true,
      isFilter: false,
      align: 'center' as const,
      render: (_: unknown, row: any) => (
        <Checkbox
          size="small"
          inputProps={{ 'aria-label': `Select ${(row as EmployeeICardRow).fullName || 'staff'}` }}
          checked={selectedEmployeeIds.includes((row as EmployeeICardRow).id)}
          onChange={() => toggleEmployeeSelection(row as EmployeeICardRow)}
          onClick={(event) => event.stopPropagation()}
        />
      ),
    },
    {
      label: 'Staff',
      id: 'fullName',
      minWidth: 100,
      sticky: true,
      align: 'left' as const,
      isFilter: true,
      filterType: 'string',
      render: (_: unknown, row: any) => (
        <Box>
          <Typography variant="body2">
            {(row as EmployeeICardRow).fullName || 'Unnamed staff'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {(row as EmployeeICardRow).employeeIdentifier || '-'}
          </Typography>
        </Box>
      ),
    },
    {
      label: 'Designation',
      id: 'designation',
      minWidth: 100,
      align: 'left' as const,
      isFilter: true,
      filterType: 'string',
      render: (value: string) => value || '-',
    },
    {
      label: 'Readiness',
      id: 'readiness',
      minWidth: 100,
      sticky: true,
      align: 'left' as const,
      isSort: true,
      isFilter: true,
      filterType: 'string',
      render: (_: unknown, row: any) => (
        <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
          {!(row as EmployeeICardRow).thumbnailPicture && (
            <Label color="warning" variant="soft">
              Photo
            </Label>
          )}
          {!(row as EmployeeICardRow).mobileNo && (
            <Label color="warning" variant="soft">
              Phone
            </Label>
          )}
          {!(row as EmployeeICardRow).designation && (
            <Label color="warning" variant="soft">
              Role
            </Label>
          )}
          {!(row as EmployeeICardRow).employeeIdentifier && (
            <Label color="warning" variant="soft">
              Code
            </Label>
          )}
          {(row as EmployeeICardRow).thumbnailPicture &&
            (row as EmployeeICardRow).mobileNo &&
            (row as EmployeeICardRow).designation &&
            (row as EmployeeICardRow).employeeIdentifier && (
              <Label color="success" variant="soft">
                Ready
              </Label>
            )}
        </Stack>
      ),
    },
  ];
}
