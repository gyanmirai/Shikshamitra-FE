import { alpha } from '@mui/material/styles';
import {
  Box,
  Card,
  Radio,
  Typography,
  RadioGroup,
  CardContent,
  FormControlLabel,
} from '@mui/material';

interface Subject {
  name: string;
}

interface ElectiveSubjectCardProps {
  title: string;
  subjects: Subject[];
  subjectColor: string;
  selectedSubject: string;
  onSubjectChange: (subject: string) => void;
}

const ElectiveSubjectCard = ({
  title,
  subjects,
  subjectColor,
  selectedSubject,
  onSubjectChange,
}: ElectiveSubjectCardProps) => (
  <Card
    sx={{
      bgcolor: alpha(subjectColor, 0.1),
      height: '100%',
    }}
  >
    <CardContent>
      <Box
        sx={{
          mb: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography variant="h6" sx={{ color: subjectColor, fontWeight: 'bold' }}>
          {title}
        </Typography>
      </Box>

      <RadioGroup value={selectedSubject} onChange={(e) => onSubjectChange(e.target.value)}>
        {subjects.map((subject) => (
          <FormControlLabel
            key={subject.name}
            value={subject.name}
            control={
              <Radio
                sx={{
                  '&.Mui-checked': {
                    color: subjectColor,
                  },
                }}
              />
            }
            label={
              <Typography
                variant="body2"
                sx={{
                  color: selectedSubject === subject.name ? subjectColor : 'text.primary',
                  fontWeight: selectedSubject === subject.name ? 600 : 400,
                }}
              >
                {subject.name}
              </Typography>
            }
          />
        ))}
      </RadioGroup>
    </CardContent>
  </Card>
);

export default ElectiveSubjectCard;
