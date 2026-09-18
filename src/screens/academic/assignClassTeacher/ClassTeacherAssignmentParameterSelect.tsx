import CustomSelect from 'src/components/custom-select';

type ClassTeacherAssignmentParameterSelectProps = {
  ariaLabel: string;
  options: readonly string[];
  value: string;
  onChange: (value: string) => void;
};

export function ClassTeacherAssignmentParameterSelect({
  ariaLabel,
  options,
  value,
  onChange,
}: ClassTeacherAssignmentParameterSelectProps) {
  return (
    <CustomSelect
      options={options.map((option) => ({ label: option, value: option }))}
      value={value}
      onChange={(selectedValue) => onChange(String(selectedValue))}
      labelId=""
      inputProps={{ 'aria-label': ariaLabel }}
    />
  );
}
