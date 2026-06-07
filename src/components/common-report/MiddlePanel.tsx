import { useState } from 'react';
import { Icon } from '@iconify/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box,
  Card,
  Stack,
  Paper,
  TextField,
  Typography,
  CardContent,
  InputAdornment,
} from '@mui/material';

import { Scrollbar } from '../scrollbar';

import type { ReportSubCategory } from './types';

const listVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.25,
      when: 'beforeChildren',
      staggerChildren: 0.08,
    },
  },
  exit: {
    opacity: 0,
    x: -20,
    transition: { duration: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

interface MiddlePanelProps {
  selectedCategory: string;
  selectedReport: ReportSubCategory | null;
  onSelectReport: (report: ReportSubCategory) => void;
  subCategories: ReportSubCategory[];
}

export default function MiddlePanel({
  selectedCategory,
  selectedReport,
  onSelectReport,
  subCategories = [],
}: MiddlePanelProps) {
  const [search, setSearch] = useState('');

  const filteredSubCategories = subCategories.filter((sub) => sub.categoryId === selectedCategory);

  const filteredSubCategoriesBySearch = filteredSubCategories.filter((sub) =>
    sub.name.toLowerCase().includes(search.toLowerCase())
  );
  const visibleReports = search ? filteredSubCategoriesBySearch : filteredSubCategories;

  return (
    <Paper
      elevation={0}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.default',
      }}
    >
      <Box
        sx={{
          p: 2,
          bgcolor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <TextField
          fullWidth
          size="small"
          placeholder="Search reports..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Icon icon="eva:search-fill" />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 1 }}
        />
      </Box>

      <Scrollbar sx={{ flexGrow: 1, overflowY: 'auto', p: 2 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedCategory + search} // ← triggers animation on category change
            variants={listVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {visibleReports.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
                No reports found.
              </Typography>
            ) : null}
            {visibleReports.map((subCat) => (
              <motion.div key={subCat.id} variants={itemVariants}>
                <Box sx={{ mb: 2 }}>
                  <Card
                    onClick={() => onSelectReport(subCat)}
                    sx={{
                      mb: 1,
                      cursor: 'pointer',
                      border: '1px solid',
                      borderColor:
                        selectedReport?.id === subCat.id ? 'primary.main' : 'transparent',
                      boxShadow: selectedReport?.id === subCat.id ? 4 : 1,
                      transition: 'all 0.2s',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: 3,
                      },
                    }}
                  >
                    <CardContent sx={{ p: 1, '&:last-child': { pb: 2 } }}>
                      {/* Existing content stays same */}
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Box
                          sx={{
                            borderRadius: 1,
                            color:
                              selectedReport?.id === subCat.id ? 'primary.main' : 'text.primary',
                            display: 'flex',
                          }}
                        >
                          <Icon icon="proicons:document" width={24} />
                        </Box>
                        <Stack
                          direction="column"
                          spacing={0}
                          alignItems="flex-start"
                          sx={{ minWidth: 0 }}
                        >
                          <Typography
                            variant="subtitle2"
                            sx={{
                              mb: 0,
                              px: 1,
                              maxWidth: '100%',
                              color: 'text.secondary',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {subCat.name}
                          </Typography>
                          <Box sx={{ pl: 1, minWidth: 0 }}>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{
                                display: '-webkit-box',
                                overflow: 'hidden',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                              }}
                            >
                              {subCat.description}
                            </Typography>
                          </Box>
                        </Stack>
                      </Stack>
                    </CardContent>
                  </Card>
                </Box>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </Scrollbar>
    </Paper>
  );
}
