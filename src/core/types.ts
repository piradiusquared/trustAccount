export type Cents = number;
export type IsoDate = string;

export interface DatePeriod {
  startDate: IsoDate;
  endDateExclusive: IsoDate;
}
