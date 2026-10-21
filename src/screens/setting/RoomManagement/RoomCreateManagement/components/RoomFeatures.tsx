import { useState } from 'react';
import { LoadingButton } from '@mui/lab';
import Add from '@mui/icons-material/Add';
import { capitalizeFirstLetter } from 'src/utils/input-format';
import { FormSectionCard } from 'src/components/form-section-card';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import {
  useGetRoomFeaturesQuery,
  useAddRoomFeatureMutation,
} from 'src/redux/InstituteSetup/RoomApi/RoomApi';
import {
  Grid,
  Alert,
  Stack,
  Button,
  Checkbox,
  TextField,
  Typography,
  FormControlLabel,
} from '@mui/material';

interface Props {
  selected: string[];
  onChange: (features: string[]) => void;
  onBusyChange: (busy: boolean) => void;
}

export function RoomFeatures({ selected, onChange, onBusyChange }: Props) {
  const query = useGetRoomFeaturesQuery();
  const [addFeature, { isLoading }] = useAddRoomFeatureMutation();
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const options = Array.from(
    new Set([...(query.data?.items.map((feature) => feature.name) ?? []), ...selected])
  );
  const add = async () => {
    const trimmed = name.trim();
    if (!trimmed || trimmed.length > 100) {
      setError('Enter a feature name of 1 to 100 characters.');
      return;
    }
    setError('');
    onBusyChange(true);
    try {
      const existing = options.find((option) => option.toLowerCase() === trimmed.toLowerCase());
      const featureName = existing ?? (await addFeature({ name: trimmed }).unwrap()).name;
      onChange(Array.from(new Set([...selected, featureName])));
      setName('');
    } catch (failure) {
      setError(parseApiProblemDetail(failure).detail || 'Feature could not be added. Try again.');
    } finally {
      onBusyChange(false);
    }
  };
  return (
    <FormSectionCard
      title="Features"
      icon="mdi:format-list-checks"
      descriptionTooltip="Select features available in this room. Adding a feature saves it to the school catalogue and selects it for this room."
    >
      {query.isLoading && (
        <Typography role="status" variant="body2">
          Loading features...
        </Typography>
      )}
      {query.isError && (
        <Alert severity="error" action={<Button onClick={() => query.refetch()}>Retry</Button>}>
          Features could not be loaded.
        </Alert>
      )}
      {!query.isLoading && !query.isError && options.length === 0 && (
        <Typography variant="body2">No room features available. Add a feature below.</Typography>
      )}
      <Grid container spacing={1}>
        {options.map((feature) => (
          <Grid size={{ xs: 12, sm: 6 }} key={feature}>
            <FormControlLabel
              sx={{ m: 0, minHeight: 44, overflowWrap: 'anywhere' }}
              label={feature}
              control={
                <Checkbox
                  checked={selected.includes(feature)}
                  onChange={(_, checked) =>
                    onChange(
                      checked ? [...selected, feature] : selected.filter((item) => item !== feature)
                    )
                  }
                />
              }
            />
          </Grid>
        ))}
      </Grid>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems="flex-start">
        <TextField
          fullWidth
          size="small"
          label="Extra feature"
          value={name}
          inputProps={{ maxLength: 100 }}
          onChange={(event) => {
            setName(capitalizeFirstLetter(event.target.value));
            setError('');
          }}
          error={Boolean(error)}
          helperText={error || 'Added features remain available for other rooms.'}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              add();
            }
          }}
        />
        <LoadingButton
          size="small"
          variant="outlined"
          startIcon={<Add />}
          loading={isLoading}
          disabled={query.isLoading || query.isError || !name.trim()}
          onClick={add}
          sx={{ flexShrink: 0 }}
        >
          Add feature
        </LoadingButton>
      </Stack>
    </FormSectionCard>
  );
}
