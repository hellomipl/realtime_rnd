import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { DataGenerationService } from '../../services/data-generation.service';
import { FeedData, LineData } from '../../models/data.interface';

@Injectable({
  providedIn: 'root'
})
export class FeedDisplayService {
/**
 *  {
      lastPage: 5,
      lastLineNumber: 22, // Random line number between 1 and 25 for the last page
      sessionId: this.sessionId,
      userName: this.userName,
      settings: {
        lineNumber: 25,
        startPage: 1,
      },
    };
 */
  private feedDataSubject = new BehaviorSubject<any[]>([]);
  feedData$ = this.feedDataSubject.asObservable();
  //globalLineNumber: number = 0;
  needScroll: boolean = false;
  sd:any;
  constructor(private dataService: DataGenerationService) { }

  initialize(sessionDetails: any) {
    this.sd=sessionDetails;
    const previousData = this.dataService.generatePreviousFetchData(sessionDetails.lastPage, sessionDetails.lastLineNumber);
    this.feedDataSubject.next(this.dataService.parsePreviousFetchData(previousData));
    this.setGlobalLineNumber()
   // this.globalLineNumber = sessionDetails.lastPage * 25 + sessionDetails.lastLineNumber;
  }

  updateFeedData(data: FeedData): void {
   
    const currentArray = this.feedDataSubject.getValue();

    data.d.forEach((lineData: LineData) => {
     
      const { time, asciiValue, inCommingLineNo } = lineData;
      const pageIndex = Math.floor((inCommingLineNo - 1) / Number(this.sd.settings.lineNumber));
      const localLineNumber =this.getLineOfCurPage(inCommingLineNo)

      const lineDataFormatted = { time, asciiValue, lineIndex: localLineNumber, lines: [String.fromCharCode(...asciiValue)] };

      if (!currentArray[pageIndex]) {
        this.needScroll = true;
        currentArray[pageIndex] = { msg: pageIndex + 1, page: pageIndex + 1, data: [] };
      }

      const pageData = currentArray[pageIndex].data;
      const existingLineIndex = pageData.findIndex((line: any) => line.lineIndex === localLineNumber);

      if (existingLineIndex >= 0) {
        pageData[existingLineIndex] = lineDataFormatted;
      } else {
        this.needScroll = true;
        pageData.push(lineDataFormatted);
        pageData.sort((a: any, b: any) => a.lineIndex - b.lineIndex);
      }
    });

    this.sd.lastPage = currentArray.length
    this.sd.lastLineNumber=currentArray[currentArray.length-1].data.length;
    this.feedDataSubject.next(currentArray.slice());
    
    this.sd.lastLineNumber = Math.max(this.sd.lastLineNumber, ...data.d.map(line => line.inCommingLineNo));
  }

  
  isBold(line: string[], index: number, data: any[]): boolean {
    if (line[0].startsWith('Q.')) {
      return true;
    }
    if (line[0].startsWith('A.')) {
      return false;
    }
    for (let i = index - 1; i >= 0; i--) {
      if (data[i].lines[0].startsWith('Q.')) {
        return true;
      }
      if (data[i].lines[0].startsWith('A.')) {
        return false;
      }
    }
    return false;
  }

  setGlobalLineNumber() {  
    this.sd.lastPage = this.feedDataSubject.getValue().length;
    this.sd.lastLineNumber = Number(Number(this.sd.lastPage)-1) * (this.sd.settings.lineNumber) + this.feedDataSubject.getValue()[Number( this.sd.lastPage) - 1].data.length;
  }

  getLineOfCurPage(globalLineNumber:Number): Number {
    return ((Number(globalLineNumber) -1) % Number(this.sd.settings.lineNumber))+1;
  }
}
