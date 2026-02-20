import type { TreeNodeData } from './type';

export const transformApiToTree = (items: any[]): TreeNodeData[] => {
  if (!items) return [];

  return items.map((board) => ({
    id: board.id,
    name: board.name,
    type: 'boards',
    parentId: null,
    children: board.educationMediums?.map((medium: any) => ({
      id: medium.id,
      name: medium.name,
      type: 'mediums',
      parentId: board.id,
      children: medium.educationMediumStages?.map((stage: any) => ({
        id: stage.id,
        name: stage.name,
        type: 'organizations', // Matches your tree UI logic
        parentId: medium.id,
        children: stage.standards?.map((standard: any) => ({
          id: standard.id,
          name: standard.name,
          type: 'standards',
          parentId: stage.id,
          children: standard.divisions?.map((division: any) => ({
            id: division.id,
            name: division.name,
            type: 'divisions',
            parentId: standard.id,
            children: [],
          })),
        })),
      })),
    })),
  }));
};
