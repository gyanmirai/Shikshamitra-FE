import type { AdmissionFormChangeHistory } from 'src/redux/student/admissions/admission-applications-api';

import { Card, List, ListItem, Typography, ListItemText } from '@mui/material';

export function FormHistoryCard({ history }: { history: AdmissionFormChangeHistory[] }) {
  if (!history.length) return null;
  return (
    <Card sx={{ p: 2 }}>
      <Typography variant="subtitle1" sx={{ mb: 1 }}>Form history</Typography>
      <List disablePadding>
        {history.map((item) => (
          <ListItem key={item.id} disableGutters divider>
            <ListItemText primary={item.changeType} secondary={new Date(item.occurredAt).toLocaleString()} />
          </ListItem>
        ))}
      </List>
    </Card>
  );
}
