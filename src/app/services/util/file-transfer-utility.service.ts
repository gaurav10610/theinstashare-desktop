import {
  InfoDialogContext,
  InfoDialogElementType,
  InfoDialogRow,
} from "./../contracts/dialog/dialog";
import { TransferredFileContext } from "./../contracts/file/file-transfer";
import { Injectable } from "@angular/core";
import { AppConstants } from "../AppConstants";
import { FileTransferContextService } from "../context/file-transfer/file-transfer-context.service";
import { UserContextService } from "../context/user.context.service";
import { LoggerUtil } from "../logging/LoggerUtil";
import { CoreAppUtilityService } from "./core-app-utility.service";

@Injectable({
  providedIn: "root",
})
export class FileTransferUtilityService {
  constructor(
    private coreAppUtilService: CoreAppUtilityService,
    private userContextService: UserContextService,
    private fileTransferContextService: FileTransferContextService
  ) {}

  /**
   * update user status in contact list
   * @param connected boolean flag to distinguish whether user is connected or
   * disconnected
   *
   * @param username username of the user whose status needs to be updated
   */
  updateUserStatus(connected: boolean, username: string) {
    if (username !== this.userContextService.username) {
      if (
        connected &&
        !this.fileTransferContextService.userStatus.has(username)
      ) {
        this.fileTransferContextService.activeUsers.push(username);
      }
      this.fileTransferContextService.userStatus.set(username, connected);
    }
  }

  /**
   * this will check if an HTML element is in viewport or not
   *
   * @param htmlElement html dom element that needed to be checked
   *
   * @TODO move it to a common class
   *
   * @return a promise
   */
  async isElementInViewport(htmlElement: any): Promise<boolean> {
    const rect = htmlElement.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <=
        (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }

  /**
   * this will update the receipt status of a message when an acknowledgement
   * is received
   *
   * @param ackMessage received message acknowledgement
   */
  updateChatMessageStatus(ackMessage: any): void {
    /**
     * a. get all the messages from user's message context
     *
     * b. do the reconciliation by finding the original message with the message
     * id from the acknowledgement and then update the receipt status
     *
     */
    const messages: any[] = this.fileTransferContextService.getMessageContext(
      ackMessage[AppConstants.USERNAME]
    );
    for (const message of messages) {
      if (message.id === ackMessage.messageId) {
        message.status = ackMessage.status;
        message.time = new Date(ackMessage.time).toLocaleTimeString();
        break;
      }
    }
  }

  /**
   * this will send an acknowledgement for a received message along with a status
   * like 'seen' or 'delivered'
   *
   * @param message received message
   *
   * @param messageStatus status of the message
   *
   * @param channel media type for the data channel i.e the type of data being
   * relayed on this data channel
   *
   * @TODO add a new contract for acknowledgement afterwards for type checking
   */
  async sendMessageAcknowledgement(
    message: any,
    messageStatus: string,
    channel: string
  ): Promise<void> {
    const ackId: string = this.coreAppUtilService.generateIdentifier();
    const isAckSent: boolean = await this.sendMessageOnDataChannel(
      message[AppConstants.USERNAME],
      {
        id: ackId,
        status: messageStatus,
        username: this.userContextService.username,
        type: AppConstants.MESSAGE_ACKNOWLEDGEMENT,
        time: new Date().getTime(),
        messageType: message.type,
        messageId: message.id,
      },
      channel
    );
    if (isAckSent) {
      if (message.id) {
        LoggerUtil.logAny(
          `acknowledgement sent for message with id: ${message.id} from ${
            message[AppConstants.USERNAME]
          }`
        );
      } else {
        LoggerUtil.logAny(
          `error while sending acknowledgement for: ${JSON.stringify(message)}`
        );
      }
    }
  }

  /**
   * this will simply send message to a user via data channel if it found to be in
   * open state and will return a boolean result
   *
   * @param username username of the user to whom message has to be sent
   * @param message json message object containing the message
   * @param channel channel type for webrtc data channel on which provided
   * message has to be sent
   *
   * @return a promise containing a boolean flag whether message has been sent
   * or not
   */
  async sendMessageOnDataChannel(
    username: string,
    message: any,
    channel: string
  ): Promise<boolean> {
    let sentFlag = false;

    try {
      /**
       * get the user's webrtc context, if there is an open data channel the
       * send the message on data channel
       *
       */
      const userContext: any =
        this.userContextService.getUserWebrtcContext(username);
      if (
        this.coreAppUtilService.isDataChannelConnected(userContext, channel)
      ) {
        userContext[AppConstants.MEDIA_CONTEXT][channel][
          AppConstants.DATACHANNEL
        ].send(JSON.stringify(message));
        sentFlag = true;
      }
      return sentFlag;
    } catch (e) {
      return sentFlag;
    }
  }

  /**
   * build context for informaational dialog box for showing file details
   * @param file details of a shared file
   * @returns InfoDialogContext
   */
  async buildFileInfoDialogContext(
    file: TransferredFileContext
  ): Promise<InfoDialogContext> {
    const rows: InfoDialogRow[] = [];

    const fileIconRow: InfoDialogRow = {
      elements: [
        {
          type: InfoDialogElementType.ICON,
          icon: file.icon,
          isSvgIcon: true,
        },
      ],
      needBorderAfterRow: false,
      rowStyle: { "row-flex-display": true, "center-content": true },
    };
    rows.push(fileIconRow);

    const fileNameRow: InfoDialogRow = {
      elements: [
        {
          type: InfoDialogElementType.TEXT,
          text: "File Name: ",
          textStyle: {
            "header-font": true,
            "bold-text": true,
            "single-line-text": true,
          },
        },
        {
          type: InfoDialogElementType.TEXT,
          text: `${file.fileName}`,
          textStyle: {
            "header-font": true,
          },
          textDivStyle: {
            "div-content-wrap": true,
          },
        },
      ],
      needBorderAfterRow: true,
    };
    rows.push(fileNameRow);

    const fileTypeRow: InfoDialogRow = {
      elements: [
        {
          type: InfoDialogElementType.TEXT,
          text: "File Type: ",
          textStyle: {
            "header-font": true,
            "bold-text": true,
            "single-line-text": true,
          },
        },
        {
          type: InfoDialogElementType.TEXT,
          text: `${file.fileType}`,
          textStyle: {
            "header-font": true,
          },
        },
      ],
      needBorderAfterRow: true,
    };
    rows.push(fileTypeRow);

    const fileSizeRow: InfoDialogRow = {
      elements: [
        {
          type: InfoDialogElementType.TEXT,
          text: "File Size: ",
          textStyle: {
            "header-font": true,
            "bold-text": true,
            "single-line-text": true,
          },
        },
        {
          type: InfoDialogElementType.TEXT,
          text: this.coreAppUtilService.formatBytes(file.size),
          textStyle: {
            "header-font": true,
          },
        },
      ],
      needBorderAfterRow: true,
    };
    rows.push(fileSizeRow);

    const timestampRow: InfoDialogRow = {
      elements: [
        {
          type: InfoDialogElementType.TEXT,
          text: file.isSent ? "Sent At: " : "Received At: ",
          textStyle: {
            "header-font": true,
            "bold-text": true,
            "single-line-text": true,
          },
        },
        {
          type: InfoDialogElementType.TEXT,
          text: file.completedAt.toLocaleString(),
          textStyle: {
            "header-font": true,
          },
        },
      ],
      needBorderAfterRow: true,
    };
    rows.push(timestampRow);

    return {
      rows,
    };
  }
}
