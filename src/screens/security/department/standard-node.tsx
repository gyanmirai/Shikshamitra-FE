import { Card, Avatar, Typography } from '@mui/material';

function StandardNode(props: any) {
  const {
    name,
    title,
    avatarUrl,
    role,
    sx,
    count,
    assignDialog,
    RenderThreeDotsAction,
    item,
    onRolesClick,
    onUserClick,
  } = props;

  return (
    <Card
      sx={{
        p: 2,
        minWidth: 150,
        borderRadius: 1.5,
        textAlign: 'left',
        position: 'relative',
        display: 'inline-flex',
        flexDirection: 'column',
        '& *': {
          userSelect: 'none',
        },
        ...sx,
      }}
    >
      {RenderThreeDotsAction && RenderThreeDotsAction(item)}

      <Avatar
        alt={name || title}
        src="https://assets.minimals.cc/public/assets/images/mock/avatar/avatar-2.webp"
        sx={{ mr: 2, mb: 2, width: 48, height: 48 }}
      />

      <Typography variant="subtitle2" noWrap sx={{ mb: 0.5 }}>
        {name || title}
      </Typography>
      <Typography variant="caption" sx={{ color: 'text.secondary', p: 0.5 }}>
        <Typography
          sx={{ cursor: 'pointer' }}
          component="span"
          variant="caption"
          onClick={() => onRolesClick(item)}
        >
          {' '}
          Roles ({count})
        </Typography>{' '}
        |{' '}
        <Typography
          sx={{ cursor: 'pointer' }}
          component="span"
          variant="caption"
          onClick={() => onUserClick(item)}
        >
          {' '}
          Users ({count})
        </Typography>
      </Typography>
    </Card>
  );
}

export default StandardNode;
