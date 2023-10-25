import React, { useState } from "react";
import { Line } from "react-chartjs-2";
import { getFormattedTime } from "utils/utils";

const getIdealPath = ideal => {
  let idealPath = ideal ? ideal.map(e => [e.x, e.z, e.directionArrow]) : [];
  return idealPath;
};

const getActualPath = actual => {
  let actualPath = actual
    ? actual.map(e => [e.x, e.z, e.time, e.speed, e.gear, e.brake, e.path])
    : [];
  return actualPath;
};

const getEvents = actualPath => {
  let events = actualPath
    .filter(e => {
      return e.collisionStatus == "1";
    })
    .map(e => [e.x, e.y, "collision", e.z]);
  return events;
};

const getEventsText = events => {
  let eventsText = events ? events.map(item => item[2]) : [];
  return eventsText;
};

const getEventsWithoutText = events => {
  let eventsWithoutText = events
    ? events.map(item => [item[0], item[1], item[3]])
    : [];
  return eventsWithoutText;
};

const getXPathValues = path => {
  let xPath = path ? path.map(point => point[0]) : [];
  return xPath;
};

const setGraphLabels = allXPaths => {
  let labels = Array.from(new Set(allXPaths)).sort((a, b) => a - b);
  return labels;
};

const getEventIndexes = (actual, events, eventsText) => {
  let eventIndexes = {};
  const arraysEqual = (event, item) => {
    return (
      event.length === item.length &&
      event.every((value, index) => value === item[index])
    );
  };
  events.map((event, eindex) => {
    actual.map((item, index) => {
      let key = eventsText[eindex];
      let val = [item.x, item.y, item.z];
      if (arraysEqual(event, val)) {
        if (key in eventIndexes) eventIndexes[key].push(index);
        else eventIndexes[key] = [index];
      }
    });
  });
  return eventIndexes;
};

const getGraphOptions = (
  actualPath1,
  actualPath2,
  setLoading,
  axisLines,
  vAxisLines,
  isReachTruck,
  title
) => {
  let options = {
    responsive: true,
    animation: {
      onComplete: function (animation) {
        setLoading(false);
      }
    },

    plugins: {
      datalabels: {
        display: false
      },
      tooltip: {
        callbacks: {
          title: function () {
            return null;
          },
          // labels for ideal and actual path with events in the tooltip
          label: tooltipItem => {
            if (
              tooltipItem.dataset.label === "Ideal path" &&
              tooltipItem.dataIndex == 0
            )
              return "Starting point";
            if (
              tooltipItem.dataset.label === "Ideal path" &&
              tooltipItem.dataIndex == tooltipItem.dataset.data.length - 1
            )
              return "Ending point";
            if (
              tooltipItem.dataset.label.includes("Pickup") &&
              tooltipItem.raw.pickup
            ) {
              return `Pickup for ${title}`;
            }
            if (
              tooltipItem.dataset.label.includes("Drop") &&
              !tooltipItem.raw.pickup
            ) {
              return `Drop for ${title}`;
            }
            if (tooltipItem.dataset.label === "Obstacles") {
              return "Obstacle";
            }
            let point = null;
            if (tooltipItem.dataset.label == "Actual Path 1") {
              point = actualPath1[tooltipItem.dataIndex];
            } else if (tooltipItem.dataset.label == "Actual Path 2") {
              point = actualPath2[tooltipItem.dataIndex];
            }
            let tooltip = ``;
            if (
              tooltipItem.dataset.label == "Actual Path 1" ||
              tooltipItem.dataset.label == "Actual Path 2"
            ) {
              tooltip += `${point[6]} Time: ${getFormattedTime(
                parseFloat(point[2])
              )}, Speed: ${parseFloat(point[3]).toFixed(2)}, ${
                point[4] !== undefined ? "Gear: " + point[4] + ", " : ""
              }Brake: ${point[5]}`;
            }
            return tooltip;
          }
        }
      },
      legend: {
        display: false,
        position: "right",
        align: "start",
        labels: {
          usePointStyle: true
        }
      },
      decimation: {
        enabled: true,
        algorithm: "lttb"
      }
    },
    elements: {
      point: {
        radius: 0
      }
    },

    scaleShowLabels: false,
    scales: {
      x: {
        type: "linear",
        grid: {
          display: false
        },
        border: {
          display: false
        },
        precision: 0,
        ticks: {
          callback: function (value, index, values) {
            // gets the value for the tick

            return parseFloat(this.getLabelForValue(value)).toFixed(0);
          },
          // autoSkip: true,
          maxTicksLimit: 10,
          color: "#565B6B",
          allowRepeatingValues: false,
          display: false
        }
      },
      y: {
        grid: {
          display: false
        },
        border: {
          display: true
        },
        ticks: {
          display: true,
          color: "#565B6B",
          beginAtZero: true
        },
        display: false
      }
    }
  };

  return options;
};

