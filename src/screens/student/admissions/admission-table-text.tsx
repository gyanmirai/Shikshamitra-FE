import { TableOverflowText } from 'src/components/customizabaleTable/components/TableOverflowText';

type Props = {
  text: string | number;
  secondary?: string;
  strong?: boolean;
};

export function AdmissionTableText({ text, secondary, strong = false }: Props) {
  return (
    <>
      <TableOverflowText
        variant="body2"
        lines={secondary ? 1 : 2}
        fontWeight={strong ? 600 : undefined}
      >
        {text}
      </TableOverflowText>
      {secondary && (
        <TableOverflowText variant="caption" color="text.secondary">
          {secondary}
        </TableOverflowText>
      )}
    </>
  );
}
