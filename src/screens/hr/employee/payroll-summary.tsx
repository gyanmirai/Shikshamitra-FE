'use client';

import type { Dayjs } from 'dayjs';
import type { RootState } from 'src/redux/store';

import dayjs from 'dayjs';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { DatePicker } from '@mui/x-date-pickers';
import { Iconify } from 'src/components/iconify';
import { skipToken } from '@reduxjs/toolkit/query';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import { hrPermissions } from 'src/constants/hr-menus';
import { formatCurrency } from 'src/utils/cureencyFormater';
import { hasGrantedPermission } from 'src/utils/permissions';
import CustomizableTable from 'src/components/customizabaleTable';
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { DashboardCard } from 'src/components/dashboard-card/dashboard-card';
import { HrNotice, HrLoadingNotice } from 'src/screens/hr/components/hr-notice';
import { useGetEmployeeSalarySlipQuery } from 'src/redux/runPayroll/runPayrollApi';
import { Box, Card, Grid, Stack, Button, Avatar, Skeleton, CardHeader } from '@mui/material';
import {
  useGetPayslipDocumentsQuery,
  useLazyGetPayslipDocumentPdfQuery,
} from 'src/redux/hr/payslip-api';

import { toSalarySlipMonthYear } from './payroll-summary-utils';
import { usePayslipActions } from '../payroll/salarySlip-generate/use-payslip-actions';
import PayslipAvailabilityNotice from '../payroll/salarySlip-generate/payslip-availability-notice';
import {
  buildPayslipSelection,
  payslipMatchesSelection,
} from '../payroll/salarySlip-generate/payslip-selection';

const PayslipPdfViewer = dynamic(
  () => import('../payroll/salarySlip-generate/payslip-pdf-viewer'),
  { ssr: false }
);
const onPdfReady = () => undefined;

const enterCurve = [0.22, 1, 0.36, 1] as const;

const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.04 } },
};

const slideUpItem = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.28, ease: enterCurve } },
};

