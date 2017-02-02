import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { MaterialModule } from '@angular/material';
import { SwiperModule } from 'angular2-useful-swiper';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { ProfileComponent } from './profile/profile.component';
import { ChangePasswordDialog } from './setting/change-pssword/change-password.dialog';
import { RouterModule, Routes } from '@angular/router';
import { CanActivateViaAuthGuard } from './shared/can-activate-via-auth.guard';
import { IsAdminViaAuthGuard } from './shared/is-admin-via-auth.guard';
import { FirebaseService } from './shared/firebase-service';
import { UserReady } from './user/user-notifier';
import { UserService } from './user/user-service';
import { ToolbarService } from './shared/toolbar.service';
import { ValidationMessageService } from './shared/validator/validation-message.service';
import { CarItemComponent } from './car/car-item/car-item.component';
import { CarService } from './car/shared/car.service';
import { EditCarDialog } from './car/edit-car/edit-car.dialog';
import { ConfirmMessageDialog } from './confirm-message/confirm-message.dialog';
import { EditCarParkDialog } from './car-park/edit-car-park/edit-car-park.dialog';
import { CarParkService } from './car-park/shared/car-park.service';
import { CarParkListComponent } from './car-park/car-park-list/car-park-list.component';
import { SubscriberService } from './shared/subscription/subscriber.service';
import { CarListComponent } from './car/car-list/car-list.component';
import { SelectTypeDialog } from './profile/select-type/select-type.dialog';
import { CarParkFilterComponent } from './car-park/car-park-filter/car-park-filter';
import { AddUserComponent } from './user/add-user.component';
import { CamelCasePipe } from './shared/camel-case.pipe';
import { CarParkItemComponent } from './car-park/car-park-item/car-park-item';
import { SettingComponent } from './setting/setting.component';
import { CarLotNumberDialog } from './car/car-lot-number/car-lot-number.dialog';
import { HistoryComponent } from './history/history';
import { AnnouncementService } from './shared/announcement.service';
import { HistoryService } from './history/history.service';
import { ClientListComponent } from './history/client-list';
import { BusyModule, BusyConfig } from 'angular2-busy';

const appRoutes: Routes = [
  {path: 'login/disconnect', component: LoginComponent},
  {path: 'login', component: LoginComponent},
  {path: 'profile', component: ProfileComponent, canActivate: [CanActivateViaAuthGuard]},
  {path: 'setting', component: SettingComponent, canActivate: [CanActivateViaAuthGuard]},
  {path: 'carparks/tobook', component: CarParkListComponent, canActivate: [CanActivateViaAuthGuard]},
  {path: 'car/towash', component: CarListComponent, canActivate: [CanActivateViaAuthGuard]},
  {path: 'add/user', component: AddUserComponent, canActivate: [IsAdminViaAuthGuard]},
  {path: 'user/list', component: ClientListComponent, canActivate: [IsAdminViaAuthGuard]},
  {path: 'user/history', component: HistoryComponent, canActivate: [IsAdminViaAuthGuard]},
  //{path: 'room/:room/chat', component: ChatComponent,canActivate: [CanActivateViaAuthGuard]},
  //{path: 'setting', component: SettingComponent, canActivate: [CanActivateViaAuthGuard]},
  //{path: 'shop', component: ShopComponent, canActivate: [CanActivateViaAuthGuard]},
  {path: '', component: ProfileComponent, canActivate: [CanActivateViaAuthGuard]},
  {path: '**', component: ProfileComponent, canActivate: [CanActivateViaAuthGuard]}
];

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    ProfileComponent,
    AddUserComponent,
    CarItemComponent,
    CarParkItemComponent,
    CarParkListComponent,
    CarParkFilterComponent,
    CarListComponent,
    SettingComponent,
    ClientListComponent,
    HistoryComponent,

    ChangePasswordDialog,
    ConfirmMessageDialog,
    EditCarDialog,
    EditCarParkDialog,
    SelectTypeDialog,
    CarLotNumberDialog,

    CamelCasePipe
  ],
  entryComponents: [
    ChangePasswordDialog,
    ConfirmMessageDialog,
    EditCarDialog,
    EditCarParkDialog,
    SelectTypeDialog,
    CarLotNumberDialog
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    MaterialModule.forRoot(),
    RouterModule.forRoot(appRoutes),
    ReactiveFormsModule,
    SwiperModule,
    BusyModule.forRoot(
      new BusyConfig({
        template:
          `<div style="background: url('../assets/loading.gif') no-repeat center 20px; background-size: 72px;">
            <div style="margin-top: 110px; text-align: center; font-size: 18px; font-weight: 700;">
              {{message}}
            </div>
          </div>`,
        minDuration: 500,
      })
    )
  ],
  providers: [
    UserService,
    CarService,
    CarParkService,
    SubscriberService,
    UserReady,
    ToolbarService,
    FirebaseService,
    ValidationMessageService,
    AnnouncementService,
    HistoryService,

    CanActivateViaAuthGuard,
    IsAdminViaAuthGuard
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
