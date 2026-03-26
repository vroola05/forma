export type IconsId =
  | "x-lg"
  | "three-dots-vertical"
  | "plus-lg"
  | "person-circle"
  | "lightning-charge"
  | "grip-vertical"
  | "file-plus"
  | "chevron-up"
  | "chevron-right"
  | "chevron-left"
  | "chevron-down"
  | "caret-right-fill"
  | "arrows-angle-expand"
  | "arrows-angle-contract";

export type IconsKey =
  | "XLg"
  | "ThreeDotsVertical"
  | "PlusLg"
  | "PersonCircle"
  | "LightningCharge"
  | "GripVertical"
  | "FilePlus"
  | "ChevronUp"
  | "ChevronRight"
  | "ChevronLeft"
  | "ChevronDown"
  | "CaretRightFill"
  | "ArrowsAngleExpand"
  | "ArrowsAngleContract";

export enum Icons {
  XLg = "x-lg",
  ThreeDotsVertical = "three-dots-vertical",
  PlusLg = "plus-lg",
  PersonCircle = "person-circle",
  LightningCharge = "lightning-charge",
  GripVertical = "grip-vertical",
  FilePlus = "file-plus",
  ChevronUp = "chevron-up",
  ChevronRight = "chevron-right",
  ChevronLeft = "chevron-left",
  ChevronDown = "chevron-down",
  CaretRightFill = "caret-right-fill",
  ArrowsAngleExpand = "arrows-angle-expand",
  ArrowsAngleContract = "arrows-angle-contract",
}

export const ICONS_CODEPOINTS: { [key in Icons]: string } = {
  [Icons.XLg]: "61697",
  [Icons.ThreeDotsVertical]: "61698",
  [Icons.PlusLg]: "61699",
  [Icons.PersonCircle]: "61700",
  [Icons.LightningCharge]: "61701",
  [Icons.GripVertical]: "61702",
  [Icons.FilePlus]: "61703",
  [Icons.ChevronUp]: "61704",
  [Icons.ChevronRight]: "61705",
  [Icons.ChevronLeft]: "61706",
  [Icons.ChevronDown]: "61707",
  [Icons.CaretRightFill]: "61708",
  [Icons.ArrowsAngleExpand]: "61709",
  [Icons.ArrowsAngleContract]: "61710",
};
