import {
  Paper,
  Table,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  Typography,
  TableContainer,
} from '@mui/material';

import RubricPerformanceMatrixRow from './rubricPerformanceMatrixRow';

import type { RubricCriterionScoringProps } from './rubricEvaluationTypes';

const RubricPerformanceMatrix = ({
  rubric,
  values,
  onMarksChange,
  onCommentsChange,
}: RubricCriterionScoringProps) => {
  const levels = [...rubric.performanceLevels].sort((left, right) => right.level - left.level);

  return (
    <TableContainer
      component={Paper}
      variant="outlined"
      sx={{ display: { xs: 'none', sm: 'block' }, borderRadius: 1 }}
    >
      <Table
        size="small"
        aria-label="Rubric performance scoring matrix"
        sx={{ tableLayout: 'fixed' }}
      >
        <TableHead>
          <TableRow>
            <TableCell sx={{ width: '28%', fontWeight: 700 }}>Criterion</TableCell>
            {levels.map((level) => (
              <TableCell
                key={`${level.level}-${level.label}`}
                align="center"
                sx={{ fontWeight: 700 }}
              >
                <Typography variant="caption" fontWeight={700} color="text.primary">
                  {level.label}
                </Typography>
                <Typography variant="caption" display="block" color="text.secondary">
                  {level.score} {level.score === 1 ? 'point' : 'points'}
                </Typography>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>

        <TableBody>
          {rubric.criteria.map((criterion) => {
            const value = values[criterion.id] ?? { marks: '', comments: '' };

            return (
              <RubricPerformanceMatrixRow
                key={criterion.id}
                criterion={criterion}
                levels={levels}
                value={value}
                onMarksChange={onMarksChange}
                onCommentsChange={onCommentsChange}
              />
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default RubricPerformanceMatrix;
