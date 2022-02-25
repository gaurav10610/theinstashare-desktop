import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { TalkWindowComponent } from './talk-window/talk-window.component';
import { GroupChatWindowComponent } from './group-chat-window/group-chat-window.component';
import { AppDashboardComponent } from './app-dashboard/app-dashboard.component';
import { FileTransferWindowComponent } from './file-transfer-window/file-transfer-window.component';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'app', component: AppDashboardComponent },
  { path: 'talk', component: TalkWindowComponent },
  { path: 'group-chat', component: GroupChatWindowComponent },
  { path: 'file-transfer', component: FileTransferWindowComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
