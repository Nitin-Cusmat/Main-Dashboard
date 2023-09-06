import {
  addDays,
  endOfDay,
  startOfDay,
  startOfMonth,
  endOfMonth,
  addMonths,
  startOfWeek,
  endOfWeek,
  isSameDay,
  differenceInCalendarDays,
  startOfYear,
  endOfYear
} from "date-fns";

export const defineds = {
  startOfWeek: startOfWeek(new Date()),
  endOfWeek: endOfWeek(new Date()),
  startOfLastWeek: startOfWeek(addDays(new Date(), -7)),
  endOfLastWeek: endOfWeek(addDays(new Date(), -7)),
  startOfToday: startOfDay(new Date()),
  endOfToday: endOfDay(new Date()),
  startOfYesterday: startOfDay(addDays(new Date(), -1)),
  endOfYesterday: endOfDay(addDays(new Date(), -1)),
  startOfMonth: startOfMonth(new Date()),
  endOfMonth: endOfMonth(new Date()),
  startOfLastMonth: startOfMonth(addMonths(new Date(), -1)),
  endOfLastMonth: endOfMonth(addMonths(new Date(), -1)),
  startOfThisYear: startOfYear(new Date()),
  endOfThisYear: endOfYear(new Date())
};

const staticRangeHandler = {
  range: {},
  isSelected(range) {
    const definedRange = this.range();
    return (
      isSameDay(range.startDate, definedRange.startDate) &&
      isSameDay(range.endDate, definedRange.endDate)
    );
  }
};

export const createStaticRanges = ranges => {
  return ranges.map(range => ({ ...staticRangeHandler, ...range }));
};

export const defaultStaticRanges = createStaticRanges([
  {
    label: "Last 7 Days",
    range: () => ({
      startDate: addDays(defineds.startOfToday, -7),
      endDate: addDays(defineds.endOfToday, -1),
      label: "last_7_days"
    })
  },
  {
    label: "Last 30 Days",
    range: () => ({
      startDate: addDays(defineds.startOfToday, -31),
      endDate: addDays(defineds.startOfToday, -1),
      label: "last_30_days"
    })
  },
  {
    label: "This Month",
    range: () => ({
      startDate: defineds.startOfMonth,
      endDate: defineds.endOfMonth,
      label: "this_month"
    })
  },
  {
    label: "Last Month",
    range: () => ({
      startDate: defineds.startOfLastMonth,
      endDate: defineds.endOfLastMonth,
      label: "last_month"
    })
  },
  {
    label: "Last 6 Months",
    range: () => ({
      startDate: addMonths(defineds.startOfMonth, -6),
      endDate: defineds.endOfLastMonth,
      label: "last_6_months"
    })
  },
  {
    label: "This Year",
    range: () => ({
      startDate: defineds.startOfThisYear,
      endDate: defineds.endOfThisYear,
      label: "this_year"
    })
  },
  {
    label: "Custom",
    range: () => ({
      startDate: new Date(),
      endDate: new Date(),
      label: "custom_range"
    })
  }
]);

export const defaultInputRanges = [
  {
    label: "days up to today",
    range(value) {
      return {
        startDate: addDays(
          defineds.startOfToday,
          (Math.max(Number(value), 1) - 1) * -1
        ),
        endDate: defineds.endOfToday
      };
    },
    getCurrentValue(range) {
      if (!isSameDay(range.endDate, defineds.endOfToday)) return "-";
      if (!range.startDate) return "∞";
      return differenceInCalendarDays(defineds.endOfToday, range.startDate) + 1;
    }
  },
  {
    label: "days starting today",
    range(value) {
      const today = new Date();
      return {
        startDate: today,
        endDate: addDays(today, Math.max(Number(value), 1) - 1)
      };
    },
    getCurrentValue(range) {
      if (!isSameDay(range.startDate, defineds.startOfToday)) return "-";
      if (!range.endDate) return "∞";
      return differenceInCalendarDays(range.endDate, defineds.startOfToday) + 1;
    }
  }
];
