export interface Annotation {
    id: string;
    pageIndex: number;
    text: string;
    color: string;
    coordinates: { x: number, y: number, width: number, height: number }[];
    timestamp: Date;
  }