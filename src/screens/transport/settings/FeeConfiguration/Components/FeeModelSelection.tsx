import type { FormikProps } from 'formik';

import React from 'react';
import { Close } from '@mui/icons-material';
import { Iconify } from 'src/components/iconify';
import CustomTooltip from 'src/components/custom-tooltip';
import {
  Box,
  Radio,
  Alert,
  Typography,
  RadioGroup,
  IconButton,
  FormControlLabel,
} from '@mui/material';

import { getInitialValuesByModel } from './getInitialValuesByModel';

interface FeeModelSelectionProps {
  formik: FormikProps<any>;
  setSelectedModel: (value: string) => void;
}

const FeeModelSelection: React.FC<FeeModelSelectionProps> = ({ formik, setSelectedModel }) => {
  const [showAlert, setShowAlert] = React.useState(true);
  const selectedModel = formik.values.model;

  const models = [
    // {
    //   value: 'flat-rate',
    //   label: 'Flat Rate Model',
    //   tooltip: 'A fixed fee is charged to all students regardless of distance or location.',
    // },
    {
      value: 'distance-based',
      label: 'Distance-Based Model',
      tooltip: 'Fee is calculated based on the distance between pickup point and school.',
    },
    {
      value: 'stop-based',
      label: 'Stop-Based Model',
      tooltip: 'Fee varies depending on the number of stops or specific pickup points.',
    },
    // {
    //   value: 'zone-based',
    //   label: 'Zone-Based Model',
    //   tooltip: 'Fee is determined by geographical zones or areas divided around the school.',
    // },
  ];

  const handleModelSelect = (newModel: string) => {
    // eslint-disable-next-line no-useless-return
    if (newModel === formik.values.model) return;

    const newValues = getInitialValuesByModel(newModel, formik.values);
    formik.setValues({
      ...formik.values,
      ...newValues,
      model: newModel,
    });
    setSelectedModel(newModel);
  };

  return (
    <Box p={2}>
      <Typography variant="h6" color="primary" gutterBottom>
        Select Transport Fee Model
      </Typography>

      <RadioGroup value={selectedModel}>
        <Box display="grid" gridTemplateColumns="1fr 1fr" gap={1} mt={1}>
          {models.map((model) => (
            <Box
              key={model.value}
              onClick={() => handleModelSelect(model.value)}
              sx={{
                border: '1px solid',
                borderColor: selectedModel === model.value ? 'primary.main' : 'divider',
                borderRadius: 1,
                p: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                '&:hover': { backgroundColor: 'action.hover' },
              }}
            >
              <FormControlLabel
                value={model.value}
                control={<Radio checked={selectedModel === model.value} />}
                label={model.label}
                sx={{ pointerEvents: 'none' }}
              />
              <CustomTooltip
                arrow
                placement="right"
                sx={{ textAlign: 'justify' }}
                title={model.tooltip}
              >
                <Iconify
                  icon="lucide:info"
                  sx={{ cursor: 'pointer' }}
                  color="info.main"
                  onClick={(e: React.MouseEvent) => e.stopPropagation()}
                />
              </CustomTooltip>
            </Box>
          ))}
        </Box>
      </RadioGroup>

      {showAlert && (
        <Alert
          severity="info"
          icon={<Iconify icon="lucide:info" />}
          sx={{ mt: 2 }}
          action={
            <IconButton size="small" onClick={() => setShowAlert(false)}>
              <Close fontSize="small" />
            </IconButton>
          }
        >
          <Typography variant="body2" fontWeight={600}>
            <strong>Important </strong> : Once you confirm this transport fee model, you won&apos;t
            be able to change it later. Please review carefully before proceeding.
          </Typography>
        </Alert>
      )}
    </Box>
  );
};

export default FeeModelSelection;
