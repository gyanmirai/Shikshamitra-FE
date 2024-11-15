import React from 'react';

import TextField from '@mui/material/TextField';

type FormattedAmountInputProps = {
    value: string;
    onChange: (formattedValue: string, numericValue: number) => void;
    label?: string;
    name?: string;
};

const formatWithCommas = (value: string) => {
    const parts = value.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{2})+(?!\d))/g, ',').replace(/,(\d{3})$/, '$1');
    //   parts[0] = parts[0]
    //   .replace(/\B(?=(\d{3})+(?!\d))/g, ',') 
    //   .replace(/\B(?=(\d{2})+(?=\d{3}))/g, ',');
    return parts.join('.');
};

const parseNumericValue = (formattedValue: string) => parseFloat(formattedValue.replace(/,/g, '')) || 0;

const FormattedAmountInput: React.FC<FormattedAmountInputProps> = ({ value, onChange, label, name }) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value.replace(/,/g, '');
        if (!/^\d*\.?\d{0,2}$/.test(inputValue)) return;
        const formattedValue = formatWithCommas(inputValue);
        const numericValue = parseNumericValue(formattedValue);
        onChange(formattedValue, numericValue);
    };

    return (
        <TextField
            label={label}
            name={name}
            value={value}
            onChange={handleChange}
            fullWidth
            size="small"
        />
    );
};

export default FormattedAmountInput;










// import React, { useState } from 'react';

// import TextField from '@mui/material/TextField';

// type FormattedAmountInputProps = {
//     value: string;
//     onChange: (formattedValue: string, numericValue: number) => void;
//     label?: string;
//     name?: string;
//     currency?: string;
// };


// export const formatNumber = (num: number | string, currency?: string): string => {
//     const numericValue = Number(num);

//     if (Number.isNaN(numericValue)) {
//         return currency ? `${currency} 0.00` : '0.00';
//     }

//     return new Intl.NumberFormat(undefined, {
//         style: currency ? 'currency' : 'decimal',
//         currency,
//         currencyDisplay: 'narrowSymbol',
//         minimumFractionDigits: 2,
//         maximumFractionDigits: 2,
//     }).format(numericValue);
// };

// const FormattedAmountInput: React.FC<FormattedAmountInputProps> = ({ value, onChange, label, name, currency }) => {
//     const [internalValue, setInternalValue] = useState(value);
//     const [rawValue, setRawValue] = useState<number>(parseFloat(value.replace(/,/g, '')) || 0);

//     const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//         const inputValue = e.target.value;

      
//         const cleanedValue = inputValue.replace(/,/g, '');

//         if (!/^\d*\.?\d{0,2}$/.test(cleanedValue)) return;

//         const numericValue = parseFloat(cleanedValue);
//         setRawValue(numericValue); 
//         setInternalValue(inputValue); 

        
//         onChange(inputValue, numericValue);
//     };

//     const handleBlur = () => {
      
//         const formattedValue = formatNumber(rawValue, currency);
//         setInternalValue(formattedValue); 
//     };

//     return (
//         <TextField
//             label={label}
//             name={name}
//             value={internalValue}
//             onChange={handleChange}
//             onBlur={handleBlur} // Trigger formatting when the input loses focus
//             fullWidth
//             size="small"
//         />
//     );
// };

// export default FormattedAmountInput;
