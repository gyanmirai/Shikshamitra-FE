export const getImportanceLevelColor = (level: string) => {
  switch (level.toLowerCase()) {
    case 'urgent':
      return {
        bg: '#FEE2E2',
        text: '#DC2626',
        border: '#FECACA',
      };
    case 'critical':
      return {
        bg: '#FFEDD5',
        text: '#EA580C',
        border: '#FED7AA',
      };
    case 'high':
      return {
        bg: '#FEF3C7',
        text: '#D97706',
        border: '#FDE68A',
      };
    case 'medium':
      return {
        bg: '#E0F2FE',
        text: '#0284C7',
        border: '#BAE6FD',
      };
    case 'low':
      return {
        bg: '#DCFCE7',
        text: '#16A34A',
        border: '#BBF7D0',
      };
    case 'informational':
      return {
        bg: '#F3F4F6',
        text: '#4B5563',
        border: '#E5E7EB',
      };
    default:
      return {
        bg: '#F3F4F6',
        text: '#4B5563',
        border: '#E5E7EB',
      };
  }
};
