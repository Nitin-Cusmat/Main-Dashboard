import React, { useState } from "react";
import Chart from "components/Chart/Chart";
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  ArcElement
} from "chart.js";
import GroupedBarChart from "components/GroupedBarChart";
import { getFormattedTime } from "utils/utils";
import EChart from "components/Chart/EChart";
import DeviationGraph from "./DeviationGraph";
import { CHART_COLORS, CHART_TYPES } from "utils/constants";
import CycleDataVisual from "./CycleDataVisual";
import Slider from "@mui/material/Slider";
import { styled } from "@mui/material/styles";

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  ArcElement
);

const GraphReport = ({
  graph,
  graph2,
  index,
  compare,
  users,
  isWinder,
  isShovel,
  ishhovel1,
  pieColor,
  cycleData
}) => {
  const colors = ["#82E0AA", "#622F22", "black", "yellow"];

  const [value, setValue] = useState([
    graph.data && graph.data[0]?.x,
    graph.data && graph.data[graph.data.length - 1]?.x
  ]);
  const getGraph = () => {
    if (
      (graph.type == "bar" || graph.type == "stacked_bar") &&
      graph.data &&
      graph.data.length > 0
    ) {
      const getStackData = () => {
        let stackDict = {};

        graph.data.map((g, i) => {
          stackDict[g.name] = i;
        });
        return stackDict;
      };

      const dataset = compare
        ? [
            ...graph.data.map((d, index) => {
              return {
                label: Array.isArray(graph.prefix)
                  ? graph.prefix[index] + " User 1"
                  : graph.prefix,
                data: d.data,
                backgroundColor: cycleData
                  ? colors[index]
                  : Object.values(CHART_COLORS)[index],
                stack: getStackData()[d.name]
              };
            }),
            ...graph2.data.map((d, index) => {
              return {
                label: Array.isArray(graph2.prefix)
                  ? graph2.prefix[index] + " User 2"
                  : graph2.prefix,
                data: d.data,
                backgroundColor: cycleData
                  ? colors[index + 2]
                  : Object.values(CHART_COLORS)[index + 2],
                stack: getStackData()[d.name]
              };
            })
          ]
        : graph && graph.data
        ? graph.data.map((d, index) => {
            return {
              label: Array.isArray(graph.prefix)
                ? graph.prefix[index]
                : graph.prefix,
              data: d.data,
              backgroundColor: cycleData
                ? colors[index]
                : Object.values(CHART_COLORS)[index]
              // stack: getStackData()[d.name]
            };
          })
        : [];

      const labelsStacked = graph.prefix
        ? dataset[0].data.map((d, index) => {
            return `${graph.prefix} ${index}`;
          })
        : [];

      return (
        <div key={index} className="border w-full h-full text-dark ">
          <div className="p-5 text-dark text-lg">{graph.name}</div>
          <GroupedBarChart
            labels={
              graph.type == "stacked_bar"
                ? labelsStacked
                : cycleData
                ? cycleData.map(data => data.name)
                : graph.labels
            }
            dataset={dataset || []}
            stacked
            xLabel={graph["xlabel"] || ""}
            yLabel={graph["ylabel"] || ""}
            isWinder={isWinder}
            maxValue={isShovel && graph.maxValue}
            title={graph.name.toLowerCase()}
          />
        </div>
      );
    } else if (graph.type == "line" && graph.data && graph.data.length > 0) {
      const getAdditionalPlots = (
        graphOfReference,
        compare = false,
        index = 1
      ) => {
        const appendName = compare ? (index === 1 ? "User 1" : "User 2") : "";
        let additional_info = graphOfReference?.additional_data;
        let additionalPlot = [];
        if (additional_info && additional_info.length > 0) {
          graphOfReference.additional_data.map(d => {
            if (
              d.representation == "plotted" &&
              d.fetch_field == "collisionStatus"
            ) {
              const seriesList = d.value_list.map((value, index) => {
                return {
                  x: graphOfReference.data[index].x,
                  y: graphOfReference.data[index].y,
                  collisionStatus: value
                };
              });
              additionalPlot.push({
                name: appendName ? appendName + " " + d.name : d.name,
                data: seriesList.filter(point => point.collisionStatus == "1")
              });
            }
          });
        }
        return additionalPlot;
      };
      //Note: custom hlines for vaccuum pump module
      const hAxisLines = graph?.hAxisLines;
      const generateColors = () => {
        return graph["data"].map((d, idx) => {
          return {
            offset: (idx / graph["data"].length) * 100,
            color:
              d.y < hAxisLines?.min || idx > hAxisLines?.max
                ? "#5AB281"
                : "#EB6C64",
            opacity: 1
          };
        });
      };

      // const colors = {
      //   1: { color: "#80e080", bg: "bg-[#80e080]" },
      //   2: { color: "#5256B8", bg: "bg-[#5256B8]" },
      //   3: { color: "#5256B8", bg: "bg-[#5256B8]" },
      //   4: { color: "#63A4E9", bg: "bg-[#63A4E9]" },
      //   5: { color: "#a0522d", bg: "bg-[#a0522d]" },
      //   N: { color: "#00804f", bg: "bg-[#00804f]" },
      //   R: { color: "#80c3e0", bg: "bg-[#80c3e0]" }
      // };
      // let additional_info = graph?.additional_data;
      // let referenceGraph;
      // if (additional_info && additional_info.length > 0) {
      //   referenceGraph = graph.additional_data.find(
      //     data => data.representation == "plotted" && data.fetch_field == "gear"
      //   );
      // }

      // const generateColors = () => {
      //   let color = "#5AB281";
      //   let additional_info = graph?.additional_data;
      //   if (additional_info && additional_info.length > 0) {
      //     return referenceGraph?.value_list.map((d, idx) => {
      //       color = colors[d]?.color;
      //       return {
      //         offset: (idx / referenceGraph.value_list.length) * 100,
      //         color,
      //         opacity: 1
      //       };
      //     });
      //   }
      // };

      const handleChange = (event, newValue) => {
        setValue(newValue);
      };

      return (
        <div className="border ">
          <div className="">
            <div className="p-1 md:py-4 md:pl-2 text-dark capitalize text-sm md:text-sm underline font-semibold">
              {" "}
              {graph.name}{" "}
              {compare &&
                graph.name.toLowerCase() != "speed vs time" &&
                "user 1"}
            </div>

            {/* {referenceGraph !== undefined && (
              <div className="flex flex-wrap pl-1 md:pl-5">
                {graph.additional_data.some(
                  obj => obj.name === "Gear Shift"
                ) && (
                  <span className=" pr-3 text-sm text-dark inline">Gears:</span>
                )}
                <div className="flex pt-[3px]">
                  {graph.additional_data.some(
                    obj => obj.name === "Gear Shift"
                  ) &&
                    Object.keys(colors).map((key, index) => {
                      return (
                        <div
                          key={`gear_${key}_${index}`}
                          className="text-sm text-dark px-1 flex"
                        >
                          <div
                            className={`${colors[key].bg} w-[12px] h-[12px] rounded-xl`}
                          />
                          <span className="mr-0 md:mr-2 mb-1 ml-1">{key}</span>
                        </div>
                      );
                    })}
                  <div key={`collison`} className="text-sm text-dark px-1 flex">
                    <div
                      className={`border-4 border-black w-[12px] h-[12px] rounded-xl`}
                    />
                    <span className="mr-2 mb-1 ml-1">Collision</span>
                  </div>
                </div>
              </div>
           )} */}
          </div>
          {graph?.hAxisLines ? (
            <DeviationGraph graph={graph} />
          ) : (
            <div>
              <Chart
                height="500px"
                type={CHART_TYPES.LINE}
                series={
                  compare
                    ? [
                        {
                          name: "User 1",
                          data: graph.data,
                          type: "area" // Specify the type as 'area' to fill under the line
                        },
                        {
                          name: "User 2",
                          data:
                            graph2 && graph2.data && graph2.data.length > 0
                              ? graph2.data
                              : []
                        },
                        ...getAdditionalPlots(graph, true),
                        ...getAdditionalPlots(graph2, compare, 2)
                      ]
                    : [
                        {
                          name: "User",
                          data: graph.data,
                          type: "area" // Specify the type as 'area' to fill under the line
                        },
                        ...getAdditionalPlots(graph)
                      ]
                }
                options={{
                  fill: {
                    type: "gradient",
                    gradient: {
                      shadeIntensity: 0.1,
                      opacityFrom: 0.1,
                      opacityTo: 0.1,
                      stops: [0, 100],
                      colorStops: [
                        {
                          offset: 0, // Top of the gradient
                          color: "#82fff3", // Replace with the desired top color
                          opacity: 0.2
                        },
                        {
                          offset: 100, // Bottom of the gradient
                          color: "#adfff3", // Replace with the desired bottom color
                          opacity: 0.1
                        }
                      ]
                    }
                  },
                  // fill:
                  //   referenceGraph !== undefined
                  //     ? {
                  //         type: "gradient",
                  //         gradient: {
                  //           shadeIntensity: 1,
                  //           opacityFrom: 0.7,
                  //           opacityTo: 0.9,
                  //           colorStops: generateColors()
                  //         }
                  //       }
                  //     : {},
                  chart: {
                    background: "#f4f4f4",
                    animations: {
                      enabled: true,
                      easing: "easeinout",
                      speed: 1000,
                      animateGradually: {
                        enabled: true,
                        delay: 300
                      },
                      dynamicAnimation: {
                        enabled: true,
                        speed: 500
                      }
                    },
                    zoom: {
                      enabled: true,
                      type: "x",
                      autoScaleYaxis: false,
                      zoomedArea: {
                        fill: {
                          color: "#90CAF9",
                          opacity: 0.4
                        },
                        stroke: {
                          color: "#0D47A1",
                          opacity: 0.4,
                          width: 1
                        }
                      }
                    }
                  },
                  markers: {
                    size: compare ? [0, 0, 2, 2] : [0, 2],
                    colors: Object.values(CHART_COLORS),
                    strokeColors: "#000",
                    strokeWidth: 2,
                    strokeOpacity: 0.9,
                    strokeDashArray: 0,
                    fillOpacity: 1,
                    discrete: [],
                    shape: "circle",
                    radius: 2,
                    offsetX: 0,
                    offsetY: 0,

                    showNullDataPoints: true
                  },
                  legend: {
                    show: true,
                    fontSize: "16px",
                    fontFamily: "Helvetica, Arial"
                  },
                  stroke: {
                    show: true,
                    curve: "smooth",
                    lineCap: "round",
                    width: compare ? [2, 2, 0, 0] : [2, 0],
                    dashArray: 0
                  },
                  xaxis: {
                    type: "numeric",
                    title: {
                      text:
                        graph.name.toLowerCase() === "speed vs time"
                          ? "Time(seconds)"
                          : graph["xlabel"].charAt(0).toUpperCase() +
                            graph["xlabel"].slice(1),
                      style: {
                        fontSize: "16px",
                        fontFamily: "Helvetica, Arial"
                      }
                    },
                    labels: {
                      style: {
                        fontSize: "14px",
                        fontFamily: "Helvetica, Arial"
                      }
                    },
                    min: value[0],
                    max: value[1]
                  },
                  tooltip: {
                    enabled: true,
                    style: {
                      fontSize: "14px",
                      fontFamily: "Helvetica, Arial"
                    },
                    custom: function ({ dataPointIndex, w }) {
                      let allTooltipData = [];
                      const getTootipData = (incomingGraph, index = 1) => {
                        let tooltipData =
                          incomingGraph &&
                          `${
                            incomingGraph["ylabel"][0].toUpperCase() +
                            incomingGraph["ylabel"].slice(1)
                          }: ${incomingGraph.data[dataPointIndex].y}`;
                        if (
                          incomingGraph &&
                          incomingGraph.data &&
                          incomingGraph.additional_data &&
                          incomingGraph.additional_data.length > 0
                        ) {
                          incomingGraph.additional_data.map(d => {
                            if (
                              d.representation == "hovered" ||
                              d.representation == "plotted"
                            )
                              tooltipData =
                                tooltipData +
                                ` ${d.name}: ${d.value_list[dataPointIndex]}`;
                          });
                        }
                        return tooltipData;
                      };

                      allTooltipData =
                        compare && graph2
                          ? [getTootipData(graph), getTootipData(graph2, 2)]
                          : [getTootipData(graph)];
                      const tooltipStyle = `background-color: black; color: white; padding: 6px;`;
                      let finalTooltip = `<div style="${tooltipStyle}">${
                        compare
                          ? "User 1: " + allTooltipData[0]
                          : allTooltipData[0]
                      }</div>`;
                      if (compare && graph2) {
                        finalTooltip =
                          finalTooltip +
                          `<div style="${tooltipStyle}">${
                            "User 2: " + allTooltipData[1]
                          }</div>`;
                      }

                      return finalTooltip;
                    }
                  },

                  yaxis: {
                    type: "numeric",
                    title: {
                      text:
                        graph.name.toLowerCase() === "speed vs time"
                          ? "Speed(km/hr)"
                          : graph["ylabel"].charAt(0).toUpperCase() +
                            graph["ylabel"].slice(1),
                      style: {
                        fontSize: "16px",
                        fontFamily: "Helvetica, Arial"
                      }
                    },
                    labels: {
                      formatter: function (value) {
                        if (value) return value.toFixed(2);
                        else return;
                      },
                      style: {
                        fontSize: "14px",
                        fontFamily: "Helvetica, Arial"
                      }
                    }
                  },
                  grid: {
                    borderColor: "#e0e0e0",
                    row: {
                      colors: ["#f9f9f9", "transparent"]
                    }
                  }
                }}
              />
              <Slider
                className="scale-75 md:ml-12"
                getAriaLabel={() => "Range slider"}
                value={value}
                onChange={handleChange}
                valueLabelDisplay="on" // Changed from "auto" to "on" to always display the value labels
                min={graph.data[0].x}
                max={graph.data[graph.data.length - 1].x}
                sx={{
                  color: "#3f854f",
                  height: 3,
                  "& .MuiSlider-thumb": {
                    height: 27,
                    width: 10,
                    backgroundColor: "#fff",
                    border: "1px solid currentColor",
                    borderRadius: 0, // Set borderRadius to 0 to make the thumb rectangular
                    "&:hover": {
                      boxShadow: "0 0 0 8px rgba(58, 133, 137, 0.16)"
                    }
                  },
                  "& .MuiSlider-track": {
                    height: 2
                  },
                  "& .MuiSlider-rail": {
                    height: 3
                  }
                }}
              />
            </div>
          )}
          {compare && graph2.name.toLowerCase() != "speed vs time" && (
            <div className="p-1 md:py-4 md:pl-2 text-dark capitalize text-sm md:text-sm underline font-semibold">
              {" "}
              {graph2.name} {"user 2"}
            </div>
          )}
          {compare && graph2?.hAxisLines && <DeviationGraph graph={graph2} />}
        </div>
      );
    } else if (
      graph.type == "multiple_line" &&
      graph.data &&
      graph.data.length > 0
    ) {
      return (
        <div className="border w-full h-full ">
          <div className="p-5 text-dark text-sm md:text-md lg:text-lg">
            {graph.name}
          </div>
          <Chart
            labels={graph.labels}
            type={CHART_TYPES.LINE}
            series={
              compare && graph2
                ? [...graph.data, ...graph2.data]
                : [...graph.data]
            }
            options={{
              stroke: {
                show: true,
                width: 2,
                dashArray: 0
              },
              xaxis: {
                tickAmount: 15,
                labels: {
                  show: true
                },
                title: {
                  text: graph["xlabel"]
                }
              },
              yaxis: {
                labels: {
                  show: true
                }
              }
            }}
          />
        </div>
      );
    } else if (
      (graph.type == "doughnut" || "pie") &&
      graph.data &&
      graph.data.length > 0
    ) {
      return (
        <div key={index} className="border w-full h-full">
          <div
            style={{ backgroundColor: "rgb(219 234 254)" }}
            className="p-5 text-dark text-sm md:text-md lg:text-lg"
          >
            {graph.name}
          </div>
          <div className="flex justify-center h-[430px] w-full py-3">
            <EChart
              options={{
                tooltip: {
                  formatter: params => {
                    let name = "";
                    if (compare) {
                      if (params.componentIndex === 1) {
                        name = "User - 2 " + params.data.name;
                      } else if (params.componentIndex === 0) {
                        name = "User - 1 " + params.data.name;
                      }
                    } else {
                      name = params.data.name;
                    }
                    const value =
                      graph.name === "Total quantity used in assembly"
                        ? params.data.value
                        : getFormattedTime(params.data.value);
                    const percentage = params.percent;
                    const result =
                      graph.name === "Total quantity used in assembly"
                        ? `<div>${name}: <b>${value}</b> (${percentage}%)</div>`
                        : `${name}: ${value} (${percentage}%)`;
                    return result;
                  }
                },
                backgroundColor: "#FFFFFF", // Set background color for the chart
                legend: {
                  show: false
                },
                series: compare
                  ? [
                      {
                        type: "pie",
                        radius: ["70%", "90%"],
                        data:
                          graph.name === "Total quantity used in assembly"
                            ? graph.data
                                .filter(x => x > 0)
                                .map((item, index) => {
                                  return {
                                    value: parseFloat(item),
                                    name: graph.labels[index]
                                  };
                                })
                            : graph.data.map((item, index) => {
                                return {
                                  value: parseFloat(item),
                                  name: graph.labels[index]
                                };
                              }),
                        emphasis: {
                          itemStyle: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: "rgba(0, 0, 0, 0.5)"
                          }
                        },
                        labelLine: {
                          show: false
                        }
                      },
                      {
                        type: "pie",
                        radius: ["40%", "60%"],
                        data:
                          graph2.name === "Total quantity used in assembly"
                            ? graph2.data
                                .filter(x => x > 0)
                                .map((item, index) => {
                                  return {
                                    value: parseFloat(item),
                                    name: graph2.labels[index]
                                  };
                                })
                            : graph2 &&
                              graph2.data &&
                              graph2.data.map((item, index) => {
                                return {
                                  value: parseFloat(item),
                                  name: graph2.labels && graph2.labels[index]
                                };
                              }),
                        label: {
                          show: false
                        },
                        emphasis: {
                          itemStyle: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: "rgba(0, 0, 0, 0.5)"
                          }
                        },
                        labelLine: {
                          show: false
                        }
                      }
                    ]
                  : [
                      {
                        type: "pie",
                        radius: ["50%", "70%"],
                        color:
                          pieColor && graph.data.length === 1
                            ? pieColor
                            : Object.values(CHART_COLORS),
                        data:
                          graph.name === "Total quantity used in assembly"
                            ? graph.data
                                .filter(x => x > 0)
                                .map((item, index) => {
                                  return {
                                    value: parseFloat(item),
                                    name: graph.labels[index]
                                  };
                                })
                            : graph.data
                                .map((item, index) => {
                                  return {
                                    value: parseFloat(item),
                                    name: graph.labels[index]
                                  };
                                })
                                .filter(item => item.value > 0),
                        emphasis: {
                          itemStyle: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: "rgba(0, 0, 0, 0.5)"
                          }
                        },
                        labelLine: {
                          show: false
                        }
                      }
                    ]
              }}
            />
          </div>
        </div>
      );
    }
  };
  return (
    <>
      <div className="pb-4 w-full ">{getGraph()}</div>
      {/* {cycleData && <CycleDataVisual cycleData={cycleData} />} */}
    </>
  );
};

export default GraphReport;