'use client';

import dayjs from 'dayjs';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import React, { useState, useEffect } from 'react';

import { LoadingButton } from '@mui/lab';
import { DatePicker } from '@mui/x-date-pickers';
import {
  Box,
  Paper,
  Table,
  Button,
  MenuList,
  TableRow,
  MenuItem,
  TableHead,
  TableCell,
  TableBody,
  IconButton,
  DialogActions,
  TableContainer,
} from '@mui/material';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CreateTableDropdown from 'src/components/customAutoComplete';
import { usePopover, CustomPopover } from 'src/components/custom-popover';

interface FilmOptionType {
  inputValue?: string;
  name: string;
  year?: number;
}

const AcademicYear = () => {
  const [open, setOpen] = React.useState<boolean>(false);
  const [value, setValue] = React.useState<FilmOptionType | null>(null);
  const [data] = React.useState<FilmOptionType[]>([]);
  const [category, setCategory] = React.useState<FilmOptionType[]>([]);
  const [tableData, setTableData] = React.useState<any>([]);
  const [currentBoard, setCurrentBoard] = useState<any>(null);

  const onEditClick = (row: any) => {
    setOpen(true);
    setCurrentBoard(row.board);
    setCategory(
      tableData
        .find((item: any) => item.board.name === row.board?.name)
        ?.category.map((i: any) => i.category) || []
    );
  };

  return (
    <Box sx={{ p: 2, '& input': { fontSize: '12px' }, '& svg': { fontSize: '18px' } }}>
      <Box display="flex" gap={2}>
        <DatePicker
          label="Start Academic Date"
          slotProps={{ textField: { size: 'small' } }}
          value={dayjs(new Date('2024-03-01'))}
        />
        <DatePicker
          label="End Academic Date"
          slotProps={{ textField: { size: 'small' } }}
          value={dayjs(new Date('2025-02-28'))}
        />
        <CreateTableDropdown
          label="Affiliation"
          options={data}
          placeholder="Affiliation"
          setValue={(val) => setValue(val)}
          value={value}
          sx={{ width: 300 }}
        />
        <Button
          variant="contained"
          disabled={!value?.name}
          size="small"
          onClick={() => {
            setOpen(true);
            setCurrentBoard(value);
            setCategory(
              tableData
                .find((item: any) => item.board.name === value?.name)
                ?.category.map((i: any) => i.category) || []
            );
          }}
        >
          Add Category
        </Button>
      </Box>

      <CustomDialog open={open} handleClose={() => setOpen(false)} title=" Add Category">
        <AcademicForm
          tableData={tableData}
          board={currentBoard}
          setTableData={setTableData}
          setOpen={setOpen}
          category={category}
        />
      </CustomDialog>
      <br />
      {/* <DataTable
        columns={[
          {
            label: 'Affiliation',
            key: 'board',
            render: (row) => row.board?.name,
          },
          {
            label: 'Category',
            key: 'category',
            render: (row) => row.category?.map((item: any) => <p>{item.category?.name}</p>),
          },
          {
            label: 'Class Name',
            key: 'className',
            render: (row) =>
              row.category?.map((item: any) => (
                <p>
                  {item.category.name} :{' '}
                  {item.className.map((i: any) => i.inputValue || i.name).join(' | ')}
                </p>
              )),
          },
          //   {
          //     label: 'Class Division',
          //     key: 'classDivision',
          //     render: (row) => row.classDivision?.map((item: any) => item.name).join(' | '),
          //   },
        ]}
        data={tableData}
      /> */}
      <AcademicTable tableData={[...tableData]} onEditClick={onEditClick} />
    </Box>
  );
};

export default AcademicYear;

const AcademicForm = ({ tableData, board, setTableData, setOpen, category }: any) => {
  console.log(tableData, 'opopop');
  const { errors, touched, handleChange, handleBlur, handleSubmit, setFieldValue, values } =
    useFormik({
      initialValues: {
        className: [],
        classDivision: [],
        category: null,
        division: [
          { inputValue: 'A' },
          { inputValue: 'B' },
          { inputValue: 'C' },
          { inputValue: 'D' },
        ],
      },
      onSubmit: (formikValues: any) => {
        const findData = tableData.find((item: any) => item.board.name === board?.name);
        if (findData) {
          const findCategory = findData.category.find(
            (item: any) => item.category.name === formikValues.category.name
          );
          if (findCategory) {
            findCategory.className = formikValues.className;
            findCategory.classDivision = formikValues.classDivision;
          } else {
            findData.category = [
              ...findData.category,
              {
                className: formikValues.className,
                division: formikValues.division,
                category: formikValues.category,
              },
            ];
          }
        } else {
          setTableData([
            ...tableData,
            {
              board,
              category: [
                {
                  category: formikValues.category,
                  className: formikValues.className,
                  division: formikValues.division,
                },
              ],
            },
          ]);
        }
        setOpen(false);
      },
      validationSchema: Yup.object({
        //   className: Yup.string().required('Class Name is required'),
        // category: Yup.string().required('Class Division is required'),
        // classOrder: Yup.number().required('Class Order is required').positive().integer(),
      }),
    });
  return (
    <form onSubmit={handleSubmit}>
      <Scrollbar sx={{ p: 3, bgcolor: 'background.neutral' }}>
        <CreateTableDropdown
          label="Category"
          options={category}
          placeholder="Category"
          setValue={(val) => {
            setFieldValue('category', val);
            const findClassName =
              tableData
                .find((item: any) => item.board.name === board?.name)
                ?.category.find((el: any) => el.category.name === val?.name)?.className || [];

            setFieldValue('className', findClassName);
          }}
          value={values.category}
        />
        <br />
        <CreateTableDropdown
          label="Class Name"
          options={[]}
          placeholder="Class Name"
          setValue={(val) => setFieldValue('className', val)}
          value={values.className}
          multiple
          disabled={!values.category}
        />
        <br />
        <CreateTableDropdown
          label="Division"
          options={[]}
          placeholder="Division"
          setValue={(val) => setFieldValue('division', val)}
          value={values.division}
          multiple
          disabled={!values.category}
          fullWidth
        />
      </Scrollbar>
      <DialogActions sx={{ flexShrink: 0 }}>
        <Button variant="outlined" color="inherit" onClick={() => setOpen(false)}>
          Cancel
        </Button>

        <LoadingButton variant="contained" loading={false} type="submit">
          Save changes
        </LoadingButton>
      </DialogActions>
    </form>
  );
};

