import { Iconify } from 'src/components/iconify';
import CustomizableTable from 'src/components/customizabaleTable';
import { formatPayrollCurrency } from 'src/utils/payroll-currency';
import { Box, Card, Stack, Avatar, CardHeader, Typography } from '@mui/material';

const salaryLineTotal = (data: any[]) =>
  (data || []).reduce((sum, item) => sum + Number(item?.amount || 0), 0);
interface SalaryDetailsTableCardProps {
  title: string;
  subheader?: string;
  icon?: string;
  iconColor?: { bg?: string; bgcolor?: string; color?: string };
  data: any[];
  tableId?: string;
  nameColumnLabel?: string;
  noDataText: string;
}

export const SalaryDetailsTableCard = ({
  title,
  subheader,
  icon = 'solar:bill-list-linear',
  iconColor,
  data,
  tableId,
  nameColumnLabel = 'Component',
  noDataText,
}: SalaryDetailsTableCardProps) => {
  const total = salaryLineTotal(data);

  return (
    <Card
      variant="outlined"
      data-table-id={tableId}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: 'none',
        minWidth: 0,
        fontVariantNumeric: 'tabular-nums',
      }}
    >
      <CardHeader
        avatar={
          <Avatar
            variant="rounded"
            sx={{
              width: 34,
              height: 34,
              borderRadius: 1.25,
              bgcolor: iconColor?.bg || iconColor?.bgcolor || 'background.neutral',
              color: iconColor?.color || 'text.primary',
            }}
          >
            <Iconify icon={icon} width={18} />
          </Avatar>
        }
        title={
          <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, overflowWrap: 'anywhere' }}>
                {title}
              </Typography>
              {subheader ? (
                <Typography variant="caption" color="text.secondary">
                  {subheader}
                </Typography>
              ) : null}
            </Box>
            <Typography variant="caption" sx={{ fontWeight: 800, whiteSpace: 'nowrap' }}>
              {formatPayrollCurrency(total)}
            </Typography>
          </Stack>
        }
        sx={{ p: 1.5, pb: 1 }}
      />

      <Box sx={{ px: 1.5, pb: 1.5, flex: 1 }}>
        <CustomizableTable
          tableId={tableId || `salary-details-${title}`}
          tableTitle={title}
          variant="embedded"
          isPagination={false}
          isSearch={false}
          isShowedDense={false}
          showColumns={false}
          showExport
          showFullScreen={false}
          exportScope="all"
          data={data || []}
          columns={[
            { id: 'name', label: nameColumnLabel, filterType: 'string' },
            {
              id: 'amount',
              label: 'Amount',
              filterType: 'number',
              render: (value) => formatPayrollCurrency(value || 0),
            },
          ]}
          wrapperProps={{ sx: { '& .MuiTable-root': { minWidth: 'auto' } } }}
          noDataText={noDataText}
        />
        <Stack
          direction="row"
          justifyContent="space-between"
          sx={{ mt: 1, px: 1, py: 0.85, borderRadius: 1, bgcolor: 'background.neutral' }}
        >
          <Typography variant="body2" sx={{ fontWeight: 800 }}>
            Total
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 800 }}>
            {formatPayrollCurrency(total)}
          </Typography>
        </Stack>
      </Box>
    </Card>
  );
};
