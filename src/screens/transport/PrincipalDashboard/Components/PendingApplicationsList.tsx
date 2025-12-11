import { Card, CardHeader } from '@mui/material';
import CustomizableView from 'src/components/customizable-view';
import ScrollableListCard from 'src/components/scrollable-list-card';

interface IListItem {
  id: string;
  title: string;
  description?: string;
  meta?: string;
}

const PendingApplicationsList = () => {
  const sections = [
    {
      id: 'TR_PRINCIPAL_LIST_PENDING_APPLICATIONS',
      icon: 'mdi:file-clock',
      title: 'Pending Applications',
      width: 12,
    },
  ];

  const items: IListItem[] = [
    {
      id: '1',
      title: 'Rohit Sharma',
      description: 'Preferred Stop: Green Park',
      meta: 'Suggested Route: R3',
    },
    {
      id: '2',
      title: 'Anita Verma',
      description: 'Preferred Stop: City Center',
      meta: 'Suggested Route: R1',
    },
    {
      id: '3',
      title: 'Kiran Patel',
      description: 'Preferred Stop: MG Road',
      meta: 'Suggested Route: R2',
    },
    {
      id: '4',
      title: 'Meera Joshi',
      description: 'Preferred Stop: Lake View',
      meta: 'Suggested Route: R4',
    },
  ];

  const dashBoardSections = {
    TR_PRINCIPAL_LIST_PENDING_APPLICATIONS: (
      <Card id="TR_PRINCIPAL_LIST_PENDING_APPLICATIONS">
        <CardHeader title="Pending Applications (for approval)" />
        <ScrollableListCard
          title=""
          items={items.map((i) => ({
            subject: i.title,
            name: i.description?.replace('Preferred Stop: ', ''),
            room: i.meta?.replace('Suggested Route: ', ''),
          }))}
        />
      </Card>
    ),
  } as Record<string, React.JSX.Element>;

  return (
    <CustomizableView
      sections={sections}
      setSections={() => {}}
      dashBoardSections={dashBoardSections}
    />
  );
};

export default PendingApplicationsList;