const AcademicTable = ({ tableData, onEditClick }: any) => {
  const [data, setData] = useState<any>([]);
  const popover = usePopover();
  useEffect(() => {
    const newData: any = [];

    tableData.forEach((item: any) => {
      const { category } = item;

      newData.push({
        board: {
          name: item.board.name,
          rowSpan: category.reduce(
            (acc: any, curr: any) => acc + (curr?.className?.length || 0),
            0
          ),
        },
        category: {
          name: category[0].category.name,
          rowSpan: category[0]?.className.length,
        },
        class: {
          name: category[0]?.className[0].inputValue || category[0]?.className[0].name,
          rowSpan: 1,
        },
      });
      category.forEach((el: any, ind: number) => {
        if (ind === 0) {
          el.className.forEach((cl: any, index: number) => {
            if (index !== 0) {
              newData.push({
                class: {
                  name: cl.inputValue,
                  rowSpan: 1,
                },
              });
            }
          });
        } else {
          el.className.forEach((cl: any, index: number) => {
            if (index === 0) {
              newData.push({
                category: {
                  name: el.category.name,
                  rowSpan: el.className.length,
                },
                class: {
                  name: cl.inputValue,
                  rowSpan: 1,
                },
              });
            } else {
              newData.push({
                class: {
                  name: cl.inputValue,
                  rowSpan: 1,
                },
              });
            }
          });
        }
      });
    });
    setData(newData);
  }, [tableData]);
  return (
    <Paper elevation={3}>
      <TableContainer>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell scope="row">Affiliation</TableCell>
              <TableCell scope="row">Category</TableCell>
              <TableCell scope="row">Class Name</TableCell>
              <TableCell scope="row">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {/* {tableData.map((row: any) => (
              <TableRow>
                <TableCell scope="row">{row.board.name}</TableCell>
                <TableCell scope="row">
                  <Table>
                    <TableBody>
                      {row.category.map((el: any) => (
                        <TableRow>
                          <TableCell scope="row">{el.category.name}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableCell>
                <TableCell scope="row">
                  <Table>
                    <TableBody>
                      {row.category.flatMap((el: any) =>
                        el.className.map((item: any) => (
                          <TableRow>
                            <TableCell scope="row">{item.inputValue || item.name}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableCell>
              </TableRow>
            ))} */}
            {data.map((row: any) => (
              <TableRow>
                {Object.keys(row).map((key: any) => (
                  <TableCell scope="row" rowSpan={row[key]?.rowSpan || 1}>
                    {row[key]?.name} &nbsp; &nbsp;
                    {key === 'class' && (
                      <IconButton onClick={popover.onOpen} size="small">
                        <Iconify
                          icon="eva:more-vertical-fill"
                          sx={{ height: '18px', width: '18px' }}
                        />
                      </IconButton>
                    )}
                  </TableCell>
                ))}
                {row.board && (
                  <TableCell scope="row" rowSpan={row.board?.rowSpan || 1}>
                    <IconButton size="small" onClick={() => onEditClick(row)}>
                      <Iconify icon="solar:pen-bold" /> &nbsp;
                    </IconButton>
                    <IconButton size="small">
                      <Iconify icon="solar:trash-bin-trash-bold" color="error.main" />
                    </IconButton>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        anchorEl={popover.anchorEl}
        slotProps={{ arrow: { placement: 'left-center' } }}
      >
        <MenuList>
          <MenuItem onClick={() => {}} sx={{ color: 'error.main' }}>
            <Iconify icon="solar:trash-bin-trash-bold" />
            Delete
          </MenuItem>

          <MenuItem onClick={() => {}}>
            <Iconify icon="solar:pen-bold" />
            Edit
          </MenuItem>
        </MenuList>
      </CustomPopover>
    </Paper>
  );
};
