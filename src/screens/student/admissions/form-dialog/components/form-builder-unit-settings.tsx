import Stack from '@mui/material/Stack';
import Accordion from '@mui/material/Accordion';
import TextField from '@mui/material/TextField';
import { Iconify } from 'src/components/iconify';
import Typography from '@mui/material/Typography';
import { useBoolean } from 'src/hooks/use-boolean';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';

type Props = {
  id: string;
  unit: 'Step' | 'Section';
  name: string;
  code: string;
  visibilityRule?: string | null;
  nameError?: string;
  codeError?: string;
  onNameBlur?: () => void;
  onCodeBlur?: () => void;
  onNameChange: (value: string) => void;
  onCodeChange: (value: string) => void;
  onVisibilityChange: (value: string) => void;
  focusName?: boolean;
};

export function FormBuilderUnitSettings({
  id,
  unit,
  name,
  code,
  visibilityRule,
  nameError,
  codeError,
  onNameBlur,
  onCodeBlur,
  onNameChange,
  onCodeChange,
  onVisibilityChange,
  focusName = false,
}: Props) {
  const advanced = useBoolean();
  return (
    <Stack id={id} spacing={1} sx={{ p: 1.5, borderBottom: 1, borderColor: 'divider' }}>
      <TextField
        fullWidth
        size="small"
        label={`${unit} name *`}
        autoFocus={focusName}
        value={name}
        error={Boolean(nameError)}
        onBlur={onNameBlur}
        helperText={
          nameError ||
          (unit === 'Step'
            ? 'Applicants see this name in their progress steps.'
            : 'Applicants see this heading above the fields.')
        }
        onChange={(event) => onNameChange(event.target.value)}
      />
      <Accordion
        disableGutters
        elevation={0}
        expanded={advanced.value || Boolean(codeError)}
        onChange={advanced.onToggle}
        sx={{ bgcolor: 'transparent', '&::before': { display: 'none' } }}
      >
        <AccordionSummary
          expandIcon={<Iconify icon="mdi:chevron-down" />}
          id={`${id}-advanced-heading`}
          aria-controls={`${id}-advanced`}
          sx={{ px: 0, minHeight: 44, '& .MuiAccordionSummary-content': { my: 0.5 } }}
        >
          <Stack>
            <Typography variant="body2" fontWeight={600}>
              Advanced settings
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Internal code and {visibilityRule ? 'conditional visibility' : 'visibility rules'}
            </Typography>
          </Stack>
        </AccordionSummary>
        <AccordionDetails sx={{ px: 0, pb: 0 }}>
          <Stack spacing={1.5}>
            <TextField
              fullWidth
              size="small"
              label={`${unit} code *`}
              value={code}
              error={Boolean(codeError)}
              onBlur={onCodeBlur}
              helperText={codeError || 'A unique internal reference. Applicants do not see this.'}
              onChange={(event) => {
                advanced.onTrue();
                onCodeChange(event.target.value.toUpperCase());
              }}
            />
            <TextField
              fullWidth
              size="small"
              multiline
              minRows={2}
              label={`${unit} visibility rule JSON`}
              value={visibilityRule ?? ''}
              helperText={`Leave empty to always show this ${unit.toLowerCase()}.`}
              onChange={(event) => onVisibilityChange(event.target.value)}
            />
          </Stack>
        </AccordionDetails>
      </Accordion>
    </Stack>
  );
}
