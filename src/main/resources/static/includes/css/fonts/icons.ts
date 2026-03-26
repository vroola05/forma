export type IconsId =
  | "x-lg"
  | "three-dots-vertical"
  | "repeat"
  | "record-circle"
  | "plus-lg"
  | "person-circle"
  | "lightning-charge"
  | "grip-vertical"
  | "fonts"
  | "file-plus"
  | "currency-euro"
  | "chevron-up"
  | "chevron-right"
  | "chevron-left"
  | "chevron-down"
  | "check-square"
  | "caret-right-fill"
  | "card-text"
  | "card-list"
  | "calendar2-date"
  | "arrows-angle-expand"
  | "arrows-angle-contract"
  | "9-square";

export type IconsKey =
  | "XLg"
  | "ThreeDotsVertical"
  | "Repeat"
  | "RecordCircle"
  | "PlusLg"
  | "PersonCircle"
  | "LightningCharge"
  | "GripVertical"
  | "Fonts"
  | "FilePlus"
  | "CurrencyEuro"
  | "ChevronUp"
  | "ChevronRight"
  | "ChevronLeft"
  | "ChevronDown"
  | "CheckSquare"
  | "CaretRightFill"
  | "CardText"
  | "CardList"
  | "Calendar2Date"
  | "ArrowsAngleExpand"
  | "ArrowsAngleContract"
  | "i9Square";

export enum Icons {
  XLg = "x-lg",
  ThreeDotsVertical = "three-dots-vertical",
  Repeat = "repeat",
  RecordCircle = "record-circle",
  PlusLg = "plus-lg",
  PersonCircle = "person-circle",
  LightningCharge = "lightning-charge",
  GripVertical = "grip-vertical",
  Fonts = "fonts",
  FilePlus = "file-plus",
  CurrencyEuro = "currency-euro",
  ChevronUp = "chevron-up",
  ChevronRight = "chevron-right",
  ChevronLeft = "chevron-left",
  ChevronDown = "chevron-down",
  CheckSquare = "check-square",
  CaretRightFill = "caret-right-fill",
  CardText = "card-text",
  CardList = "card-list",
  Calendar2Date = "calendar2-date",
  ArrowsAngleExpand = "arrows-angle-expand",
  ArrowsAngleContract = "arrows-angle-contract",
  i9Square = "9-square",
}

export const ICONS_CODEPOINTS: { [key in Icons]: string } = {
  [Icons.XLg]: "61697",
  [Icons.ThreeDotsVertical]: "61698",
  [Icons.Repeat]: "61699",
  [Icons.RecordCircle]: "61700",
  [Icons.PlusLg]: "61701",
  [Icons.PersonCircle]: "61702",
  [Icons.LightningCharge]: "61703",
  [Icons.GripVertical]: "61704",
  [Icons.Fonts]: "61705",
  [Icons.FilePlus]: "61706",
  [Icons.CurrencyEuro]: "61707",
  [Icons.ChevronUp]: "61708",
  [Icons.ChevronRight]: "61709",
  [Icons.ChevronLeft]: "61710",
  [Icons.ChevronDown]: "61711",
  [Icons.CheckSquare]: "61712",
  [Icons.CaretRightFill]: "61713",
  [Icons.CardText]: "61714",
  [Icons.CardList]: "61715",
  [Icons.Calendar2Date]: "61716",
  [Icons.ArrowsAngleExpand]: "61717",
  [Icons.ArrowsAngleContract]: "61718",
  [Icons.i9Square]: "61719",
};
