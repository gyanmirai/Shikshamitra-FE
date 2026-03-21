import { TextField, IconButton } from '@mui/material';
import { Clear as ClearIcon, Search as SearchIcon } from '@mui/icons-material';

interface TableSearchProps {
  searchValue: string;
  onSearch: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
  searchFieldProps?: any;
}

export const TableSearch: React.FC<TableSearchProps> = ({
  searchValue,
  onSearch,
  onClear,
  searchFieldProps,
}) => (
  <TextField
    variant="outlined"
    size="small"
    value={searchValue}
    onChange={onSearch}
    InputProps={{
      endAdornment: (
        <>
          {searchValue ? (
            <IconButton size="small" sx={{ mr: '-12px', p: 1 }} onClick={onClear}>
              <ClearIcon />
            </IconButton>
          ) : (
            <IconButton size="small" sx={{ mr: '-12px', p: 1 }}>
              <SearchIcon />
            </IconButton>
          )}
        </>
      ),
    }}
    label="Search in Table"
    sx={{ maxWidth: '249.6px', width: '100%' }}
    {...searchFieldProps}
  />
);
