import React from 'react';

import { TimePicker, renderTimeViewClock } from '@mui/x-date-pickers';
import { Grid, Switch, TextField, FormControlLabel } from '@mui/material';

import CustomSelect from 'src/components/custom-select';

interface RoleConfigForNotificationProps {
  role: string;
  selectedRoles: string[];
  configurations: any;
  handleConfigChange: (role: string, field: string, value: string) => void;
  communicationChannel: string[];
  setCommunicationChannel: (value: string[]) => void;
  isRecurring: boolean;
  setIsRecurring: (value: boolean) => void;
  timingOptions: { label: string; value: string }[];
  recurringValue: number;
  setRecurringValue: (value: number) => void;
  showRecurringSwitch: boolean;
  selectedTemplateName: string;
  selectedTemplateContent: string;
  fromSendManual: boolean;
  templateOptions: { label: string; value: string }[];
  handleTemplateChange: (value: any) => void;
}

const RoleConfigForNotification: React.FC<RoleConfigForNotificationProps> = ({
  role,
  selectedRoles,
  configurations,
  handleConfigChange,
  communicationChannel,
  setCommunicationChannel,
  isRecurring,
  setIsRecurring,
  timingOptions,
  recurringValue,
  setRecurringValue,
  showRecurringSwitch,
  selectedTemplateName,
  selectedTemplateContent,
  fromSendManual,
  templateOptions,
  handleTemplateChange,
}) => {
  if (!selectedRoles.includes(role)) return null;

  return (
    <Grid item lg={6} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <CustomSelect
        disabled={fromSendManual}
        label={`Select Template for ${role.charAt(0).toUpperCase() + role.slice(1)}`}
        options={templateOptions}
        value={selectedTemplateName}
        onChange={(e) => handleTemplateChange(e as string)}
      />
      <TextField
        name="content for selected template"
        multiline
        rows={4}
        value={selectedTemplateContent}
        disabled
      />
      <CustomSelect
        disabled={fromSendManual}
        multiple
        label="Select Communication Channel"
        options={[
          { label: 'WhatsApp', value: 'WhatsApp' },
          { label: 'SMS', value: 'sms' },
          { label: 'Email', value: 'email' },
        ]}
        value={communicationChannel}
        onChange={(e) => setCommunicationChannel(e as string[])}
      />
      {!fromSendManual && (
        <>
          <CustomSelect
            label="Timing"
            options={timingOptions}
            value={configurations[role].timing}
            onChange={(e) => handleConfigChange(role, 'timing', e as string)}
          />
          {configurations[role].timing === 'scheduled' && (
            <TimePicker
              value={null}
              viewRenderers={{
                hours: renderTimeViewClock,
                minutes: renderTimeViewClock,
                seconds: renderTimeViewClock,
              }}
              onChange={(newTime) => console.log(newTime)}
              slotProps={{ textField: { size: 'small' } }}
            />
          )}
          {showRecurringSwitch && (
            <>
              <FormControlLabel
                control={
                  <Switch checked={isRecurring} onChange={() => setIsRecurring(!isRecurring)} />
                }
                label="Is Recurring"
              />
              {isRecurring && (
                <TextField
                  value={recurringValue}
                  size="small"
                  label="Enter day you want to Repeat"
                  type="number"
                  onChange={(e) => setRecurringValue(parseInt(e.target.value, 10))}
                />
              )}
            </>
          )}
        </>
      )}
    </Grid>
  );
};

export default RoleConfigForNotification;
