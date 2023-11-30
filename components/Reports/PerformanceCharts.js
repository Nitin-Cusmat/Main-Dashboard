import React from "react";
import Chart from "components/Chart/Chart";
import { CHART_COLORS, CHART_TYPES } from "utils/constants";
import { Disclosure } from "components/Disclosure";
import { timeConverter } from "utils/utils";

const PerformanceCharts = ({ data }) => {
  return (
    <div>
      {Object.entries(data).map(([name, series], index) => (
        <div key={index}>
          <Disclosure classname="mt-4" title={name} show={index === 0}>
            <div className="flex mt-4">
              <div className="w-1/2">
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
                      tickAmount: 5
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
                      custom: function ({ w, seriesIndex, dataPointIndex }) {
                        if (seriesIndex === 0) {
                          const month =
                            w.globals.categoryLabels[dataPointIndex];
                          const value = w.config.series[0].data[dataPointIndex];
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
              <div className="w-1/2">
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
                      custom: function ({ w, seriesIndex, dataPointIndex }) {
                        if (seriesIndex === 0) {
                          const month =
                            w.config.series[seriesIndex].data[dataPointIndex].x;
                          const value =
                            w.config.series[seriesIndex].data[dataPointIndex].y;
                          const content =
                            w.config.series[seriesIndex].data[dataPointIndex]
                              .content;
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
                            w.config.series[seriesIndex].data[dataPointIndex].y;
                          return `<div style="padding: 5px;">
                          Ideal Mistake: <b>${idealMistake}</b></div>`;
                        }
                      }
                    }
                  }}
                />
              </div>
            </div>
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
                tooltip: {
                  enabled: true,
                  shared: false,
                  custom: function ({ w, seriesIndex, dataPointIndex }) {
                    const month =
                      w.config.series[seriesIndex].data[dataPointIndex].x;
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
          </Disclosure>
        </div>
      ))}
    </div>
  );
};

export default PerformanceCharts;
