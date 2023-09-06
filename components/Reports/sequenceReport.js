import CustomTable from "components/CustomTable";
import React from "react";
import RangeBarChart from "./RangeBarChart";
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
import { CHART_COLORS } from "utils/constants";
import EChart from "components/Chart/EChart";
import { formatTimeDay, getFormattedTime } from "utils/utils";
import BoxData from "components/BoxData";
ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  ArcElement
);

const SequenceReport = ({
  tasks,
  tasks2,
  compare,
  users,
  attemptDuration,
  attemptData
}) => {
  const task = tasks;
  const task2 = tasks2;

  const getRangeData = mainTask => {
    let rangeData = [];
    if (
      mainTask &&
      mainTask["idealSequence"] &&
      mainTask["idealSequence"].length > 0
    ) {
      mainTask["idealSequence"].forEach(item => {
        const min = item.timeRange.min ? item.timeRange.min : 0;
        let max = item.timeRange.max;
        max = Math.ceil(max);

        let actualTaskObj = mainTask["actualSequence"].find(
          actualItem => actualItem.name == item.name
        );

        rangeData.push({
          ...item,
          value: actualTaskObj.time + "s",
          decimalValue: actualTaskObj.time.toFixed(2),
          range: [min, max],
          "ideal range": item.timeRange.min + "-" + item.timeRange.max
        });
      });
    }
    return rangeData;
  };

  const maxLength =
    task["idealSequence"].length > task["actualSequence"].length
      ? task["idealSequence"].length
      : task["actualSequence"].length;

  let SequenceComparisonList = [];
  if (task["idealSequence"]) {
    for (let i = 0; i < maxLength; i++) {
      const idealObj = task["idealSequence"][i] ? task["idealSequence"][i] : {};
      const actualObj = task["actualSequence"][i]
        ? task["actualSequence"][i]
        : {};
      let actualObj2;
      if (compare && task2["actualSequence"]) {
        actualObj2 = task2["actualSequence"][i]
          ? task2["actualSequence"][i]
          : {};
      }
      const a =
        compare && actualObj2
          ? {
              "Ideal Object Placement": idealObj.name,
              "Placement User1":
                idealObj.name == actualObj.name ? "correct" : "incorrect",
              "User1 Object Placement": actualObj.name,
              "Placement User2":
                idealObj.name == actualObj2.name ? "correct" : "incorrect",
              "User2 Object Placement": actualObj2.name
            }
          : {
              "Ideal Object Placement": idealObj.name,
              Placement:
                idealObj.name == actualObj.name ? "correct" : "incorrect",
              "User Object Placement": actualObj.name
            };
      SequenceComparisonList.push(a);
    }
  }

  const series = [
    {
      name: "user 1",
      data: task["actualSequence"].map(t => t.time)
    },
    {
      name: "user 2",
      data: task["actualSequence"].map(t => t.time)
    }
  ];
  return (
    <div className="my-4 ">
      <div className="font-bold text-dark ">Tasks</div>
      <div className="w-full flex flex-col lg:flex-row gap-5">
        {/* ideal vs actual sequence followed table */}
        {compare && task2["idealSequence"] && task2["actualSequence"]
          ? task["idealSequence"] &&
            task["actualSequence"] &&
            task2["idealSequence"] &&
            task2["actualSequence"] && (
              <CustomTable
                columns={[
                  "Ideal Object Placement",
                  "Placement User1",
                  "Placement User2",
                  "User1 Object Placement",
                  "User2 Object Placement"
                ]}
                rows={SequenceComparisonList}
              />
            )
          : task["idealSequence"] &&
            task["actualSequence"] && (
              <CustomTable
                columns={[
                  "Ideal Object Placement",
                  "Placement",
                  "User Object Placement"
                ]}
                rows={SequenceComparisonList}
              />
            )}

        {/* sequence followed table */}
        {compare && task["actualSequence"] && task2["actualSequence"] && (
          <CustomTable
            columns={[
              "Index",
              "Sequence Followed by User1",
              "Sequence Followed by User2"
            ]}
            rows={task["actualSequence"].map((s, index) => {
              return {
                Index: index,
                "Sequence Followed by User1": s.name,
                "Sequence Followed by User2":
                  task2["actualSequence"][index].name
              };
            })}
          />
        )}
        {!compare && task["actualSequence"] && task["actualSequence"] && (
          <CustomTable
            columns={["Index", "Sequence Followed"]}
            rows={task["actualSequence"].map((s, index) => {
              return { Index: index, "Sequence Followed": s.name };
            })}
          />
        )}
      </div>

      {/* bar chart for time taken by each task with respect to its ideal range */}
      <div className="mt-4">
        <div className="border">
          <RangeBarChart
            rangeData={
              compare
                ? [getRangeData(task), getRangeData(task2)]
                : [getRangeData(task)]
            }
            title="Time taken for each task with respect to its ideal time range"
            compare={compare}
          />
        </div>
      </div>

      {/* time taken by each task pie chart */}
      <div className="mt-5 pb-0 text-dark text-lg">
        Time Taken by Each Task W.R.T total Time Taken
      </div>
      <div className="flex justify-center w-full h-[500px]">
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
              show: false
            },
            series: compare
              ? [
                  {
                    type: "pie",
                    radius: ["70%", "90%"],
                    data: tasks["actualSequence"].map(task => {
                      return {
                        value: task.time,
                        name: task.name
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
                    data: tasks2["actualSequence"].map(task => {
                      return {
                        value: task.time,
                        name: task.name
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
                    radius: ["40%", "60%"],
                    data: tasks["actualSequence"].map(task => {
                      return {
                        value: task.time,
                        name: task.name
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
                  }
                ]
          }}
        />
      </div>
    </div>
  );
};

export default SequenceReport;