// let idealPath1 = idealPath ? idealPath.map((point, index) => {
//   if (index >= 30 && index <= 60)
//     return [point[0], point[1], "BackwardArrow"]
//   if (index >= 80 && index <= 110)
//     return [point[0], point[1], "BackwardArrow"]
//   else return point

// }) : []
const MyChart = ({
  ideal,
  actual,
  actual2,
  compare,
  axisLines,
  extraPlots,
  isReachTruck,
  isForkLift,
  obstacles,
  vAxisLines,
  title
}) => {
  const [loading, setLoading] = useState(true);
  // getting data set paths pass these through props with appropriate variable name

  let idealPath = ideal ? ideal.map(e => [e.x, e.z, e.directionArrow]) : [];

  let actualPath = getActualPath(actual);
  let actualPath2 = actual2 && getActualPath(actual2);

  let events = getEvents(actual);
  let events2 = actual2 && getEvents(actual2);

  let eventsText = getEventsText(events);
  let eventsText2 = getEventsText(events2);

  // getting events without the text
  events = getEventsWithoutText(events);
  events2 = events2 && getEventsWithoutText(events2);

  // getting all the x values from the paths
  let idealPathX = getXPathValues(idealPath);
  let eventX = getXPathValues(events);
  let eventX2 = getXPathValues(events2);

  let actualPathX = getXPathValues(actualPath);
  let actualPathX2 = actualPath2 && getXPathValues(actualPath2);

  // creating the labels for the x axis of the graph with the x values from the path and make it unique with set
  let labels = setGraphLabels(
    compare && actualPathX2
      ? [...actualPathX2, ...actualPathX, ...eventX2, ...eventX, ...idealPathX]
      : [...actualPathX, ...eventX, ...idealPathX]
  );

  // getting indexes of events in the actual path (assuming that the events are already present in the actual path)
  let eventIndexes = getEventIndexes(actual, events, eventsText);
  let eventIndexes2 =
    actual2 &&
    events2 &&
    eventsText2 &&
    getEventIndexes(actual2, events2, eventsText2);

  // undefined should be changed to actualPath2 and eventIndexes2
  let options = getGraphOptions(
    actualPath,
    actualPath2,
    setLoading,
    axisLines,
    vAxisLines,
    isReachTruck,
    title
    // eventIndexes,
    // eventIndexes2
  );

  // to change the color of the line segment with accordance with the forward arrow and backward arrow
  const changeLineSegmentColor = (
    context,
    forwardColor,
    backwardColor,
    defaultColor
  ) => {
    // trueValue is returned if the data is an event else falseValue is returned
    if (
      context?.p0?.raw?.length > 0 &&
      context?.p0?.raw[2] === "ForwardArrow"
    ) {
      return forwardColor;
    }
    if (
      context?.p0?.raw?.length > 0 &&
      context?.p0?.raw[2] === "BackwardArrow"
    ) {
      return backwardColor;
    }
    return defaultColor;
  };
  // common function to get correct pointBorderColor, pointStyle, rotation, radius
  const diff = ({
    context,
    trueValue,
    falseValue,
    showArrow,
    arrowValue,
    firstValue,
    lastValue
  }) => {
    if (context.dataIndex === 0) return firstValue;
    if (context.dataIndex === context.dataset.data.length - 1) return lastValue;
    if (showArrow) {
      let firstArrowIndex = parseInt(context.dataset.data.length * 0.9);

      if (context.dataIndex == firstArrowIndex) {
        return arrowValue;
      }
    }
    // trueValue is returned if the data is an event else falseValue is returned
    if (Object.values(eventIndexes)[0] == undefined) return falseValue;
    if (Object.values(eventIndexes)[0].includes(context.dataIndex)) {
      return trueValue;
    }
    return falseValue;
  };

  const idealPathData = {
    label: "Ideal path",
    data: idealPath,
    segment: {
      borderColor: context =>
        changeLineSegmentColor(context, "blue", "orange", "red")
    },
    borderDashOffset: "2",
    borderDash: [8, 5],
    tension: 0.5, // for smoother line/curve
    borderWidth: 2,
    showLine: true,
    pointBackgroundColor: context =>
      diff({ context: context, firstValue: "green", lastValue: "red" }),
    pointBorderColor: context =>
      diff({ context: context, firstValue: "green", lastValue: "red" }),
    pointStyle: context =>
      diff({ context: context, firstValue: "circle", lastValue: "rect" }),
    radius: context =>
      diff({
        context: context,
        firstValue: axisLines || vAxisLines ? 7 : 15,
        lastValue: axisLines || vAxisLines ? 7 : 15
      })
  };

  // actualpath dataset with events
  const actualPathDataWithEvents = {
    label: "Actual Path 1",
    data: actualPath,
    fill: false,
    backgroundColor: "green",
    segment: {
      borderColor: context =>
        changeLineSegmentColor(context, "green", "orange", "green")
    },
    tension: 0.5, // for smoother line/curve
    borderWidth: 2,
    showLine: true
  };
  const actualPathDataWithEvents2 = actual2 &&
    compare && {
      label: "Actual Path 2",
      data: actualPath2,
      fill: false,
      backgroundColor: "green",
      segment: {
        borderColor: context =>
          changeLineSegmentColor(context, "#00FFFF", "orange", "#00FFFF")
      },
      tension: 0.5, // for smoother line/curve
      borderWidth: 2,
      showLine: true
    };

  let obstaclePlots = null;
  if (obstacles) {
    obstaclePlots = {
      label: "Obstacles",
      tension: 0.5, // for smoother line/curve
      borderWidth: 2,
      showLine: false,
      data: obstacles,
      pointStyle: "rect",
      rotation: 45,
      pointBackgroundColor: "brown",
      pointBorderColor: "brown",
      radius: 4
    };
  }

  const getAxisLinePlotPoints = (axislinesdata, horizontal = true) => {
    let plotLines = [];
    if (axislinesdata) {
      plotLines = axislinesdata.map(al => {
        let listToPlot = [];
        listToPlot.push(
          horizontal
            ? { x: parseFloat(al.xmax), y: parseFloat(al.y) }
            : { y: parseFloat(al.ymax), x: parseFloat(al.x) }
        );
        listToPlot.push(
          horizontal
            ? { x: parseFloat(al.xmin), y: parseFloat(al.y) }
            : { y: parseFloat(al.ymin), x: parseFloat(al.x) }
        );
        return {
          segment: {
            borderColor:
              (extraPlots && extraPlots.length) || isForkLift
                ? "#5256b8"
                : "white"
          },
          borderWidth: 2,
          showLine:
            (extraPlots && extraPlots.length) || isForkLift ? true : false,
          data: listToPlot,
          label: ""
        };
      });
    }
    const color =
      extraPlots &&
      extraPlots.length &&
      extraPlots.map(plot => (plot.pickup === true ? "Orange" : "yellow"));

    const pickupdropPlot = {
      label:
        extraPlots &&
        extraPlots.length &&
        extraPlots.map(plot => (plot.pickup === true ? "Pickup" : "Drop")),
      tension: 0.5, // for smoother line/curve
      borderWidth: 2,
      showLine: false,
      data: extraPlots,
      pointBackgroundColor: context =>
        diff({ context: context, firstValue: color, lastValue: color }),
      pointBorderColor: context =>
        diff({ context: context, firstValue: "black", lastValue: "black" }),
      pointStyle: context =>
        diff({ context: context, firstValue: "rect", lastValue: "rect" }),
      radius: context =>
        diff({
          context: context,
          firstValue: 12,
          lastValue: 12
        })
    };
    if (extraPlots) {
      plotLines.push(pickupdropPlot);
    }
    if (obstaclePlots) {
      plotLines.push(obstaclePlots);
    }
    return plotLines;
  };

  let linesToPlot = null;
  // if (axisLines) {
  linesToPlot = getAxisLinePlotPoints(axisLines);
  // }
  let resultArray = [];
  if (vAxisLines && vAxisLines.length) {
    linesToPlot = getAxisLinePlotPoints(vAxisLines, false);
    if (isForkLift) {
      let maxY = vAxisLines[0].ymax;
      vAxisLines.forEach(point => {
        if (point.ymax > maxY) {
          maxY = point.ymax;
        }
      });
      for (let i = 1; i < vAxisLines.length; i++) {
        let textPlot = [];

        if (i % 2 == 1) {
          textPlot.push({ x: vAxisLines[i - 1].x, y: vAxisLines[i - 1].ymax });
          textPlot.push({ x: vAxisLines[i].x, y: vAxisLines[i].ymax });

          resultArray.push({
            segment: {
              borderColor: "#FFA500"
            },
            borderWidth: 2,
            showLine: true,
            data: textPlot,
            backgroundColor: "#DADADA",
            fill: "+1"
          });

          resultArray.push({
            segment: {
              borderColor: "#FFA500"
            },
            borderWidth: 2,
            showLine: true,
            data: [
              {
                x: vAxisLines[i - 1].x,
                y: (vAxisLines[i - 1].ymax + vAxisLines[i - 1].ymin) / 2
              },
              {
                x: vAxisLines[i].x,
                y: (vAxisLines[i].ymax + vAxisLines[i].ymin) / 2
              }
            ],
            label: "",
            backgroundColor: "#DADADA",
            fill: "+1"
          });
          resultArray.push({
            segment: {
              borderColor: "#FFA500"
            },
            borderWidth: 2,
            showLine: true,
            data: [
              { x: vAxisLines[i - 1].x, y: vAxisLines[i - 1].ymin },
              { x: vAxisLines[i].x, y: vAxisLines[i].ymin }
            ],
            label: ""
          });
        } else {
          const xMid =
            (parseFloat(vAxisLines[i - 1].x) + parseFloat(vAxisLines[i].x)) / 2;
          textPlot.push({ x: xMid, y: maxY + 5 });
          textPlot.push({ x: xMid, y: vAxisLines[i].ymin });
          resultArray.push({
            segment: {
              borderColor: "red"
            },
            borderWidth: 2,
            borderDash: [5, 5],
            showLine: true,
            data: textPlot
          });
        }
      }
      linesToPlot.push(...resultArray);
    }
  }
  const data = {
    labels: labels,
    datasets:
      compare && actual2
        ? linesToPlot
          ? [
              idealPathData,
              actualPathDataWithEvents,
              actualPathDataWithEvents2,
              ...linesToPlot
            ]
          : [idealPathData, actualPathDataWithEvents, actualPathDataWithEvents2]
        : linesToPlot
        ? [idealPathData, actualPathDataWithEvents, ...linesToPlot]
        : [idealPathData, actualPathDataWithEvents]
  };

  return (
    <div className="rounded  text-slate-500">
      <div className="min-h-[300px] relative pt-8">
        {loading && (
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            Loading
          </span>
        )}
        {/* <CustomLegend /> */}
        <Line data={data} options={options} height={125} />
      </div>
    </div>
  );
};

export default MyChart;
