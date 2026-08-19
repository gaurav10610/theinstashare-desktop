import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { AppDashboardComponent } from "./components/app-dashboard/app-dashboard.component";
import { FileTransferWindowComponent } from "./components/file-transfer-window/file-transfer-window.component";
import { GroupChatWindowComponent } from "./components/group-chat-window/group-chat-window.component";
import { LoginComponent } from "./components/login/login.component";
import { TalkWindowComponent } from "./components/talk-window/talk-window.component";

const routes: Routes = [
  { path: "", redirectTo: "login", pathMatch: "full" },
  { path: "login", component: LoginComponent },
  { path: "app", component: AppDashboardComponent },
  { path: "talk", component: TalkWindowComponent },
  { path: "group-chat", component: GroupChatWindowComponent },
  { path: "file-transfer", component: FileTransferWindowComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
