import type { RootState } from 'src/redux/store';

import { useSelector } from 'react-redux';
import { Scrollbar } from 'src/components/scrollbar';
import { GridExpandMoreIcon } from '@mui/x-data-grid';
import React, { useRef, useMemo, useState, useEffect, useCallback } from 'react';
import {
  Box,
  Grid,
  Stack,
  Divider,
  TextField,
  Accordion,
  Typography,
  CircularProgress,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';

import GroupedBookList from './GroupedBookList';
import BasicBookTable from './BookView/BasicBookTable';
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
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchInput);
    }, 400); // debounce delay

    return () => clearTimeout(handler);
  }, [searchInput]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { currentAcademicYear, currentMedium } = useSelector(
    (state: RootState) => state.globalState
  );
  // const {
  //   data: books,
  //   isLoading,
  //   isFetching,
  // } = useQueryAndMutation({
  //   type: 'query',
  //   currentQueryAndMutation: useGetAllBooksQuery,
  //   params: {
  //     academicYearId: (currentAcademicYear as AcademicYear)?.id,
  //     search: debouncedSearch,
  //   },
  // });
  const [visibleCount, setVisibleCount] = useState(10);
  const loaderRef = useRef<HTMLDivElement | null>(null);

  const [books] = useState(libraryDummyData.books);

  const filteredBooks = useMemo(() => {
    if (!debouncedSearch) return books;
    const term = debouncedSearch.toLowerCase();
    return books?.filter(
      (book: any) =>
        book.title.toLowerCase().includes(term) ||
        book.author.toLowerCase().includes(term) ||
        book.isbn.includes(term)
    );
  }, [books, debouncedSearch]);

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

  // const handleSearch = () => {
  //   setVisibleCount(20); // reset pagination
  //   setSearchTerm(searchInput.trim());
  // };

  return (
    <Box sx={{ height: '100%', pb: 5 }}>
      <Stack direction="row" spacing={2} mb={2}>
        <TextField
          variant="outlined"
          size="small"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          label="Search by Title, Author, ISBN.."
          sx={{ flex: 1 }}
        />
      </Stack>

      <Grid container spacing={2}>
        {!searchInput ? (
          <>
            {Object.keys(groupedBooks)
              .sort()
              .map((letter) => (
                <Grid size={{ xs: 12 }} key={letter}>
                  <Accordion
                    sx={{
                      borderRadius: 3,
                      overflow: 'hidden',
                      boxShadow: 'var(--shadows-5)',
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
          </>
        ) : (
          <BasicBookTable
            books={visibleBooks}
            onView={onView}
            onEdit={onEdit}
            onDelete={onDelete}
            onReserveBook={onReserveBook}
            onViewAllReservationBook={onViewAllReservationBook}
          />
        )}
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
