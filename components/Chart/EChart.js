import React from "react";
import ReactECharts from "echarts-for-react";
import { deepMerge } from "utils/utils";
import { CHART_COLORS } from "utils/constants";

const EChart = ({ options }) => {
  const getChartOptions = () => {
    const defaultOptions = {
      title: {
        text: "",
        left: ""
      },
      tooltip: {
        trigger: "item"
      },
      series: [
        {
          type: "pie",
          radius: "50%",
          label: {
            show: true
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: "rgba(0, 0, 0, 0.5)"
            }
          }
        }
      ],
      color: Object.values(CHART_COLORS)
    };
    return deepMerge(defaultOptions, options);
  };
  return (
    <ReactECharts
      style={{
        height: "100%",
        width: "100%"
      }}
      option={getChartOptions()}
      notMerge={true}
      lazyUpdate={true}
    />
  );
};

export default EChart;
