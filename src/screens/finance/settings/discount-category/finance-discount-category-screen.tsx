import React from 'react';

import {
  Table,
  Paper,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  TableContainer,
} from '@mui/material';

const FinanceDiscountCategorySettingScreen = () => {
  const discountData = [
    {
      standard: 'Grade 1',
      categories: [
        { category: 'Scholarship Above 90%', percentage: '20%' },
        { category: 'Old Student', percentage: '10%' },
        { category: 'Early Bird', percentage: '5%' },
        { category: 'Scholarship Above 90%', percentage: '20%' },
        { category: 'Scholarship Above 90%', percentage: '20%' },
        { category: 'Scholarship Above 90%', percentage: '20%' },
        { category: 'Scholarship Above 90%', percentage: '20%' },
        { category: 'Scholarship Above 90%', percentage: '20%' },
        { category: 'Scholarship Above 90%', percentage: '20%' },
      ],
    },
    {
      standard: 'Grade 2',
      categories: [
        { category: 'Early Bird', percentage: '5%' },
        { category: 'Scholarship Above 90%', percentage: '20%' },
        { category: 'Old Student', percentage: '10%' },
        { category: 'Early Bird', percentage: '5%' },
        { category: 'Scholarship Above 90%', percentage: '20%' },
        { category: 'Scholarship Above 90%', percentage: '20%' },
        { category: 'Scholarship Above 90%', percentage: '20%' },
        { category: 'Scholarship Above 90%', percentage: '20%' },
        { category: 'Scholarship Above 90%', percentage: '20%' },
        { category: 'Scholarship Above 90%', percentage: '20%' },
      ],
    },
    {
      standard: 'Grade 2',
      categories: [
        { category: 'Early Bird', percentage: '5%' },
        { category: 'Scholarship Above 90%', percentage: '20%' },
        { category: 'Old Student', percentage: '10%' },
        { category: 'Early Bird', percentage: '5%' },
        { category: 'Scholarship Above 90%', percentage: '20%' },
        { category: 'Scholarship Above 90%', percentage: '20%' },
        { category: 'Scholarship Above 90%', percentage: '20%' },
        { category: 'Scholarship Above 90%', percentage: '20%' },
        { category: 'Scholarship Above 90%', percentage: '20%' },
        { category: 'Scholarship Above 90%', percentage: '20%' },
      ],
    },
    {
      standard: 'Grade 2',
      categories: [
        { category: 'Early Bird', percentage: '5%' },
        { category: 'Scholarship Above 90%', percentage: '20%' },
        { category: 'Old Student', percentage: '10%' },
        { category: 'Early Bird', percentage: '5%' },
        { category: 'Scholarship Above 90%', percentage: '20%' },
        { category: 'Scholarship Above 90%', percentage: '20%' },
        { category: 'Scholarship Above 90%', percentage: '20%' },
        { category: 'Scholarship Above 90%', percentage: '20%' },
        { category: 'Scholarship Above 90%', percentage: '20%' },
        { category: 'Scholarship Above 90%', percentage: '20%' },
      ],
    },

    {
      standard: 'Grade 2',
      categories: [
        { category: 'Early Bird', percentage: '5%' },
        { category: 'Scholarship Above 90%', percentage: '20%' },
        { category: 'Old Student', percentage: '10%' },
        { category: 'Early Bird', percentage: '5%' },
        { category: 'Scholarship Above 90%', percentage: '20%' },
        { category: 'Scholarship Above 90%', percentage: '20%' },
        { category: 'Scholarship Above 90%', percentage: '20%' },
        { category: 'Scholarship Above 90%', percentage: '20%' },
        { category: 'Scholarship Above 90%', percentage: '20%' },
        { category: 'Scholarship Above 90%', percentage: '20%' },
      ],
    },
    {
      standard: 'Grade 2',
      categories: [
        { category: 'Early Bird', percentage: '5%' },
        { category: 'Scholarship Above 90%', percentage: '20%' },
        { category: 'Old Student', percentage: '10%' },
        { category: 'Early Bird', percentage: '5%' },
        { category: 'Scholarship Above 90%', percentage: '20%' },
        { category: 'Scholarship Above 90%', percentage: '20%' },
        { category: 'Scholarship Above 90%', percentage: '20%' },
        { category: 'Scholarship Above 90%', percentage: '20%' },
        { category: 'Scholarship Above 90%', percentage: '20%' },
        { category: 'Scholarship Above 90%', percentage: '20%' },
      ],
    },
  ];

  return (
    // <CustomizableTable columns={[
    //     {id:"standard", label:"standard"},
    //     {id: "standard", label: "Category"},
    //     {}
    // ]} data={[]}>

    // </CustomizableTable>
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>
              <strong>Standard</strong>
            </TableCell>
            <TableCell>
              <strong>Discount Category</strong>
            </TableCell>
            <TableCell>
              <strong>Percentage</strong>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {discountData.map((standardData) =>
            standardData.categories.map((category, index) => (
              <TableRow key={`${standardData.standard}-${index}`}>
                {/* Show the standard only once per group */}
                {index === 0 ? (
                  <TableCell rowSpan={standardData.categories.length}>
                    {standardData.standard}
                  </TableCell>
                ) : null}
                <TableCell>{category.category}</TableCell>
                <TableCell>{category.percentage}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default FinanceDiscountCategorySettingScreen;
