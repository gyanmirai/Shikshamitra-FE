'use client';

import type { RootState } from 'src/redux/store';
import type { HrSetupReadiness } from 'src/redux/hr/hr-setup-readiness-api';

import { useSelector } from 'react-redux';
import { useState, useContext } from 'react';
import { hrPermissions } from 'src/constants/hr-menus';
import { PFForm } from 'src/screens/hr/payroll/setting/pf';
import { securityPaths } from 'src/constants/security-menu';
import { hasGrantedPermission } from 'src/utils/permissions';
import { useGetLeavePoliciesQuery } from 'src/redux/hr/leaveApi';
import { Alert, Stack, Button, MenuItem, TextField } from '@mui/material';
import { useGetSalaryTemplatesQuery } from 'src/redux/hr/salary-template-api';
import { EsiPolicyEditor } from 'src/screens/hr/payroll/setting/esi-policies';
import { hrLeavePolicyPermissions } from 'src/constants/hr-policy-permissions';
import { LeavePolicyForm } from 'src/screens/hr/policies/components/LeavePolicyForm';
import { ProfessionalTaxForm } from 'src/screens/hr/payroll/setting/professional-tax';
import { useGetEarningComponentOptionsQuery } from 'src/redux/hr/employee-payroll-api';
import { EarningComponentForm } from 'src/screens/hr/payroll/setting/earning-component';
import { ShiftManagementForm } from 'src/screens/hr/attendance-setting/shift-management';
import SalaryTemplateEditor from 'src/screens/hr/payroll/setting/salary-template-editor';
import { DeductionComponentForm } from 'src/screens/hr/payroll/setting/deduction-component';

import { HrSetupPolicyEditor } from './hr-setup-policy-editor';
import { HrSetupNavigationContext } from './hr-setup-editor-context';

type Props = { task: string; readiness: HrSetupReadiness; onSaved: () => void; revision: number };
const administratorMessage = 'An administrator must complete this step.';

export function HrSetupEditor(props: Props) {
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const granted = (name: string) => hasGrantedPermission(permissions, name);
  const { task, onSaved } = props;
  const denied = <Alert severity="warning">{administratorMessage}</Alert>;
  if (task.endsWith('-role'))
    return (
      <Alert
        severity="info"
        action={
          granted('AbpIdentity.Roles.Update') && granted('AbpIdentity.Roles') ? (
            <Button
              size="small"
              href={securityPaths.roleAndPermission.role}
              target="_blank"
              rel="noopener noreferrer"
            >
              Manage roles (new tab)
            </Button>
          ) : undefined
        }
      >
        Approve an Employee-audience role for the required employee group in Role Management. Return
        here and refresh setup after saving.
        <Button size="small" onClick={onSaved}>
          Check setup again
        </Button>
      </Alert>
    );
  if (task === 'shift')
    return granted(`${hrPermissions.attendance.setting.shiftManagement}.Add`) ? (
      <ShiftManagementForm editData={null} handleClose={onSaved} />
    ) : (
      denied
    );
  if (task === 'earnings')
    return granted(`${hrPermissions.payroll.settings.earningComponents}.Add`) &&
      granted(`${hrPermissions.payroll.settings.earningComponents}.View`) ? (
      <EarningsEditor onSaved={onSaved} />
    ) : (
      denied
    );
  if (task === 'salary-template')
    return granted(hrPermissions.payroll.settings.salaryTemplateActions.view) ? (
      <TemplateEditor {...props} />
    ) : (
      denied
    );
  if (task === 'deductions')
    return granted(`${hrPermissions.payroll.settings.deductionComponents}.Add`) &&
      granted(`${hrPermissions.payroll.settings.deductionComponents}.View`) ? (
      <DeductionComponentForm
        editData={null}
        handleClose={(_, saved) => {
          if (saved) onSaved();
        }}
      />
    ) : (
      denied
    );
  if (task === 'pf')
    return granted(`${hrPermissions.payroll.settings.pfRule}.Add`) ? (
      <PFForm
        editData={null}
        handleClose={(_, saved) => {
          if (saved) onSaved();
        }}
      />
    ) : (
      denied
    );
  if (task === 'professional-tax')
    return granted(`${hrPermissions.payroll.settings.professionalTax}.Add`) ? (
      <ProfessionalTaxForm editData={null} handleClose={onSaved} />
    ) : (
      denied
    );
  if (task === 'esi')
    return [
      hrPermissions.payroll.settings.statutorySchemes,
      ...['edit', 'activate', 'configureCalculation'].map(
        (action) =>
          hrPermissions.payroll.settings.statutorySchemeActions[
            action as 'edit' | 'activate' | 'configureCalculation'
          ]
      ),
    ].every(granted) ? (
      <EsiPolicyEditor onClose={onSaved} />
    ) : (
      denied
    );
  if (task === 'leave-policy')
    return granted(hrLeavePolicyPermissions.view) &&
      (granted(hrLeavePolicyPermissions.create) || granted(hrLeavePolicyPermissions.edit)) ? (
      <LeaveEditor {...props} />
    ) : (
      denied
    );
  if (['calendar', 'payroll-policy', 'attendance-policy'].includes(task))
    return granted(hrPermissions.policyActions.view) ? <HrSetupPolicyEditor {...props} /> : denied;
  return <Alert severity="info">Choose a setup task from the checklist.</Alert>;
}

