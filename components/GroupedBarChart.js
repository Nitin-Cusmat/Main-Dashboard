import React from "react";
import { Bar } from "react-chartjs-2";
import { useRecoilValue } from "recoil";
import deviceState from "states/deviceState";
import ChartDataLabels from "chartjs-plugin-datalabels";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
);

const GroupedBarChart = ({
  title,
  dataset,
  stacked,
  labels,
  xLabel,
  yLabel,
  isWinder,
  isShovel,
  horizontalBars,
  maxValue
}) => {
  const { screenWidth } = useRecoilValue(deviceState);

  const options = {
    barPercentage: 0.8,
    categoryPercentage: 0.3,
    responsive: true,
    aspectRatio:
      screenWidth < 500
        ? 1
        : screenWidth < 700
        ? 1.3
        : screenWidth < 900
        ? 1.5
        : screenWidth < 1500
        ? 1.6
        : 1.8,
    plugins: {
      tooltip: {
        displayColors: false,
        callbacks: !isShovel
          ? {
              title: function (tooltipItem) {
                return tooltipItem[0].label;
              },
              label: tooltipItem => {
                const datasetLabel = tooltipItem.dataset.label;
                if (datasetLabel && datasetLabel.trim() !== "")
                  return `${tooltipItem.dataset.label}: ${
                    tooltipItem.dataset.data[tooltipItem.dataIndex]
                  }`;
                else
                  return `${tooltipItem.dataset.data[tooltipItem.dataIndex]}`;
              }
            }
          : {
              title: function () {
                return null;
              },
              label: tooltipItem => {
                const loading =
                  ((tooltipItem.parsed._stacks.x[0] +
                    tooltipItem.parsed._stacks.x[1]) /
                    maxValue) *
                  100;
                const spillage =
                  (tooltipItem.parsed._stacks.x[1] /
                    (tooltipItem.parsed._stacks.x[0] +
                      tooltipItem.parsed._stacks.x[1])) *
                  100;
                return `Loading: ${loading
                  .toFixed(2)
                  .replace(/\.00$/, "")}%, Spillage: ${spillage
                  .toFixed(2)
                  .replace(/\.00$/, "")}%`;
              }
            }
      },
      datalabels: {
        display: isWinder ? true : false,
        color: "black",
        formatter: Math.round,
        anchor: "end",
        offset: -20,
        align: "start"
      },
      legend: {
        display: true,
        position: "right",
        align: screenWidth >= 768 ? "start" : "end",
        labels: {
          usePointStyle: true,
          font: {
            size: screenWidth > 1024 ? 14 : screenWidth >= 768 ? 10 : 6
          }
        }
      }
    },
    scales: {
      x: {
        max: horizontalBars ? maxValue : dataset[0].data.length,
        stacked: true,
        title: {
          display: true,
          text: xLabel,
          font: {
            weight: "bold"
          }
        }
      },
      y: {
        stacked: true,
        title: {
          display: true,
          text: yLabel,
          font: {
            weight: "bold"
          }
        }
      }
    },
    indexAxis: horizontalBars ? "y" : "x"
  };

  const data = {
    labels: labels,
    datasets: dataset,
  };
  return (
    <div className="max-md:w-full p-5">
      <Bar options={options} data={data} width={"100%"} height={"100%"} />
    </div>
  );
};

export default GroupedBarChart;
