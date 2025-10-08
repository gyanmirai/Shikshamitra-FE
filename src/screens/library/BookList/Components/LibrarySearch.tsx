import ClearIcon from '@mui/icons-material/Clear';
import SearchIcon from '@mui/icons-material/Search';
import { Scrollbar } from 'src/components/scrollbar';
import { GridExpandMoreIcon } from '@mui/x-data-grid';
import React, { useRef, useMemo, useState, useEffect, useCallback } from 'react';
import {
  Box,
  Grid,
  Stack,
  Button,
  Divider,
  TextField,
  Accordion,
  IconButton,
  Typography,
  CircularProgress,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';

import GroupedBookList from './GroupedBookList';
import libraryDummyData from '../../../../../libraryData.json';

import type { IBook } from '../../BookManagement/Components/type';

interface GroupedBooks {
  [key: string]: IBook[];
}

interface LibrarySearchProps {
  onView?: (book: IBook) => void;
  onEdit?: (book: IBook) => void;
  onDelete?: (book: IBook) => void;
  onReserveBook?: (book: IBook) => void;
  onViewAllReservationBook?: (book: IBook) => void;
}

const LibrarySearch: React.FC<LibrarySearchProps> = ({
  onView,
  onEdit,
  onDelete,
  onReserveBook,
  onViewAllReservationBook,
}) => {
  const [searchInput, setSearchInput] = useState(''); // typed text
  const [searchTerm, setSearchTerm] = useState(''); // term used for filtering
  const [visibleCount, setVisibleCount] = useState(10);
  const loaderRef = useRef<HTMLDivElement | null>(null);
  // const {
  //   data: books,
  //   isLoading,
  //   error,
  // } = useQueryAndMutation({
  //   type: 'query',
  //   currentQueryAndMutation: useGetAllBooksQuery, // no params needed
  // });
  // const { data: books, isLoading, error } = useGetAllBooksQuery(undefined);
  const [books, setBooks] = useState(libraryDummyData.books);
  // console.log({ books, isLoading, error });
  const filteredBooks = useMemo(() => {
    if (!searchTerm) return books;
    const term = searchTerm.toLowerCase();
    return books.filter(
      (book) =>
        book.title.toLowerCase().includes(term) ||
        book.author.toLowerCase().includes(term) ||
        book.isbn.includes(term)
    );
  }, [books, searchTerm]);

  const visibleBooks = useMemo(
    () => filteredBooks.slice(0, visibleCount),
    [filteredBooks, visibleCount]
  );

  const groupedBooks: GroupedBooks = useMemo(
    () =>
      visibleBooks.reduce((groups: GroupedBooks, book: IBook) => {
        const firstLetter = book.title[0].toUpperCase();
        if (!groups[firstLetter]) groups[firstLetter] = [];
        groups[firstLetter].push(book);
        return groups;
      }, {}),
    [visibleBooks]
  );

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const target = entries[0];
      if (target.isIntersecting) {
        setVisibleCount((prev) => Math.min(prev + 20, filteredBooks.length));
      }
    },
    [filteredBooks.length]
  );

  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, { threshold: 0.5 });
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [handleObserver]);

  const handleSearch = () => {
    setVisibleCount(20); // reset pagination
    setSearchTerm(searchInput.trim());
  };

  const handleClear = () => {
    setSearchInput('');
    setSearchTerm('');
    setVisibleCount(20);
  };

  return (
    <Box sx={{ height: '100%', pb: 5 }}>
      <Stack direction="row" spacing={2} mb={2}>
        <TextField
          variant="outlined"
          size="small"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          label="Search by title, author, ISBN.."
          sx={{ flex: 1 }}
          InputProps={{
            endAdornment: searchInput && (
              <IconButton size="small" onClick={handleClear}>
                <ClearIcon />
              </IconButton>
            ),
          }}
        />
        <Button
          variant="contained"
          color="primary"
          startIcon={<SearchIcon />}
          onClick={handleSearch}
          sx={{ px: 3 }}
        >
          Search
        </Button>
      </Stack>

      <Grid container spacing={3}>
        {Object.keys(groupedBooks)
          .sort()
          .map((letter) => (
            <Grid size={{ xs: 12 }} key={letter}>
              <Accordion
                sx={{
                  borderRadius: 3,
                  overflow: 'hidden',
                  boxShadow: 'var(--shadows-8)',
                  '&:before': { display: 'none' },
                }}
              >
                <AccordionSummary
                  expandIcon={<GridExpandMoreIcon />}
                  sx={{
                    bgcolor: 'background.paper',
                    borderBottom: '1px solid #eee',
                    '& .MuiTypography-root': { fontWeight: 600 },
                  }}
                >
                  <Typography variant="h6">{letter}</Typography>
                </AccordionSummary>

                <AccordionDetails sx={{ p: 0, pb: 2 }}>
                  <Divider />
                  <Scrollbar sx={{ height: 300, p: 2 }}>
                    <GroupedBookList
                      groupedBooks={{ [letter]: groupedBooks[letter] }}
                      onView={onView}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      onReserveBook={onReserveBook}
                      onViewAllReservationBook={onViewAllReservationBook}
                    />
                  </Scrollbar>
                </AccordionDetails>
              </Accordion>
            </Grid>
          ))}
      </Grid>

      {visibleCount < filteredBooks.length && (
        <Box ref={loaderRef} sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress size={30} />
        </Box>
      )}
    </Box>
  );
};

export default LibrarySearch;
