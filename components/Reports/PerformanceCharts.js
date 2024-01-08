import React from "react";
import Chart from "components/Chart/Chart";
import { CHART_COLORS, CHART_TYPES } from "utils/constants";
import { Disclosure } from "components/Disclosure";
import { timeConverter } from "utils/utils";
import EChart from "components/Chart/EChart";
import { object } from "prop-types";

const PerformanceCharts = ({ data }) => {
  const calculateSums = series => {
    const sums = series.reduce(
      (acc, data) => {
        acc.totalAttempts += data.attempts_count || 0;
        acc.totalResult.good += data.result.good || 0;
        acc.totalResult.average += data.result.average || 0;
        acc.totalResult.excellent += data.result.excellent || 0;
        return acc;
      },
      { totalAttempts: 0, totalResult: { good: 0, average: 0, excellent: 0 } }
    );

    return sums;
  };

  const calculateLevelResults = results => {
    const levelResults = {};

    results.forEach(result => {
      const levels = result.level_wise_result;

      Object.keys(levels).forEach(level => {
        if (!levelResults[level]) {
          levelResults[level] = {
            name: level,
            data: [0, 0, 0]
          };
        }

        levelResults[level].data[0] += levels[level].excellent;
        levelResults[level].data[1] += levels[level].good;
        levelResults[level].data[2] += levels[level].average;
      });
    });

    return Object.values(levelResults);
  };

  return (
    <div>
      {Object.entries(data).map(([name, series], index) => (
        <div key={index}>
          <Disclosure classname="mt-4" title={name} show={index === 0}>
            <div
              className={`flex flex-wrap ${
                Object.keys(series).length > 0 ? "mt-4" : "mt-0"
              }`}
            >
              {Object.keys(series).length > 0 ? (
                <>
                  <div className="w-full lg:w-1/2">
                    <Chart
                      type={CHART_TYPES.LINE}
                      height={300}
                      series={[
                        {
                          name: "Success Score",
                          data: series.map(item => item.success_score)
                        },
                        {
                          name: "Ideal Score",
                          data: series.map(item => item.ideal_score)
                        }
                      ]}
                      options={{
                        colors: Object.values(CHART_COLORS),
                        stroke: {
                          width: [4, 3, 5]
                        },
                        xaxis: {
                          categories: series.map(item => item.month_name),
                          title: {
                            text: "Success Rate"
                          }
                        },
                        yaxis: {
                          max: 100,
                          min: 0,
                          tickAmount: 5,
                          labels: {
                            formatter: function (value) {
                              return parseInt(value);
                            }
                          }
                        },
                        legend: {
                          position: "top",
                          horizontalAlign: "center",
                          markers: {
                            width: 20,
                            height: 5
                          }
                        },
                        tooltip: {
                          enabled: true,
                          shared: false,
                          custom: function ({
                            w,
                            seriesIndex,
                            dataPointIndex
                          }) {
                            if (seriesIndex === 0) {
                              const month =
                                w.globals.categoryLabels[dataPointIndex];
                              const value =
                                w.config.series[0].data[dataPointIndex];
                              const improvements = Math.max(
                                0,
                                w.config.series[1].data[dataPointIndex] - value
                              );

                              const tooltipContent = `
                          <div style="background-color: #DCDCDC; color: black; padding: 5px;">
                            ${month}
                          </div>
                          <div style="color: black; padding: 5px;">
                            Score: <b>${value}</b>
                          </div>
                          <div style="color: black; padding: 5px;">
                            Improvements: <span style="font-weight: bold; color: ${
                              improvements === 0 ? "green" : "red"
                            }">${improvements}</span>
                          </div>
                        `;

                              return tooltipContent;
                            } else {
                              const idealScore =
                                w.config.series[1].data[dataPointIndex];
                              return `<div style="padding: 5px;">
                          Ideal Score: <b>${idealScore}</b>
                        </div>`;
                            }
                          }
                        }
                      }}
                    />
                  </div>
                  <div className="w-full lg:w-1/2">
                    <Chart
                      type={CHART_TYPES.LINE}
                      height={300}
                      series={[
                        {
                          name: "Mistake Score",
                          data: series.map(item => ({
                            x: item.month_name,
                            y: item.mistake_score,
                            content: item.mistake_content
                          }))
                        },
                        {
                          name: "Ideal Mistake",
                          data: series.map(item => ({
                            x: item.month_name,
                            y: item.ideal_mistake
                          }))
                        }
                      ]}
                      options={{
                        colors: Object.values(CHART_COLORS),
                        stroke: {
                          width: [4, 3, 5]
                        },
                        xaxis: {
                          title: {
                            text: "Mistakes Rate"
                          }
                        },
                        yaxis: {
                          labels: {
                            formatter: function (value) {
                              return parseInt(value);
                            }
                          }
                        },
                        legend: {
                          position: "top",
                          horizontalAlign: "center",
                          markers: {
                            width: 20,
                            height: 5
                          }
                        },
                        tooltip: {
                          enabled: true,
                          shared: false,
                          custom: function ({
                            w,
                            seriesIndex,
                            dataPointIndex
                          }) {
                            if (seriesIndex === 0) {
                              const month =
                                w.config.series[seriesIndex].data[
                                  dataPointIndex
                                ].x;
                              const value =
                                w.config.series[seriesIndex].data[
                                  dataPointIndex
                                ].y;
                              const content =
                                w.config.series[seriesIndex].data[
                                  dataPointIndex
                                ].content;
                              const contentDiv = content
                                ? content.length > 1
                                  ? `
                              <div style="overflow-y: auto;">
                                ${content
                                  .map(
                                    line =>
                                      `<div style="white-space: pre-wrap;">${line}</div>`
                                  )
                                  .join("")}
                              </div>
                            `
                                  : `<div>${content[0]}</div>`
                                : "";
                              const tooltipContent = `
                            <div style="background-color: #DCDCDC; color: black; padding: 5px;">
                              ${month}
                            </div>
                            <div style="color: black; padding: 5px;">
                              Mistakes Count: <span style="font-weight: bold; color: ${
                                value <
                                w.config.series[1].data[dataPointIndex].y
                                  ? "green"
                                  : "red"
                              }">${value}</span>
                            </div>
                            <div style="color: black; padding: 5px; max-width: 450px;">
                                Mistakes: <b>${contentDiv}</b>
                            </div>
                          `;

                              return tooltipContent;
                            } else {
                              const idealMistake =
                                w.config.series[seriesIndex].data[
                                  dataPointIndex
                                ].y;
                              return `<div style="padding: 5px;">
                          Ideal Mistake: <b>${idealMistake}</b></div>`;
                            }
                          }
                        }
                      }}
                    />
                  </div>
                  <div className="w-full lg:w-1/2">
                    <Chart
                      type={CHART_TYPES.LINE}
                      height={300}
                      series={[
                        {
                          name: "Attempt Score",
                          data: series.map(item => ({
                            x: item.month_name,
                            y: item.attempts_count,
                            duration: item.duration
                          }))
                        }
                      ]}
                      options={{
                        stroke: {
                          width: [4, 3, 5]
                        },
                        xaxis: {
                          title: {
                            text: "Average Module Completion Time"
                          }
                        },
                        yaxis: {
                          title: {
                            text: "Total Attempts"
                          },
                          labels: {
                            formatter: function (value) {
                              return parseInt(value);
                            }
                          }
                        },
                        tooltip: {
                          enabled: true,
                          shared: false,
                          custom: function ({
                            w,
                            seriesIndex,
                            dataPointIndex
                          }) {
                            const month =
                              w.config.series[seriesIndex].data[dataPointIndex]
                                .x;
                            const duration = timeConverter(
                              w.config.series[seriesIndex].data[dataPointIndex]
                                .duration,
                              true
                            );
                            const tooltipContent = `
                        <div style="background-color: #DCDCDC; color: black; padding: 5px;">
                        ${month}
                        </div>
                        <div style="color: black; padding: 5px;">
                        Duration: <b>${duration}</b>
                        </div>`;
                            return tooltipContent;
                          }
                        }
                      }}
                    />
                  </div>
                  <div className="w-full h-[300px] lg:w-1/2">
                    <EChart
                      options={{
                        tooltip: {
                          formatter: params => {
                            return `Total Attempts: ${
                              calculateSums(series).totalAttempts
                            }`;
                          }
                        },
                        series: [
                          {
                            type: "gauge",
                            radius: "90%",
                            startAngle: 90,
                            endAngle: -270,
                            pointer: {
                              show: false
                            },
                            progress: {
                              show: true,
                              overlap: false,
                              roundCap: true,
                              clip: false,
                              itemStyle: {
                                borderWidth: 1,
                                borderColor: "#464646"
                              }
                            },
                            axisLine: {
                              lineStyle: {
                                width: 40
                              }
                            },
                            splitLine: {
                              show: false,
                              distance: 0,
                              length: 10
                            },
                            axisTick: {
                              show: false
                            },
                            axisLabel: {
                              show: false,
                              distance: 50
                            },
                            data: [
                              {
                                value: (
                                  (calculateSums(series).totalResult[
                                    "excellent"
                                  ] /
                                    calculateSums(series).totalAttempts) *
                                  100
                                ).toFixed(2),
                                name: "Excellent",
                                title: {
                                  offsetCenter: ["0%", "-40%"]
                                },
                                detail: {
                                  offsetCenter: ["0%", "-25%"]
                                }
                              },
                              {
                                value: (
                                  (calculateSums(series).totalResult["good"] /
                                    calculateSums(series).totalAttempts) *
                                  100
                                ).toFixed(2),
                                name: "Good",
                                title: {
                                  offsetCenter: ["0%", "-8%"]
                                },
                                detail: {
                                  offsetCenter: ["0%", "8%"]
                                }
                              },
                              {
                                value: (
                                  (calculateSums(series).totalResult[
                                    "average"
                                  ] /
                                    calculateSums(series).totalAttempts) *
                                  100
                                ).toFixed(2),
                                name: "Average",
                                title: {
                                  offsetCenter: ["0%", "25%"]
                                },
                                detail: {
                                  offsetCenter: ["0%", "40%"]
                                }
                              }
                            ],
                            title: {
                              fontSize: 14
                            },
                            detail: {
                              width: 50,
                              height: 14,
                              fontSize: 14,
                              color: "inherit",
                              borderColor: "inherit",
                              borderWidth: 1,
                              formatter: "{value}%"
                            }
                          }
                        ]
                      }}
                    />
                  </div>
                  {!calculateLevelResults(series).every(item =>
                    item.data.every(value => value === 0)
                  ) && (
                    <div className="w-full">
                      <Chart
                        type={CHART_TYPES.BAR}
                        height={350}
                        series={[
                          {
                            name: "Excellent",
                            data: calculateLevelResults(series).map(
                              item => item.data[0]
                            )
                          },
                          {
                            name: "Good",
                            data: calculateLevelResults(series).map(
                              item => item.data[1]
                            )
                          },
                          {
                            name: "Average",
                            data: calculateLevelResults(series).map(
                              item => item.data[2]
                            )
                          }
                        ]}
                        options={{
                          chart: {
                            stacked: true,
                            stackType: "100%"
                          },
                          responsive: [
                            {
                              breakpoint: 480,
                              options: {
                                legend: {
                                  position: "bottom",
                                  offsetX: -10,
                                  offsetY: 0
                                }
                              }
                            }
                          ],
                          xaxis: {
                            labels: {
                              style: {
                                fontSize: "8px"
                              }
                            },
                            categories: calculateLevelResults(series).map(
                              x => x.name
                            )
                          },
                          fill: {
                            opacity: 1
                          },
                          legend: {
                            position: "right",
                            offsetX: 0,
                            offsetY: 50
                          },
                          dataLabels: {
                            enabled: true,
                            style: {
                              fontSize: "10px"
                            }
                          }
                        }}
                      />
                    </div>
                  )}
                </>
              ) : (
                <table className="table-auto w-full border shadow-sm h-full">
                  <tbody>
                    <tr>
                      <td className="text-center py-4">No data available</td>
                    </tr>
                  </tbody>
                </table>
              )}
            </div>
          </Disclosure>
        </div>
      ))}
    </div>
  );
};

export default PerformanceCharts;
