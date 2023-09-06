import dynamic from "next/dynamic";
import React from "react";
// import Chart from "react-google-charts";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false
});
const GaugeBox = ({ value }) => {
  const series = [value];
  const options = {
    tooltip: {
      enabled: true,
      x: {
        show: true,
        formatter: undefined
      },
      y: {
        formatter: value => value + "%",
        title: {
          formatter: seriesName => "Value"
        }
      },
      z: {
        formatter: undefined,
        title: "Size: "
      }
    },
    chart: {
      height: 150,
      type: "radialBar",
      offsetY: -10
    },
    plotOptions: {
      radialBar: {
        startAngle: -135,
        endAngle: 135,
        dataLabels: {
          name: {
            fontSize: "8px",
            color: "#5255B9",
            offsetY: 0
          },
          value: {
            offsetY: 20,
            fontSize: "12px",
            color: "#5AB281",
            formatter: function (val) {
              return val + "%";
            }
          }
        }
      }
    },
    fill: {
      type: "gradient",
      gradient: {
        shade: "dark",
        shadeIntensity: 0.2,
        inverseColors: false,
        opacityFrom: 0.8,
        opacityTo: 1,
        stops: [0, 50, 65, 91]
      }
    },
    stroke: {
      dashArray: 2
    },
    labels: ["Completion rate"]
  };

  return (
    <ReactApexChart
      options={options}
      series={series}
      type="radialBar"
      height={180}
      width={110}
    />
  );
};

export default GaugeBox;
