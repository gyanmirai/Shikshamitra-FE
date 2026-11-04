'use client';

import type { GrantedPermission } from 'src/utils/permissions';

import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { hasGrantedPermission } from 'src/utils/permissions';
import { Stack, Alert, Button, Typography } from '@mui/material';
import { FormSectionCard } from 'src/components/form-section-card';
import { financePaths, financePermissions } from 'src/constants/finance-menu';

import { financeWorkflowGuides } from './finance-setup-catalog';

export default function FinanceSetupGuidance({
  assignment,
  permissions,
  disabled,
}: {
  assignment: boolean;
  permissions: GrantedPermission[];
  disabled: boolean;
}) {
  if (assignment)
    return (
      <Stack spacing={2}>
        <FormSectionCard
          title="Prepare Student Fee Assignment"
          description="Review the published structure and each student’s applicable academic-year context before confirming fees."
        >
          <Stack component="ol" spacing={1.5} sx={{ m: 0, pl: 2.5 }}>
            {[
              'Review the eligible students and any prepared admission fee handoffs. Students need to be available in the selected academic year.',
              'Choose the appropriate published fee structure, optional heads and permitted amounts or service dates.',
              'Review the applicable policy versions and the server preview of installments and amounts.',
              'Confirm assignments only after reviewing their financial effect. Review individual results and resolve any remaining students.',
            ].map((text) => (
              <Typography component="li" variant="body2" key={text}>
                {text}
              </Typography>
            ))}
          </Stack>
          {hasGrantedPermission(permissions, `${financePermissions.fees.structureAssign}.View`) && (
            <Button
              startIcon={<Iconify icon={GlobalIcons.openInNew} width={18} />}
              component="a"
              href={financePaths.fees.structureAssign}
              target="_blank"
              rel="noopener noreferrer"
              color="inherit"
              variant="contained"
              size="small"
              disabled={disabled}
              sx={{ alignSelf: 'flex-start' }}
            >
              Open fee assignment
            </Button>
          )}
        </FormSectionCard>
        <Alert severity="info">
          You can finish reviewing this guide before students are admitted. Continuing here does not
          assign fees or generate student dues.
        </Alert>
      </Stack>
    );

  const workflows = financeWorkflowGuides.filter((item) =>
    hasGrantedPermission(permissions, item.permission)
  );
  return (
    <Stack spacing={2}>
      <Alert severity="info">
        Use these workflows after their prerequisites are ready. You do not need to create a
        collection, concession, expense or refund to finish reviewing setup.
      </Alert>
      {workflows.map((item) => (
        <FormSectionCard
          key={item.title}
          title={item.title}
          description={item.description}
          action={
            <Button
              startIcon={<Iconify icon={GlobalIcons.openInNew} width={18} />}
              component="a"
              href={item.path}
              target="_blank"
              rel="noopener noreferrer"
              color="inherit"
              variant="outlined"
              size="small"
              disabled={disabled}
              aria-label={`Open ${item.title}`}
            >
              Open
            </Button>
          }
        />
      ))}
      {!workflows.length && (
        <Alert severity="info">
          An authorized staff member can review the operational submodules. Your current permissions
          allow access to configuration only.
        </Alert>
      )}
    </Stack>
  );
}
