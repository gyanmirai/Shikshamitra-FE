import type { FormikProps } from 'formik';
import type { SalaryTemplateRule } from 'src/redux/hr/salary-template-api';

import { getIn } from 'formik';
import { Iconify } from 'src/components/iconify';
import NumericFormatCustom from 'src/components/custom-numeric-format';
import {
  Box,
  Card,
  Chip,
  Button,
  Select,
  Collapse,
  MenuItem,
  IconButton,
  InputLabel,
  Typography,
  FormControl,
  FormHelperText,
} from '@mui/material';

import { formulaSummary } from './salary-template-form-model';
import {
  getRoleOptions,
  formatRuleLabel,
  applyFormulaType,
  applySemanticType,
  getFormulaOptions,
  normalizeRuleOrder,
  formulaAcceptsValue,
  getAutomaticFormulaSemanticType,
} from './salary-template-editor-utils';

import type { EditorValues } from './salary-template-form-model';

const uniqueRoles = new Set([
  'BASIC',
  'BALANCING_EARNING',
  'EMPLOYEE_PROVIDENT_FUND',
  'PROFESSIONAL_TAX',
]);

type Props = {
  lineKind: SalaryTemplateRule['lineKind'];
  formik: FormikProps<EditorValues>;
  componentNames: Map<string, string>;
  readOnly: boolean;
  expanded: Set<string>;
  onToggle: (id: string) => void;
  onAdd: () => void;
};

