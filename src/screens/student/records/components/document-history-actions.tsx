import AdaptiveThreeDotsActions from 'src/components/adaptive-three-dots-actions';

type Action = {
  label: string;
  icon: string;
  disabled?: boolean;
  danger?: boolean;
  onClick: () => void;
};
type Props = { number: string; actions: Action[] };

export default function DocumentHistoryActions({ number, actions }: Props) {
  const disabledReason = 'This document is voided or another document action is in progress.';
  return (
    <AdaptiveThreeDotsActions
      actions={actions.map((action) => ({
        ...action,
        id: action.label,
        ariaLabel: `${action.label} ${number}`,
        tooltip: action.disabled ? disabledReason : `${action.label} ${number}`,
        color: action.danger ? 'error.main' : undefined,
      }))}
      moreLabel={`More actions for ${number}`}
      directActionLimit={2}
      collapseOnOverflow={false}
      placement="right-top"
      sx={{ justifyContent: 'flex-end' }}
    />
  );
}
