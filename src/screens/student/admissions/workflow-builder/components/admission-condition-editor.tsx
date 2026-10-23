import type { AdmissionConditionRule } from 'src/redux/student/admissions/admission-condition-rule';

import { Paper, Stack, Button } from '@mui/material';
import CustomSelect from 'src/components/custom-select';
import { StudentFeedback } from 'src/components/student-feedback';
import {
  emptyCondition,
  readAdmissionCondition,
} from 'src/redux/student/admissions/admission-condition-rule';

import { AdmissionConditionLeafEditor } from './admission-condition-leaf-editor';

import type { AdmissionConditionField } from './admission-condition-fields';

type Props = {
  json?: string | null;
  fields: AdmissionConditionField[];
  readOnly: boolean;
  onChange: (json: string) => void;
  groupLabel?: string;
  strictTypes?: boolean;
};
type NodeProps = Omit<Props, 'json' | 'onChange'> & {
  value: AdmissionConditionRule;
  onChange: (value: AdmissionConditionRule) => void;
  depth: number;
};

export function AdmissionConditionEditor({ json, onChange, ...props }: Props) {
  const rule = json ? readAdmissionCondition(json) : emptyCondition();
  if (!rule)
    return (
      <StudentFeedback notificationKey="STU-0500" presentation="persistent" severity="error">
        This condition cannot be edited in this version. Its saved rule has been preserved.
      </StudentFeedback>
    );
  return (
    <ConditionNode
      {...props}
      value={rule}
      depth={0}
      onChange={(value) => onChange(JSON.stringify(value))}
    />
  );
}

function ConditionNode({ value, onChange, depth, ...props }: NodeProps) {
  if (!('conditions' in value))
    return (
      <Stack spacing={1}>
        <AdmissionConditionLeafEditor {...props} value={value} onChange={onChange} />
        {depth < 4 && (
          <Button
            size="small"
            disabled={props.readOnly}
            onClick={() => onChange({ operator: 'ALL', conditions: [value, emptyCondition()] })}
          >
            Add another condition
          </Button>
        )}
      </Stack>
    );
  const changeChild = (index: number, child: AdmissionConditionRule) =>
    onChange({
      ...value,
      conditions: value.conditions.map((item, current) => (current === index ? child : item)),
    });
  return (
    <Stack spacing={1}>
      <CustomSelect
        size="small"
        fullWidth
        label={props.groupLabel ?? 'Match conditions'}
        disabled={props.readOnly}
        value={value.operator}
        options={[
          { value: 'ALL', label: 'All conditions match' },
          { value: 'ANY', label: 'Any condition matches' },
        ]}
        onChange={(operator) =>
          onChange({ ...value, operator: operator === 'ANY' ? 'ANY' : 'ALL' })
        }
      />
      {value.conditions.map((child, index) => (
        <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1 }} key={index}>
          <ConditionNode
            {...props}
            depth={depth + 1}
            value={child}
            onChange={(next) => changeChild(index, next)}
          />
          <Button
            size="small"
            color="error"
            disabled={props.readOnly}
            aria-label={`Remove condition ${index + 1}`}
            onClick={() =>
              onChange({
                ...value,
                conditions: value.conditions.filter((_, current) => current !== index),
              })
            }
          >
            Remove condition
          </Button>
        </Paper>
      ))}
      <Button
        size="small"
        disabled={props.readOnly || value.conditions.length >= 30}
        onClick={() => onChange({ ...value, conditions: [...value.conditions, emptyCondition()] })}
      >
        Add condition
      </Button>
    </Stack>
  );
}
