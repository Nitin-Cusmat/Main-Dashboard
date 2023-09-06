import React from "react";
import dynamic from "next/dynamic";
import { useRecoilValue } from "recoil";
import deviceState from "states/deviceState";
import { da, tr } from "date-fns/locale";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false
});

const RangeBarChart = ({ rangeData, title, compare }) => {
  const { screenWidth } = useRecoilValue(deviceState);

  const getData = rangeData => {
    return rangeData.map(item => {
      return {
        x: item.name,
        y: [0, item.decimalValue],
        goals: [
          {
            name: "Ideal Time",
            value: item.range[1],
            strokeColor: "#CD2F2A"
          }
        ]
      };
    });
  };

  // const data1 = rangeData.map(item => {
  //   return {
  //     x: item.name,
  //     y: item.range,
  //     goals: [
  //       {
  //         name: "actual",
  //         value: item.decimalValue,
  //         strokeColor: "#CD2F2A"
  //       }
  //     ]
  //   };
  // });

  const series = rangeData.map((d, index) => {
    return {
      name: compare ? "User " + (index + 1) : "Time (Sec)",
      data:
        typeof d === "object" && !Array.isArray(d) ? getData([d]) : getData(d)
    };
  });

  const options = {
    chart: {
      height: 450,
      type: "rangeBar",
      toolbar: {
        show: false
      }
    },
    dataLabels: {
      enabled: false,
      textAnchor: "start",
      offsetX: 65,
      style: {
        colors: ["#000000"], // set label color to black
        fontWeight: "500"
      }
    },
    plotOptions: {
      bar: {
        horizontal: true,
        barHeight: "80%"
      }
    },
    colors: ["#45b6fe"],
    xaxis: {
      type: "decimal",
      title: {
        text: "Time(seconds)"
      }
    },
    yaxis: {
      labels: {
        show: screenWidth > 500
      }
    },
    stroke: {
      width: 1
    },
    fill: {
      type: "solid",
      opacity: 0.6
    },
    legend: {
      show: true,
      showForSingleSeries: true,
      customLegendItems: ["Time (sec)", "Ideal Time"],
      position: "top",
      horizontalAlign: "right",
      markers: {
        fillColors: ["#45b6fe", "#CD2F2A"]
      }
    },
    tooltip: {
      custom: function ({ seriesIndex, dataPointIndex, w }) {
        const data = w.globals.initialSeries[seriesIndex].data[dataPointIndex];
        const idealTime =
          w.globals.initialSeries[seriesIndex].data[dataPointIndex]["goals"][0]
            .value;
        return `<div style="padding:5px; color:black;">${
          data.x + ": " + data.y[1]
        } sec${
          !isNaN(idealTime) ? `, Ideal Time: ${idealTime} sec` : ``
        }</div>`;
      }
    }
  };

  return (
    <div>
      <div className="p-5 pb-0 text-dark text-lg">{title}</div>
      <ReactApexChart
        options={options}
        series={series}
        type="rangeBar"
        height={
          title === "KPI with respect to its values and its ideal range"
            ? series.length * 100 + "px"
            : "400px"
        }
        width={
          screenWidth < 500 ? "200px" : screenWidth < 800 ? "400px" : "700px"
        }
      />
    </div>
  );
};

export default RangeBarChart;
