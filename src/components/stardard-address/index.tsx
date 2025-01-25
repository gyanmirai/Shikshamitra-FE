import type { TextFieldProps } from '@mui/material';

import React from 'react';

import { TextField } from '@mui/material';

import CustomSelect from '../custom-select';

import type { CustomSelectProps } from '../custom-select';

class StandardAddress {
  static RenderAddressField = (filedProps: TextFieldProps): JSX.Element => (
    <TextField {...filedProps} />
  );

  static RenderCountry = <T extends string, J extends boolean>(
    filedProps: CustomSelectProps<T, J>
  ): JSX.Element => <CustomSelect label="Country" {...filedProps} />;

  static RenderState = <T extends string, J extends boolean>(
    filedProps: CustomSelectProps<T, J>
  ): JSX.Element => <CustomSelect label="State" {...filedProps} />;

  static RenderCity = <T extends string, J extends boolean>(
    filedProps: CustomSelectProps<T, J>
  ): JSX.Element => <CustomSelect label="City" {...filedProps} />;

  static RenderPincode = (filedProps: TextFieldProps): JSX.Element => (
    <TextField label="Pincode" {...filedProps} />
  );
}
export default StandardAddress;
