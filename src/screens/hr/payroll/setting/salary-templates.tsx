'use client';

import type { SalaryTemplate, SalaryTemplateRule } from 'src/redux/hr/salary-template-api';
import type { RootState } from 'src/redux/store';

import { toast } from 'sonner';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Add, Edit, Star, Archive, Publish, ContentCopy } from '@mui/icons-material';
import { hasGrantedPermission } from 'src/utils/permissions';
import { hrPermissions } from 'src/constants/hr-menus';
import {
  Box,
  Grid,
  Chip,
  Card,
  Alert,
  Button,
  Select,
  Dialog,
  MenuItem,
  TextField,
  Typography,
  InputLabel,
  CardContent,
  DialogTitle,
  CardActions,
  FormControl,
  DialogActions,
  DialogContent,
  CircularProgress,
} from '@mui/material';
import {
  useGetSalaryTemplatesQuery,
  useCloneSalaryTemplateMutation,
  useArchiveSalaryTemplateMutation,
  usePublishSalaryTemplateMutation,
  useSetDefaultSalaryTemplateMutation,
  useUpdateSalaryTemplateDraftMutation,
  useCreateSalaryTemplateVersionMutation,
} from 'src/redux/hr/salary-template-api';

const formulaOptions = [
  'PERCENTAGE_OF_GROSS',
  'PERCENTAGE_OF_BASIC',
  'PERCENTAGE_OF_COMPONENT',
  'FIXED_AMOUNT',
  'REMAINDER_OF_GROSS',
  'EMPLOYEE_PROVIDENT_FUND',
  'PROFESSIONAL_TAX',
];

const getFormulaOptions = (rule: SalaryTemplateRule) => {
  if (rule.semanticType === 'EMPLOYEE_PROVIDENT_FUND') return ['EMPLOYEE_PROVIDENT_FUND'];
  if (rule.semanticType === 'PROFESSIONAL_TAX') return ['PROFESSIONAL_TAX'];
  if (rule.semanticType === 'BALANCING_EARNING') return ['REMAINDER_OF_GROSS'];

  return formulaOptions.filter(
    (option) =>
      !['REMAINDER_OF_GROSS', 'EMPLOYEE_PROVIDENT_FUND', 'PROFESSIONAL_TAX'].includes(
        option
      )
  );
};

type DraftEditor = {
  templateId: string;
  versionId: string;
  name: string;
  description: string;
  rules: SalaryTemplateRule[];
};

type CloneIntent = 'create' | 'clone';

