import { format } from "date-fns";
import request from "./api";
import apiRoutes from "./api-routes";
import { HTTP_STATUSES } from "./constants";

const getFormattedTime = time => {
  time = parseInt(time);
  if (time < 60) {
    return `${time}s`;
  } else if (time >= 60 && time < 3600) {
    const minutes = Math.floor(time / 60);
    let seconds = time % 60;
    if (seconds % 1 !== 0) {
      seconds = seconds.toFixed(2);
    } else if (seconds == 0) {
      return `${minutes}m`;
    }
    return `${minutes}m ${seconds}s`;
  } else {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    let seconds = (time % 3600) % 60;
    if (seconds % 1 !== 0) {
      seconds = seconds.toFixed(2);
    }
    return `${hours}hr ${minutes}m`;
  }
};

const getDateFromEpoch = seconds => {
  const date = new Date(0);
  date.setUTCSeconds(seconds);
  return date;
};
const getSum = arrayToAdd => {
  return arrayToAdd.reduce((a, b) => {
    return a + b;
  });
};

const formatDateDisplay = (dateStr, defaultText) => {
  const date = new Date(dateStr);
  if (!date) return defaultText;
  return format(date, "dd-MM-yyyy");
};

const formatDayDisplay = (dateStr, defaultText) => {
  const date = new Date(dateStr);
  if (!date) return defaultText;
  return format(date, "LLLL-dd-yyyy");
};

const getTimeFromDate = timeDate => {
  const startTimeDate = new Date(timeDate);
  const time = startTimeDate.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });
  return time;
};

const formatTimeDay = timeDuration => {
  let duration = timeDuration;
  duration = duration.split(" ");
  if (duration.length > 1) {
    duration = [duration[0], duration[1].slice(0, 8)];
    duration = duration.join("d ");
  } else {
    duration = duration[0].slice(0, 8);
  }
  return duration;
};

const secondsToDuration = seconds => {
  let date = new Date(null);
  date.setSeconds(seconds);
  let hhmmssFormat = date.toISOString().substr(11, 8);
  return hhmmssFormat;
};
const formatTimeDisplay = (dateStr, defaultText) => {
  const date = new Date(dateStr);
  if (!date) return defaultText;
  return format(date, "HH:mm");
};
const deepMerge = (target, source) => {
  for (const key in source) {
    if (Array.isArray(source[key])) {
      target[key] = source[key].map((item, index) => {
        if (typeof item === "object" && item !== null) {
          if (!target[key] || !Array.isArray(target[key])) {
            target[key] = [];
          }
          if (!target[key][index]) {
            target[key][index] = {};
          }
          return deepMerge(target[key][index], item);
        } else {
          return item;
        }
      });
    } else if (typeof source[key] === "object" && source[key] !== null) {
      if (!target[key]) {
        target[key] = {};
      }
      deepMerge(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  }
  return target;
};

const getModuleAnalytics = async organization => {
  let filterString = `include_levels=true`;
  if (organization) {
    filterString += `&organization_id=${organization.id}`;
  }

  const res = await request(
    `${apiRoutes.organization.modules}?${filterString}`,
    {
      isAuthenticated: true
    }
  );
  if (res.status == HTTP_STATUSES.OK) {
    const resJson = await res.json();
    const tempModules = resJson.results.map(mod => {
      return mod.module;
    });
    return tempModules;
  }
};

const formatTime = (symbol, totalSeconds) => {
  const convertedDays = Math.floor(totalSeconds / (24 * 60 * 60));
  const remainingSeconds = totalSeconds % (24 * 60 * 60);
  const convertedHours = Math.floor(remainingSeconds / (60 * 60));
  const remainingSecondsAfterHours = remainingSeconds % (60 * 60);
  const convertedMinutes = Math.floor(remainingSecondsAfterHours / 60);
  const convertedSeconds = parseInt(remainingSecondsAfterHours % 60);

  const formattedHours = String(convertedHours).padStart(2, "0");
  const formattedMinutes = String(convertedMinutes).padStart(2, "0");
  const formattedSeconds = String(convertedSeconds).padStart(2, "0");

  let result = "";
  if (convertedDays > 0) {
    result = `${symbol}${convertedDays} Days, ${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
  } else {
    result = `${symbol}${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
  }
  return result;
};

const timeConverter = (time, addUnits = false) => {
  let totalSeconds;

  let symbol = "";
  if (time[0] === "+" || time[0] === "-") {
    symbol = time[0];
  }

  if (typeof time === "number") {
    totalSeconds = time;
  } else if (typeof time === "string") {
    if (time.includes(":")) {
      const [hoursStr, minutesStr, secondsStr] = time.split(":");
      const hours = parseInt(hoursStr);
      const minutes = parseInt(minutesStr);
      const seconds = parseInt(secondsStr);
      totalSeconds = hours * 60 * 60 + minutes * 60 + seconds;
    } else {
      totalSeconds = parseInt(time);
    }
  }
  if (addUnits) {
    const formattedTime = formatTime(symbol, totalSeconds);
    const daysAndTime = formattedTime.split(",");
    let time = "";
    let days = false;
    try {
      time = daysAndTime[1].trim();
      days = true;
    } catch {
      time = daysAndTime[0].trim();
    }
    const [hoursStr, minutesStr, secondsStr] = time.split(":");
    const hours = parseInt(hoursStr);
    const minutes = parseInt(minutesStr);
    const seconds = parseInt(secondsStr);
    totalSeconds = hours * 60 * 60 + minutes * 60 + seconds;
    let result = `${days ? daysAndTime[0].trim() : ""}${
      days ? ", " : ""
    }${getFormattedTime(totalSeconds)}`;
    return result;
  }
  return formatTime(symbol, totalSeconds);
};

export {
  getDateFromEpoch,
  getSum,
  deepMerge,
  formatDateDisplay,
  formatDayDisplay,
  formatTimeDisplay,
  getModuleAnalytics,
  secondsToDuration,
  getTimeFromDate,
  formatTimeDay,
  getFormattedTime,
  formatTime,
  timeConverter
};
