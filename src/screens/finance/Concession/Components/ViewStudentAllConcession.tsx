import dayjs from 'dayjs';
import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import React, { useMemo, useCallback } from 'react';
import { Scrollbar } from 'src/components/scrollbar';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { Box, Grid, MenuItem, MenuList, Typography } from '@mui/material';
import {
  ConcessionStatusType,
  ConcessionStatusOptions,
  ConcessionStatusTypeColors,
} from 'src/enums/concession-status-type';

import type { IConcession, IStudentInfo } from '../type';

const ViewStudentAllConcession = ({
  data,
  onDelete,
}: {
  data: IStudentInfo;
  onDelete: (student: IConcession) => void;
}) => {
  const tableData = useMemo(
    () =>
      (data?.concessions || []).map((row: IConcession) => ({
        ...row,
        amountPercentageValue:
          row.concessionType === 'fixed'
            ? `₹ ${row.amount?.toLocaleString()}`
            : `${row.percentage}%`,
        applicableFeeHeadsValue: row.applicableFeeHeads?.join(', '),
        documentRequiredValue: row.documentRequired ? 'Yes' : 'No',
      })),
    [data]
  );

  const actions = useCallback(
    ({ popover: pop, row }: any) => (
      <MenuList>
        <MenuItem
          onClick={() => {
            onDelete?.(row as IConcession);
            pop.onClose();
          }}
        >
          <Iconify icon={GlobalIcons.cancel} />
          Remove
        </MenuItem>
      </MenuList>
    ),
    [onDelete]
  );

  return (
    <Scrollbar sx={{ height: '500px', p: 2 }}>
      <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 2, mb: 2 }}>
        <Typography variant="h6" mb={2} color="primary.main">
          Student Information
        </Typography>
        <Grid container spacing={2}>
          <Grid size={3}>
            <Typography color="text.secondary">Student Name</Typography>
            <Typography sx={{ fontWeight: 300 }} variant="body2">
              {data?.studentName}
            </Typography>
          </Grid>

          <Grid size={3}>
            <Typography color="text.secondary">Roll No.</Typography>
            <Typography sx={{ fontWeight: 300 }} variant="body2">
              {data?.rollNo}
            </Typography>
          </Grid>

          <Grid size={3}>
            <Typography color="text.secondary">Sibling</Typography>
            <Typography sx={{ fontWeight: 300 }} variant="body2">
              {data?.sibling}
            </Typography>
          </Grid>

          <Grid size={3}>
            <Typography color="text.secondary">Contact No.</Typography>
            <Typography sx={{ fontWeight: 300 }} variant="body2">
              {data?.contactNo}
            </Typography>
          </Grid>

          <Grid size={3}>
            <Typography color="text.secondary">Class/Division</Typography>
            <Typography sx={{ fontWeight: 300 }} variant="body2">
              {data?.classDivision}
            </Typography>
          </Grid>

          <Grid size={3}>
            <Typography color="text.secondary">GR No.</Typography>
            <Typography sx={{ fontWeight: 300 }} variant="body2">
              {data?.grNo}
            </Typography>
          </Grid>

          <Grid size={3}>
            <Typography color="text.secondary">Parent Name</Typography>
            <Typography sx={{ fontWeight: 300 }} variant="body2">
              {data?.parentName}
            </Typography>
          </Grid>

          <Grid size={3}>
            <Typography color="text.secondary">Email</Typography>
            <Typography sx={{ fontWeight: 300 }} variant="body2">
              {data?.email}
            </Typography>
          </Grid>
        </Grid>
      </Box>
      <CustomizableTable
        tableId="concession-table"
        noDataText="No concession requests found"
        columns={[
          {
            id: 'concessionType',
            label: 'Concession Type',
            align: 'left',
            minWidth: 150,
          },
          {
            id: 'requestDate',
            label: 'Request Date',
            align: 'left',
            minWidth: 150,
            filterType: 'date',
            render: (value) => (
              <Typography fontSize="13px">{dayjs(value).format('DD-MM-YYYY')}</Typography>
            ),
          },
          {
            id: 'amountPercentageValue',
            label: 'Amount/Percentage',
            align: 'left',
          },
          {
            id: 'reason',
            label: 'Reason',
            align: 'left',
            minWidth: 220,
            render: (value) => (
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                {value}
              </Typography>
            ),
          },
          {
            id: 'status',
            label: 'Status',
            align: 'left',
            sticky: true,
            minWidth: 120,
            filterType: 'enum',
            enumOptions: ConcessionStatusOptions,
            render: (value) => {
              if (value === undefined || value === null) return '-';
              const color = ConcessionStatusTypeColors[value as ConcessionStatusType];
              return <Label color={color}>{ConcessionStatusType[value]}</Label>;
            },
          },
          {
            id: 'actions',
            label: 'Action',
            align: 'left',
            isSort: false,
            isFilter: false,
            sticky: true,
            minWidth: 40,
            render: (value, row) => (
              <ThreeDotsActions
                placement="right-center"
                actions={(prop) => actions({ ...prop, row })}
              />
            ),
          },
        ]}
        data={tableData || []}
      />
    </Scrollbar>
  );
};

export default ViewStudentAllConcession;
