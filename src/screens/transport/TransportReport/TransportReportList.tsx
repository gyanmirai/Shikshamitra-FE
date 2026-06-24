'use client';

import type { RootState } from 'src/redux/store';
import type { TransportReportCatalogItem } from 'src/redux/transport/vehicle-management/dashboard-report-api';

import { useSelector } from 'react-redux';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { useMemo, useState, useEffect } from 'react';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import {
  useGetTransportReportQuery,
  useLazyExportTransportReportQuery,
  useGetTransportReportCatalogQuery,
} from 'src/redux/transport/vehicle-management/dashboard-report-api';
import {
  Box,
  Card,
  Stack,
  Table,
  Button,
  Select,
  MenuItem,
  TableRow,
  TextField,
  TableBody,
  TableCell,
  TableHead,
  InputLabel,
  Typography,
  FormControl,
  TableContainer,
  LinearProgress,
} from '@mui/material';

const pageSize = 25;

const saveBlob = (blob: Blob, fileName: string) => {
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  window.URL.revokeObjectURL(url);
};

const TransportReportList = () => {
  const { currentMedium, currentYear } = useSelector((state: RootState) => state.globalState);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedReportKey, setSelectedReportKey] = useState('');
  const [pageNumber, setPageNumber] = useState(1);
  const [status, setStatus] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const catalogQuery = {
    academicMediumId: currentMedium?.id,
    academicYearId: currentYear?.id,
  };
  const { data: catalog = [], isLoading: isCatalogLoading } = useGetTransportReportCatalogQuery(
    catalogQuery,
    { skip: !currentMedium?.id }
  );
  const [exportReport, { isFetching: isExporting }] = useLazyExportTransportReportQuery();

  const categories = useMemo(
    () => ['All', ...Array.from(new Set(catalog.map((report) => report.category)))],
    [catalog]
  );

  const filteredCatalog = useMemo(
    () =>
      selectedCategory === 'All'
        ? catalog
        : catalog.filter((report) => report.category === selectedCategory),
    [catalog, selectedCategory]
  );

  useEffect(() => {
    if (selectedReportKey || filteredCatalog.length === 0) {
      return;
    }

    setSelectedReportKey(
      filteredCatalog.find((report) => report.isSupported)?.key ?? filteredCatalog[0].key
    );
  }, [filteredCatalog, selectedReportKey]);

  useEffect(() => {
    if (filteredCatalog.length === 0) {
      setSelectedReportKey('');
      return;
    }

    if (selectedReportKey && !filteredCatalog.some((report) => report.key === selectedReportKey)) {
      setSelectedReportKey(
        filteredCatalog.find((report) => report.isSupported)?.key ?? filteredCatalog[0].key
      );
      setPageNumber(1);
    }
  }, [filteredCatalog, selectedReportKey]);

  const selectedReport = catalog.find((report) => report.key === selectedReportKey);
  const reportArgs = {
    reportKey: selectedReportKey,
    academicMediumId: currentMedium?.id,
    academicYearId: currentYear?.id,
    pageNumber,
    pageSize,
    fromDate: fromDate || undefined,
    toDate: toDate || undefined,
    status: status || undefined,
  };
  const { data: reportData, isFetching: isReportLoading } = useGetTransportReportQuery(reportArgs, {
    skip: !currentMedium?.id || !selectedReportKey,
  });

  const totalCount = reportData?.totalCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const handleExport = async () => {
    if (!selectedReportKey || !currentMedium?.id) {
      return;
    }

    const blob = await exportReport(reportArgs).unwrap();
    saveBlob(blob, `${selectedReportKey}.csv`);
  };

  if (!currentMedium?.id) {
    return (
      <Card sx={{ p: 3 }}>
        <Typography variant="h6">Transport reports unavailable</Typography>
        <Typography variant="body2" color="text.secondary">
          Select an academic medium to view transport reports.
        </Typography>
      </Card>
    );
  }

  return (
    <Stack spacing={2}>
      <CustomBreadcrumbs
        heading="Reports"
        links={[{ name: 'Transport', href: '/transport/dashboard/' }, { name: 'Reports' }]}
      />

      {(isCatalogLoading || isReportLoading) && <LinearProgress />}

      <Card sx={{ p: 2 }}>
        <Stack spacing={2}>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={1.5}
            alignItems={{ xs: 'stretch', md: 'center' }}
          >
            <FormControl size="small" sx={{ minWidth: 240 }}>
              <InputLabel>Category</InputLabel>
              <Select
                label="Category"
                value={selectedCategory}
                onChange={(event) => {
                  setSelectedCategory(event.target.value);
                  setPageNumber(1);
                }}
              >
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 280, flex: 1 }}>
              <InputLabel>Report</InputLabel>
              <Select
                label="Report"
                value={selectedReportKey}
                onChange={(event) => {
                  setSelectedReportKey(event.target.value);
                  setPageNumber(1);
                }}
              >
                {filteredCatalog.map((report: TransportReportCatalogItem) => (
                  <MenuItem key={report.key} value={report.key}>
                    {report.title}
                    {!report.isSupported ? ' (Unavailable)' : ''}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              size="small"
              label="From"
              type="date"
              value={fromDate}
              onChange={(event) => {
                setFromDate(event.target.value);
                setPageNumber(1);
              }}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              size="small"
              label="To"
              type="date"
              value={toDate}
              onChange={(event) => {
                setToDate(event.target.value);
                setPageNumber(1);
              }}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              size="small"
              label="Status"
              value={status}
              onChange={(event) => {
                setStatus(event.target.value);
                setPageNumber(1);
              }}
            />
            <Button
              variant="contained"
              onClick={handleExport}
              disabled={!selectedReportKey || isExporting}
              startIcon={<Iconify icon="mdi:download" />}
            >
              Export
            </Button>
          </Stack>

          {selectedReport && (
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
              <Typography variant="h6">{selectedReport.title}</Typography>
              <Label color={selectedReport.isSupported ? 'success' : 'warning'}>
                {selectedReport.isSupported ? 'Available' : 'Unavailable'}
              </Label>
              <Typography variant="body2" color="text.secondary">
                {selectedReport.description}
              </Typography>
            </Stack>
          )}
        </Stack>
      </Card>

      <Card sx={{ p: 2 }}>
        {reportData && !reportData.isSupported ? (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Typography variant="h6">Report unavailable</Typography>
            <Typography variant="body2" color="text.secondary">
              {reportData.message}
            </Typography>
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    {(reportData?.columns ?? []).map((column) => (
                      <TableCell key={column.key}>{column.label}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(reportData?.items ?? []).map((row, index) => (
                    <TableRow key={`${selectedReportKey}-${index}`}>
                      {(reportData?.columns ?? []).map((column) => (
                        <TableCell key={column.key}>{row[column.key] ?? '-'}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                  {(reportData?.items ?? []).length === 0 && (
                    <TableRow>
                      <TableCell colSpan={Math.max(reportData?.columns?.length ?? 1, 1)}>
                        <Typography variant="body2" color="text.secondary">
                          No rows found for the selected report and filters.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mt: 2 }}
            >
              <Typography variant="body2" color="text.secondary">
                {totalCount.toLocaleString('en-IN')} row(s)
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <Button
                  size="small"
                  disabled={pageNumber <= 1}
                  onClick={() => setPageNumber((page) => Math.max(1, page - 1))}
                >
                  Previous
                </Button>
                <Typography variant="body2">
                  Page {pageNumber} of {totalPages}
                </Typography>
                <Button
                  size="small"
                  disabled={pageNumber >= totalPages}
                  onClick={() => setPageNumber((page) => page + 1)}
                >
                  Next
                </Button>
              </Stack>
            </Stack>
          </>
        )}
      </Card>
    </Stack>
  );
};

export default TransportReportList;
