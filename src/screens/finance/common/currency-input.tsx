import React, { useState } from 'react';

import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';

type CurrencyInputProps = {
  value: string;
  onChange: (formattedValue: string, numericValue: number) => void;
  currencyCode?: string; // Default to "INR"
  label?: string;
};

const CurrencyInput: React.FC<CurrencyInputProps> = ({
  value,
  onChange,
  currencyCode = 'INR',
  label = 'Amount',
}) => {
  const [inputValue, setInputValue] = useState(value);

  // Format number to the specified currency
  const formatCurrency = (valu: string): string => {
    const numericValue = Number(valu.replace(/,/g, ''));
    if (Number.isNaN(numericValue)) return '';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 0,
    //   minimumFractionDigits: 2,
    //   maximumFractionDigits: 2,
    })
      .format(numericValue)
      .replace(/^₹\s?/, ''); 
  };

  // Handle input change
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = event.target.value.replace(/,/g, '').replace(/[^\d]/g, ''); // Allow only numbers
    if (!rawValue) {
      setInputValue('');
      onChange('', 0);
      return;
    }
    const formattedValue = formatCurrency(rawValue);
    setInputValue(formattedValue);
    onChange(formattedValue, Number(rawValue));
  };

  return (
    <TextField
      label={label}
      value={inputValue}
      onChange={handleInputChange}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            {new Intl.NumberFormat(undefined, {
              style: 'currency',
              currency: currencyCode,
            })
              .format(0)
              .replace(/\d/g, '')
              .trim()}
          </InputAdornment>
        ),
      }}
      fullWidth
      size="small"
    />
  );
};

export default CurrencyInput;











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
