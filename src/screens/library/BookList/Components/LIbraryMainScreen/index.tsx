import type { RootState } from 'src/redux/store';
import type { IBook } from 'src/screens/library/BookManagement/Components/type';

import { useSelector } from 'react-redux';
import { Scrollbar } from 'src/components/scrollbar';
import CustomSelect from 'src/components/custom-select';
import React, { useMemo, useState, useEffect } from 'react';
import { EmptyContent } from 'src/components/empty-content';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetAllBooksQuery } from 'src/redux/library/bookList/bookList-api';
import { Box, Card, Grid, Button, Skeleton, TextField, CircularProgress } from '@mui/material';

import ListView from './ListView';
import CoverView from './CoverView';
import SummaryView from './SummaryView';

const alphabet = [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''), 'ALL'];

interface LibrarySearchProps {
  onView?: (book: IBook) => void;
  onEdit?: (book: IBook) => void;
  onDelete?: (book: IBook) => void;
  onReserveBook?: (book: IBook) => void;
  onViewAllReservationBook?: (book: IBook) => void;
}

const LibraryMainScreen: React.FC<LibrarySearchProps> = ({
  onView,
  onEdit,
  onDelete,
  onReserveBook,
  onViewAllReservationBook,
}) => {
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const { data: bookData, isLoading: bookLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetAllBooksQuery,
    params: { academicYearId: currentYear?.id },
  });
  const [searchInput, setSearchInput] = useState('');
  const [selectedLetter, setSelectedLetter] = useState('ALL');
  const [selectedViewMode, setSelectedViewMode] = useState('list');
  const books = useMemo(() => bookData?.items || [], [bookData?.items]);
  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [displayedBooks, setDisplayedBooks] = useState<IBook[]>([]);
  const [hasMore, setHasMore] = useState(true);
  // --- Filter logic ---
  const [debouncedSearch, setDebouncedSearch] = useState(searchInput);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchInput), 800);
    return () => clearTimeout(handler);
  }, [searchInput]);

  useEffect(() => {
    if (debouncedSearch.trim()) {
      const firstChar = debouncedSearch.trim()[0].toUpperCase();
      if (alphabet.includes(firstChar)) setSelectedLetter(firstChar);
    } else {
      setSelectedLetter('ALL');
    }
  }, [debouncedSearch]);

  const filteredBooks = useMemo(() => {
    let filtered = books;

    // Search filter
    if (debouncedSearch.trim()) {
      const query = debouncedSearch.toLowerCase();
      filtered = filtered.filter(
        (b: IBook) =>
          b.title.toLowerCase().includes(query) ||
          b.author.toLowerCase().includes(query) ||
          b.isbn.includes(query)
      );
    }
    // Alphabet filter
    if (selectedLetter !== 'ALL') {
      filtered = filtered.filter((b: IBook) => b.title.charAt(0).toUpperCase() === selectedLetter);
    }
    return filtered;
  }, [books, debouncedSearch, selectedLetter]);

  React.useEffect(() => {
    const start = 0;
    const end = limit;
    const paginated = filteredBooks.slice(start, end);
    setDisplayedBooks(paginated);
    setPage(1);
    setHasMore(filteredBooks.length > limit);
  }, [filteredBooks, limit]);

  const observer = React.useRef<IntersectionObserver | null>(null);
  const lastBookRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prev) => prev + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [hasMore]
  );

  React.useEffect(() => {
    if (page === 1) return;
    const start = page * limit - limit;
    const end = page * limit;
    const nextBooks = filteredBooks.slice(start, end);
    setDisplayedBooks((prev) => [...prev, ...nextBooks]);
    setHasMore(filteredBooks.length > end);
  }, [page, filteredBooks, limit]);

  // --- View Mode Rendering ---
  const renderView = () => {
    switch (selectedViewMode) {
      case 'list':
        return (
          <ListView
            books={displayedBooks}
            onView={onView}
            onEdit={onEdit}
            onDelete={onDelete}
            onReserveBook={onReserveBook}
            onViewAllReservationBook={onViewAllReservationBook}
          />
        );
      case 'cover':
        return (
          <CoverView
            books={displayedBooks}
            onView={onView}
            onEdit={onEdit}
            onDelete={onDelete}
            onReserveBook={onReserveBook}
            onViewAllReservationBook={onViewAllReservationBook}
          />
        );
      case 'summary':
        return (
          <SummaryView
            books={displayedBooks}
            onView={onView}
            onEdit={onEdit}
            onDelete={onDelete}
            onReserveBook={onReserveBook}
            onViewAllReservationBook={onViewAllReservationBook}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Card
      sx={{
        flexGrow: 1,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        boxShadow: 'var(--shadows-4)',
      }}
    >
      {/* Search and View mode */}
      <Box sx={{ flexShrink: 0, mb: 3, p: 2 }}>
        <Grid container spacing={2} mb={2}>
          <Grid size={{ xs: 12, md: 10 }}>
            <TextField
              variant="outlined"
              size="small"
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
              }}
              label="Search by Title, Author, ISBN."
              fullWidth
              InputProps={{
                endAdornment: (
                  <>{searchInput !== debouncedSearch && <CircularProgress size={20} />}</>
                ),
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 2 }}>
            <CustomSelect
              options={[
                { value: 'list', label: 'List' },
                { value: 'cover', label: 'Cover' },
                { value: 'summary', label: 'Summary' },
              ]}
              label="View"
              name="viewMode"
              value={selectedViewMode}
              onChange={(value) => setSelectedViewMode(value as string)}
            />
          </Grid>
        </Grid>

        {/* Alphabet Filter */}
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 1,
            position: 'sticky',
            top: 0,
            bgcolor: 'background.paper',
            zIndex: 1,
          }}
        >
          {alphabet.map((letter) => (
            <Button
              key={letter}
              size="small"
              variant={selectedLetter === letter ? 'contained' : 'text'}
              onClick={() => setSelectedLetter(letter)}
              sx={{ minWidth: 32 }}
            >
              {letter}
            </Button>
          ))}
        </Box>
      </Box>

      {/* View Rendering inside Scrollbar */}
      <Scrollbar sx={{ flexGrow: 1 }}>
        <Box sx={{ pb: 5 }}>
          {bookLoading ? (
            <Box sx={{ p: 2 }}>
              <Grid container spacing={2}>
                {[...Array(6)].map((_, index) => (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
                    <Skeleton
                      variant="rectangular"
                      width="100%"
                      height={160}
                      sx={{ borderRadius: 2 }}
                    />
                    <Skeleton variant="text" sx={{ mt: 1, height: 24, width: '80%' }} />
                    <Skeleton variant="text" sx={{ height: 20, width: '50%' }} />
                  </Grid>
                ))}
              </Grid>
            </Box>
          ) : displayedBooks.length === 0 ? (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100%',
                minHeight: 300,
              }}
            >
              <EmptyContent
                title="No Books Available"
                sx={{
                  width: '100%',
                }}
              />
            </Box>
          ) : (
            renderView()
          )}
          <Box ref={lastBookRef} sx={{ height: 20, mt: 2 }} />
          {hasMore && (
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <CircularProgress size={24} />
            </Box>
          )}
        </Box>
      </Scrollbar>
    </Card>
  );
};

export default LibraryMainScreen;
