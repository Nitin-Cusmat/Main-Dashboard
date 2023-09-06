import { deepMerge } from "./utils";
import { CHART_COLORS } from "utils/constants";
export const getcChartColors = () => {
  return Object.keys(CHART_COLORS).map(key => CHART_COLORS[key]);
};
export const getPieChartOptions = ({ labels, options = {} }) => {
  const defaultOptions = {
    chart: {
      type: "pie",
      zoom: { enabled: false }
    },
    colors: getcChartColors(),
    labels: labels,
    legend: {
      position: "right",
      offsetY: "100%",
      labels: {
        usePointStyle: true
      }
    },
    responsive: [
      {
        breakpoint: 1280,
        options: {
          legend: {
            position: "bottom",
            horizontalAlign: "center",
            offsetY: 0
          }
        }
      }
    ]
  };
  return deepMerge(defaultOptions, options);
};

export const getLineChartOptions = ({ options = {}, labels }) => {
  const defaultOptions = {
    labels: labels,
    chart: {
      type: "line",
      toolbar: {
        show: false
      },
      zoom: { enabled: false }
    },
    colors: getcChartColors(),
    legend: {
      position: "top",
      horizontalAlign: "right",
      labels: {
        usePointStyle: true
      }
    },
    dataLabels: {
      enabled: false
    }
  };
  return deepMerge(defaultOptions, options);
};

export const getRadialBarChartOptions = ({ labels, options = {} }) => {
  const defaultOptions = {
    chart: { zoom: { enabled: false } },
    labels: labels,
    legend: {
      show: true,
      position: "right",
      offsetY: "100%",
      onItemClick: {
        toggleDataSeries: true
      },
      onItemHover: {
        highlightDataSeries: true
      }
    },
    responsive: [
      {
        breakpoint: 1280,
        options: {
          legend: {
            position: "bottom",
            offsetY: 0,
            horizontalAlign: "center"
          }
        }
      }
    ],
    colors: getcChartColors()
  };
  return deepMerge(defaultOptions, options);
};



export const getBarChartOptions = ({ options = {} }) => {
  const defaultOptions = {
    plotOptions: {
      bar: {
        columnWidth: "30px"
      }
    },
    chart: {
      type: "bar",
      toolbar: {
        show: false
      },
      zoom: { enabled: false }
    },
    colors: getcChartColors(),
    dataLabels: {
      enabled: false
    },
    fill: {
      opacity: 1
    },
    grid: {
      show: false
    }
    // tooltip: { theme: "dark" }
  };
  return deepMerge(defaultOptions, options);
};
export const getAreaChartOptions = ({ options = {} }) => {
  const defaultOptions = {
    chart: {
      type: "area",
      toolbar: {
        show: false
      }
    },
    colors: getcChartColors(),
    dataLabels: {
      enabled: false
    },
    stroke: {
      curve: "smooth"
    }
  };
  return deepMerge(defaultOptions, options);
};
export const getRadarChartOptions = ({ options = {}, labels }) => {
  const defaultOptions = {
    chart: {
      type: "radar",
      toolbar: {
        show: false
      }
    },
    labels,
    colors: getcChartColors(),
    responsive: [
      {
        breakpoint: 1280,
        options: {
          legend: {
            position: "bottom",
            horizontalAlign: "center",
            offsetY: 0
          }
        }
      }
    ]
  };
  return deepMerge(defaultOptions, options);
};
