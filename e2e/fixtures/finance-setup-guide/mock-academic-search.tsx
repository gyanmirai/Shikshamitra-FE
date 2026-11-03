import { MenuItem, TextField } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';

export default function MockAcademicSearch() {
  const year = useSelector(
    (state: { globalState: { currentYear: { id: string } } }) => state.globalState.currentYear.id
  );
  const dispatch = useDispatch();
  return (
    <TextField
      select
      fullWidth
      size="small"
      label="Academic year"
      value={year}
      onChange={(event) => dispatch({ type: 'fixture/year', payload: event.target.value })}
    >
      <MenuItem value="year-a">2026–2027</MenuItem>
      <MenuItem value="year-b">2027–2028</MenuItem>
    </TextField>
  );
}
