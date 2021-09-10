import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { TalkWindowComponent } from './talk-window/talk-window.component';
import { GroupChatWindowComponent } from './group-chat-window/group-chat-window.component';
import { GroupChatLoginComponent } from './group-chat-login/group-chat-login.component';
import { AppDashboardComponent } from './app-dashboard/app-dashboard.component';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'talk', component: TalkWindowComponent },
  { path: 'group-chat', component: GroupChatWindowComponent },
  { path: 'group-login', component: GroupChatLoginComponent },
  { path: 'app', component: AppDashboardComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
