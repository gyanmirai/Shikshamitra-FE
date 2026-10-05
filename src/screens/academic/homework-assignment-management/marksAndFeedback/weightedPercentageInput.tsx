import TextField from '@mui/material/TextField';
import { useRef, useState, useEffect } from 'react';

const percentageFromMarks = (marks: string, weight: number) =>
  marks === '' || !weight ? '' : String(Number(((Number(marks) / weight) * 100).toFixed(2)));

export default function WeightedPercentageInput({
  marks,
  weight,
  required,
  readOnly,
  onChange,
}: {
  marks: string;
  weight: number;
  required: boolean;
  readOnly?: boolean;
  onChange: (marks: string) => void;
}) {
  const [percentage, setPercentage] = useState(() => percentageFromMarks(marks, weight));
  const focused = useRef(false);
  useEffect(() => {
    if (!focused.current) setPercentage(percentageFromMarks(marks, weight));
  }, [marks, weight]);
  const numeric = Number(percentage);
  const invalid = percentage !== '' && (!Number.isFinite(numeric) || numeric < 0 || numeric > 100);

  return (
    <TextField
      size="small"
      type="number"
      label="Achievement %"
      required={required}
      value={percentage}
      inputProps={{ min: 0, max: 100, step: 0.01 }}
      onFocus={() => { focused.current = true; }}
      onBlur={() => {
        focused.current = false;
        if (!invalid) setPercentage(percentageFromMarks(marks, weight));
      }}
      onChange={(event) => {
        const next = event.target.value;
        setPercentage(next);
        onChange(next === '' ? '' : Number.isFinite(Number(next))
          ? String((Number(next) / 100) * weight)
          : next);
      }}
      error={invalid}
      helperText={invalid ? 'Enter a percentage from 0 to 100' : `${weight}% of the total`}
      sx={{ width: { xs: '100%', sm: 190 } }}
      disabled={readOnly}
    />
  );
}

