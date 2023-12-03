import ReactECharts from "echarts-for-react";
import React, { useEffect, useRef } from "react";
import { getFormattedTime } from "utils/utils";

const IdealActualTimeBar2 = ({
  idealTime,
  actualPath,
  compare,
  actualPath2
}) => {
  const chartRef = useRef(null);
  const idealTimeObj = {};
  idealTime.forEach(e => {
    idealTimeObj[e.path] = e.timeTaken;
  });
  let labelsList = Object.keys(idealTimeObj).map(key => key.toLowerCase());
  let idealTimeList = Object.values(idealTimeObj);
  const hasNoIdealTime =
    !idealTimeList.length || idealTimeList.every(time => time === 0);

  if (hasNoIdealTime) {
    idealTimeList = [];
  }

  let actualTimeList = labelsList.map(path => {
    try {
      return (
        actualPath[path][actualPath[path].length - 1].time -
        actualPath[path][0].time
      );
    } catch {
      return 0;
    }
  });

  const totalTimeCalculator = list => {
    return list.reduce(
      (accumulator, currentValue) => accumulator + currentValue,
      0
    );
  };

  let actualTimeList2 =
    compare && actualPath2
      ? labelsList.map(path => {
          try {
            return (
              actualPath2[path][actualPath2[path].length - 1].time -
              actualPath2[path][0].time
            );
          } catch {
            return 0;
          }
        })
      : null;

  useEffect(() => {
    if (
      actualTimeList &&
      actualTimeList.length > 0 &&
      idealTimeList &&
      idealTimeList.length > 0 &&
      labelsList &&
      labelsList.length > 0
    ) {
      const pathSymbols = {
        truck:
          "path://M224.975,126.109l13.365-33.421h52.974l-44.138-52.966l-61.793-8.828l-26.483,26.483l-26.483,17.655 l-52.966-8.828L52.97,136.826h156.178C216.113,136.826,222.389,132.58,224.975,126.109 M506.605,219.17l-76.712-84.383c-3.928-4.317-9.498-6.788-15.342-6.788h-81.311 c-8.527,0-15.448,6.921-15.448,15.448v196.414H26.482v75.767c0,6.912,5.597,12.509,12.509,12.509h13.974 c0-29.246,23.711-52.966,52.966-52.966s52.966,23.72,52.966,52.966h158.897h44.138c0-29.246,23.711-52.966,52.966-52.966 c29.255,0,52.966,23.72,52.966,52.966h31.629c6.912,0,12.509-5.597,12.509-12.509V233.127 C511.999,227.963,510.075,222.993,506.605,219.17 M256,339.864H26.483L0,225.105l35.31-88.276h173.833c6.974,0,13.241-4.246,15.828-10.717 l13.374-33.421h52.965L256,339.864 M368.275,269.243h143.722v-36.122c0-5.155-1.924-10.134-5.394-13.948l-50.776-55.861h-87.552 c-3.505,0-6.347,2.842-6.347,6.347v93.237C361.928,266.401,364.771,269.243,368.275,269.243 M467.862,428.14c0,29.255-23.711,52.966-52.966,52.966s-52.966-23.711-52.966-52.966 c0-29.255,23.711-52.966,52.966-52.966S467.862,398.885,467.862,428.14 M158.897,428.14c0,29.255-23.711,52.966-52.966,52.966s-52.966-23.711-52.966-52.966 c0-29.255,23.711-52.966,52.966-52.966S158.897,398.885,158.897,428.14 M459.034,339.864H512v-17.655h-52.966V339.864z M123.586,428.14c0,9.754-7.901,17.655-17.655,17.655 s-17.655-7.901-17.655-17.655 c0-9.754,7.901-17.655,17.655-17.655S123.586,418.385,123.586,428.14 M432.552,428.14c0,9.754-7.901,17.655-17.655,17.655 s-17.655-7.901-17.655-17.655 c0-9.754,7.901-17.655,17.655-17.655S432.552,418.385,432.552,428.14 M353.103,110.347h-70.621 c-4.882,0-8.828-3.946-8.828-8.828c0-4.882,3.946-8.828,8.828-8.828h70.621c4.882,0,8.828,3.946,8.828,8.828 C361.931,106.401,357.985,110.347,353.103,110.347 M3.531,216.278h102.4c4.882,0,8.828-3.946,8.828-8.828s-3.946-8.828-8.828-8.828H10.593L3.531,216.278z M8.149,260.416H150.07 c4.882,0,8.828-3.946,8.828-8.828c0-4.882-3.946-8.828-8.828-8.828H4.07L8.149,260.416"
      };
      const labelSetting = {
        show: true,
        position: "right",
        offset: [10, 0],
        fontSize: 12,
        formatter: function (params) {
          return getFormattedTime(params.data.value);
        }
      };

      const makeOption = (type, symbol) => {
        return {
          title: {
            text: "Driving Performance"
          },
          legend: {
            data: compare
              ? ["Actual Time User 1", "Actual Time User 2", "Ideal Time"]
              : ["Actual Time", "Ideal Time"]
          },
          tooltip: {
            trigger: "axis",
            axisPointer: {
              type: "shadow"
            },
            formatter: params => {
              if (compare) {
                const actualTime1 = params.find(
                  item => item.seriesName === "Actual Time User 1"
                );
                const actualTime2 = params.find(
                  item => item.seriesName === "Actual Time User 2"
                );
                const idealTime = params.find(
                  item => item.seriesName === "Ideal Time"
                );

                if (actualTime1 && actualTime2 && idealTime) {
                  const actualValue1 = actualTime1.value;
                  const actualValue2 = actualTime2.value;
                  const idealValue = idealTime.value;

                  return `Actual Time User 1 - ${getFormattedTime(
                    actualValue1
                  )}, Actual Time User 2 - ${getFormattedTime(
                    actualValue2
                  )}, Ideal Time - ${getFormattedTime(idealValue)}`;
                }

                return "";
              } else {
                const actualTime = params.find(
                  item => item.seriesName === "Actual Time"
                );
                const idealTime = params.find(
                  item => item.seriesName === "Ideal Time"
                );

                if (actualTime && idealTime) {
                  const actualValue = actualTime.value;
                  const idealValue = idealTime.value;

                  return `Actual Time - ${getFormattedTime(
                    actualValue
                  )}, Ideal Time - ${getFormattedTime(idealValue)}`;
                }

                return "";
              }
            }
          },
          grid: {
            containLabel: true,
            left: 20
          },
          yAxis: {
            data: Object.keys(actualPath).filter(path => path !== "path-1"),
            inverse: true,
            axisLine: { show: false },
            axisTick: { show: false },
            axisLabel: {
              margin: 30,
              fontSize: 14
            },
            axisPointer: {
              label: {
                show: true,
                margin: 30
              }
            }
          },
          xAxis: {
            splitLine: { show: false },
            axisLabel: { show: false },
            axisTick: { show: false },
            axisLine: { show: false }
          },
          animationDurationUpdate: 200,
          series:
            compare && actualPath2
              ? [
                  {
                    name: "Actual Time User 1",
                    id: "bar1",
                    type: type,
                    label: labelSetting,
                    symbolRepeat: true,
                    symbolSize: ["80%", "60%"],
                    barCategoryGap: "40%",
                    universalTransition: {
                      enabled: true,
                      delay: function (idx, total) {
                        return (idx / total) * 1000;
                      }
                    },
                    data: actualTimeList.map(value => ({
                      value,
                      symbol: pathSymbols.truck
                    }))
                  },
                  {
                    name: "Actual Time User 2",
                    id: "bar2",
                    type: type,
                    label: labelSetting,
                    symbolRepeat: true,
                    symbolSize: ["80%", "60%"],
                    barCategoryGap: "40%",
                    universalTransition: {
                      enabled: true,
                      delay: function (idx, total) {
                        return (idx / total) * 1000;
                      }
                    },
                    data: actualTimeList2.map(value => ({
                      value,
                      symbol: pathSymbols.truck
                    }))
                  },
                  {
                    name: "Ideal Time",
                    id: "bar3",
                    type: type,
                    barGap: "10%",
                    label: labelSetting,
                    symbolRepeat: true,
                    symbolSize: ["80%", "60%"],
                    universalTransition: {
                      enabled: true,
                      delay: function (idx, total) {
                        return (idx / total) * 1000;
                      }
                    },
                    data: idealTimeList.map(value => ({
                      value,
                      symbol: pathSymbols.truck
                    }))
                  }
                ]
              : [
                  {
                    name: "Actual Time",
                    id: "bar1",
                    type: type,
                    label: labelSetting,
                    symbolRepeat: true,
                    symbolSize: ["80%", "60%"],
                    barCategoryGap: "40%",
                    universalTransition: {
                      enabled: true,
                      delay: function (idx, total) {
                        return (idx / total) * 1000;
                      }
                    },
                    data: actualTimeList.map(value => ({
                      value,
                      symbol: pathSymbols.truck
                    }))
                  },
                  {
                    name: "Ideal Time",
                    id: "bar2",
                    type: type,
                    barGap: "10%",
                    label: labelSetting,
                    symbolRepeat: true,
                    symbolSize: ["80%", "60%"],
                    universalTransition: {
                      enabled: true,
                      delay: function (idx, total) {
                        return (idx / total) * 1000;
                      }
                    },
                    data: idealTimeList.map(value => ({
                      value,
                      symbol: pathSymbols.truck
                    }))
                  }
                ]
        };
      };

      const options = [makeOption("pictorialBar"), makeOption("bar")];

      var optionIndex = 0;

      chartRef.current.getEchartsInstance().setOption(options[optionIndex]);

      const intervalId = setInterval(() => {
        optionIndex = (optionIndex + 1) % options.length;
        chartRef.current.getEchartsInstance().setOption(options[optionIndex]);
      }, 2500);

      return () => clearInterval(intervalId);
    }
  }, [actualTimeList, actualTimeList2, idealTimeList, labelsList]);

  return (
    <div className="mt-4">
      <ReactECharts
        ref={chartRef}
        option={{}}
        style={{ width: "100%", height: "400px" }}
      />
    </div>
  );
};

export default IdealActualTimeBar2;
