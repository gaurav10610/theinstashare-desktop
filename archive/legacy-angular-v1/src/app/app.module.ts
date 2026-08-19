import "reflect-metadata";
import "../polyfills";

import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { HttpClientModule, HttpClient } from "@angular/common/http";

import { AppRoutingModule } from "./app-routing.module";

// NG Translate
import { TranslateModule, TranslateLoader } from "@ngx-translate/core";
import { TranslateHttpLoader } from "@ngx-translate/http-loader";

import { AppComponent } from "./app.component";
import { NgxElectronModule } from "ngx-electron";
import { MatListModule } from "@angular/material/list";
import { MatDividerModule } from "@angular/material/divider";
import { MatIconModule } from "@angular/material/icon";
import { MatChipsModule } from "@angular/material/chips";
import { MatInputModule } from "@angular/material/input";
import { MatGridListModule } from "@angular/material/grid-list";
import { MatDialogModule } from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatButtonModule } from "@angular/material/button";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { AppDashboardComponent } from "./components/app-dashboard/app-dashboard.component";
import { AppLoginDialogComponent } from "./components/app-login-dialog/app-login-dialog.component";
import { FileTransferWindowComponent } from "./components/file-transfer-window/file-transfer-window.component";
import { GroupChatWindowComponent } from "./components/group-chat-window/group-chat-window.component";
import { GroupLoginDialogComponent } from "./components/group-login-dialog/group-login-dialog.component";
import { IconsDialogComponent } from "./components/icons-dialog/icons-dialog.component";
import { LoginComponent } from "./components/login/login.component";
import { MediaViewerDialogComponent } from "./components/media-viewer-dialog/media-viewer-dialog.component";
import { ProgressDialogComponent } from "./components/progress-dialog/progress-dialog.component";
import { RequestProcessingDialogComponent } from "./components/request-processing-dialog/request-processing-dialog.component";
import { TalkWindowComponent } from "./components/talk-window/talk-window.component";

// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient): TranslateHttpLoader {
  return new TranslateHttpLoader(http, "./assets/i18n/", ".json");
}

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    AppLoginDialogComponent,
    TalkWindowComponent,
    AppDashboardComponent,
    GroupChatWindowComponent,
    GroupLoginDialogComponent,
    MediaViewerDialogComponent,
    IconsDialogComponent,
    RequestProcessingDialogComponent,
    ProgressDialogComponent,
    FileTransferWindowComponent,
  ],
  imports: [
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatListModule,
    MatDividerModule,
    MatIconModule,
    MatChipsModule,
    MatGridListModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatToolbarModule,
    MatProgressBarModule,
    BrowserAnimationsModule,
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    NgxElectronModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
    }),
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
