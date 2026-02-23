import type { RootState } from 'src/redux/store';

import { useSelector } from 'react-redux';
import React, { useState, useEffect } from 'react';
import { DialogScrollContent } from 'src/components/customDialog';
import { Box, Grid, Typography, CircularProgress } from '@mui/material';
import { useGetSectionManagementByIdQuery } from 'src/redux/library/settingApi';

import type { ISection, ISectionDetails } from './type';

interface IViewShelfDataProps {
  sectionData: ISection | null;
}

const ViewShelfData: React.FC<IViewShelfDataProps> = ({ sectionData }) => {
  const [selectedShelfIndex, setSelectedShelfIndex] = useState<number>(0);
  const { currentYear } = useSelector((state: RootState) => state.globalState);

  const { data: apiSectionDetails, isLoading } = useGetSectionManagementByIdQuery(
    { sectionId: sectionData?.id, academicYearId: currentYear?.id },
    { skip: !sectionData?.id || !currentYear?.id }
  );

  const sectionDetails: ISectionDetails | undefined = apiSectionDetails;

  // Generate unique data for each shelf based on API data or fallback
  const shelves = React.useMemo(() => {
    if (!sectionDetails?.shelfDetails) return [];

    return sectionDetails.shelfDetails.map((shelf, index) => ({
      id: index + 1,
      name: shelf.shelfName,
      booksCount: Math.floor(Math.random() * 50) + 10, // Mock data
      // Different number of rows for each shelf
      rowsPerShelf: Math.floor(Math.random() * 4) + 4, // Random between 4-7 rows
      // Each shelf has different book distribution data
      bookDistribution: Array.from(
        { length: Math.floor(Math.random() * 4) + 4 },
        (__, rowIndex) => ({
          row: rowIndex + 1,
          bookCount: Math.floor(Math.random() * 25) + 8 + index * 2, // Different base count per shelf
        })
      ),
    }));
  }, [sectionDetails]);

  // Reset selected shelf when data changes
  useEffect(() => {
    setSelectedShelfIndex(0);
  }, [sectionData?.id]);

  const handleShelfClick = (index: number) => {
    setSelectedShelfIndex(index);
  };

  const generateBookSquares = (shelfIndex: number) => {
    const selectedShelf = shelves[shelfIndex];
    if (!selectedShelf) return null;

    const squares: any = [];

    selectedShelf.bookDistribution.forEach((rowData) => {
      squares.push(
        <Box key={rowData.row} sx={{ textAlign: 'center' }}>
          <Box
            sx={{
              width: 120,
              height: 120,
              border: '2px solid #e0e0e0',
              borderRadius: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'background.paper',
            }}
          >
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontSize: '12px', mb: 1, fontWeight: '500' }}
            >
              Row {rowData.row}
            </Typography>
            <Typography variant="h6" fontWeight="600" color="text.primary">
              Books {rowData.bookCount}
            </Typography>
          </Box>
        </Box>
      );
    });

    return squares;
  };

  if (!sectionData) {
    return (
      <DialogScrollContent>
        <Typography variant="body1" color="text.secondary" textAlign="center">
          No section data available
        </Typography>
      </DialogScrollContent>
    );
  }

  if (isLoading) {
    return (
      <DialogScrollContent>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
          <CircularProgress />
        </Box>
      </DialogScrollContent>
    );
  }

  if (!sectionDetails || shelves.length === 0) {
    return (
      <DialogScrollContent>
        <Typography variant="body1" color="text.secondary" textAlign="center">
          No details found for this section.
        </Typography>
      </DialogScrollContent>
    );
  }

  return (
    <DialogScrollContent>
      <Grid container spacing={3}>
        {/* Left side - Shelf List */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Typography variant="h6" gutterBottom color="primary">
            Shelves
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {shelves.map((shelf, index) => (
              <Box
                key={shelf.id}
                onClick={() => handleShelfClick(index)}
                sx={{
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  p: 2,
                  cursor: 'pointer',
                  backgroundColor:
                    selectedShelfIndex === index ? 'primary.lighter' : 'background.paper',
                  borderColor: selectedShelfIndex === index ? 'primary.main' : '#e0e0e0',
                  '&:hover': {
                    backgroundColor:
                      selectedShelfIndex === index ? 'primary.lighter' : 'rgba(0, 0, 0, 0.04)',
                    borderColor: 'primary.main',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                <Typography
                  variant="h6"
                  color={selectedShelfIndex === index ? 'primary.main' : 'text.primary'}
                  fontWeight="600"
                >
                  {shelf.name}
                </Typography>
              </Box>
            ))}
          </Box>
        </Grid>

        {/* Right side - Book Count Squares */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Box
            sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}
          >
            <Typography variant="h6" color="primary">
              {shelves[selectedShelfIndex]?.name} - Book Distribution
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 3,
              alignItems: 'flex-start',
            }}
          >
            {generateBookSquares(selectedShelfIndex)}
          </Box>
        </Grid>
      </Grid>
    </DialogScrollContent>
  );
};

export default ViewShelfData;