export default function SalaryTemplateRules({
  lineKind,
  formik,
  componentNames,
  readOnly,
  expanded,
  onToggle,
  onAdd,
}: Props) {
  const rules = formik.values.rules.filter((rule) => rule.lineKind === lineKind);
  const usedRoles = new Set(formik.values.rules.map((rule) => rule.semanticType));
  const earning = lineKind === 'EARNING';
  const setRules = (value: SalaryTemplateRule[]) =>
    formik.setFieldValue('rules', normalizeRuleOrder(value));
  const update = (rule: SalaryTemplateRule) =>
    setRules(
      formik.values.rules.map((item) => (item.componentId === rule.componentId ? rule : item))
    );
  const move = (index: number, direction: number) => {
    const reordered = [...rules];
    [reordered[index], reordered[index + direction]] = [
      reordered[index + direction],
      reordered[index],
    ];
    const others = formik.values.rules.filter((rule) => rule.lineKind !== lineKind);
    setRules(earning ? [...reordered, ...others] : [...others, ...reordered]);
  };

  return (
    <Box
      component="section"
      id={earning ? 'salary-earnings' : 'salary-deductions'}
      tabIndex={-1}
      aria-label={earning ? 'Earnings' : 'Deductions'}
      sx={{ minWidth: 0, display: 'grid', gap: 1.5, alignContent: 'start' }}
    >
      <Box display="flex" alignItems="center" justifyContent="space-between" gap={1}>
        <Box>
          <Typography variant="h6">{earning ? 'Earnings' : 'Deductions'}</Typography>
          <Typography variant="caption" color="text.secondary">
            {rules.length} {rules.length === 1 ? 'component' : 'components'}
          </Typography>
        </Box>
        {!readOnly && (
          <Button
            size="small"
            variant="outlined"
            startIcon={<Iconify icon="mdi:plus" />}
            onClick={onAdd}
            sx={{ flexShrink: 0 }}
          >
            {earning ? 'Add Earning' : 'Add Deduction'}
          </Button>
        )}
      </Box>
      {!rules.length && (
        <Card variant="outlined" sx={{ p: 2 }}>
          <Typography variant="body2" color="text.secondary">
            {earning
              ? 'Add earnings to allocate the full Gross Salary.'
              : 'No deduction components configured.'}
          </Typography>
        </Card>
      )}
      {rules.map((rule, index) => {
        const fieldIndex = formik.values.rules.indexOf(rule);
        const path = `rules[${fieldIndex}]`;
        const name = componentNames.get(rule.componentId) || rule.code || 'Payroll component';
        const open = expanded.has(rule.componentId);
        const acceptsValue = formulaAcceptsValue(rule.formulaType);
        const error = (field: string) =>
          getIn(formik.touched, `${path}.${field}`) && getIn(formik.errors, `${path}.${field}`);
        const valueError = error('value');
        const basisError = error('basisComponentId');
        return (
          <Card
            key={rule.componentId}
            id={`salary-rule-${rule.componentId}`}
            variant="outlined"
            sx={{ p: 2, minWidth: 0 }}
          >
            <Box display="flex" alignItems="flex-start" gap={1}>
              <Box flex={1} minWidth={0}>
                <Typography variant="subtitle2" sx={{ overflowWrap: 'anywhere' }}>
                  {name}
                </Typography>
                <Chip size="small" label={formatRuleLabel(rule.semanticType)} sx={{ mt: 0.5 }} />
              </Box>
              <IconButton
                size="small"
                aria-label={`${open ? 'Collapse' : 'Expand'} ${name}`}
                aria-expanded={open}
                aria-controls={`salary-rule-details-${rule.componentId}`}
                onClick={() => onToggle(rule.componentId)}
              >
                <Iconify icon={open ? 'mdi:chevron-up' : 'mdi:chevron-down'} />
              </IconButton>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 1, flexWrap: 'wrap' }}>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ flex: '1 1 150px', overflowWrap: 'anywhere' }}
              >
                {formulaSummary(rule, componentNames)}
              </Typography>
              {acceptsValue && (
                <NumericFormatCustom
                  size="small"
                  name={`${path}.value`}
                  label={rule.formulaType.startsWith('PERCENTAGE') ? 'Percent' : 'Amount'}
                  value={rule.value ?? ''}
                  disabled={readOnly}
                  prefix={rule.formulaType.startsWith('PERCENTAGE') ? '' : '₹ '}
                  suffix={rule.formulaType.startsWith('PERCENTAGE') ? ' %' : ''}
                  decimalScale={rule.formulaType.startsWith('PERCENTAGE') ? undefined : 2}
                  isAllowed={({ floatValue }) =>
                    floatValue === undefined || Number.isFinite(floatValue)
                  }
                  onValueChange={({ floatValue }) => update({ ...rule, value: floatValue ?? null })}
                  onBlur={formik.handleBlur}
                  error={Boolean(valueError)}
                  helperText={valueError}
                  slotProps={{
                    htmlInput: {
                      inputMode: 'decimal',
                      'aria-label': `${name} ${rule.formulaType.startsWith('PERCENTAGE') ? 'percent' : 'amount'}`,
                    },
                  }}
                  sx={{ width: 150, maxWidth: '100%' }}
                />
              )}
            </Box>
            <Collapse in={open} unmountOnExit>
              <Box
                id={`salary-rule-details-${rule.componentId}`}
                sx={{ display: 'grid', gap: 1.5, mt: 2 }}
              >
                <FormControl fullWidth size="small" disabled={readOnly}>
                  <InputLabel id={`purpose-${rule.componentId}`}>Purpose</InputLabel>
                  <Select
                    labelId={`purpose-${rule.componentId}`}
                    label="Purpose"
                    name={`${path}.semanticType`}
                    value={rule.semanticType}
                    onChange={(event) => update(applySemanticType(rule, event.target.value))}
                  >
                    {getRoleOptions(lineKind).map((role) => (
                      <MenuItem
                        key={role}
                        value={role}
                        disabled={
                          uniqueRoles.has(role) && role !== rule.semanticType && usedRoles.has(role)
                        }
                      >
                        {formatRuleLabel(role)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth size="small" disabled={readOnly}>
                  <InputLabel id={`formula-${rule.componentId}`}>Calculation</InputLabel>
                  <Select
                    labelId={`formula-${rule.componentId}`}
                    label="Calculation"
                    name={`${path}.formulaType`}
                    value={rule.formulaType}
                    onChange={(event) => update(applyFormulaType(rule, event.target.value))}
                  >
                    {getFormulaOptions(rule).map((formula) => {
                      const role = getAutomaticFormulaSemanticType(formula);
                      return (
                        <MenuItem
                          key={formula}
                          value={formula}
                          disabled={
                            role !== null && role !== rule.semanticType && usedRoles.has(role)
                          }
                        >
                          {formatRuleLabel(formula)}
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
                {rule.formulaType === 'PERCENTAGE_OF_COMPONENT' && (
                  <FormControl
                    fullWidth
                    size="small"
                    disabled={readOnly}
                    error={Boolean(basisError)}
                  >
                    <InputLabel id={`basis-${rule.componentId}`}>Basis component</InputLabel>
                    <Select
                      labelId={`basis-${rule.componentId}`}
                      label="Basis component"
                      name={`${path}.basisComponentId`}
                      value={rule.basisComponentId || ''}
                      onBlur={formik.handleBlur}
                      onChange={(event) =>
                        update({ ...rule, basisComponentId: event.target.value || null })
                      }
                    >
                      {formik.values.rules
                        .filter(
                          (basis) =>
                            basis.componentId !== rule.componentId &&
                            (lineKind === 'DEDUCTION' || basis.lineKind === 'EARNING')
                        )
                        .map((basis) => (
                          <MenuItem key={basis.componentId} value={basis.componentId}>
                            {componentNames.get(basis.componentId) || basis.code}
                          </MenuItem>
                        ))}
                    </Select>
                    <FormHelperText>{basisError}</FormHelperText>
                  </FormControl>
                )}
                {!readOnly && (
                  <Box display="flex" justifyContent="flex-end" gap={0.5}>
                    <IconButton
                      size="small"
                      aria-label={`Move ${name} up`}
                      disabled={index === 0}
                      onClick={() => move(index, -1)}
                    >
                      <Iconify icon="mdi:arrow-up" />
                    </IconButton>
                    <IconButton
                      size="small"
                      aria-label={`Move ${name} down`}
                      disabled={index === rules.length - 1}
                      onClick={() => move(index, 1)}
                    >
                      <Iconify icon="mdi:arrow-down" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      aria-label={`Remove ${name}`}
                      onClick={() =>
                        setRules(
                          formik.values.rules.filter(
                            (item) => item.componentId !== rule.componentId
                          )
                        )
                      }
                    >
                      <Iconify icon="mdi:delete-outline" />
                    </IconButton>
                  </Box>
                )}
              </Box>
            </Collapse>
          </Card>
        );
      })}
    </Box>
  );
}