const PayrollSummary = ({ employee }: any) => {
  const [monthYear, setMonthYear] = useState<null | Dayjs>(dayjs());
  const employeeId = employee?.id;
  const salarySlipMonth = toSalarySlipMonthYear(monthYear);
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const canView = hasGrantedPermission(
    permissions,
    `${hrPermissions.payroll.generateSalarySlip}.View`
  );
  const selection = buildPayslipSelection(employeeId, monthYear);
  const args =
    canView && selection
      ? { employeeId: selection.employeeId, monthYear: selection.monthYear }
      : skipToken;
  const documents = useGetPayslipDocumentsQuery(args, {
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
  });
  const currentDocument = documents.currentData?.find((document) => document.isCurrent);
  const documentKnown = documents.isSuccess && !documents.isFetching && !documents.isError;
  const summary = useGetEmployeeSalarySlipQuery(currentDocument ? args : skipToken);
  const salarySlip = payslipMatchesSelection(summary.currentData, selection)
    ? summary.currentData
    : null;
  const isFetching = documents.isFetching || (!!currentDocument && summary.isFetching);
  const isError = documents.isError || (!!currentDocument && summary.isError);
  const hasSalarySlip =
    canView && documentKnown && !!currentDocument && !!salarySlip && !isFetching && !isError;
  const earnings = salarySlip?.earnings || [];
  const deductions = salarySlip?.deductions || [];
  const [loadDocument] = useLazyGetPayslipDocumentPdfQuery();
  const documentId = hasSalarySlip ? currentDocument?.id : null;
  const loadPdf = useCallback(
    () => (documentId ? loadDocument(documentId).unwrap() : Promise.resolve(null)),
    [documentId, loadDocument]
  );
  const documentKey = documentId && selection ? `${selection.key}:${documentId}` : null;
  const actions = usePayslipActions({
    selectionKey: documentKey,
    loadPdf: documentKey ? loadPdf : null,
    fileName: `Payslip_${monthYear?.format('YYYY-MM') ?? ''}_R${currentDocument?.revision ?? ''}.pdf`,
  });
  const [previewSelection, setPreviewSelection] = useState<string | null>(null);
  useEffect(() => setPreviewSelection(null), [documentKey]);
  const contentRef = useRef<HTMLDivElement>(null);
  const canUsePdf = hasSalarySlip && !!actions.pdfUrl && !actions.isLoading && !actions.error;

  if (!canView) return <HrNotice>You do not have access to payslips.</HrNotice>;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 280px)' }}>
      <Scrollbar sx={{ flexGrow: 1, height: '100%' }}>
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          style={{ display: 'flex', flexDirection: 'column' }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, pb: 1 }}>
            <motion.div variants={slideUpItem}>
              <Card sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 1 }}>
                <Stack
                  direction={{ xs: 'column', md: 'row' }}
                  alignItems="center"
                  justifyContent="space-between"
                  spacing={1}
                >
                  <DatePicker
                    value={monthYear}
                    onChange={(val) => setMonthYear(val)}
                    views={['month', 'year']}
                    label="Select Year Month"
                    format="MMMM-YYYY"
                    sx={{ maxWidth: { xs: '100%', md: 240 }, mt: 1 }}
                    slotProps={{ textField: { size: 'small' } }}
                  />

                  <Stack direction="row" flexWrap="wrap" spacing={1} alignItems="center">
                    <Button
                      size="small"
                      startIcon={<Iconify icon="solar:eye-linear" />}
                      variant="outlined"
                      color="inherit"
                      disabled={!canUsePdf}
                      onClick={() => {
                        if (canUsePdf) setPreviewSelection(documentKey);
                      }}
                    >
                      Preview
                    </Button>
                    <Button
                      size="small"
                      startIcon={<Iconify icon="solar:download-linear" />}
                      variant="outlined"
                      color="inherit"
                      disabled={!canUsePdf}
                      onClick={() => {
                        if (canUsePdf) actions.handleDownload();
                      }}
                    >
                      Download
                    </Button>
                    <Button
                      size="small"
                      startIcon={<Iconify icon="solar:printer-linear" />}
                      variant="outlined"
                      color="inherit"
                      disabled
                    >
                      Print
                    </Button>
                    <Button
                      size="small"
                      startIcon={<Iconify icon="solar:plain-linear" />}
                      variant="outlined"
                      color="inherit"
                      disabled
                    >
                      Email
                    </Button>
                  </Stack>
                </Stack>
              </Card>
            </motion.div>

            {actions.isLoading && hasSalarySlip && (
              <HrLoadingNotice>Loading the issued payslip PDF.</HrLoadingNotice>
            )}
            {actions.error && hasSalarySlip && (
              <HrNotice
                severity="error"
                action={
                  <Button size="small" onClick={actions.retry}>
                    Retry PDF
                  </Button>
                }
              >
                {actions.error}
              </HrNotice>
            )}
            {selection && documentKnown && !currentDocument && (
              <PayslipAvailabilityNotice
                key={selection.key}
                employeeId={selection.employeeId}
                monthYear={selection.monthYear}
                reload={() => documents.refetch()}
              />
            )}
            {isFetching ? (
              <PayrollSummarySkeleton />
            ) : isError ? (
              <HrNotice
                severity="error"
                action={
                  <Button
                    size="small"
                    onClick={() => {
                      documents.refetch();
                      if (currentDocument && !summary.isUninitialized) summary.refetch();
                    }}
                  >
                    Retry
                  </Button>
                }
              >
                The payslip could not be loaded. Retry to check this staff member and month.
              </HrNotice>
            ) : hasSalarySlip ? (
              <>
                <Grid container spacing={1}>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <motion.div variants={slideUpItem}>
                      <DashboardCard
                        title="Total Salary"
                        value={formatCurrency(salarySlip.totalEarning || 0)}
                        icon="solar:wallet-bold-duotone"
                        color="success.dark"
                        bgColor="success.lighter"
                      />
                    </motion.div>
                  </Grid>

                  <Grid size={{ xs: 12, md: 4 }}>
                    <motion.div variants={slideUpItem}>
                      <DashboardCard
                        title="Total Deduction"
                        value={formatCurrency(salarySlip.totalDeduction || 0)}
                        icon="solar:bill-list-bold-duotone"
                        color="error.dark"
                        bgColor="error.lighter"
                      />
                    </motion.div>
                  </Grid>

                  <Grid size={{ xs: 12, md: 4 }}>
                    <motion.div variants={slideUpItem}>
                      <DashboardCard
                        title="Net Payable"
                        value={formatCurrency(salarySlip.netSalary ?? salarySlip.netPay ?? 0)}
                        icon="solar:card-send-bold-duotone"
                        color="info.dark"
                        bgColor="info.lighter"
                      />
                    </motion.div>
                  </Grid>
                </Grid>

                <Grid container spacing={1} alignItems="stretch">
                  <Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex', flexDirection: 'column' }}>
                    <PayrollLineTable
                      title="Earnings"
                      subheader="Breakdown of earnings"
                      icon="solar:hand-money-linear"
                      iconColor={{ bgcolor: 'success.lighter', color: 'success.main' }}
                      nameColumnLabel="Earning Type"
                      tableId="earning-section"
                      noDataText="No Data Found For Earning Section"
                      data={earnings}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex', flexDirection: 'column' }}>
                    <PayrollLineTable
                      title="Deductions"
                      subheader="Breakdown of deductions"
                      icon="solar:minus-circle-linear"
                      iconColor={{ bgcolor: 'error.lighter', color: 'error.main' }}
                      nameColumnLabel="Deduction Type"
                      tableId="deduction-section"
                      noDataText="No Data Found For Deduction"
                      data={deductions}
                    />
                  </Grid>
                </Grid>
              </>
            ) : (
              <HrNotice severity="info">Select a month to view finalized payroll summary.</HrNotice>
            )}
          </Box>
        </motion.div>
      </Scrollbar>
      <CustomDialog
        open={canUsePdf && previewSelection === documentKey}
        handleClose={() => setPreviewSelection(null)}
        title="Payslip Preview"
        titleInfo="View the issued payslip for the selected staff member and pay period."
        maxWidth="md"
        hasForm={false}
        guardUnsavedChanges={false}
      >
        {canUsePdf && actions.pdfUrl && previewSelection === documentKey && (
          <Box sx={{ p: 2 }}>
            <PayslipPdfViewer
              url={actions.pdfUrl}
              title={`Official payslip PDF, ${salarySlipMonth}`}
              contentRef={contentRef}
              onReady={onPdfReady}
            />
          </Box>
        )}
      </CustomDialog>
    </Box>
  );
};

