import ReactECharts from "echarts-for-react";
import React from "react";

const LoadingSpillageGraph = ({ data, labels, maxValue }) => {
  const option = {
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow"
      },
      formatter: params => {
        const loading = (parseFloat(params[0].value) / maxValue) * 100;
        const spillage =
          (parseFloat(params[1].value) / parseFloat(params[0].value)) * 100;

        return `Loading: ${loading
          .toFixed(2)
          .replace(/\.00$/, "")}%, Spillage: ${spillage
          .toFixed(2)
          .replace(/\.00$/, "")}%`;
      }
    },
    legend: {
      data: ["Loading", "Spillage"]
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      containLabel: true
    },
    xAxis: [
      {
        type: "value",
        max: maxValue.toFixed(2)
      }
    ],
    yAxis: [
      {
        type: "category",
        axisTick: {
          show: false
        },
        data: [...labels].reverse()
      }
    ],
    series: [
      {
        name: "Loading",
        type: "bar",
        stack: "Total",
        label: {
          show: true,
          formatter: function (params) {
            return params.value !== 0 ? params.value.toFixed(2) : "";
          }
        },
        emphasis: {
          focus: "series"
        },
        data: [...data[0].data].reverse()
      },
      {
        name: "Spillage",
        type: "bar",
        stack: "Total",
        label: {
          show: true,
          position: "left",
          formatter: function (params) {
            return params.value !== 0 ? params.value.toFixed(2) : "";
          }
        },
        emphasis: {
          focus: "series"
        },
        data: [...data[1].data].reverse().map(x => -x)
      }
    ]
  };
  // console.log('maxValue:', maxValue); // Check the actual value and type

  return (
    <ReactECharts
      style={{
        width: "100%",
        height: 500
      }}
      option={option}
      notMerge={true}
      lazyUpdate={true}
    />
  );
};

export default LoadingSpillageGraph;