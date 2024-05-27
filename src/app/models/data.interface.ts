export interface LineData {
    time: string;
    asciiValue: number[];
    globalLineNumber: number;
  }
  
  export interface FeedData {
    i: number;
    d: LineData[];
    date: number;
  }
  