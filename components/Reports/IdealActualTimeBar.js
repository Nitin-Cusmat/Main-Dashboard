import Chart from "components/Chart/Chart";
import React from "react";
import { CHART_COLORS, CHART_TYPES } from "utils/constants";
import { getFormattedTime, secondsToDuration } from "utils/utils";

const IdealActualTimeBar = ({
  idealTime,
  actualPath,
  actualPath2,
  compare
}) => {
  const idealTimeObj = {};
  idealTime.forEach(e => {
    idealTimeObj[e.path] = e.timeTaken;
  });
  let labelsList = Object.keys(idealTimeObj).map(key => key.toLowerCase());
  let idealTimeList = Object.values(idealTimeObj);
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

  if (
    actualTimeList &&
    actualTimeList.length > 0 &&
    idealTimeList &&
    idealTimeList.length > 0 &&
    labelsList &&
    labelsList.length > 0
  )
    return (
      <div className="text-dark rounded border p-4 col-start-1 col-end-3 mt-8">
        <div className="text-dark">Driving performance</div>
        <Chart
          type={CHART_TYPES.BAR}
          series={
            compare && actualTimeList2
              ? [
                  {
                    name: "Ideal Time",
                    data: idealTimeList
                  },
                  { name: "Actual time User 1", data: actualTimeList },
                  { name: "Actual time User 2", data: actualTimeList2 }
                ]
              : [
                  { name: "Ideal time", data: idealTimeList },
                  {
                    name: "Actual time",
                    data: actualTimeList
                  }
                ]
          }
          options={{
            responsive: [
              {
                breakpoint: 480,
                options: {
                  chart: {
                    textAnchor: "start",
                    offsetX: -20,
                    width: "100%",
                    height: 350,
                    style: {
                      colors: ["#000000"], // set label color to black
                      fontWeight: "500"
                    }
                  },
                  plotOptions: {
                    bar: {
                      columnWidth: "70%"
                    }
                  },
                  dataLabels: {
                    enabled: false
                  },
                  legend: {
                    position: "bottom",
                    // horizontalAlign: "center",
                    markers: {
                      width: 6,
                      height: 6
                    }
                  }
                }
              }
            ],
            legend: {
              position: "top",
              horizontalAlign: "right"
            },
            grid: {
              show: true,
              xaxis: {
                lines: {
                  show: false
                }
              },
              yaxis: {
                lines: {
                  show: true
                }
              }
            },
            xaxis: {
              categories: labelsList,
              title: { text: "Time (secs)" },
              labels: {
                formatter: value => {
                  return parseFloat(value) > 10000
                    ? (parseFloat(value) / 1000).toFixed(0).toString() + "k"
                    : parseFloat(value).toFixed(0);
                }
              }
            },
            yaxis: {
              title: { text: "Paths" }
            },
            tooltip: {
              y: {
                formatter: value => {
                  return getFormattedTime(value);
                }
              }
            },
            colors: Object.values(CHART_COLORS),
            dataLabels: {
              enabled: true,
              textAnchor: "start",
              offsetX: 75,
              style: {
                colors: ["#000000"], // set label color to black
                fontWeight: "500"
              },
              formatter: value => {
                return getFormattedTime(value);
              }
            },
            plotOptions: {
              bar: {
                horizontal: true,
                columnWidth: "70%",
                barHeight:
                  idealTimeList.length > 1 ? (compare ? "80%" : "50%") : "10%",
                endingShape: "rounded",
                dataLabels: {
                  position: "top"
                }
              }
            }
          }}
        />
        <div className="flex justify-around border p-2">
          {compare ? (
            <>
              <div>
                Total Actual Time User 1:{" "}
                <span className="text-primary">
                  {secondsToDuration(totalTimeCalculator(actualTimeList))}
                </span>
              </div>
              <div>
                Total Actual Time User 2:{" "}
                <span className="text-primary">
                  {secondsToDuration(totalTimeCalculator(actualTimeList2))}
                </span>
              </div>
            </>
          ) : (
            <div>
              Total Actual Time:{" "}
              <span className="text-primary">
                {secondsToDuration(totalTimeCalculator(actualTimeList))}
              </span>
            </div>
          )}

          <div>
            Total Ideal Time:{" "}
            <span className="font-bold">
              {secondsToDuration(totalTimeCalculator(idealTimeList))}
            </span>
          </div>
        </div>
      </div>
    );
};

export default IdealActualTimeBar;
