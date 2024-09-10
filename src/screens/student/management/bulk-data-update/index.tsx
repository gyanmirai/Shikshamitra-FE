'use client';

import type { RootState } from 'src/redux/store';
import type { Medium, Division, Standards, Organization } from 'src/types/school';

import { useSelector } from 'react-redux';
import React, { useState, useEffect } from 'react';

import { Save } from '@mui/icons-material';
import { Box, Button } from '@mui/material';

import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useLazyGetBoardByIdQuery } from 'src/redux/board/boardApi';

import CustomSelect from 'src/components/custom-select';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

const allCategory = [
  {
    name: 'General',
    id: 'general',
    subCategory: [
      { name: 'Roll No.', id: 'rollNo' },
      { name: 'Gr. No.', id: 'grNo' },
      { name: 'Last Name', id: 'lastName' },
      { name: 'First Name', id: 'firstName' },
      { name: 'Middle Name', id: 'middleName' },
      { name: 'Gender', id: 'gender' },
      { name: 'Fee Category', id: 'feeCategory' },
      { name: 'Date Of birth', id: 'dateOfBirth' },
      { name: 'BloodGroup', id: 'bloodGroup' },
      { name: 'BirthPlace', id: 'birthPlace' },
      { name: 'BirthTaluka', id: 'birthTaluka' },
      { name: 'BirthDistrict', id: 'birthDistrict' },
      { name: 'BirthState', id: 'birthState' },
      { name: 'BirthCountry', id: 'birthCountry' },
      { name: 'Religion', id: 'religion' },
      { name: 'FamilyCaste', id: 'familyCaste' },
      { name: 'FamilySubCast', id: 'familySubCast' },
      { name: 'CasteCategory', id: 'casteCategory' },
      { name: 'House', id: 'house' },
      { name: 'MotherTongue', id: 'motherTongue' },
      { name: 'Nationality', id: 'nationality' },
      { name: 'UIDNumber', id: 'uidNumber' },
      { name: 'AdhaarNumber', id: 'adhaarNumber' },
      { name: 'PENNumber', id: 'penNumber' },
      { name: 'Bank Name', id: 'bankName' },
      { name: 'Branch Name', id: 'branchName' },
      { name: 'IFSC Code', id: 'ifscCode' },
      { name: 'Account No.', id: 'accountNo' },
      { name: 'Account Holder Name', id: 'accountHolderName' },
    ],
  },
  {
    name: 'Admission',
    id: 'admission',
    subCategory: [
      { name: 'Admission Category', id: 'admissionCategory' },
      { name: 'Previous School', id: 'previousSchool' },
      { name: 'Admission Date', id: 'admissionDate' },
      { name: 'Admission Form Number', id: 'admissionFormNumber' },
      { name: 'Transfer From', id: 'transferFrom' },
      { name: 'PassingYear', id: 'passingYear' },
      { name: 'LC Date', id: 'lcDate' },
      { name: 'LeftReason', id: 'leftReason' },
      { name: 'LCNumber', id: 'lcNumber' },
      { name: 'Admission Standard', id: 'admissionStandard' },
      { name: 'LC Submitted', id: 'lcSubmitted' },
    ],
  },
  {
    name: 'Contact Detail',
    id: 'contactDetail',
    subCategory: [
      { name: 'Name', id: 'name' },
      { name: 'DOB', id: 'dob' },
      { name: 'Qualification', id: 'qualification' },
      { name: 'Occupation', id: 'occupation' },
      { name: 'Organization', id: 'organization' },
      { name: 'Designation', id: 'designation' },
      { name: 'Mail', id: 'mail' },
      { name: 'Office Contact No.', id: 'officeContactNo' },
      { name: 'Annual Income', id: 'annualIncome' },
      { name: 'Name', id: 'name2' },
      { name: 'DOB', id: 'dob2' },
      { name: 'Qualification', id: 'qualification2' },
      { name: 'Occupation', id: 'occupation2' },
      { name: 'Mail', id: 'mail2' },
      { name: 'Office Contact No.', id: 'officeContactNo2' },
      { name: 'Annual Income', id: 'annualIncome2' },
    ],
  },
];
const BulkDataUpdateScreen = () => {
  const [allMediums, setAllMediums] = useState<Medium[]>([]);
  const [medium, setMedium] = useState<string>('');
  const [allOrganization, setAllOrganization] = useState<Organization[]>([]);
  const [organization, setOrganization] = useState<string>('');
  const [allClass, setAllClass] = useState<Standards[]>([]);
  const [classes, setClass] = useState<string>('');
  const [allDivision, setAllDivision] = useState<Division[]>([]);
  const [division, setDivision] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [subCategory, setSubCategory] = useState<string>('');
  const [allSubCategory, setAllSubCategory] = useState<{ name: string; id: string }[]>([]);

  const [tableData, setTableData] = useState([
    { id: 1, srNo: 1, grNo: 'GR001', name: 'John Doe', division: '' },
    { id: 2, srNo: 2, grNo: 'GR002', name: 'Jane Smith', division: '' },
    { id: 3, srNo: 3, grNo: 'GR003', name: 'Alice Johnson', division: '' },
  ]);
  const { currentBoard } = useSelector((state: RootState) => state.globalState);
  const [getBoard, { data: boardData }] = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useLazyGetBoardByIdQuery,
  });
  useEffect(() => {
    if (currentBoard?.id) {
      if (boardData) {
        setAllMediums(boardData?.educationMediums || []);
        setMedium(boardData?.educationMediums?.[0]?.id || '');
      } else {
        getBoard(currentBoard.id);
      }
    } else {
      setAllMediums([]);
      setMedium('');
    }
  }, [boardData, currentBoard?.id, getBoard]);

  useEffect(() => {
    setAllMediums(boardData?.educationMediums || []);
    setMedium(boardData?.educationMediums?.[0]?.id || '');
  }, [boardData]);

  useEffect(() => {
    setAllMediums(boardData?.educationMediums || []);
    setMedium(boardData?.educationMediums?.[0]?.id || '');
  }, [boardData]);

  useEffect(() => {
    setAllOrganization(
      allMediums.find((med: any) => med?.id === medium)?.educationMediumStages || []
    );
    setOrganization(
      allMediums.find((med: any) => med?.id === medium)?.educationMediumStages?.[0]?.id || ''
    );
  }, [medium, allMediums]);

  useEffect(() => {
    setAllClass(allOrganization.find((org: any) => org?.id === organization)?.standards || []);
    setClass(
      allOrganization.find((org: any) => org?.id === organization)?.standards?.[0]?.id || ''
    );
  }, [organization, allOrganization]);
  useEffect(() => {
    setAllDivision(allClass.find((org: any) => org?.id === classes)?.divisions || []);
    setDivision(allClass.find((org: any) => org?.id === classes)?.divisions?.[0]?.id || '');
  }, [allClass, classes]);

  return (
    <Box>
      <CustomBreadcrumbs
        heading="Bulk Data Update"
        links={[{ name: 'Student' }, { name: 'Student Management' }, { name: 'Bulk Data Update' }]}
        sx={{ px: 1, mb: 2 }}
      />
      <Box display="flex" gap={2} flexWrap="wrap">
        <CustomSelect
          options={allMediums}
          label="Medium"
          value={medium}
          onChange={(val: string | string[]) => {
            setMedium(val as string);
          }}
          labelKey="name"
          valueKey="id"
          formControlProps={{ sx: { maxWidth: '250px', width: '100%' } }}
        />
        <CustomSelect
          options={allOrganization}
          label="Organization"
          value={organization}
          onChange={(val: string | string[]) => setOrganization(val as string)}
          labelKey="name"
          valueKey="id"
          formControlProps={{ sx: { maxWidth: '250px', width: '100%' } }}
          disabled={!medium}
        />
        <CustomSelect
          options={allClass}
          label="Class"
          value={classes}
          onChange={(val: string | string[]) => setClass(val as string)}
          labelKey="name"
          valueKey="id"
          formControlProps={{ sx: { maxWidth: '250px', width: '100%' } }}
          disabled={!organization}
        />
        <CustomSelect
          options={allDivision}
          label="Division"
          value={division}
          onChange={(val: string | string[]) => setDivision(val as string)}
          labelKey="name"
          valueKey="id"
          formControlProps={{ sx: { maxWidth: '250px', width: '100%' } }}
          disabled={!classes}
        />
        <CustomSelect
          options={allCategory}
          label="Category"
          value={category}
          onChange={(val: string | string[]) => {
            setAllSubCategory(allCategory.find((cat: any) => cat.id === val)?.subCategory || []);
            setSubCategory('');
            setCategory(val as string);
          }}
          labelKey="name"
          valueKey="id"
          formControlProps={{ sx: { maxWidth: '250px', width: '100%' } }}
          disabled={!division}
        />
        <CustomSelect
          options={allSubCategory}
          label="Sub Category"
          value={subCategory}
          onChange={(val: string | string[]) => {
            setSubCategory(val as string);
          }}
          labelKey="name"
          valueKey="id"
          formControlProps={{ sx: { maxWidth: '250px', width: '100%' } }}
          disabled={!category}
        />
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2, gap: 2 }}>
        <Button startIcon={<Save />} variant="outlined">
          Save
        </Button>
      </Box>
      {subCategory && (
        <CustomizableTable
          columns={[
            { id: 'srNo', label: 'Sr. No.' },
            { id: 'grNo', label: 'GR No.' },
            { id: 'name', label: 'Name' },
            {
              id: 'division',
              label: 'Division',
            },
          ]}
          data={tableData}
        />
      )}
    </Box>
  );
};

export default BulkDataUpdateScreen;

interface TableDivisionDropDownProps {
  allDivision: Division[];
  division: string;

  onChange: (val: string | string[]) => void;
}

const TableDivisionDropDown = ({
  allDivision,
  division,

  onChange,
}: TableDivisionDropDownProps) => (
  <CustomSelect
    options={allDivision}
    label="Division"
    value={division}
    onChange={onChange}
    labelKey="name"
    valueKey="id"
    formControlProps={{ sx: { width: '150px', textAlign: 'left' } }}
    onClick={(e) => e.stopPropagation()}
  />
);
