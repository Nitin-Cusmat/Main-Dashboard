import CustomTable from "components/CustomTable";
import React from "react";
import Chart from "components/Chart/Chart";
import { CHART_TYPES } from "utils/constants";
import IdealActualTimeBar from "./IdealActualTimeBar";
import IdealActualTimeBar2 from "./IdealActualTimeBar2";

const DrivingModuleReport = ({
  attemptData,
  attemptData2,
  compare,
  organization
}) => {
  const path = attemptData.path;
  let idealTime = [];
  const classname = "text-dark";

  const angleOptions = {
    stroke: {
      width: [2, 2, 1]
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            textAnchor: "start",
            offsetX: -20,
            width: "100%",
            height: 150,
            style: {
              colors: ["#000000"], // set label color to black
              fontWeight: "500"
            }
          },
          legend: {
            fontSize: "8px",
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
    xaxis: {
      title: {
        text: "Pallet Angle"
      },
      min: -5,
      max: 5,
      labels: {
        formatter: function(value) {
          // Hide -5 and 5 only if isApollo is true
          if (isApollo && (value === -5 || value === 5)) {
            return '';
          }
          return value;
        }
      }
    },
    tooltip: {
      enabled: false
    },
    yaxis: {
      show: true,
      title: {
        text: "Forks error"
      }
    },
    grid: {
      yaxis: {
        lines: {
          show: false
        }
      }
    }
  };
  const isApollo = organization && organization.name.toLowerCase() === "vctpl"; //rtgc
  const engageErrorLabel = isApollo
    ? "Loading Error[yard to Truck] (Angle)"
    : "Pallet Engage Error (Angle)"; // for rtgc
  const engageDistanceLabel = isApollo
    ? "Loading Error[yard to Truck] (Distance)"
    : "Pallet Engage Error (Distance)"; // for rtgc

  const stackingErrorLabel = isApollo
    ? "Stacking Error[Truck to Yard] (Angle)"
    : "Stacking Error (Angle)"; // for rtgc
  const stackingDistanceLabel = isApollo
    ? "Stacking Error[Truck to Yard] (Distance)"
    : "Stacking Error (Distance)"; // for rtgc
  const getAngleChart = (dataObj, angleField) => {
    const chartHeight = isApollo ? "99%" : "100%"; // Set the height based on the organization

    return (
      <div className="h-full w-full">
        <Chart
          width={"100%"}
          height={chartHeight}
          type={CHART_TYPES.LINE}
          options={angleOptions}
          series={
            !compare && !attemptData2
              ? [
                  ...attemptData[dataObj].map((d, index) => {
                    return {
                      name: "Pallet " + parseInt(index + 1),
                      data: [
                        [0, 0],
                        [d[angleField], 1]
                      ]
                    };
                  }),
                  {
                    name: "main",
                    data: [
                      [0, 0],
                      [0, 1]
                    ]
                  }
                ]
              : [
                  ...attemptData[dataObj].map((d, index) => {
                    return {
                      name: "Pallet " + parseInt(index + 1) + " User 1",
                      data: [
                        [0, 0],
                        [d[angleField], 1]
                      ]
                    };
                  }),
                  ...attemptData2[dataObj].map((d, index) => {
                    return {
                      name: "Pallet " + parseInt(index + 1) + " User 2",
                      data: [
                        [0, 0],
                        [d[angleField], 1]
                      ]
                    };
                  }),
                  {
                    name: "main",
                    data: [
                      [0, 0],
                      [0, 1]
                    ]
                  }
                ]
          }
        />
        <div className=" text-primary text-sm p-2 mt-2 border w-full rounded mx-auto flex flex-wrap">
          {attemptData[dataObj].map((d, index) => {
            return (
              <span key={`angle_${index}`} className="p-2 w-1/2">
                Pallet {parseInt(index + 1)} {compare && "User 1"}:{" "}
                <span className="font-bold">
                  {parseFloat(d[angleField]).toFixed(2)}
                </span>
              </span>
            );
          })}
          {attemptData2 &&
            compare &&
            attemptData2[dataObj].map((d, index) => {
              return (
                <span key={`angle_${index}`} className="p-2 w-1/2">
                  Pallet {parseInt(index + 1)} {compare && "User 2"}:{" "}
                  <span className="font-bold">
                    {parseFloat(d[angleField]).toFixed(2)}
                  </span>
                </span>
              );
            })}
        </div>
      </div>
    );
  };

  const getDistanceChart = (dataObj, distanceField) => {
    const categories = [];
    for (let i = 1; i <= attemptData[dataObj].length; i++) {
      categories.push(`Pallet ${i}`);
    }
    return (
      <Chart
        width="100%"
        type={CHART_TYPES.BAR}
        series={
          compare && attemptData2[dataObj]
            ? [
                {
                  label: "User 1",
                  data: attemptData[dataObj].map(d => d[distanceField] || [])
                },
                {
                  label: "User 2",
                  data: attemptData2[dataObj].map(d => d[distanceField] || [])
                }
              ]
            : [
                {
                  label: "",
                  data: attemptData[dataObj].map(d => d[distanceField] || [])
                }
              ]
        }
        options={{
          legend: {
            customLegendItems: ["User 1", "User 2"]
          },
          tooltip: {
            enabled: true,
            custom: function ({ series, seriesIndex, dataPointIndex }) {
              const label = "Pallet " + (parseInt(dataPointIndex) + 1);
              const result = series[seriesIndex][dataPointIndex].toFixed(2);
              const tooltipStyle = `color:black; padding: 10px;`;
              return `<div style="${tooltipStyle}">${label}: ${result} </div>`;
            }
          },
          xaxis: {
            title: { text: "Pallets" },
            categories: categories
          },

          yaxis: {
            labels: {
              formatter: function (value) {
                return value.toFixed(2);
              }
            },
            show: true,
            title: { text: "Error" }
          }
        }}
      />
    );
  };


  if (attemptData && attemptData.path) idealTime = attemptData.path.ideal_time;
  if (!path && isApollo && attemptData.boxKeptData && attemptData.boxKeptData.length > 0) {
    return (
      <div className="flex flex-wrap pt-4 print:flex print:flex-row">
        {/* Angle Chart Section */}
        <div className="p-4 w-full md:w-1/2 print:w-1/2 h-full">
          <div className="my-2">
            <div className="flex justify-center">
              <div className="py-2 transform transition duration-500 hover:scale-105 cursor-pointer">
                <div className="bg-gradient-to-r from-green-200 via-blue-100 to-purple-200 rounded-lg shadow-xl p-2 border-b-2 border-blue-300">
                  <div className="flex items-center justify-center text-blue-800">
                    <span className="icon text-xl">📊</span> {/* Icon */}
                    <h2 className="text-md md:text-lg font-medium pl-1">
                      <strong>{stackingErrorLabel}</strong>
                    </h2>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="min-h-96"> 
            {getAngleChart("boxKeptData", "stackingAngle")}
          </div>
        </div>

        {/* Distance Chart Section */}
        <div className="p-4 w-full md:w-1/2 print:w-1/2 h-full">
          <div className="my-2">
            <div className="flex justify-center">
              <div className="py-2 transform transition duration-500 hover:scale-105 cursor-pointer">
                <div className="bg-gradient-to-r from-green-200 via-blue-100 to-purple-200 rounded-lg shadow-xl p-2 border-b-2 border-blue-300">
                  <div className="flex items-center justify-center text-blue-800">
                    <span className="icon text-xl">📊</span> {/* Icon */}
                    <h2 className="text-md md:text-lg font-medium pl-1">
                      <strong>{stackingDistanceLabel}</strong>
                    </h2>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="min-h-96">
            {getDistanceChart("boxKeptData", "stackingDistance")}
          </div>
        </div>
      </div>
    );

  }
  return (
    <div className="w-full">
      {idealTime && idealTime.length > 0 && (
        <div className="flex w-full flex-wrap">
          <div className="w-full lg:w-3/4">
            <IdealActualTimeBar
              idealTime={attemptData?.path?.ideal_time}
              actualPath={attemptData.path.actual_path}
              compare={compare}
              actualPath2={
                compare &&
                attemptData2 &&
                attemptData2.path &&
                attemptData2.path.actual_path
                  ? attemptData2.path.actual_path
                  : null
              }
            />
             {/* <IdealActualTimeBar2
                idealTime={attemptData?.path?.ideal_time}
                actualPath={attemptData.path.actual_path}
                compare={compare}
                actualPath2={
                  compare &&
                  attemptData2 &&
                  attemptData2.path &&
                  attemptData2.path.actual_path
                    ? attemptData2.path.actual_path
                    : null
                }
              /> */}
          </div>
          {path.ideal_time &&
            path.ideal_time.length > 0 &&
            path.ideal_time[0].path &&
            path.ideal_time[0].name && (
              <div className="w-full lg:w-1/4 lg:pl-5 pt-7">
                <CustomTable
                  columns={["Path Definition"]}
                  rows={path.ideal_time
                    .map(path => {
                      if (path.name !== undefined && path.name !== "") {
                        return {
                          "Path Definition": `${
                            path.name.toLowerCase().startsWith("path")
                              ? path.name
                              : `${path.path}: ${path.name}`
                          }`
                        };
                      }
                    })
                    .filter(x => x !== undefined)}
                  compare
                  rows2={
                    compare &&
                    attemptData2.path &&
                    attemptData2.path.idealTime
                      ? attemptData2.path.ideal_time.map(path => {
                          return {
                            "Path Definition": `${
                              path.name !== undefined &&
                              path.name !== "" &&
                              path.name.toLowerCase().startsWith("path")
                                ? path.name
                                : `${path.path}: ${path.name}`
                            }`
                          };
                        })
                      : null
                  }
                />
              </div>
            )}
        </div>
      )}
 
   
        {/* <div className="w-full lg:w-3/4">
          <GearCollisionGraph
            graphs={attemptData.graphs}
            graphs2={compare ? attemptData2.graphs : null}
            actualPath={attemptData.path.actual_path}
            compare={compare}
            actualPath2={
              compare &&
              attemptData2 &&
              attemptData2.path &&
              attemptData2.path.actual_path
                ? attemptData2.path.actual_path
                : null
            }
          />
        </div> */}
        {/* This below code is only for RTGC */}

        {!isApollo &&
          attemptData.boxPickupData &&
          attemptData.boxPickupData.length > 0 && (
            <div className="flex flex-wrap pt-4">
              <div className=" p-4 w-full md:w-1/2">
                <div className={classname}>Pallet engage error(Distance)</div>
                {getDistanceChart("boxPickupData", "engageDistance")}
              </div>
              <div className=" p-4 w-full md:w-1/2">
                <div className={classname}>Pallet engage error(Angle)</div>
                {getAngleChart("boxPickupData", "engageAngle")}
              </div>
            </div>
          )}

        {!isApollo &&
          attemptData.boxKeptData &&
          attemptData.boxKeptData.length > 0 && (
            <div className="flex flex-wrap">
              <div className=" p-4 w-full md:w-1/2">
                <div className={classname}>Stacking error(Distance)</div>
                {getDistanceChart("boxKeptData", "stackingDistance")}
              </div>
              <div className=" p-4 w-full md:w-1/2">
                <div className={classname}>Stacking error(Angle)</div>
                {getAngleChart("boxKeptData", "stackingAngle")}
              </div>
            </div>
          )}
      </div>
    );
};

export default DrivingModuleReport;
