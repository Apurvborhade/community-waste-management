export interface WasteReportAdmin {
  id: string;
  reportId: string;
  user: string;
  location: string;
  status: 'Open' | 'Resolved';
  priority: 'Low' | 'Medium' | 'High';
  dateCreated: string;
  description: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  imageUrl?: string;
}
