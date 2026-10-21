import { useState } from 'react';
import { Icon } from '@iconify/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box,
  Paper,
  TextField,
  Typography,
  InputAdornment,
} from '@mui/material';

import { Scrollbar } from '../scrollbar';
import { ReportChoiceCard } from './ReportChoiceCard';

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
          p: 1.5,
          bgcolor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <TextField
          fullWidth
          size="small"
          label="Search reports"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Icon icon="eva:search-fill" />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <Scrollbar sx={{ flexGrow: 1, overflowY: 'auto', p: 1.5 }}>
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
                <ReportChoiceCard report={subCat} selected={selectedReport?.id === subCat.id} onSelect={onSelectReport} />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </Scrollbar>
    </Paper>
  );
}
