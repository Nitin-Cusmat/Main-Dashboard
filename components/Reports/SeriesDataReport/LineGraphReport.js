import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  RadialLinearScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  RadialLinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const LineGraphReport = ({ data, options, borderColor, labels }) => {
  const dataset = data.flatMap(seriesData => {
    return seriesData["series-data"].flatMap(dataSeries =>
      dataSeries["data-series"].flatMap(datasetArr => {
        return [datasetArr["data"].map(dataset => dataset[1])];
      })
    );
  });

  const datasets = [];
  for (let index = 0; index < dataset.length; index++) {
    const datasetAttributes = {
      label: data[index]["user-id"],
      data: dataset[index],
      borderColor: borderColor[index],
      borderDashOffset: "2",
      tension: 0.1, // for smoother line/curve
      borderWidth: 2,
      showLine: true,
      pointBackgroundColor: "white"
    };
    datasets.push(datasetAttributes);
  }

  const formattedData = {
    labels: labels,
    datasets: datasets
  };
  return <Line data={formattedData} options={options} />;
};

export default LineGraphReport;
