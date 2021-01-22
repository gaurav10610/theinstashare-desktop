import { Injectable } from '@angular/core';
import { LoggerUtil } from '../services/logging/LoggerUtil';
import { NativeElectronService } from '../core/services/electron/electron.service';
import { AppConstants } from '../services/AppConstants';
import {TalkWindowContextService} from '../services/context/talk-window-context.service';

@Injectable({
  providedIn: 'root'
})
export class NativeRemoteAccessService {

  //state of caps lock on local machine 
  capsLockState: boolean = false;

  constructor(
    private nativeElectronService: NativeElectronService,
    public talkWindowContextService: TalkWindowContextService) { }

  /**
   * this will simulate appropriate native mouse or keyboard event as per the received 
   * info from remote end 
   * 
   * @param nativeEventMessage message containing mouse and keyboard action info 
   * performed at remote end
   * 
   */
  handleNativeEvents(nativeEventMessage: any) {
    switch (nativeEventMessage.eventType) {

      case AppConstants.REMOTE_ACCESS_HANDLER_IDS.MOUSE_MOVE:
        this.handleMoveMouseEvent(nativeEventMessage);
        break;

      case AppConstants.REMOTE_ACCESS_HANDLER_IDS.MOUSE_DOWN:
        this.handleMouseClickEvent('down', nativeEventMessage);
        break;

      case AppConstants.REMOTE_ACCESS_HANDLER_IDS.MOUSE_UP:
        this.handleMouseClickEvent('up', nativeEventMessage);
        break;

      case AppConstants.REMOTE_ACCESS_HANDLER_IDS.DOUBLE_CLICK_MOUSE_DOWN:
        this.handleMouseDoubleClickEvent(nativeEventMessage);
        break;

      case AppConstants.REMOTE_ACCESS_HANDLER_IDS.WHEEL:
        this.handleMouseScrollEvent(nativeEventMessage);
        break;

      case AppConstants.REMOTE_ACCESS_HANDLER_IDS.SELECT:
        this.handleSelectionEvent(nativeEventMessage);
        break;

      case AppConstants.REMOTE_ACCESS_HANDLER_IDS.PASTE:
        this.handlePasteEvent(nativeEventMessage);
        break;

      case AppConstants.REMOTE_ACCESS_HANDLER_IDS.KEY_DOWN:
        this.handleKeyTapEvent(nativeEventMessage);
        break;

      default:
        LoggerUtil.log('received native event is unknown');
    }
  }

  /**
   * this will handle mouse double click native event as per the 
   * received info from remote end
   * 
   * @param mouseDoubleClickEventMessage message containing info about mouse event perform at remote end
   * 
   */
  private handleMouseDoubleClickEvent(mouseDoubleClickEventMessage: any) {
    this.nativeElectronService.robotjs.moveMouse(
      Math.round(mouseDoubleClickEventMessage.clientX * mouseDoubleClickEventMessage.widthRatio),
      Math.round(mouseDoubleClickEventMessage.clientY * mouseDoubleClickEventMessage.heightRatio)
    );
    this.nativeElectronService.robotjs.mouseClick(mouseDoubleClickEventMessage.clickType, true);
  }

  /**
   * this will handle mouse scroll native event as per the received info from remote end
   * 
   * @param mouseScrollEventMessage message containing info about mouse event perform at remote end
   * 
   */
  private handleMouseScrollEvent(mouseScrollEventMessage: any) {
    this.nativeElectronService.robotjs.scrollMouse(0, -mouseScrollEventMessage.deltaY);
  }

  /**
   * this will handle data paste native event as per the received info from remote end
   * 
   * @param dataPasteEventMessage message containing info about paste event perform at remote end
   * 
   */
  private handlePasteEvent(dataPasteEventMessage: any) {
    this.nativeElectronService.clipboard.writeText(dataPasteEventMessage.data);

    /**
     * get 'v' keyboard key from keyCode
     * 
     * @TODO check if this is really required
     */
    const key = this.nativeElectronService.vkey[86].toLowerCase();
    LoggerUtil.log('this is the pasted data: ' + this.nativeElectronService.clipboard.readText());
    switch (this.talkWindowContextService.remoteAccessContext['localOS']) {
      case 'win':
        this.nativeElectronService.robotjs.keyTap(key, ['control']);
        break;

      case 'mac':
        this.nativeElectronService.robotjs.keyTap(key, ['command']);
        this.nativeElectronService.robotjs.keyToggle('command', 'up'); //check if this is required 
        break;
    }
  }

  /**
   * this will handle selection native event as per the received info from remote end
   * 
   * @param selectionEventMessage message containing info about selection event perform at remote end
   * 
   */
  private handleSelectionEvent(selectionEventMessage: any) {

    /**
     * get 'a' keyboard key from keyCode
     * 
     * @TODO check if this is really required
     */
    const key = this.nativeElectronService.vkey[65].toLowerCase();
    switch (this.talkWindowContextService.remoteAccessContext['localOS']) {
      case 'win':
        this.nativeElectronService.robotjs.keyTap(key, ['control']);
        break;

      case 'mac':
        this.nativeElectronService.robotjs.keyTap(key, ['command']);
        this.nativeElectronService.robotjs.keyToggle('command', 'up'); //check if this is required 
        break;
    }
  }

