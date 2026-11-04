import type { AdmissionFormChangeHistory } from 'src/redux/student/admissions/admission-applications-api';

import { Card, List, ListItem, Typography, ListItemText } from '@mui/material';

export function FormHistoryCard({ history }: { history: AdmissionFormChangeHistory[] }) {
  if (!history.length) return null;
  return (
    <Card sx={{ p: 2 }}>
      <Typography variant="subtitle1" sx={{ mb: 1 }}>
        Form History
      </Typography>
      <List disablePadding>
        {history.map((item) => (
          <ListItem key={item.id} disableGutters divider>
            <ListItemText
              primary={item.changeType === 'FormCorrected' ? 'Form corrected' : item.changeType}
              secondary={
                <>
                  {new Date(item.occurredAt).toLocaleString()}
                  {correctionSummary(item.changedFieldsJson, item.changeType).map((text) => (
                    <Typography
                      key={text}
                      component="span"
                      variant="body2"
                      sx={{ display: 'block', overflowWrap: 'anywhere' }}
                    >
                      {text}
                    </Typography>
                  ))}
                </>
              }
            />
          </ListItem>
        ))}
      </List>
    </Card>
  );
}

function correctionSummary(json: string | null | undefined, changeType: string): string[] {
  if (changeType !== 'FormCorrected' || !json) return [];
  try {
    const data = JSON.parse(json);
    if (!data || typeof data !== 'object' || Array.isArray(data)) return [];
    return [
      typeof data.Reason === 'string' ? data.Reason : '',
      Array.isArray(data.ChangedFields)
        ? data.ChangedFields.filter((field: unknown) => typeof field === 'string').join(', ')
        : '',
    ].filter(Boolean);
  } catch {
    return [];
  }
}
