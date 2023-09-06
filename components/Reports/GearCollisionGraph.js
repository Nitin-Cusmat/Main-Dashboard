import Chart from "components/Chart/Chart";
import React, { useEffect, useState } from "react";
import { CHART_TYPES } from "utils/constants";

const GearCollisionGraph = ({
  graphs,
  graphs2,
  actualPath,
  actualPath2,
  compare
}) => {
  const [gearData, setGearData] = useState();
  const [gearData2, setGearData2] = useState();
  let graph2;
  let graph1 =
    graphs && graphs.find(graph => graph.name.toLowerCase() == "speed vs time");
  if (compare && graphs2) {
    graph2 = graphs2.find(graph => graph.name.toLowerCase() == "speed vs time");
  }
  let referenceGraph;
  if (graph1) {
    let additional_info = graph1?.additional_data;
    if (additional_info && additional_info.length > 0) {
      referenceGraph = graph1.additional_data.find(
        data => data.fetch_field == "gear"
      );
    }
  }

  const getCordinates = (paths, setfucn) => {
    let combinedPaths = Object.values(paths);
    combinedPaths = [].concat(...combinedPaths);
    let finalGearsObj = {};
    combinedPaths.forEach(p => {
      if (finalGearsObj.hasOwnProperty(p.gear)) {
        let tempData = finalGearsObj[p.gear];
        tempData.push({
          speed: p["speed"],
          collisionStatus: p["collisionStatus"]
        });
        finalGearsObj[p.gear] = tempData;
      } else {
        finalGearsObj[p.gear] = [
          {
            speed: p["speed"],
            collisionStatus: p["collisionStatus"]
          }
        ];
      }
    });

    let mainGearsObj = {};
    Object.keys(finalGearsObj).forEach(gear => {
      let gearDataObjs = finalGearsObj[gear];
      let max = finalGearsObj[gear][0].speed;
      for (let i = 1; i < finalGearsObj[gear].length; i++) {
        const speed = Number(finalGearsObj[gear][i].speed);
        if (speed > max) {
          max = speed;
        }
      }
      let collisions = 0;
      let prev = 1;
      gearDataObjs.forEach(point => {
        if (point.collisionStatus == "1" && point.collisionStatus != prev) {
          collisions = collisions + 1;
        }
        prev = point.collisionStatus;
      });

      mainGearsObj[gear] = { maxSpeed: max, collisions: collisions };
      setfucn(mainGearsObj);
    });
  };

  useEffect(() => {
    actualPath && getCordinates(actualPath, setGearData);
    if (compare && actualPath2) {
      getCordinates(actualPath2, setGearData2);
    }
  }, [referenceGraph]);

  if (gearData && referenceGraph) {
    return (
      <div className="text-dark rounded border p-1 md:p-4 col-start-1 col-end-3 ">
        <div className="text-dark text-sm md:text-md lg:text-lg">
          Gear Collision graph
        </div>
        <div>
          <Chart
            height="600px"
            type={CHART_TYPES.BAR}
            series={
              compare && gearData2
                ? [
                    {
                      name: "User 1",
                      data: Object.keys(gearData).map(g => {
                        return parseFloat(gearData[g].maxSpeed).toFixed(2);
                      })
                    },
                    {
                      name: "User 2",
                      data: Object.keys(gearData2).map(g => {
                        return parseFloat(gearData2[g].maxSpeed).toFixed(2);
                      })
                    }
                  ]
                : [
                    {
                      name: "max speed",
                      data: Object.keys(gearData).map(g => {
                        return parseFloat(gearData[g].maxSpeed).toFixed(2);
                      })
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

                    dataLabels: {
                      enabled: false
                    },
                    legend: {
                      position: "bottom",
                      horizontalAlign: "center",
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
                    show: true
                  }
                },
                yaxis: {
                  lines: {
                    show: false
                  }
                }
              },
              xaxis: {
                categories: Object.keys(gearData),
                title: { text: "Gears" }
                // labels: {
                //   formatter: value => {
                //     return parseFloat(value) > 1000
                //       ? (parseFloat(value) / 1000).toFixed(0).toString() + "k"
                //       : parseFloat(value).toFixed(0);
                //   }
                // }
              },
              yaxis: {
                title: { text: "Max Speed(km/hr)" }
              },
              tooltip: {
                custom: function ({ seriesIndex, dataPointIndex, w }) {
                  const tooltipStyle = `background-color: white; color: black; padding: 5px 10px;`;
                  return `<div style="${tooltipStyle}"> ${
                    compare ? "User " + (seriesIndex + 1) + ":" : ""
                  }
                          Max speed: ${parseFloat(
                            w.config.series[seriesIndex].data[dataPointIndex]
                          ).toFixed(2)}
                          </div>
                          <div style="${tooltipStyle}">
                          Collisions: ${
                            compare
                              ? seriesIndex === 0
                                ? Object.values(gearData)[dataPointIndex]
                                    ?.collisions
                                : Object.values(gearData2)[dataPointIndex]
                                    ?.collisions
                              : Object.values(gearData)[dataPointIndex]
                                  ?.collisions
                          } </div>`;
                },
                y: {
                  formatter: value => {
                    return parseFloat(value) > 1000
                      ? (parseFloat(value) / 1000).toFixed(0).toString() + "k"
                      : parseFloat(value).toFixed(0);
                  }
                }
              },
              dataLabels: {
                enabled: !compare,
                textAnchor: "start",
                offsetY: -20,
                offsetX: -10,
                style: {
                  colors: ["#000000"], // set label color to black
                  fontWeight: "500"
                },
                formatter: value => {
                  return parseFloat(value) > 10000
                    ? (parseFloat(value) / 1000).toFixed(1).toString() + "k"
                    : parseFloat(value).toFixed(1);
                }
              },
              plotOptions: {
                bar: {
                  distributed: !compare,
                  columnWidth: "20%",
                  endingShape: "rounded",
                  dataLabels: {
                    position: "top"
                  }
                }
              }
            }}
          />
        </div>
      </div>
    );
  }
};

export default GearCollisionGraph;
