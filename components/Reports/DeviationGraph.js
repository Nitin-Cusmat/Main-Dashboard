import React, { useState } from "react";
import { Line } from "react-chartjs-2";

const DeviationGraph = ({ graph, graph2, compare }) => {
  let max = graph.data[0].y;
  let min = Infinity;
  graph.data.forEach(point => {
    if (max < point.y) {
      max = point.y;
    }
    if (min > point.y) {
      min = point.y;
    }
  });
  const plugins = [
    {
      id: "backgrounds",
      beforeDraw: (chart, args, options) => {
        const {
          ctx,
          chartArea,
          scales: { y }
        } = chart;

        ctx.fillStyle = "#f7bfbe";
        ctx.fillRect(
          chartArea.left,
          y.getPixelForValue(chart.scales.y.ticks[0].value),
          chartArea.right - chartArea.left,
          y.getPixelForValue(graph.hAxisLines.min) -
            y.getPixelForValue(chart.scales.y.ticks[0].value)
        );

        ctx.fillStyle = "#cdffcd";
        ctx.fillRect(
          chartArea.left,
          y.getPixelForValue(graph.hAxisLines.min),
          chartArea.right - chartArea.left,
          y.getPixelForValue(graph.hAxisLines.max) -
            y.getPixelForValue(graph.hAxisLines.min)
        );

        ctx.fillStyle = "#f7bfbe";
        ctx.fillRect(
          chartArea.left,
          y.getPixelForValue(graph.hAxisLines.max),
          chartArea.right - chartArea.left,
          y.getPixelForValue(
            chart.scales.y.ticks[chart.scales.y.ticks.length - 1].value
          ) - y.getPixelForValue(graph.hAxisLines.max)
        );
      }
    }
  ];

  const options = {
    responsive: true,
    plugins: {
      datalabels: {
        display: false
      },
      tooltip: {
        callbacks: {
          title: () => null,
          label: tooltipItem => {
            return `${graph.name.split(" ")[0]}: ${tooltipItem.raw.y}`;
          },
          labelColor: tooltipItem => {
            let hoverBackgroundColor = {
              backgroundColor: "green"
            };
            if (tooltipItem.raw.y > graph.hAxisLines.max) {
              hoverBackgroundColor["backgroundColor"] = "red";
            }
            return hoverBackgroundColor;
          }
        }
      },
      legend: {
        display: true,
        position: "top",
        align: "end",
        labels: {
          usePointStyle: true,
          pointStyle: "circle",
          generateLabels: () => {
            const labels = [];

            labels.push({
              text: `High ${graph.name.split(" ")[0]}`,
              fontColor: "black",
              color: "black",
              fillStyle: "#f7bfbe",
              strokeStyle: "#f7bfbe",
              lineWidth: 1,
              hidden: false
            });

            labels.push({
              text: `Ideal ${graph.name.split(" ")[0]}`,
              fontColor: "black",
              fillStyle: "#cdffcd",
              strokeStyle: "#cdffcd",
              lineWidth: 1,
              hidden: false
            });

            return labels;
          }
        }
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
        title: {
          display: true,
          text:
            graph["x-label"].charAt(0).toUpperCase() + graph["x-label"].slice(1)
        },
        type: "linear",
        grid: {
          display: false
        },
        border: {
          display: true
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
          display: true
        }
      },
      y: {
        min: min < 0 ? min : 0,
        max: max > graph.hAxisLines.max ? max : Number(graph.hAxisLines.max),
        grid: {
          display: false
        },
        border: {
          display: true
        },
        ticks: {
          display: true,
          color: "#565B6B"
        }
      }
    }
  };

  const data = {
    datasets: [
      {
        label: "User 1",
        data: graph.data,
        borderColor: "#4b0082",
        tension: 0.5, // for smoother line/curve
        borderWidth: 1,
        showLine: true
      }
    ]
  };
  return (
    <div>
      <Line plugins={plugins} data={data} options={options} height={125} />
    </div>
  );
};

export default DeviationGraph;
