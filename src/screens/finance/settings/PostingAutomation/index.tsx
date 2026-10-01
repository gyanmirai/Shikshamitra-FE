'use client';

import { useEffect, useState } from 'react';
import { LoadingButton } from '@mui/lab';
import { Alert, Box, Card, CardContent, Chip, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { useSelector } from 'react-redux';
import type { RootState } from 'src/redux/store';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { shikshaMitraToast } from 'src/components/toast';
import { useAccountSettingPermissions } from 'src/hooks/useAccountSettingPermissions';
import { useGetAccountHeadOptionsQuery } from 'src/redux/finance/accountHeadApi';
import { useGetBankAccountQuery } from 'src/redux/finance/BankAccountManage/bankAccountApi';
import {
  useGetAccountsPostingSetupQuery,
  useConfigureAccountsPostingMutation,
  useAddAccountingPeriodMutation,
  useAddPaymentDestinationMutation,
  useEndPaymentDestinationMutation,
} from 'src/redux/finance/accountsPostingSetupApi';

const methods = [
  { value: 1, label: 'Cheque' }, { value: 2, label: 'Demand draft' },
  { value: 3, label: 'Bank transfer' }, { value: 4, label: 'Credit card' },
  { value: 5, label: 'Debit card' }, { value: 6, label: 'UPI' },
];
type HeadOption = { id: string; name: string };
type BankOption = { id: string; bankName: string; maskedAccountNumber: string; accountHeadId: string };

export default function PostingAutomation() {
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const yearId = currentYear?.id ?? '';
  const access = useAccountSettingPermissions('PostingSetup');
  const bankAccess = useAccountSettingPermissions('BankAccount');
  const headAccess = useAccountSettingPermissions('AccountHead');
  const { data: setup, isLoading, isError } = useGetAccountsPostingSetupQuery(yearId, { skip: !yearId });
  const { data: headOptions } = useGetAccountHeadOptionsQuery(
    { academicYearId: yearId, headType: 'Asset' }, { skip: !yearId || !headAccess.canView });
  const { data: bankPage } = useGetBankAccountQuery(
    { academicYearId: yearId, page: 1, pageSize: 100, includeInactive: false },
    { skip: !yearId || !bankAccess.canView });
  const heads = (headOptions ?? []) as HeadOption[];
  const banks = (bankPage?.items ?? []) as BankOption[];
  const [configure, { isLoading: savingConfig }] = useConfigureAccountsPostingMutation();
  const [addPeriod, { isLoading: savingPeriod }] = useAddAccountingPeriodMutation();
  const [addDestination, { isLoading: savingDestination }] = useAddPaymentDestinationMutation();
  const [endDestination, { isLoading: endingDestination }] = useEndPaymentDestinationMutation();
  const [endingDates, setEndingDates] = useState<Record<string, string>>({});
  const [firstDate, setFirstDate] = useState('');
  const [cashHeadId, setCashHeadId] = useState('');
  const [period, setPeriod] = useState({ code: '', startsOn: '', endsOn: '' });
  const [destination, setDestination] = useState({ method: 3, direction: 1,
    assetAccountHeadId: '', bankAccountId: '', effectiveFrom: '', effectiveTo: '' });
  useEffect(() => {
    setFirstDate('');
    setCashHeadId('');
    setPeriod({ code: '', startsOn: '', endsOn: '' });
    setDestination({ method: 3, direction: 1, assetAccountHeadId: '', bankAccountId: '', effectiveFrom: '', effectiveTo: '' });
    setEndingDates({});
  }, [yearId]);
  const save = async (operation: Promise<unknown>, message: string) => {
    try { await operation; shikshaMitraToast.success({ message }); }
    catch { shikshaMitraToast.error({ message: 'Could not save Accounts setup. Check the dates and account mapping.' }); }
  };

  return <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pb: 3 }}>
    <CustomBreadcrumbs heading="Accounts posting setup"
      description="Choose financial dates and the actual school account used by each payment method."
      links={[{ name: 'Finance', href: '/finance/dashboard' }, { name: 'Accounts settings' },
        { name: 'Posting setup' }]} />
    {!yearId && <Alert severity="info">Select an academic year to configure Accounts.</Alert>}
    {isLoading && <Alert severity="info">Loading posting setup…</Alert>}
    {isError && <Alert severity="error">Accounts setup could not be loaded.</Alert>}
    {setup && (!headAccess.canView || !bankAccess.canView) &&
      <Alert severity="info">Account Head and Bank Account view access is needed to select a school destination.</Alert>}
    {setup && <Card variant="outlined"><CardContent>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
        <Typography variant="h6">Posting readiness</Typography>
        <Chip size="small" color={setup.isEnabled ? 'success' : 'warning'}
          label={setup.isEnabled ? 'Enabled' : 'Not active'} />
      </Stack>
      {setup.readinessIssues.map((issue) => <Typography key={issue} variant="body2" color="text.secondary">
        • {issue}
      </Typography>)}
      <Typography variant="caption" color="text.secondary">
        Fee and refund rows in Income & Expenses are source activity, not posted journals yet.
      </Typography>
    </CardContent></Card>}
    {setup && <Stack spacing={2}>
      <Card variant="outlined"><CardContent>
        <Typography variant="subtitle1" sx={{ mb: 2 }}>Financial start and cash drawer</Typography>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField type="date" label="First live posting date" InputLabelProps={{ shrink: true }}
            value={firstDate || setup.firstPostingDate || ''} onChange={(e) => setFirstDate(e.target.value)} />
          <TextField select label="School cash Asset account" sx={{ minWidth: 240 }}
            value={cashHeadId || setup.cashAccountHeadId || ''} onChange={(e) => setCashHeadId(e.target.value)}>
            {heads.map((head) => <MenuItem key={head.id} value={head.id}>{head.name}</MenuItem>)}
          </TextField>
          <LoadingButton variant="contained" disabled={!access.canEdit || !(firstDate || setup.firstPostingDate) ||
            !(cashHeadId || setup.cashAccountHeadId)} loading={savingConfig}
            onClick={() => save(configure({ academicYearId: yearId,
              firstPostingDate: firstDate || setup.firstPostingDate!,
              cashAccountHeadId: cashHeadId || setup.cashAccountHeadId! }).unwrap(), 'Posting dates and cash account saved.')}>
            Save setup
          </LoadingButton>
        </Stack>
      </CardContent></Card>
      <Card variant="outlined"><CardContent>
        <Typography variant="subtitle1">Financial periods</Typography>
        {setup.periods.map((item) => <Typography key={item.id} variant="body2">
          {item.code}: {item.startsOn} to {item.endsOn} · {item.isOpen ? 'Open' : 'Closed'}
        </Typography>)}
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mt: 2 }}>
          <TextField label="Period code" value={period.code}
            onChange={(e) => setPeriod({ ...period, code: e.target.value })} />
          <TextField label="Start" type="date" InputLabelProps={{ shrink: true }} value={period.startsOn}
            onChange={(e) => setPeriod({ ...period, startsOn: e.target.value })} />
          <TextField label="End" type="date" InputLabelProps={{ shrink: true }} value={period.endsOn}
            onChange={(e) => setPeriod({ ...period, endsOn: e.target.value })} />
          <LoadingButton variant="outlined" loading={savingPeriod} disabled={!access.canEdit ||
            !period.code || !period.startsOn || !period.endsOn}
            onClick={() => save(addPeriod({ academicYearId: yearId, ...period }).unwrap(), 'Financial period saved.')}>
            Add period
          </LoadingButton>
        </Stack>
      </CardContent></Card>
      <Card variant="outlined"><CardContent>
        <Typography variant="subtitle1">Payment destinations</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Choose the school account that receives or pays the money. Parent and student accounts are never used here.
        </Typography>
        {setup.destinations.map((item) => <Stack key={item.id} direction={{ xs: 'column', md: 'row' }}
          spacing={1} alignItems={{ md: 'center' }} sx={{ my: 1 }}>
          <Typography variant="body2">
            {item.direction === 1 ? 'Incoming' : 'Outgoing'} {methods.find((m) => m.value === item.method)?.label}
            {' → '}{heads.find((h) => h.id === item.assetAccountHeadId)?.name ?? 'School account'}
            {' · '}{item.effectiveFrom}{item.effectiveTo ? ` to ${item.effectiveTo}` : ''}
          </Typography>
          {item.isActive && access.canEdit && <>
            <TextField size="small" type="date" label="Last effective date" InputLabelProps={{ shrink: true }}
              value={endingDates[item.id] ?? ''}
              onChange={(e) => setEndingDates({ ...endingDates, [item.id]: e.target.value })} />
            <LoadingButton size="small" variant="text" loading={endingDestination}
              disabled={!endingDates[item.id] || endingDates[item.id] < item.effectiveFrom}
              onClick={() => save(endDestination({ academicYearId: yearId, id: item.id,
                lastEffectiveDate: endingDates[item.id] }).unwrap(), 'Destination end date saved.')}>
              End rule
            </LoadingButton>
          </>}
        </Stack>)}
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} flexWrap="wrap" sx={{ mt: 2 }}>
          <TextField select label="Method" value={destination.method} sx={{ minWidth: 150 }}
            onChange={(e) => setDestination({ ...destination, method: Number(e.target.value) })}>
            {methods.map((method) => <MenuItem key={method.value} value={method.value}>{method.label}</MenuItem>)}
          </TextField>
          <TextField select label="Direction" value={destination.direction} sx={{ minWidth: 130 }}
            onChange={(e) => setDestination({ ...destination, direction: Number(e.target.value) })}>
            <MenuItem value={1}>Incoming</MenuItem><MenuItem value={2}>Outgoing</MenuItem>
          </TextField>
          <TextField select label="School Asset account" value={destination.assetAccountHeadId} sx={{ minWidth: 200 }}
            onChange={(e) => setDestination({ ...destination, assetAccountHeadId: e.target.value, bankAccountId: '' })}>
            {heads.map((head) => <MenuItem key={head.id} value={head.id}>{head.name}</MenuItem>)}
          </TextField>
          <TextField select label="School bank (if applicable)" value={destination.bankAccountId} sx={{ minWidth: 190 }}
            onChange={(e) => setDestination({ ...destination, bankAccountId: e.target.value })}>
            <MenuItem value="">Clearing account</MenuItem>
            {banks.filter((bank) => bank.accountHeadId === destination.assetAccountHeadId)
              .map((bank) => <MenuItem key={bank.id} value={bank.id}>
                {bank.bankName} · {bank.maskedAccountNumber}
              </MenuItem>)}
          </TextField>
          <TextField label="Effective from" type="date" InputLabelProps={{ shrink: true }}
            value={destination.effectiveFrom}
            onChange={(e) => setDestination({ ...destination, effectiveFrom: e.target.value })} />
          <TextField label="Effective to (optional)" type="date" InputLabelProps={{ shrink: true }}
            value={destination.effectiveTo}
            onChange={(e) => setDestination({ ...destination, effectiveTo: e.target.value })} />
          <LoadingButton variant="outlined" loading={savingDestination}
            disabled={!access.canEdit || !destination.assetAccountHeadId || !destination.effectiveFrom}
            onClick={() => save(addDestination({ academicYearId: yearId, ...destination,
              bankAccountId: destination.bankAccountId || null,
              effectiveTo: destination.effectiveTo || null }).unwrap(), 'Payment destination saved.')}>
            Add destination
          </LoadingButton>
        </Stack>
      </CardContent></Card>
    </Stack>}
  </Box>;
}
