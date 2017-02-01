import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";

import { HistoryService } from "./history.service";
import { UserModel } from "../user/user.model";
import { SubscriptionModel } from "../shared/subscription/subscription.model";
import { ToolbarService } from "../shared/toolbar.service";

@Component({
  selector: 'page-history',
  templateUrl: './history.html',
  styleUrls: ['./history.css']
})
export class HistoryComponent implements OnInit {

  private client: UserModel;
  private histories: Array<SubscriptionModel>;
  private selectedHistory: SubscriptionModel;

  constructor(public historyService: HistoryService, public toolbarService: ToolbarService,
              public router: Router) {
  }

  ngOnInit() {
    this.toolbarService.title('Subscriptions History');
    this.client = this.historyService.selectedClient;
    if (this.client) {
      this.historyService.getHistory(this.client)
        .then(histories => this.histories = histories);
    } else {
      this.router.navigate(['user/list']);
    }
  }

  selectHistory(history: SubscriptionModel) {
    this.selectedHistory = history;
  }

}