export default function SalaryTemplateSettings() {
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const canAdd = hasGrantedPermission(
    permissions,
    hrPermissions.payroll.settings.salaryTemplateActions.add
  );
  const canEdit = hasGrantedPermission(
    permissions,
    hrPermissions.payroll.settings.salaryTemplateActions.edit
  );
  const canPublish = hasGrantedPermission(
    permissions,
    hrPermissions.payroll.settings.salaryTemplateActions.publish
  );
  const canSetDefault = hasGrantedPermission(
    permissions,
    hrPermissions.payroll.settings.salaryTemplateActions.setDefault
  );
  const canArchive = hasGrantedPermission(
    permissions,
    hrPermissions.payroll.settings.salaryTemplateActions.archive
  );
  const { data, isLoading, isError, refetch } = useGetSalaryTemplatesQuery();
  const [setDefault, defaultState] = useSetDefaultSalaryTemplateMutation();
  const [publish, publishState] = usePublishSalaryTemplateMutation();
  const [archive, archiveState] = useArchiveSalaryTemplateMutation();
  const [clone, cloneState] = useCloneSalaryTemplateMutation();
  const [createVersion, versionState] = useCreateSalaryTemplateVersionMutation();
  const [updateDraft, updateState] = useUpdateSalaryTemplateDraftMutation();
  const [cloneSourceId, setCloneSourceId] = useState<string | null>(null);
  const [cloneName, setCloneName] = useState('');
  const [cloneIntent, setCloneIntent] = useState<CloneIntent>('clone');
  const [draftEditor, setDraftEditor] = useState<DraftEditor | null>(null);
  const [archiveTarget, setArchiveTarget] = useState<SalaryTemplate | null>(null);
  const busy =
    defaultState.isLoading ||
    publishState.isLoading ||
    archiveState.isLoading ||
    cloneState.isLoading ||
    versionState.isLoading ||
    updateState.isLoading;

  const openDraftEditor = (template: SalaryTemplate) => {
    setDraftEditor({
      templateId: template.id,
      versionId: template.latest.id,
      name: template.name,
      description: template.description || '',
      rules: template.latest.rules.map((rule) => ({ ...rule })),
    });
  };

  const openCloneDialog = (template: SalaryTemplate, intent: CloneIntent) => {
    setCloneSourceId(template.id);
    setCloneName(intent === 'create' ? '' : `${template.name} Copy`);
    setCloneIntent(intent);
  };

  const closeCloneDialog = () => {
    setCloneSourceId(null);
    setCloneName('');
    setCloneIntent('clone');
  };

  const updateRule = (index: number, patch: Partial<SalaryTemplateRule>) => {
    setDraftEditor((current) => current && ({
      ...current,
      rules: current.rules.map((rule, ruleIndex) => ruleIndex === index ? { ...rule, ...patch } : rule),
    }));
  };

  const run = async (action: () => Promise<unknown>, message: string) => {
    try {
      await action();
      toast.success(message);
      return true;
    } catch {
      toast.error('Unable to update the salary template.');
      return false;
    }
  };

  if (isLoading) {
    return <Box display="flex" justifyContent="center" py={6}><CircularProgress /></Box>;
  }

  if (isError) {
    return <Alert severity="error" action={<Button onClick={() => refetch()}>Retry</Button>}>Unable to load salary templates.</Alert>;
  }

  const templateItems = data?.items || [];
  const creationSource = templateItems.find((template) => template.isDefault) || templateItems[0];
  const cloneSource = templateItems.find((template) => template.id === cloneSourceId);

  return (
    <>
      <Box display="flex" alignItems={{ xs: 'stretch', md: 'flex-start' }} gap={2} mb={2} flexDirection={{ xs: 'column', md: 'row' }}>
        <Alert severity="info" sx={{ flex: 1 }}>
          Published versions are immutable. Start a new draft version before changing rules. Existing
          employee salary components never change automatically.
        </Alert>
        {canAdd && creationSource ? (
          <Button variant="contained" startIcon={<Add />} disabled={busy} onClick={() => openCloneDialog(creationSource, 'create')}>
            Create template
          </Button>
        ) : null}
      </Box>
      {!templateItems.length ? (
        <Alert severity="warning">No salary templates are available. Ask an administrator to run the tenant payroll defaults.</Alert>
      ) : null}
      <Grid container spacing={2}>
        {templateItems.map((template) => (
          <Grid key={template.id} size={{ xs: 12, md: 6, xl: 4 }}>
            <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flex: 1 }}>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <Typography variant="h6">{template.name}</Typography>
                  <Chip size="small" label={template.status} color={template.status === 'PUBLISHED' ? 'success' : template.status === 'DRAFT' ? 'warning' : 'default'} variant="soft" />
                  {template.isDefault && <Chip size="small" icon={<Star />} label="Default" color="primary" variant="soft" />}
                </Box>
                <Typography variant="body2" color="text.secondary" mb={1.5}>
                  {template.description || 'No description provided.'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Latest version: {template.latest.versionNumber} · {template.latest.rules.length} rules
                </Typography>
              </CardContent>
              <CardActions sx={{ flexWrap: 'wrap' }}>
                {canEdit && template.latest.status === 'PUBLISHED' && template.status !== 'ARCHIVED' && (
                  <Button size="small" startIcon={<Add />} disabled={busy} onClick={() => run(() => createVersion(template.id).unwrap(), 'Draft version created.')}>New draft</Button>
                )}
                {template.latest.status === 'DRAFT' && (canEdit || canPublish) && (
                  <>
                    {canEdit && <Button size="small" startIcon={<Edit />} disabled={busy} onClick={() => openDraftEditor(template)}>Edit draft</Button>}
                    {canPublish && <Button size="small" startIcon={<Publish />} disabled={busy} onClick={() => run(() => publish({ templateId: template.id, versionId: template.latest.id }).unwrap(), 'Template published.')}>Publish</Button>}
                  </>
                )}
                {canSetDefault && template.status === 'PUBLISHED' && !template.isDefault && (
                  <Button size="small" startIcon={<Star />} disabled={busy} onClick={() => run(() => setDefault(template.id).unwrap(), 'Default template updated.')}>Set default</Button>
                )}
                {canAdd && <Button size="small" startIcon={<ContentCopy />} disabled={busy || template.status === 'ARCHIVED'} onClick={() => openCloneDialog(template, 'clone')}>Clone</Button>}
                {canArchive && <Button size="small" color="error" startIcon={<Archive />} disabled={busy || template.status === 'ARCHIVED'} onClick={() => setArchiveTarget(template)}>Archive</Button>}
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={Boolean(cloneSourceId)} onClose={closeCloneDialog} maxWidth="xs" fullWidth>
        <DialogTitle>{cloneIntent === 'create' ? 'Create salary template' : 'Clone salary template'}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Start with the current rules from {cloneSource?.name}. The new template is an independent draft.
          </Typography>
          <TextField autoFocus fullWidth label="New template name" value={cloneName} onChange={(event) => setCloneName(event.target.value)} sx={{ mt: 1 }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeCloneDialog}>Cancel</Button>
          <Button variant="contained" disabled={!cloneSourceId || !cloneName.trim() || cloneState.isLoading} onClick={async () => {
            if (!cloneSourceId) return;
            const succeeded = await run(
              () => clone({ id: cloneSourceId, name: cloneName.trim() }).unwrap(),
              cloneIntent === 'create' ? 'Salary template created.' : 'Template cloned as a new draft.'
            );
            if (succeeded) closeCloneDialog();
          }}>{cloneIntent === 'create' ? 'Create' : 'Clone'}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(archiveTarget)} onClose={() => setArchiveTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Archive salary template?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            {archiveTarget?.name} will no longer be available for new salary calculations. Existing
            employee structures and locked payroll snapshots will not change.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setArchiveTarget(null)}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            disabled={!archiveTarget || archiveState.isLoading}
            onClick={async () => {
              if (!archiveTarget) return;
              const succeeded = await run(
                () => archive(archiveTarget.id).unwrap(),
                'Template archived.'
              );
              if (succeeded) setArchiveTarget(null);
            }}
          >
            Archive
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(draftEditor)} onClose={() => setDraftEditor(null)} maxWidth="md" fullWidth>
        <DialogTitle>Edit salary template draft</DialogTitle>
        <DialogContent>
          {draftEditor && (
            <Box display="grid" gap={2} pt={1}>
              <TextField
                label="Template name"
                value={draftEditor.name}
                onChange={(event) => setDraftEditor({ ...draftEditor, name: event.target.value })}
              />
              <TextField
                label="Description"
                value={draftEditor.description}
                multiline
                minRows={2}
                onChange={(event) => setDraftEditor({ ...draftEditor, description: event.target.value })}
              />
              <Typography variant="subtitle2">Calculation rules</Typography>
              {draftEditor.rules.map((rule, index) => {
                const acceptsValue = !['REMAINDER_OF_GROSS', 'EMPLOYEE_PROVIDENT_FUND', 'PROFESSIONAL_TAX'].includes(rule.formulaType);
                return (
                  <Card key={`${rule.code}-${rule.displayOrder}`} variant="outlined">
                    <CardContent>
                      <Grid container spacing={1.5} alignItems="center">
                        <Grid size={{ xs: 12, md: 3 }}>
                          <Typography variant="subtitle2">{rule.code}</Typography>
                          <Typography variant="caption" color="text.secondary">{rule.lineKind} · {rule.semanticType}</Typography>
                        </Grid>
                        <Grid size={{ xs: 12, md: 5 }}>
                          <FormControl fullWidth size="small">
                            <InputLabel>Formula</InputLabel>
                            <Select
                              label="Formula"
                              value={rule.formulaType}
                              onChange={(event) => updateRule(index, { formulaType: event.target.value })}
                            >
                              {getFormulaOptions(rule).map((option) => <MenuItem key={option} value={option}>{option.replaceAll('_', ' ')}</MenuItem>)}
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid size={{ xs: 12, md: 2 }}>
                          <TextField
                            fullWidth
                            size="small"
                            type="number"
                            label={rule.formulaType.startsWith('PERCENTAGE') ? 'Percent' : 'Amount'}
                            disabled={!acceptsValue}
                            value={acceptsValue ? rule.value ?? '' : ''}
                            onChange={(event) => updateRule(index, { value: event.target.value === '' ? null : Number(event.target.value) })}
                            slotProps={{ htmlInput: { min: 0, step: 0.01 } }}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, md: 2 }}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Basis code"
                            disabled={rule.formulaType !== 'PERCENTAGE_OF_COMPONENT'}
                            value={rule.basisCode || ''}
                            onChange={(event) => updateRule(index, { basisCode: event.target.value.toUpperCase() || null })}
                          />
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                );
              })}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDraftEditor(null)}>Cancel</Button>
          <Button
            variant="contained"
            disabled={!draftEditor?.name.trim() || updateState.isLoading}
            onClick={async () => {
              if (!draftEditor) return;
              const succeeded = await run(
                () => updateDraft({
                  ...draftEditor,
                  name: draftEditor.name.trim(),
                  description: draftEditor.description.trim() || null,
                }).unwrap(),
                'Draft template saved.'
              );
              if (succeeded) setDraftEditor(null);
            }}
          >
            Save draft
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
