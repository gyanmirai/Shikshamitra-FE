export const useSession = () => ({
  data: {
    profile: {
      role: new URLSearchParams(window.location.search).has('admin') ? ['admin'] : [],
    },
    user: {
      name: 'Synthetic Finance User',
      roles: [],
    },
  },
  status: 'authenticated',
});
