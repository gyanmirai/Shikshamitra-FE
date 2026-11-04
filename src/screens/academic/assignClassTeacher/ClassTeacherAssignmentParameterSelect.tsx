import CustomSelect from 'src/components/custom-select';

type ClassTeacherAssignmentParameterSelectProps = {
  ariaLabel: string;
  label?: string;
  options: readonly string[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

export function ClassTeacherAssignmentParameterSelect({
  ariaLabel,
  label,
  options,
  value,
  onChange,
  disabled = false,
}: ClassTeacherAssignmentParameterSelectProps) {
  return (
    <CustomSelect
      disabled={disabled}
      options={options.map((option) => ({ label: option, value: option }))}
      value={value}
      onChange={(selectedValue) => onChange(String(selectedValue))}
      label={label}
      labelId={label ? undefined : ''}
      inputProps={{ 'aria-label': ariaLabel }}
      SelectDisplayProps={{ 'aria-label': ariaLabel, 'aria-labelledby': undefined }}
    />
  );
}
