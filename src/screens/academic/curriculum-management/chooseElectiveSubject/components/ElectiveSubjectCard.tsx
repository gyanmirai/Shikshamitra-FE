import { styled } from '@mui/material/styles';
import {
  Box,
  Card,
  Radio,
  alpha,
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

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[4],
  },
}));

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
