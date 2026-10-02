import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import ButtonBase from '@mui/material/ButtonBase';
import Typography from '@mui/material/Typography';

export type AdmissionFormStarter = 'blank' | 'admission-application' | 'admission-inquiry';

type Props = {
  selectedStarter: AdmissionFormStarter | null;
  onSelect: (starter: AdmissionFormStarter) => void;
};

const STARTERS: Array<{
  id: AdmissionFormStarter;
  title: string;
  description: string;
  detail: string;
  action: string;
  icon: string;
}> = [
  {
    id: 'blank',
    title: 'Blank form',
    description: 'Start small and add only the fields your school needs.',
    detail: 'Includes an empty section ready for student fields.',
    action: 'Start blank',
    icon: 'mdi:file-outline',
  },
  {
    id: 'admission-application',
    title: 'Admission application',
    description: 'Start with the recommended application for most schools.',
    detail: 'Includes student, guardian, address, academic history, and declaration sections.',
    action: 'Use recommended',
    icon: 'mdi:file-document-edit-outline',
  },
  {
    id: 'admission-inquiry',
    title: 'Inquiry form',
    description: 'Start with the details needed for an admission inquiry.',
    detail: 'Includes applicant and guardian contact details.',
    action: 'Use inquiry form',
    icon: 'mdi:account-question-outline',
  },
];

export function FormTemplateChooser({ selectedStarter, onSelect }: Props) {
  return (
    <Stack spacing={1.5}>
      <Box>
        <Typography variant="h6">Start with a form</Typography>
        <Typography variant="body2" color="text.secondary">
          Choose a starting point for this form.
        </Typography>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'minmax(0, 1fr)', sm: 'repeat(3, minmax(0, 1fr))' },
          gap: 1.5,
        }}
      >
        {STARTERS.map((starter) => (
          <Paper
            key={starter.id}
            variant="outlined"
            sx={{
              overflow: 'hidden',
              borderRadius: 1.5,
              borderColor: selectedStarter === starter.id ? 'text.primary' : 'divider',
            }}
          >
            <ButtonBase
              aria-label={`${starter.action}: ${starter.title}`}
              aria-pressed={selectedStarter === starter.id}
              onClick={() => onSelect(starter.id)}
              sx={{
                width: 1,
                height: 1,
                minHeight: { xs: 64, sm: 72, lg: 64 },
                p: 1.25,
                gap: 1,
                textAlign: 'left',
                alignItems: 'center',
                '&:focus-visible': {
                  outline: 2,
                  outlineColor: 'text.primary',
                  outlineOffset: -2,
                },
              }}
            >
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  display: 'grid',
                  flexShrink: 0,
                  placeItems: 'center',
                  borderRadius: 1,
                  bgcolor: 'action.hover',
                  color: 'text.secondary',
                }}
              >
                <Iconify icon={starter.icon} width={20} />
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap">
                  <Typography variant="subtitle2">{starter.title}</Typography>
                  {starter.id === 'admission-application' && (
                    <Label color="success" variant="soft">
                      Recommended
                    </Label>
                  )}
                </Stack>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: { xs: 'block', sm: 'none', lg: 'block' } }}
                >
                  {starter.description}
                </Typography>
              </Box>
              <Box
                aria-hidden
                sx={{
                  width: 24,
                  height: 24,
                  display: 'grid',
                  flexShrink: 0,
                  placeItems: 'center',
                  border: 1,
                  borderRadius: '50%',
                  borderColor: selectedStarter === starter.id ? 'success.main' : 'text.disabled',
                  bgcolor: selectedStarter === starter.id ? 'success.main' : 'transparent',
                  color: selectedStarter === starter.id ? 'common.white' : 'transparent',
                }}
              >
                <Iconify icon="mdi:check" width={16} />
              </Box>
            </ButtonBase>
          </Paper>
        ))}
      </Box>
    </Stack>
  );
}
