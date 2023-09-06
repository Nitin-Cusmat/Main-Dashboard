import React from "react";
import Chart from "components/Chart/Chart";
import { getFormattedTime, secondsToDuration } from "utils/utils";
import CustomTable from "components/CustomTable";
import { useRecoilValue } from "recoil";
import deviceState from "states/deviceState";
import PropTypes from "prop-types";

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
import EChart from "components/Chart/EChart";
ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  ArcElement
);

const AssemblyReport = ({
  assembly,
  disAssembly,
  measurement,
  disAssembly2 = null,
  assembly2 = null,
  measurement2 = null,
  users = ["", ""],
  compare
}) => {
  const { screenWidth } = useRecoilValue(deviceState);
  const options = {
    tooltip: {
      enabled: true,
      custom: function ({ series, seriesIndex, dataPointIndex }) {
        const tooltipStyle = `color:black; padding: 10px;`;
        return `<div style="${tooltipStyle}">${disAssembly.subActivities[dataPointIndex]["name"]}: ${series[seriesIndex][dataPointIndex]} sec </div>`;
      }
    },
    dataLabels: {
      enabled: true,
      textAnchor: "start",
      offsetX: 20,
      style: {
        colors: ["#000000"], // set label color to black
        fontWeight: "500"
      },
      formatter: value => {
        return parseFloat(value) > 1000
          ? (parseFloat(value) / 1000).toFixed(1).toString() + "k" + " sec"
          : parseFloat(value).toFixed(1) + " sec";
      }
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
      categories: disAssembly?.subActivities
        ? disAssembly["subActivities"].map(t => t.name)
        : [],
      title: { text: "Time taken (seconds)" }
    },
    yaxis: {
      labels: {
        show: screenWidth > 500
      }
    },
    plotOptions: {
      bar: {
        horizontal: true,
        columnWidth: "70%",
        endingShape: "rounded",
        dataLabels: {
          position: "top"
        }
      }
    }
  };

  const subactivityColumnsMap = {
    name: "Subactivity Name",
    value: "Correct",
    "value user 1": "Correct User 1",
    "value user 2": "Correct User 2"
  };
  const disassemblySeries =
    compare && disAssembly2
      ? [
          {
            name: "User 1",
            data:
              disAssembly && disAssembly["subActivities"]
                ? disAssembly["subActivities"].map(t => t.duration)
                : []
          },
          {
            name: "User 2",
            data:
              disAssembly2 && disAssembly2["subActivities"]
                ? disAssembly2["subActivities"].map(t => t.duration)
                : []
          }
        ]
      : [
          {
            name: "",
            data:
              disAssembly && disAssembly["subActivities"]
                ? disAssembly["subActivities"].map(t => t.duration)
                : []
          }
        ];

  const dataAnalysis = (col1, col2, title) => {
    let rows = [
      {
        User: users[0],
        [col1]: measurement.subActivities[col1],
        [col2]: measurement.subActivities[col2]
      }
    ];
    if (compare && measurement2 && measurement2.subActivities) {
      rows.push({
        User: users[1],
        [col1]: measurement2.subActivities[col1],
        [col2]: measurement2.subActivities[col2]
      });
    }
    return (
      <div className="p-2 md:p-4">
        {/* heading */}
        <div className="font-bold text-center p-2 text-primary">{title}</div>
        <div className="text-sm lg:text-md  text-center text-dark">
          Difference between {col1} and {col2}
          <div>
            <span className="text-red px-2">Error rate is</span>
            <span className="pr-2 font-semibold text-red">
              {measurement.subActivities[col1] -
                measurement.subActivities[col2]}
            </span>
            {compare && <span>for {users[0]}</span>}
            {compare && measurement2 && measurement.subActivities && (
              <div>
                <span className="pr-2 font-semibold text-red">
                  {measurement2.subActivities[col1] -
                    measurement2.subActivities[col2]}
                </span>
                <span>for {users[1]}</span>
              </div>
            )}
          </div>
        </div>

        {compare && measurement2 ? (
          <CustomTable rows={rows} columns={["User", col1, col2]} />
        ) : (
          <CustomTable rows={rows} columns={[col1, col2]} />
        )}
      </div>
    );
  };

  const assemblyDataSet = compare ? [assembly, assembly2] : [assembly];

  const getParsedSubactivities = (activities, activities2 = null) => {
    if (activities2) {
      return activities.map((activity, index) => {
        return {
          name: activity.name,
          "value user 1": activity.value ? "True" : "False",
          "value user 2": activities2[index].value ? "True" : "False"
        };
      });
    } else {
      return activities.map(activity => {
        const activityName = activity.name
          .replace(/([a-z])([A-Z])/g, "$1 $2")
          .split("_")
          .join(" ")
          .toLowerCase();

        return {
          name: activityName.charAt(0).toUpperCase() + activityName.slice(1),
          value: activity.value ? "True" : "False"
        };
      });
    }
  };

  const assemblyData = assembly && (
    <div className="py-4 border p-2 md:p-4">
      <div className="font-bold text-dark pb-5">Assembly</div>
      <div>
        <div className="flex justify-around h-[300px]">
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
                  const time = getFormattedTime(params.data.value);
                  const percentage = params.percent;
                  return `${name}: ${time} (${percentage}%)`;
                }
              },
              legend: {
                top: "5%",
                orient: "vertical",
                left: "left"
              },
              series: assemblyDataSet.map((assemble, index) => {
                return {
                  type: "pie",
                  radius: index === 0 ? ["70%", "90%"] : ["40%", "60%"],
                  data: [
                    {
                      value: Object.values(assemble.installingFrame)[0],
                      name: "Installing Frame"
                    },
                    {
                      value: Object.values(assemble.installingRoller)[0],
                      name: "Installing Roller"
                    }
                  ],
                  label: {
                    show: index === 0 ? true : false
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
                };
              })
            }}
          />
        </div>
        <div className="w-full pt-5 text-center">
          {[assembly, assembly2].map((d, index) => {
            if (d?.completionTime) {
              return (
                <div key={`disassmbly${index}`} className="text-primary px-5">
                  {compare && <span>{users[index]} -</span>}Total Time Taken to
                  complete the task = {secondsToDuration(d.completionTime)}
                </div>
              );
            }
          })}
        </div>
      </div>
      {!compare &&
        assembly?.subActivities &&
        assembly.subActivities.length > 0 && (
          <div className="p-2 md:p-4">
            <CustomTable
              columns={["name", "value"]}
              columnsMap={subactivityColumnsMap}
              rows={getParsedSubactivities(assembly.subActivities)}
            />
          </div>
        )}
      {assembly?.subActivities &&
        assembly.subActivities.length &&
        assembly2?.subActivities &&
        assembly2.subActivities.length &&
        compare > 0 && (
          <div className="p-2 md:p-4">
            <CustomTable
              columns={["name", "value user 1", "value user 2"]}
              columnsMap={subactivityColumnsMap}
              rows={getParsedSubactivities(
                assembly.subActivities,
                assembly2.subActivities
              )}
            />
          </div>
        )}
    </div>
  );

  const disAssemblyData = disAssembly && (
    <div className="py-4 border p-2 md:p-4">
      <div className="font-bold text-dark p-2 md:p-4">Disassembly</div>
      <div className="">
        <Chart
          options={options}
          series={disassemblySeries}
          type="bar"
          width={
            screenWidth < 500 ? "300px" : screenWidth < 800 ? "400px" : "100%"
          }
          height={
            disassemblySeries.length > 0 ? disassemblySeries.length * 650 : 350
          }
        />
        <div className="w-full pt-5 text-center">
          {[disAssembly, disAssembly2].map((d, index) => {
            if (d?.completionTime) {
              return (
                <div key={`disassmbly${index}`} className=" text-primary px-5">
                  {compare && <span>{users[index]} -</span>}Total Time Taken to
                  complete the task ={secondsToDuration(d.completionTime)}
                </div>
              );
            }
          })}
        </div>

        {!compare &&
          disAssembly?.subActivities &&
          disAssembly.subActivities.length > 0 && (
            <div className="p-2 md:p-4">
              <CustomTable
                columns={["name", "value"]}
                columnsMap={subactivityColumnsMap}
                rows={getParsedSubactivities(disAssembly.subActivities)}
              />
            </div>
          )}
        {disAssembly?.subActivities &&
          disAssembly.subActivities.length &&
          disAssembly?.subActivities &&
          disAssembly.subActivities.length &&
          compare > 0 && (
            <div className="p-4">
              <CustomTable
                columns={["name", "value user 1", "value user 2"]}
                columnsMap={subactivityColumnsMap}
                rows={getParsedSubactivities(
                  disAssembly.subActivities,
                  disAssembly.subActivities
                )}
              />
            </div>
          )}
      </div>
    </div>
  );

  const measurementData = measurement && (
    <div className="py-4 border p-2 md:p-4">
      <div className="font-bold text-dark text-lx pb-4">Measurement</div>

      <div className="px-4 flex gap-4 flex-col">
        {dataAnalysis(
          "required_Vertical_Vernier_Height",
          "measured_vertical_Vernier_Height",
          " Vertical Vernier Data Analysis"
        )}

        {dataAnalysis(
          "required_difference_with_vernierCaliper",
          "measured_difference_with_vernierCaliper",
          "Vertical Vernier Data Analysis"
        )}
        {dataAnalysis(
          "required_SpacerSize",
          "selected_SpacerSize",
          "Spacers Data Analysis"
        )}

        {dataAnalysis(
          "bottomRoller_initial_Yposition",
          "bottomRoller_final_Yposition",
          "Bottom Roller Data Analysis:"
        )}
        {dataAnalysis(
          "topRoller_initial_Yposition",
          "topRoller_final_Yposition",
          "Top Roller Data Analysis:"
        )}
        <div className="w-full text-center">
          {[measurement, measurement2].map((m, index) => {
            if (m?.completionTime) {
              return (
                <div key={`measurement_${index} `} className=" text-primary">
                  {compare && <span>{users[index]} -</span>} Total Time Taken by
                  all Subactivity ={secondsToDuration(m.completionTime)}
                </div>
              );
            }
          })}
        </div>
      </div>
    </div>
  );

  return (
    <div className="">
      {assemblyData}
      {disAssemblyData}
      {measurementData}
    </div>
  );
};

AssemblyReport.propTypes = {
  assembly: PropTypes.object,
  disAssembly: PropTypes.object,
  measurement: PropTypes.object
};

AssemblyReport.defaultProps = {
  assembly: {},
  disAssembly: {},
  measurement: {}
};

export default AssemblyReport;
