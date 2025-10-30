import type { IBook } from 'src/screens/library/BookManagement/Components/type';

import React, { useMemo, useState } from 'react';
import CustomSelect from 'src/components/custom-select';
import { EmptyContent } from 'src/components/empty-content';
import { Box, Grid, Button, TextField, CircularProgress } from '@mui/material';

import ListView from './ListView';
import CoverView from './CoverView';
import SummaryView from './SummaryView';
import libraryDummyData from '../../../../../../libraryData.json';

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
  const [searchInput, setSearchInput] = useState('');
  const [selectedLetter, setSelectedLetter] = useState('ALL');
  const [selectedViewMode, setSelectedViewMode] = useState('list');
  const [books, setBooks] = useState(libraryDummyData.books);
  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [displayedBooks, setDisplayedBooks] = useState<IBook[]>([]);
  const [hasMore, setHasMore] = useState(true);
  // --- Filter logic ---
  const [debouncedSearch, setDebouncedSearch] = useState(searchInput);

  React.useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchInput), 300);
    return () => clearTimeout(handler);
  }, [searchInput]);

  const filteredBooks = useMemo(() => {
    let filtered = books;

    // Search filter
    if (debouncedSearch.trim()) {
      const query = debouncedSearch.toLowerCase();
      filtered = filtered.filter(
        (b) =>
          b.title.toLowerCase().includes(query) ||
          b.author.toLowerCase().includes(query) ||
          b.isbn.includes(query)
      );
    }
    // Alphabet filter
    if (selectedLetter !== 'ALL') {
      filtered = filtered.filter((b) => b.title.charAt(0).toUpperCase() === selectedLetter);
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
    <Box sx={{ height: '100%', pb: 5 }}>
      {/* Search and View mode */}
      <Grid container spacing={2} mb={2}>
        <Grid size={{ xs: 12, md: 10 }}>
          <TextField
            variant="outlined"
            size="small"
            value={searchInput}
            onChange={(e) => {
              const val = e.target.value;
              setSearchInput(val);
              if (val.trim()) {
                const firstChar = val.trim()[0].toUpperCase();
                if (alphabet.includes(firstChar)) setSelectedLetter(firstChar);
              } else {
                setSelectedLetter('ALL');
              }
            }}
            label="Search by Title, Author, ISBN.."
            fullWidth
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
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
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

      {/* View Rendering */}
      {displayedBooks.length === 0 ? (
        <Box
          sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}
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
  );
};

export default LibraryMainScreen;
