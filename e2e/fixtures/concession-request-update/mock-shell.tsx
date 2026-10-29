import { financePermissions } from 'src/constants/finance-menu';

const permissionNames = Object.values(financePermissions.fees.concessionActions);
const store = {
  confirmPopup: { isChanges: false, currentRoute: '', nextRoute: '', dialog: false },
  auth: { permissions: permissionNames.map((name) => ({ name, isGranted: true })) },
  globalState: {
    currentYear: {
      id: 'year',
      name: '2026–2027',
      boards: [
        {
          id: 'board',
          name: 'Synthetic board',
          educationMediums: [{ id: 'medium', name: 'English' }],
        },
      ],
    },
  },
};
const router = { push: () => undefined, back: () => undefined };
export const useSelector = (selector: any) => selector(store);
export const useDispatch = () => () => undefined;
export const useRouter = () => router;
export const usePathname = () => '/local-concession-regression';
export const useSession = () => ({
  data: { profile: { role: 'accountant' } },
  status: 'authenticated',
});
export const BackPopUpChecked = ({ children }: any) => children;
