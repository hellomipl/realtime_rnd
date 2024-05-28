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
  needScroll: boolean = false; //flag to check if the scroll is needed this will ensure the scroll will happen only once after the viewUpdated
  sd:any;
  constructor(private dataService: DataGenerationService) { }

  initialize(sessionDetails: any) {
    this.sd=sessionDetails;
    const previousData = this.dataService.generatePreviousFetchData(sessionDetails.lastPage);
    this.feedDataSubject.next(this.dataService.parsePreviousFetchData(previousData));
    this.setGlobalLineNumber()
   // this.globalLineNumber = sessionDetails.lastPage * 25 + sessionDetails.lastLineNumber;
  }

  updateFeedData(data: FeedData): void {
   
    const currentArray = this.feedDataSubject.getValue();

    data.d.forEach((lineData: LineData) => {
     
      const { time, asciiValue, inCommingLineNo } = lineData;

      const pageIndex = Math.floor((inCommingLineNo - 1) / Number(this.sd.settings.lineNumber)); //get the pageindex based on the incoming line number     
      const localLineNumber =this.getLineOfCurPage(inCommingLineNo) //get the line number of the current page

      const lineDataFormatted = { time, asciiValue, lineIndex: localLineNumber, lines: [String.fromCharCode(...asciiValue)] };

      if (!currentArray[pageIndex]) { //if the page index is not present in the current array, then create a new page
        this.needScroll = true;
        currentArray[pageIndex] = { msg: pageIndex + 1, page: pageIndex + 1, data: [] };
      }

      const pageData = currentArray[pageIndex].data; //get the data of the current page
      const existingLineIndex = pageData.findIndex((line: any) => line.lineIndex === localLineNumber); //check if the line is already present in the page   

      if (existingLineIndex >= 0) { //if the line is already present in the page, then update the line
        pageData[existingLineIndex] = lineDataFormatted;
      } else { //if the line is not present in the page, then add the line
        this.needScroll = true;
        pageData.push(lineDataFormatted);
        pageData.sort((a: any, b: any) => a.lineIndex - b.lineIndex);
      }
    });

    this.sd.lastPage = currentArray.length //update the last page number to the sessions details
    this.sd.lastLineNumber=currentArray[currentArray.length-1].data.length; //update the last line number of the last page to the sessions details
    this.setGlobalLineNumber(); //update the global line(total lines) number to the sessions details
    this.feedDataSubject.next(currentArray.slice());
    
//    this.sd.lastLineNumber = Math.max(this.sd.lastLineNumber, ...data.d.map(line => line.inCommingLineNo));
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
    this.sd.globalLineNo = Number(Number(this.sd.lastPage)-1) * (this.sd.settings.lineNumber) + this.feedDataSubject.getValue()[Number( this.sd.lastPage) - 1].data.length;
    
  }

  getLineOfCurPage(globalLineNumber:Number): Number {
    return ((Number(globalLineNumber) -1) % Number(this.sd.settings.lineNumber))+1;
  }
}
