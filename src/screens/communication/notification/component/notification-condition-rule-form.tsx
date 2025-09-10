import React from 'react';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import { Grid, Switch, Button, TextField, Typography, FormControlLabel } from '@mui/material';

interface NotificationConditionRuleFormProps {
  title: string;
  conditionFor: string;
  setConditionFor: (value: string) => void;
  arithmeticOperator: string;
  setArithmeticOperator: (value: string) => void;
  conditionValue: string;
  setConditionValue: (value: string) => void;
  mergeOperator: string;
  setMergeOperator: (value: string) => void;
  isMultiCondition: boolean;
  setIsMultiCondition: (value: boolean) => void;
  isPercentage: boolean;
  setIsPercentage: (value: boolean) => void;
  addConditionHandler: () => void;
  deleteConditionHandler: () => void;
  isDisabled?: boolean;
}

const NotificationConditionRuleForm: React.FC<NotificationConditionRuleFormProps> = ({
  title,
  conditionFor,
  setConditionFor,
  arithmeticOperator,
  setArithmeticOperator,
  conditionValue,
  setConditionValue,
  mergeOperator,
  setMergeOperator,
  isMultiCondition,
  setIsMultiCondition,
  isPercentage,
  setIsPercentage,
  addConditionHandler,
  deleteConditionHandler,
  isDisabled = false,
}) => (
  <Grid size={{ lg: 12 }} alignItems="center">
    <Typography variant="subtitle1" gutterBottom>
      {title}
    </Typography>
    <Grid container spacing={1} alignItems="center">
      {/* Name Field */}
      <Grid size={{ lg: 2 }}>
        <TextField
          label="Name"
          fullWidth
          size="small"
          value={conditionFor}
          onChange={(e) => setConditionFor(e.target.value)}
          disabled={isDisabled}
        />
      </Grid>

      {/* Arithmetic Operator */}
      <Grid size={{ lg: 3 }}>
        <CustomSelect
          label="Arithmetic Operator"
          options={[
            { label: '>', value: '>' },
            { label: '<', value: '<' },
            { label: '=', value: '=' },
            { label: '!=', value: '!=' },
          ]}
          value={arithmeticOperator}
          onChange={(e) => setArithmeticOperator(e as string)}
          disabled={isDisabled}
        />
      </Grid>

      {/* Value Field */}
      <Grid size={{ lg: 2 }}>
        <TextField
          label="Value"
          fullWidth
          size="small"
          type="number"
          value={conditionValue}
          onChange={(e) => setConditionValue(e.target.value)}
          disabled={isDisabled}
        />
      </Grid>

      {/* Merge Operator */}
      <Grid size={{ lg: 3 }}>
        <CustomSelect
          label="Merge Operator"
          options={[
            { label: 'None', value: 'None' },
            { label: 'And', value: 'And' },
            { label: 'Or', value: 'Or' },
          ]}
          value={mergeOperator}
          onChange={(e) => setMergeOperator(e as string)}
        />
      </Grid>

      {/* Action Buttons */}
      <Grid size={{ lg: 2 }} display="flex" alignItems="center" gap={1}>
        <Button
          color="primary"
          variant="outlined"
          size="small"
          startIcon={<Iconify icon="eva:plus-fill" />}
          onClick={addConditionHandler}
        >
          Add
        </Button>

        <Button
          color="error"
          variant="outlined"
          size="small"
          startIcon={<Iconify icon="mdi:delete" />}
          onClick={deleteConditionHandler}
        >
          Clear
        </Button>
        {/* <Chip
                    label="Add"
                    icon={<Iconify icon="eva:plus-fill" />}
                    onClick={addConditionHandler}
                    color="primary"
                    clickable
                    size="small"
                />
                <Chip
                    label="Clear"
                    icon={<Iconify icon="mdi:delete" />}
                    onClick={deleteConditionHandler}
                    color="error"
                    clickable
                    size="small"
                /> */}
      </Grid>

      {/* Switches */}
      <Grid container spacing={1} alignItems="center">
        <Grid size={{ lg: 2 }} />
        <Grid size={{ lg: 3 }} />

        {/* Is Percentage Switch */}
        <Grid size={{ lg: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={isPercentage}
                onChange={() => setIsPercentage(!isPercentage)}
                disabled={isDisabled}
              />
            }
            label="Is Percentage"
          />
        </Grid>
      </Grid>
    </Grid>
  </Grid>
);

export default NotificationConditionRuleForm;
