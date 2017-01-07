import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

@Injectable()
export class ToolbarService {

  private showSource = new Subject<boolean>();
  private titleSource = new Subject<string>();

  showSource$: Observable<boolean> = this.showSource.asObservable();

  titleSource$: Observable<string> = this.titleSource.asObservable();

  show(show: boolean) {
    this.showSource.next(show);
  }

  title(title: string) {
    this.titleSource.next(title);
  }

}
