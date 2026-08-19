import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import * as robotjs from 'robotjs';
import { ElectronService } from 'ngx-electron';
import { clipboard } from 'electron';
import * as vkey from 'vkey';

@Injectable({
  providedIn: 'root'
})
export class NativeElectronService {

  //robotjs module
  robotjs: typeof robotjs;

  //clipboard module 
  clipboard: typeof clipboard;

  //vkey module
  vkey: typeof vkey;

  constructor(private electronService: ElectronService) {
    // Conditional imports
    if (environment.is_native_app) {
      this.robotjs = this.electronService.remote.require('robotjs');
      this.clipboard = this.electronService.clipboard;
      this.vkey = this.electronService.remote.require('vkey');
    }
  }
}
