import React from "react";
import ReactECharts from "echarts-for-react";

const Thriveni = ({ attemptData }) => {
  let brakeData = [];
  let accelerationData = [];
  let timeData = [];
  let rpmData = [];
  const intervals = [];
  const pieces = [];

  if (attemptData) {
    const {
      path: { actual_path }
    } = attemptData;

    const filteredData = Object.keys(actual_path)
      .map(key => actual_path[key])
      .flat();

    brakeData = filteredData.map(item => item.brake);
    accelerationData = filteredData.map(item => item.acceleration);
    timeData = filteredData.map(item => item.time);
    rpmData = filteredData.map(item => item.rpm);
    let startInterval = null;

    for (let i = 0; i < filteredData.length; i++) {
      const point = filteredData[i];
      if (point.loadingstatus === "1") {
        if (startInterval === null) {
          startInterval = point.time;
        }
        pieces.push({
          lte: i + 1,
          color: "red"
        });
      } else {
        if (startInterval !== null) {
          intervals.push([
            { name: "Loading", xAxis: startInterval },
            { name: "Loading", xAxis: point.time }
          ]);
          startInterval = null;
        }
        pieces.push({
          lte: i + 1,
          color: "green"
        });
      }
    }
    if (startInterval !== null) {
      intervals.push([
        { name: "Loading", xAxis: startInterval },
        { name: "Loading", xAxis: filteredData[filteredData.length - 1].time }
      ]);
    }
  }

  const vehicleChartOptions = {
    title: {
      text: "Vehicle Analytics",
      subtext: "Speed vs time graph",
      left: "center"
    },
    tooltip: {
      trigger: "axis",
      axisPointer: {
        animation: false
      }
    },
    legend: {
      data: ["Acceleration", "Brake"],
      left: 10
    },
    toolbox: {
      feature: {
        dataZoom: {
          yAxisIndex: "none"
        },
        restore: {},
        saveAsImage: {}
      }
    },
    axisPointer: {
      link: { xAxisIndex: "all" }
    },
    dataZoom: [
      {
        show: true,
        realtime: true,
        xAxisIndex: [0, 1]
      },
      {
        type: "inside",
        realtime: true,
        xAxisIndex: [0, 1]
      }
    ],
    grid: [
      {
        left: 50,
        right: 50,
        height: "35%"
      },
      {
        left: 50,
        right: 50,
        top: "55%",
        height: "35%"
      }
    ],
    xAxis: [
      {
        type: "category",
        boundaryGap: false,
        axisLine: { onZero: true },
        data: timeData
      },
      {
        gridIndex: 1,
        type: "category",
        boundaryGap: false,
        axisLine: { onZero: true },
        data: timeData,
        position: "top"
      }
    ],
    yAxis: [
      {
        name: "Acceleration(m^3/s)",
        type: "value",
        max: 1
      },
      {
        gridIndex: 1,
        name: "Brake(mm)",
        type: "value",
        inverse: true
      }
    ],
    series: [
      {
        name: "Acceleration",
        type: "line",
        symbolSize: 8,
        hoverAnimation: false,
        data: accelerationData
      },
      {
        name: "Brake",
        type: "line",
        xAxisIndex: 1,
        yAxisIndex: 1,
        symbolSize: 8,
        hoverAnimation: false,
        data: brakeData
      }
    ]
  };

  const rpmChartOptions = {
    title: {
      text: "Rpm Vs Time During Loading"
    },
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "cross"
      }
    },
    toolbox: {
      show: true,
      feature: {
        saveAsImage: {}
      }
    },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: timeData,
      axisLabel: {
        formatter: function (value) {
          return parseInt(value);
        }
      }
    },
    yAxis: {
      type: "value",
      axisLabel: {
        formatter: "{value} "
      },
      axisPointer: {
        snap: true
      }
    },
    visualMap: {
      show: false,
      dimension: 0,
      pieces: pieces
    },
    series: [
      {
        name: "Rpm Vs Time During Loading",
        type: "line",
        smooth: true,
        data: rpmData,
        markArea: {
          itemStyle: {
            color: "rgba(255, 173, 177, 0.4)"
          },
          data: intervals
        }
      }
    ]
  };

  return (
    <>
      <ReactECharts
        style={{
          height: "500px"
        }}
        option={vehicleChartOptions}
        notMerge={true}
        lazyUpdate={true}
      />

      <ReactECharts
        style={{
          height: "500px"
        }}
        option={rpmChartOptions}
        notMerge={true}
        lazyUpdate={true}
      />
    </>
  );
};

export default Thriveni;
