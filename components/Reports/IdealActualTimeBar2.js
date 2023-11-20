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
      const labelSetting = {
        show: true,
        position: "right",
        offset: [10, 0],
        fontSize: 12,
        formatter: function (params) {
          return getFormattedTime(params.data);
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
            data: Object.values(idealTime).map(x => x.path),
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
                    data: actualTimeList
                    //   data: [
                    //     {
                    //       value: 17,
                    //       symbol: symbol || pathSymbols.train
                    //     },
                    //     {
                    //       value: 25,
                    //       symbol: symbol || pathSymbols.car
                    //     }
                    //   ]
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
                    data: actualTimeList2
                    //   data: [
                    //     {
                    //       value: 17,
                    //       symbol: symbol || pathSymbols.train
                    //     },
                    //     {
                    //       value: 25,
                    //       symbol: symbol || pathSymbols.car
                    //     }
                    //   ]
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
                    data: idealTimeList
                    //   data: [
                    //     {
                    //       value: 25,
                    //       symbol: symbol || pathSymbols.train
                    //     },
                    //     {
                    //       value: 35,
                    //       symbol: symbol || pathSymbols.car
                    //     }
                    //   ]
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
                    data: actualTimeList
                    //   data: [
                    //     {
                    //       value: 17,
                    //       symbol: symbol || pathSymbols.train
                    //     },
                    //     {
                    //       value: 25,
                    //       symbol: symbol || pathSymbols.car
                    //     }
                    //   ]
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
                    data: idealTimeList
                    //   data: [
                    //     {
                    //       value: 25,
                    //       symbol: symbol || pathSymbols.train
                    //     },
                    //     {
                    //       value: 35,
                    //       symbol: symbol || pathSymbols.car
                    //     }
                    //   ]
                  }
                ]
        };
      };

      const options = [
        makeOption("pictorialBar"),
        makeOption("bar"),
        makeOption("pictorialBar", "diamond")
      ];

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
