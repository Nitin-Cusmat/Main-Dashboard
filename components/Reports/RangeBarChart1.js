import React from "react";
import dynamic from "next/dynamic";
import { useRecoilValue } from "recoil";
import deviceState from "states/deviceState";
import { da, tr } from "date-fns/locale";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false
});

const extractNumericalValue = (valueWithUnit) => {
  if (typeof valueWithUnit === 'number') return valueWithUnit;
  if (typeof valueWithUnit === 'string' && !isNaN(valueWithUnit)) return parseFloat(valueWithUnit);
  if (typeof valueWithUnit === 'string') {
    const matchedValue = valueWithUnit.match(/\d+(\.\d+)?/);
    return matchedValue ? parseFloat(matchedValue[0]) : 0;
  }
  
  return 0;
};

const RangeBarChart1= ({ rangeData, title, compare, showIdealTime }) => {
  const { screenWidth } = useRecoilValue(deviceState);

  const getData = rangeData => {
    return rangeData.map(item => {
      let dataObj = {
        x: item.name,
        y: [0, item.decimalValue],
      };
      if (showIdealTime && item["Ideal time"]) {
        dataObj.goals = [
          {
            name: "Ideal Time",
            value: extractNumericalValue(item["Ideal time"]),
            strokeColor: "#CD2F2A"
          }
        ];
      }
      return dataObj;
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
      data: typeof d === "object" && !Array.isArray(d) ? getData([d]) : getData(d)
    };
  });

  const options = {
    chart: {
      height: 450,
      type: "rangeBar",
      toolbar: {
        show: false
      },
      background: "#FFFFFF", // Set the background color of the chart
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
        // horizontal: true,
        // barHeight: "80%"
        horizontal: true,
        barHeight: 50, // Adjust the bar height as needed
        distributed: true, // Enable to evenly distribute bars across the available width
        rangeBarGroupRows: true, // Enable to group bars by row
        dataLabels: {
          position: "bottom"
        },
        colors: {
          ranges: [{
           
            color: "#9acef5" // Color for the entire bar
          }],
          backgroundBarColors: ["#f0f0f0"], // Set background color for bars
          backgroundBarOpacity: 0.5 // Adjust background color opacity
        }
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
      customLegendItems: showIdealTime ? ["Time (sec)", "Ideal Time"] : ["Time (sec)"],
      position: "top",
      horizontalAlign: "right",
      markers: {
        fillColors: showIdealTime ? ["#45b6fe", "#CD2F2A"] : ["#45b6fe"]
      }
    },
    tooltip: {
      custom: function ({ seriesIndex, dataPointIndex, w }) {
          const data = w.globals.initialSeries[seriesIndex].data[dataPointIndex];
          let idealTimeText = "";
          
          if (showIdealTime && data.goals && data.goals.length > 0 && !isNaN(data.goals[0].value)) {
              idealTimeText = `, Ideal Time: ${extractNumericalValue(data.goals[0].value)} sec`;
          }
          
          return `<div class="apexcharts_tooltip" style="padding:5px; color:black;">${data.x + ": " + data.y[1]} sec${idealTimeText}</div>`;
      }
  }
  
  };


  return (
    <div style={{ marginTop: '40px' }}> {/* Add this style */}
    <div className="p-5 pb-0 text-dark text-lg bg-blue-100" 
         style={title === "KPI with respect to its values and its ideal range" ? { backgroundColor: 'rgb(219 234 254)' } : {}}>
      {title}
    </div>
      <ReactApexChart
        options={options}
        series={series}
        type="rangeBar"
        height={
          title === "KPI with respect to its values and its ideal range"
            ? series.length * 90 + "px"
            : "400px"
        }
        width={
          screenWidth < 300 ? "200px" : screenWidth < 800 ? "1400px" : "1150px"        }
      />
    </div>
  );
};

export default RangeBarChart1;