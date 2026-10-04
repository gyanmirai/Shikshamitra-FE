'use client';

import type { RootState } from 'src/redux/store';

import React from 'react';
import { useSelector } from 'react-redux';
import { fCurrency } from 'src/utils/format-number';
import { useGetPayableAgeingQuery } from 'src/redux/finance/reports/financeReportsApi';
import {
  Card,
  Table,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  Typography,
  TableContainer,
  CircularProgress,
} from '@mui/material';

export default function PayableAgeingReport({ report }: { report?: string }) {
  const { currentYear } = useSelector((state: RootState) => state.globalState);

  const { data: rawData, isLoading } = useGetPayableAgeingQuery(currentYear?.id ?? '', {
    skip: !currentYear?.id,
  });

  // Mock data for Payable Ageing as fallback
  const mockData = [
    {
      vendorId: 'V001',
      vendorName: 'ABC Corp',
      days0_30: 10000,
      days31_60: 5000,
      days61_90: 0,
      days90Plus: 2000,
      total: 17000,
    },
    {
      vendorId: 'V002',
      vendorName: 'XYZ Ltd',
      days0_30: 0,
      days31_60: 12000,
      days61_90: 3000,
      days90Plus: 0,
      total: 15000,
    },
  ];

  const tableData = rawData || mockData;

  if (isLoading) {
    return (
      <Card sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Card>
    );
  }

  return (
    <Card sx={{ p: 2 }}>
      <Typography variant="h6" mb={2}>
        Payable Ageing Report
      </Typography>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Vendor / Entity</TableCell>
              <TableCell align="right">0-30 Days</TableCell>
              <TableCell align="right">31-60 Days</TableCell>
              <TableCell align="right">61-90 Days</TableCell>
              <TableCell align="right">90+ Days</TableCell>
              <TableCell align="right">Total Outstanding</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tableData.map((row: any) => (
              <TableRow key={row.vendorId || row.id}>
                <TableCell>{row.vendorName || row.name}</TableCell>
                <TableCell align="right">{fCurrency(row.days0_30 || 0)}</TableCell>
                <TableCell align="right">{fCurrency(row.days31_60 || 0)}</TableCell>
                <TableCell align="right">{fCurrency(row.days61_90 || 0)}</TableCell>
                <TableCell align="right">{fCurrency(row.days90Plus || 0)}</TableCell>
                <TableCell align="right">
                  <strong>{fCurrency(row.total || 0)}</strong>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  );
}
