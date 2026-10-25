import type { IFeeHeadDependencies } from 'src/redux/feeCategory/feeCategoryApi';

import { useId } from 'react';
import { stylesMode } from 'src/theme/styles';
import { useBoolean } from 'src/hooks/use-boolean';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { financePermissions } from 'src/constants/finance-menu';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { Box, Alert, Stack, Button, Collapse, Typography } from '@mui/material';

import { useFinancePermissions } from '../../hooks/useFinancePermissions';

const countLabel = (count: number, singular: string) =>
  `${count} ${singular}${count === 1 ? '' : 's'}`;

export const feeHeadDependencyMessage = (name: string, dependencies?: IFeeHeadDependencies) =>
  dependencies
    ? `${name} is used by ${countLabel(dependencies.studentCount, 'student')}, ${countLabel(dependencies.assignmentCount, 'assignment')}, ${countLabel(dependencies.feeStructureCount, 'fee structure')}, and ${countLabel(dependencies.paymentTermCount, 'payment term')}. Remove or reassign these references before removing or deactivating this fee head.`
    : `${name} is already in use. Review its fee structures and student assignments before removing or deactivating it.`;

export default function FeeHeadDependencies({
  name,
  dependencies,
  feeHeadId,
  showName = false,
}: {
  name: string;
  dependencies?: IFeeHeadDependencies;
  feeHeadId?: string;
  showName?: boolean;
}) {
  const assignments = useFinancePermissions(financePermissions.fees.structureAssign);
  const structures = useFinancePermissions(financePermissions.fees.settings.feeStructure);
  const usage = useBoolean();
  const usageId = useId();
  const usageCounts = dependencies
    ? [
        { label: 'Students', count: dependencies.studentCount },
        { label: 'Fee assignments', count: dependencies.assignmentCount },
        { label: 'Fee structures', count: dependencies.feeStructureCount },
        { label: 'Payment terms', count: dependencies.paymentTermCount },
      ]
    : [];

  return (
    <Alert
      severity="warning"
      aria-label={`Usage restrictions for ${name}`}
      icon={<ErrorOutlineIcon fontSize="small" />}
      sx={{
        p: 0,
        bgcolor: 'transparent',
        color: 'text.primary',
        [stylesMode.dark]: {
          bgcolor: 'transparent',
          color: 'text.primary',
          '& .MuiAlert-icon': { color: 'warning.main' },
        },
        '& .MuiAlert-icon': { color: 'warning.main', mr: 1, py: 0.5 },
        '& .MuiAlert-message': { minWidth: 0, width: 1, py: 0 },
      }}
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems="flex-start"
        justifyContent="space-between"
        spacing={{ xs: 0.5, sm: 1 }}
      >
        <Box sx={{ minWidth: 0, pt: 0.5 }}>
          <Typography variant="body2" sx={{ fontWeight: 'fontWeightSemiBold' }}>
            {showName && `${name}: `}
            In use. Can’t remove or deactivate.
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Remove or reassign references first.
          </Typography>
        </Box>
        <Button
          type="button"
          size="small"
          color="info"
          onClick={usage.onToggle}
          aria-expanded={usage.value}
          aria-controls={usage.value ? usageId : undefined}
          startIcon={usage.value ? <ArrowDropDownIcon /> : <ArrowRightIcon />}
          sx={{ flexShrink: 0 }}
        >
          {usage.value ? 'Hide usage' : 'View usage'}
        </Button>
      </Stack>
      <Collapse in={usage.value} unmountOnExit>
        <Box id={usageId} role="region" aria-label={`Usage of ${name}`} sx={{ pt: 1 }}>
          {dependencies ? (
            <Box
              component="dl"
              sx={{
                m: 0,
                p: 1,
                bgcolor: 'background.paper',
                border: 1,
                borderColor: 'divider',
                borderRadius: 1,
              }}
            >
              {usageCounts.map(({ label, count }) => (
                <Stack key={label} direction="row" justifyContent="space-between" spacing={2}>
                  <Typography component="dt" variant="caption" color="text.secondary">
                    {label}
                  </Typography>
                  <Typography component="dd" variant="caption" sx={{ m: 0 }}>
                    {count}
                  </Typography>
                </Stack>
              ))}
            </Box>
          ) : (
            <Typography variant="caption" color="text.secondary">
              Usage counts are unavailable. Review fee structures and student assignments.
            </Typography>
          )}
          <Stack direction="row" spacing={1} sx={{ mt: 0.5 }} flexWrap="wrap">
            {assignments.canView && (
              <Button
                size="small"
                href={
                  feeHeadId
                    ? `/finance/fee-structure-assign?feeHeadId=${encodeURIComponent(feeHeadId)}`
                    : '/finance/fee-structure-assign'
                }
                target="_blank"
                rel="noopener"
              >
                Review Fee Assignments
              </Button>
            )}
            {structures.canView && (
              <Button
                size="small"
                href="/finance/settings/create-fee-structure"
                target="_blank"
                rel="noopener"
              >
                Review Fee Structures
              </Button>
            )}
          </Stack>
        </Box>
      </Collapse>
    </Alert>
  );
}
