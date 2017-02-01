import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HistoryService } from './history.service';
import { UserModel } from '../user/user.model';
import { ToolbarService } from '../shared/toolbar.service';

@Component({
  selector: 'app-client-list',
  templateUrl: './client-list.html',
  styleUrls: ['./client-list.css']
})
export class ClientListComponent implements OnInit {

  private clients: Array<UserModel>;

  constructor(public historyService: HistoryService, public toolbarService: ToolbarService,
              public router: Router) {
  }

  ngOnInit() {
    this.toolbarService.title('Subscription History');
    this.historyService.getClients().then(clients => this.clients = clients);
  }

  selectClient(client: UserModel) {
    this.historyService.selectedClient = client;
    this.router.navigate(['user/history']);
  }
}
