export const useSession = () => ({
  data: {
    profile: {
      role:
        typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('liveApi')
          ? ['Cashier']
          : ['admin'],
    },
  },
  status: 'authenticated',
});
