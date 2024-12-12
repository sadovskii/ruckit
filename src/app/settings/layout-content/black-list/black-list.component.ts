import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { GlobalService } from 'src/app/shared/services/global/global.service';

@Component({
  selector: 'app-black-list',
  templateUrl: './black-list.component.html',
  styleUrls: ['./black-list.component.scss']
})
export class BlackListComponent implements OnInit, OnDestroy {

  public isRestricted: boolean;

  private _subscription = new Subscription();

  constructor(private _globalService: GlobalService) {}

  ngOnInit(): void {
    this.initIsRestricted();
  }

  private initIsRestricted() {
    const sub = this._globalService.getIsRestricted$.subscribe(storedIsRestricted => {
      this.isRestricted = storedIsRestricted;
    })

    this._subscription.add();
  }

  ngOnDestroy(): void {
    this._subscription.unsubscribe();
  }
}
