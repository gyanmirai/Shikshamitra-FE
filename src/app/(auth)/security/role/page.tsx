'use client';

import type { SelectChangeEvent } from '@mui/material';

import React, { useState } from 'react';

import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import { Box, Select, Button, MenuItem, InputLabel, FormControl } from '@mui/material';

import DataTable from 'src/components/commonTable';
import CreateTableDropdown from 'src/components/customAutoComplete';

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;
const Role = () => {
  const [affiliation, setAffiliation] = useState('');
  const [roleOptions, setRoleOptions] = useState([]);
  const [roleValue, setRoleValue] = useState([]);
  const [assignModule, setAssignModule] = useState<any>([]);
  const [assignModuleOptions, setAssignModuleOptions] = useState([
    { name: 'Student' },
    { name: 'Teacher' },
    { name: 'Parent' },
    { name: 'Admin' },
    { name: 'Security' },
    { name: 'Setting' },
  ]);
  const [tableData, setTableData] = useState<any>([]);

  const handleChange = (event: SelectChangeEvent<string>) => {
    setAffiliation(event.target.value);
  };
  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
        <FormControl sx={{ maxWidth: 200, width: '100%' }}>
          <InputLabel size="small" id="affiliation-select-label">
            Affiliation
          </InputLabel>
          <Select
            labelId="affiliation-select-label"
            id="affiliation-select"
            value={affiliation}
            label="Affiliation"
            onChange={handleChange}
            size="small"
          >
            <MenuItem value="GSEB">GSEB</MenuItem>
            <MenuItem value="CBSE">CBSE</MenuItem>
          </Select>
        </FormControl>
        <CreateTableDropdown
          label="Create Role"
          options={roleOptions}
          placeholder="Create Role"
          setValue={(val: any) => {
            setRoleValue(val);
          }}
          value={roleValue}
          multiple
          sx={{ maxWidth: 300, width: '100%' }}
        />
        <Button
          variant="contained"
          onClick={() => {
            setTableData((pre: any) => [...pre, { board: affiliation, role: roleValue }]);
            setAffiliation('');
            setRoleValue([]);
          }}
          size="small"
        >
          Add
        </Button>
        {/* <Autocomplete
          multiple
          id="checkboxes-tags-demo"
          options={[
            { title: 'Student' },
            { title: 'Teacher' },
            { title: 'Parent' },
            { title: 'Admin' },
            { title: 'Security' },
            { title: 'Setting' },
          ]}
          value={assignModule}
          disableCloseOnSelect
          onChange={(_e, s: any, value, selectedValue) => {
            setAssignModule(s);
            console.log(s, value, selectedValue);
          }}
          getOptionLabel={(option: any) => option.title}
          renderOption={(props: any, option: any) => {
            const { key, ...optionProps } = props;
            const selected = !!assignModule.find((e: any) => e.title === option.title);
            console.log(option, '===', selected);
            return (
              <li key={key} {...optionProps}>
                <Checkbox
                  icon={icon}
                  checkedIcon={checkedIcon}
                  style={{ marginRight: 8 }}
                  checked={selected}
                  size="small"
                />
                {option.title}
              </li>
            );
          }}
          sx={{ maxWidth: 300, width: '100%' }}
          size="small"
          renderInput={(params) => (
            <TextField {...params} label="Assign Module" size="small" placeholder="Assign Module" />
          )}
        /> */}
        {/* <CreateTableDropdown
          label="Assign Module"
          options={assignModuleOptions}
          placeholder="Assign Module"
          setValue={(val: any) => {
            setAssignModule(val);
          }}
          value={assignModule}
          multiple
          setOptions={setAssignModuleOptions}
          sx={{ maxWidth: 300, width: '100%' }}
        /> */}
      </Box>
      <br />
      <DataTable
        columns={[
          {
            key: 'board',
            label: 'Affiliation',
            width: '10%',
          },
          {
            key: 'role',
            label: 'Roles',
            width: '10%',
            render: (value: any) =>
              value.role.map((e: any, index: number) => (
                <Box key={index} sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  {e.inputValue || e.name}{' '}
                </Box>
              )),
          },
        ]}
        data={tableData}
      />
    </Box>
  );
};

export default Role;
