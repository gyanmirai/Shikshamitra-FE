export interface TAnnouncementImportant {
  id: number;
  importantLevel: string;
  importantLevelDesc: string;
  status: string;
}

export interface TAnnoucementCategory {
  id: number;
  categoryName: string;
  categoryDescription: string;
  status: string;
}

export interface TEvent {
  id: number;
  eventType: string;
  eventTypeDesc: string;
  status: string;
}
