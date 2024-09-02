import React, { useState } from 'react';

import { FormHelperText } from '@mui/material';

import { UploadAvatar } from 'src/components/upload';

const Upload = ({ ...other }) => {
  const [value, setValue] = useState('');
  const [error] = useState({ message: '' });
  const onDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];

    if (file) {
      setValue(URL.createObjectURL(file));
    }
  };
  return (
    <div>
      <UploadAvatar value={value} error={!!error} onDrop={onDrop} {...other} />

      {!!error && (
        <FormHelperText error sx={{ px: 2, textAlign: 'center' }}>
          {error?.message}
        </FormHelperText>
      )}
    </div>
  );
};

export default Upload;
