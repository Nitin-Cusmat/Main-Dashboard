import React, { useState } from "react";
import { Line } from "react-chartjs-2";
import useUserProfile from "hooks/useUserProfile";
const DeviationGraph = ({ graph }) => {
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
      afterBuildTicks: function (chart) {
        let ticks = chart.scales.y.ticks;
        let positiveTicks = ticks.filter(item => item.value > 0);
        let negativeTicks = ticks.filter(item => item.value < 0);
        const stepSize = positiveTicks.length > 1 ? positiveTicks[1].value - positiveTicks[0].value : 0;        
        const lastValue = ticks[ticks.length - 1].value;

        chart.scales.y.ticks = ticks;
        if (max < graph.hAxisLines.max) {
          for (
            let i = lastValue + stepSize;
            i <= graph.hAxisLines.max;
            i = i + stepSize
          ) {
            ticks.push({ value: i, label: i.toString() });
          }
          chart.scales.y.max = ticks[ticks.length - 1].value;
        }
        if (min < 0) {
          const negativeStepSize =
            negativeTicks[negativeTicks.length - 2].value -
            negativeTicks[negativeTicks.length - 1].value;
          let negativeTicksLength = negativeTicks.length;
          for (let i = min, idx = 0; i < 0; i = i - negativeStepSize) {
            ticks[idx] = {
              value: negativeStepSize * negativeTicksLength,
              label: negativeStepSize * negativeTicksLength.toString()
            };
            idx = idx + 1;
            negativeTicksLength = negativeTicksLength - 1;
          }
          chart.scales.y.min = ticks[0].value;
        }

        return;
      },
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

  const { organization } = useUserProfile();

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
              text: `Ideal ${graph.name.split(" ")[0]} (${graph.hAxisLines.min} to ${graph.hAxisLines.max})`,
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
        
    radius: 6, // Set the marker radius to your desired size
    backgroundColor: "#a7b0f2", // Marker fill color
    borderWidth:1, // Marker border width
    borderColor: "white", // Marker border color
    hoverRadius: 8, // Marker radius on hover
    hoverBackgroundColor: "red", // Marker fill color on hover
    hoverBorderWidth:1, // Marker border width on hover
    hoverBorderColor: "white", // Marker border color on hover
      }
    },
    animation: {
      duration: 10000, // Animation duration in milliseconds
      easing: "easeInOutQuad", // Easing function for the animation (you can change this)
    },

    scaleShowLabels: false,
    scales: {
      x: {
        title: {
          display: true,
          text:
            graph["xlabel"].charAt(0).toUpperCase() + graph["xlabel"].slice(1)
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
          maxTicksLimit: 10,
          color: "#565B6B",
          allowRepeatingValues: false,
          display: true
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
          color: "#565B6B"
        },
        min : organization.name.toLowerCase()==="apollo" ? -1 : min,
        max : organization.name.toLowerCase()==="apollo" ? 1 : max,
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
      <Line plugins={plugins} data={data} options={options} height={100} />{" "}
    </div>
  );
};

export default DeviationGraph;

