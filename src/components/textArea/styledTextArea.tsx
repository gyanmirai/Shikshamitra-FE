import React from 'react'
import { styled } from '@mui/system';
import { TextareaAutosize as MuiTextareaAutosize } from '@mui/base/TextareaAutosize';

const StyledTextarea = styled(MuiTextareaAutosize)(({ theme }) => ({
    maxWidth : '250px',
    width: '100%',
    minHeight: '80px',
    padding: '12px',
    borderRadius: '4px',
    border: '1px solid #30363d',
    fontFamily: 'Arial, sans-serif',
    fontSize: '14px',
    resize: 'vertical',
}));

const FullWidthTextarea = ({ placeholder = 'Text description', ...props }) => {
    return (
        <StyledTextarea
            aria-label="textarea"
            placeholder={placeholder}
            {...props}
        />
    )
}

export default FullWidthTextarea;