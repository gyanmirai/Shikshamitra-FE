import { Iconify } from 'src/components/iconify';
import { formatCurrency } from 'src/utils/cureencyFormater';
import { Box, Card, Stack, Avatar, Divider, CardHeader, Typography } from '@mui/material';

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
      data-table-id={tableId}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        border: (theme) => `1px solid ${theme.palette.divider}`,
        boxShadow: (theme) => theme.customShadows?.z1,
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
              <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                {title}
              </Typography>
              {subheader ? (
                <Typography variant="caption" color="text.secondary">
                  {subheader}
                </Typography>
              ) : null}
            </Box>
            <Typography variant="caption" sx={{ fontWeight: 800, whiteSpace: 'nowrap' }}>
              {formatCurrency(total)}
            </Typography>
          </Stack>
        }
        sx={{ p: 1.5, pb: 1 }}
      />

      <Box sx={{ px: 1.5, pb: 1.5, flex: 1 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          sx={{
            py: 0.75,
            borderTop: (theme) => `1px solid ${theme.palette.divider}`,
            borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
          }}
        >
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800 }}>
            {nameColumnLabel}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800 }}>
            Amount
          </Typography>
        </Stack>
        {data?.length ? (
          <Stack divider={<Divider flexItem />}>
            {data.map((item, index) => (
              <Stack
                key={`${item?.name || title}-${index}`}
                direction="row"
                justifyContent="space-between"
                spacing={1.5}
                sx={{ py: 0.9 }}
              >
                <Typography variant="body2" color="text.secondary" sx={{ minWidth: 0 }}>
                  {item?.name || '-'}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>
                  {formatCurrency(item?.amount || 0)}
                </Typography>
              </Stack>
            ))}
          </Stack>
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
            {noDataText}
          </Typography>
        )}
        <Stack
          direction="row"
          justifyContent="space-between"
          sx={{ mt: 1, px: 1, py: 0.85, borderRadius: 1, bgcolor: 'background.neutral' }}
        >
          <Typography variant="body2" sx={{ fontWeight: 800 }}>
            Total
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 800 }}>
            {formatCurrency(total)}
          </Typography>
        </Stack>
      </Box>
    </Card>
  );
};

