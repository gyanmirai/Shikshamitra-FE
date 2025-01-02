import React, { Fragment } from 'react';

import { Save } from '@mui/icons-material';
import Grid from '@mui/material/Unstable_Grid2/Grid2';
import {
  Box,
  Select,
  Slider,
  Button,
  Divider,
  MenuItem,
  TextField,
  InputLabel,
  Typography,
  FormControl,
} from '@mui/material';

import { Scrollbar } from 'src/components/scrollbar';

interface TemplateViewProps {
  template: React.ReactNode;
  settings: Record<string, any>;
  setSettings: React.Dispatch<React.SetStateAction<Record<string, any>>>;
  views: { field: string; subField: string }[];
  isShowSettings: boolean;
  onSave: () => void;
}

const TemplateView = ({
  template,
  settings,
  setSettings,
  views,
  isShowSettings = false,
  onSave = () => {},
}: TemplateViewProps) => {
  const handleSettingChange = (field: string, subField: string, value: any) => {
    setSettings((prevSettings) => ({
      ...prevSettings,
      [field]: {
        ...prevSettings[field],
        [subField]: value,
      },
    }));
  };

  const renderSettingsForField = (field: string, label: string) => (
    <Box sx={{ mb: 2 }}>
      <Typography variant="h6">{label}</Typography>

      <Grid container spacing={2}>
        <Grid xs={4}>
          <Typography variant="caption">Font Size</Typography>
          <Slider
            value={settings[field]?.fontSize}
            onChange={(_, value) => handleSettingChange(field, 'fontSize', value)}
            min={8}
            max={48}
            step={1}
            valueLabelDisplay="auto"
            aria-label="Font Size"
            size="small"
          />
        </Grid>
        <Grid xs={4}>
          <FormControl size="small" fullWidth>
            <InputLabel size="small">Font Weight</InputLabel>
            <Select
              value={settings[field]?.fontWeight}
              onChange={(e) => handleSettingChange(field, 'fontWeight', e.target.value)}
              label="Font Weight"
              size="small"
            >
              <MenuItem value="normal">Normal</MenuItem>
              <MenuItem value="bold">Bold</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid xs={4}>
          <FormControl size="small" fullWidth>
            <InputLabel size="small">Text Transform</InputLabel>
            <Select
              value={settings[field]?.textTransform}
              onChange={(e) => handleSettingChange(field, 'textTransform', e.target.value)}
              label="Text Transform"
              size="small"
            >
              <MenuItem value="none">None</MenuItem>
              <MenuItem value="uppercase">Uppercase</MenuItem>
              <MenuItem value="lowercase">Lowercase</MenuItem>
              <MenuItem value="capitalize">Capitalize</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid xs={4}>
          <Typography variant="subtitle2">Color</Typography>
          <TextField
            type="color"
            size="small"
            value={settings[field]?.color}
            onChange={(e) => handleSettingChange(field, 'color', e.target.value)}
            sx={{ width: '100%' }}
          />
        </Grid>
      </Grid>
    </Box>
  );
  const renderCardHeaderSettings = () => (
    <Box sx={{ mb: 2 }}>
      <Typography variant="h6">Header</Typography>
      <Grid container spacing={2}>
        <Grid xs={4}>
          <Typography variant="caption">Font Size</Typography>
          <Slider
            value={settings.cardHeader?.fontSize}
            onChange={(_, value) => handleSettingChange('cardHeader', 'fontSize', value)}
            min={8}
            max={48}
            step={1}
            valueLabelDisplay="auto"
            aria-label="Font Size"
            size="small"
          />
        </Grid>
        <Grid xs={4}>
          <FormControl size="small" fullWidth>
            <InputLabel size="small">Font Weight</InputLabel>
            <Select
              value={settings.cardHeader?.fontWeight}
              onChange={(e) => handleSettingChange('cardHeader', 'fontWeight', e.target.value)}
              label="Font Weight"
              size="small"
            >
              <MenuItem value="normal">Normal</MenuItem>
              <MenuItem value="bold">Bold</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid xs={4}>
          <FormControl size="small" fullWidth>
            <InputLabel size="small">Text Transform</InputLabel>
            <Select
              value={settings.cardHeader?.textTransform}
              onChange={(e) => handleSettingChange('cardHeader', 'textTransform', e.target.value)}
              label="Text Transform"
              size="small"
            >
              <MenuItem value="none">None</MenuItem>
              <MenuItem value="uppercase">Uppercase</MenuItem>
              <MenuItem value="lowercase">Lowercase</MenuItem>
              <MenuItem value="capitalize">Capitalize</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid xs={4}>
          <Typography variant="subtitle2">Color</Typography>
          <TextField
            type="color"
            size="small"
            value={settings.cardHeader?.color}
            onChange={(e) => handleSettingChange('cardHeader', 'color', e.target.value)}
            sx={{ width: '100%' }}
          />
        </Grid>
        <Grid xs={8}>
          <Typography variant="subtitle2">Background Color</Typography>
          <TextField
            type="color"
            size="small"
            value={settings.cardHeader?.backgroundColor}
            onChange={(e) => handleSettingChange('cardHeader', 'backgroundColor', e.target.value)}
            sx={{ width: '100%' }}
          />
        </Grid>
      </Grid>
    </Box>
  );
  return isShowSettings ? (
    <Grid container width="100%" spacing={2}>
      <Grid xs={4} sx={{ boxShadow: 'var(--shadows-4)', p: 0 }}>
        <Scrollbar sx={{ height: 'calc(100vh - 230px)', p: 2 }}>
          <TemplateSetting
            renderCardHeaderSettings={renderCardHeaderSettings}
            renderSettingsForField={renderSettingsForField}
            views={views}
          />
        </Scrollbar>
      </Grid>

      <Grid xs={8} display="flex" justifyContent="center" alignItems="center" position="relative">
        <Button
          startIcon={<Save />}
          sx={{ position: 'absolute', right: 0, top: 0 }}
          variant="contained"
          onClick={onSave}
        >
          Save
        </Button>
        {template}
      </Grid>
    </Grid>
  ) : (
    template
  );
};

export default TemplateView;

interface TemplateSettingProps {
  renderCardHeaderSettings: () => React.JSX.Element;
  renderSettingsForField: (field: string, label: string) => React.JSX.Element;
  views: { field: string; subField: string }[];
}

const TemplateSetting = ({
  renderCardHeaderSettings,
  renderSettingsForField,
  views,
}: TemplateSettingProps) => (
  <Box sx={{ p: 2 }}>
    <Typography variant="h5" sx={{ mb: 2 }}>
      Template Settings
    </Typography>
    {renderCardHeaderSettings()}
    <Divider sx={{ my: 2 }} />
    {views.map((view, index) => (
      <Fragment key={view.field}>
        {renderSettingsForField(view.field, view.subField)}
        {index !== views.length - 1 && <Divider sx={{ my: 2 }} />}
      </Fragment>
    ))}
  </Box>
);