function EarningsEditor({ onSaved }: { onSaved: () => void }) {
  const navigate = useContext(HrSetupNavigationContext);
  const query = useGetEarningComponentOptionsQuery(undefined);
  const [selected, setSelected] = useState('new');
  // Keep the selected record stable while its catalogue refreshes in the background.
  const [row, setRow] =
    useState<React.ComponentProps<typeof EarningComponentForm>['editData']>(null);
  const rows = query.currentData?.items || [];
  const errorNotice = query.isError ? (
    <Alert
      severity="error"
      action={
        <Button size="small" onClick={() => query.refetch()}>
          Retry
        </Button>
      }
    >
      Unable to load earning components.
    </Alert>
  ) : null;
  if (!query.currentData)
    return errorNotice || <Alert severity="info">Loading earning components...</Alert>;
  return (
    <Stack spacing={2}>
      {errorNotice}
      <TextField
        select
        size="small"
        label="Earning component"
        value={selected}
        onChange={(event) =>
          navigate(() => {
            setSelected(event.target.value);
            setRow(rows.find((item) => item.id === event.target.value) || null);
          })
        }
      >
        <MenuItem value="new">Create earning component</MenuItem>
        {rows.map((item) => (
          <MenuItem key={item.id} value={item.id}>
            {item.earningComponentName}
          </MenuItem>
        ))}
      </TextField>
      <EarningComponentForm
        key={selected}
        editData={row ? { ...row, componentName: row.earningComponentName } : null}
        handleClose={(_, saved) => {
          if (saved) onSaved();
        }}
      />
    </Stack>
  );
}

function TemplateEditor({ onSaved, revision }: Pick<Props, 'onSaved' | 'revision'>) {
  const navigate = useContext(HrSetupNavigationContext);
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const canCreate = hasGrantedPermission(
    permissions,
    hrPermissions.payroll.settings.salaryTemplateActions.add
  );
  const canEdit = hasGrantedPermission(
    permissions,
    hrPermissions.payroll.settings.salaryTemplateActions.edit
  );
  const query = useGetSalaryTemplatesQuery();
  const [selected, setSelected] = useState(canCreate ? 'new' : '');
  const errorNotice = query.isError ? (
    <Alert
      severity="error"
      action={
        <Button size="small" onClick={() => query.refetch()}>
          Retry
        </Button>
      }
    >
      Unable to load salary templates.
    </Alert>
  ) : null;
  if (!query.currentData)
    return errorNotice || <Alert severity="info">Loading salary templates...</Alert>;
  return (
    <Stack spacing={2}>
      {errorNotice}
      <TextField
        select
        size="small"
        label="Salary template"
        value={selected}
        onChange={(event) => navigate(() => setSelected(event.target.value))}
      >
        {canCreate && <MenuItem value="new">Create salary template</MenuItem>}
        {query.currentData.items
          .filter((item) => item.status !== 'ARCHIVED')
          .map((item) => (
            <MenuItem key={item.id} value={item.id}>
              {item.name}
            </MenuItem>
          ))}
      </TextField>
      {selected && (
        <SalaryTemplateEditor
          key={selected}
          mode={selected === 'new' ? 'create' : canEdit ? 'edit' : 'view'}
          templateId={selected === 'new' ? undefined : selected}
          onSaved={onSaved}
          onClose={() => {}}
          dependencyRevision={revision}
        />
      )}
    </Stack>
  );
}

function LeaveEditor({ readiness, onSaved }: Pick<Props, 'readiness' | 'onSaved'>) {
  const navigate = useContext(HrSetupNavigationContext);
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const canCreate = hasGrantedPermission(permissions, hrLeavePolicyPermissions.create);
  const query = useGetLeavePoliciesQuery({
    academicYearId: readiness.academicYearId || undefined,
    page: 1,
    pageSize: 500,
  });
  const [selected, setSelected] = useState(canCreate ? 'new' : '');
  const [row, setRow] = useState<React.ComponentProps<typeof LeavePolicyForm>['editData']>(null);
  if (query.isError)
    return (
      <Alert
        severity="error"
        action={
          <Button size="small" onClick={() => query.refetch()}>
            Retry
          </Button>
        }
      >
        Unable to load leave policies.
      </Alert>
    );
  if (!query.currentData) return <Alert severity="info">Loading leave policies...</Alert>;
  const rows = query.currentData.items || [];
  return (
    <Stack spacing={2}>
      <TextField
        select
        size="small"
        label="Leave policy"
        value={selected}
        onChange={(event) =>
          navigate(() => {
            setSelected(event.target.value);
            setRow(rows.find((item: { id: string }) => item.id === event.target.value) || null);
          })
        }
      >
        {canCreate && <MenuItem value="new">Create leave policy</MenuItem>}
        {rows.map((item: { id: string; policyTitle?: string; title?: string }) => (
          <MenuItem key={item.id} value={item.id}>
            {item.policyTitle || item.title}
          </MenuItem>
        ))}
      </TextField>
      {selected && (
        <LeavePolicyForm
          key={selected}
          editData={row || null}
          handleClose={(_, saved) => {
            if (saved) onSaved();
          }}
        />
      )}
    </Stack>
  );
}