const PayrollSummarySkeleton = () => (
  <>
    <Grid container spacing={1}>
      {[1, 2, 3].map((item) => (
        <Grid size={{ xs: 12, md: 4 }} key={item}>
          <Card sx={{ p: 1 }}>
            <Skeleton variant="text" width="45%" height={24} />
            <Skeleton variant="text" width="65%" height={42} />
          </Card>
        </Grid>
      ))}
    </Grid>
    <Grid container spacing={1}>
      {[1, 2].map((item) => (
        <Grid size={{ xs: 12, md: 6 }} key={item}>
          <Card sx={{ p: 2 }}>
            <Skeleton variant="text" width="40%" height={28} />
            <Skeleton variant="rounded" width="100%" height={180} />
          </Card>
        </Grid>
      ))}
    </Grid>
  </>
);

const PayrollLineTable = ({
  title,
  subheader,
  icon,
  iconColor,
  nameColumnLabel,
  tableId,
  noDataText,
  data,
}: any) => (
  <motion.div variants={slideUpItem} style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
    <Card sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <CardHeader
        title={title}
        subheader={subheader}
        avatar={
          <Avatar sx={{ ...iconColor, width: 32, height: 32 }}>
            <Iconify icon={icon} width={20} />
          </Avatar>
        }
        sx={{ p: 2 }}
      />
      <CustomizableTable
        variant="embedded"
        showColumns
        showExport
        showFullScreen
        exportScope="all"
        noDataText={noDataText}
        tableId={tableId}
        tableTitle="Salary components"
        isFilter={false}
        isSearch={false}
        columns={[
          { id: 'name', label: nameColumnLabel },
          {
            id: 'amount',
            label: 'Amount',
            filterType: 'number',
            render(value) {
              return formatCurrency(value || 0);
            },
          },
        ]}
        data={data}
        wrapperProps={{ sx: { flex: 1, '& .MuiTable-root': { minWidth: 'auto' } } }}
      />
    </Card>
  </motion.div>
);

export default PayrollSummary;