  /**
   * this will simulate mouse click/toggle('up' or down) native event as per the 
   * received info from remote end
   * 
   * @param toggleType whether it is mouse down or up 
   * 
   * @param mouseClickEventMessage message containing info about mouse event perform at remote end
   *  
   */
  private handleMouseClickEvent(toggleType: string, mouseClickEventMessage: any) {
    this.nativeElectronService.robotjs.moveMouse(
      Math.round(mouseClickEventMessage.clientX * mouseClickEventMessage.widthRatio),
      Math.round(mouseClickEventMessage.clientY * mouseClickEventMessage.heightRatio)
    );
    this.nativeElectronService.robotjs.mouseToggle(toggleType, mouseClickEventMessage.clickType);
  }

  /**
   * this will simpulate move mouse native event as per the received info from remote end
   * 
   * @param moveMouseEventMessage message containing info about mouse event perform at remote end
   * 
   * @TODO see if this can be done in one step
   */
  private handleMoveMouseEvent(moveMouseEventMessage: any) {
    this.nativeElectronService.robotjs.moveMouse(
      Math.round(moveMouseEventMessage.clientX * moveMouseEventMessage.widthRatio),
      Math.round(moveMouseEventMessage.clientY * moveMouseEventMessage.heightRatio)
    );
  }

  /**
   * this will simpulate appropriate native keboard event as per the received info from remote end
   * 
   * @param keyboardeventMessage message containing info about keyboard event perform at remote end
   * 
   */
  private handleKeyTapEvent(keyboardEventMessage: any) {

    try {

      let key = this.nativeElectronService.vkey[keyboardEventMessage.keyCode].toLowerCase();

      if (this.capsLockState !== keyboardEventMessage.capslock) {
        if (this.talkWindowContextService.remoteAccessContext['localOS'] === 'win') {
          this.nativeElectronService.robotjs.keyTap('capslock');
          this.capsLockState = keyboardEventMessage.capslock;
        }
      }

      if (key === '<space>') key = ' ';

      /**
       * array for modifier keys to tap via robotjs
       */
      const modifiers = [];
      if (keyboardEventMessage.shift) modifiers.push('shift');
      if (keyboardEventMessage.control) modifiers.push('control');
      if (keyboardEventMessage.alt) modifiers.push('alt');
      if (keyboardEventMessage.meta) modifiers.push('command');

      if (key.charAt(0) !== '<') {
        if (modifiers.length > 0) {

          /**
           * ignore 'copy', 'paste' and 'selection' event
           */
          if ((this.talkWindowContextService.remoteAccessContext['localOS'] === 'win' ||
            this.talkWindowContextService.remoteAccessContext['localOS'] === 'mac') &&
            (keyboardEventMessage.control || keyboardEventMessage.meta) &&
            (keyboardEventMessage.keyCode == 86 || keyboardEventMessage.keyCode == 67 || keyboardEventMessage.keyCode == 65)) {
            return;
          }

          this.nativeElectronService.robotjs.keyTap(key, modifiers);
          if (keyboardEventMessage.shift) this.nativeElectronService.robotjs.keyToggle('shift', 'up');
          if (keyboardEventMessage.control) this.nativeElectronService.robotjs.keyToggle('control', 'up');
          if (keyboardEventMessage.alt) this.nativeElectronService.robotjs.keyToggle('alt', 'up');
          if (keyboardEventMessage.meta) this.nativeElectronService.robotjs.keyToggle('command', 'up');
          LoggerUtil.log('tapped key: ' + key + ' with modifiers: ' + modifiers);
        } else {
          LoggerUtil.log('tapped key ' + key);
          this.nativeElectronService.robotjs.keyTap(key);
        }
      } else {

        switch (key) {
          case '<enter>':
            this.nativeElectronService.robotjs.keyTap('enter');
            break;
          case '<backspace>':
            this.nativeElectronService.robotjs.keyTap('backspace');
            break;
          case '<up>':
            this.nativeElectronService.robotjs.keyTap('up');
            break;
          case '<down>':
            this.nativeElectronService.robotjs.keyTap('down');
            break;
          case '<left>':
            this.nativeElectronService.robotjs.keyTap('left');
            break;
          case '<right>':
            this.nativeElectronService.robotjs.keyTap('right');
            break;
          case '<delete>':
            this.nativeElectronService.robotjs.keyTap('delete');
            break;
          case '<home>':
            this.nativeElectronService.robotjs.keyTap('home');
            break;
          case '<end>':
            this.nativeElectronService.robotjs.keyTap('end');
            break;
          case '<page-up>':
            this.nativeElectronService.robotjs.keyTap('pageup');
            break;
          case '<page-down>':
            this.nativeElectronService.robotjs.keyTap('pagedown');
            break;
          case '<tab>':
            this.nativeElectronService.robotjs.keyTap('tab');
            break;
          case '<escape>':
            this.nativeElectronService.robotjs.keyTap('escape');
            break;
          default:
            LoggerUtil.log('not able to tap key: ' + key);
        }
      }
    } catch (error) {
      LoggerUtil.log('error while tapping key');
      LoggerUtil.log(error);
    }
  }
}
