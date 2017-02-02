import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HistoryService } from './history.service';
import { UserModel } from '../user/user.model';
import { SubscriptionModel } from '../shared/subscription/subscription.model';
import { ToolbarService } from '../shared/toolbar.service';

@Component({
  selector: 'page-history',
  templateUrl: './history.html',
  styleUrls: ['./history.css']
})
export class HistoryComponent implements OnInit {

  clients: Array<UserModel>;
  selectedClient: UserModel;
  histories: Array<SubscriptionModel>;
  selectedHistory: SubscriptionModel;

  constructor(public historyService: HistoryService, public toolbarService: ToolbarService,
              public router: Router) {
  }

  ngOnInit() {
    this.toolbarService.title('Subscriptions History');
    this.historyService.getClients().then(clients => this.clients = clients);
  }

  selectClient(client: UserModel) {
    this.selectedClient = client;
    this.selectedHistory = undefined;
    this.historyService.getHistory(this.selectedClient)
      .then(histories => this.histories = histories);
  }

  selectHistory(history: SubscriptionModel) {
    this.selectedHistory = history;
  }

}
