export const grossSalaryOption = {
  id: 'GROSS',
  componentName: 'Gross Salary',
  group: 'System values',
};

export function getCalculationBase(calculationType: string, selectedBase: string | null) {
  if (calculationType !== 'Percentage') return { calculationBase: 'COMPONENT', componentId: null };
  return selectedBase === grossSalaryOption.id
    ? { calculationBase: 'GROSS', componentId: null }
    : { calculationBase: 'COMPONENT', componentId: selectedBase };
}
