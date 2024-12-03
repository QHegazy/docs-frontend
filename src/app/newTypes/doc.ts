export interface Document {
  id: string;
  title: string;
  content: any;
  lastUpdate: Date;
  type: 'recent' | 'owned' | 'shared';
}

export interface QuillDoc {
  title: string;
  mongoId: string;
}
export interface ApiResponse {
  status: number;
  message: string;
  data: QuillDoc;
}
