import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

@Injectable()
export class  LoadingService {

  private showSource = new Subject<boolean>();

  showSource$: Observable<boolean> = this.showSource.asObservable();

  show(show: boolean) {
    this.showSource.next(show);
  }
}
