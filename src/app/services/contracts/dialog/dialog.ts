import { DialogCloseResultType } from "../enum/DialogCloseResultType";

export interface DialogCloseResult {
  type: DialogCloseResultType; // type of dialog which is opened
  data: any; // dynamic data dialog has send
}

export interface InfoDialogContext {
  rows: InfoDialogRow[];
}

export interface InfoDialogRow {
  elements: InfoDialogElement[];
  rowStyle?: any; // [ngClass] like json
  needBorderAfterRow: boolean;
}

export interface InfoDialogElement {
  type: InfoDialogElementType;
  text?: string;
  textDivStyle?: any; // [ngClass] like json
  textStyle?: any; // [ngClass] like json
  isIconButton?: boolean;
  buttonIcon?: string;
  isSvgButton?: boolean;
  buttonColor?: string; // primary, accent or warn
  buttonText?: string;
  icon?: string;
  isSvgIcon?: boolean;
}

export enum InfoDialogElementType {
  ICON = "icon",
  TEXT = "text",
  BUTTON = "button",
}
