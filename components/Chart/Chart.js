import dynamic from "next/dynamic";
import {
  getAreaChartOptions,
  getBarChartOptions,
  getLineChartOptions,
  getPieChartOptions,
  getRadarChartOptions,
  getRadialBarChartOptions
} from "utils/chartOptionUtils";
import { CHART_TYPES } from "utils/constants";

const ApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });
const chartOptions = {
  [CHART_TYPES.LINE]: getLineChartOptions,
  [CHART_TYPES.BAR]: getBarChartOptions,
  [CHART_TYPES.PIE]: getPieChartOptions,
  [CHART_TYPES.RADIAL]: getRadialBarChartOptions,
  [CHART_TYPES.AREA]: getAreaChartOptions,
  [CHART_TYPES.RADAR]: getRadarChartOptions,
  [CHART_TYPES.DOUGHNUT]: getRadarChartOptions
};
const Chart = ({
  type,
  height = "auto",
  width = "100%",
  series = [],
  labels = [],
  options
}) => {
  return (
    <ApexChart
      type={type}
      width={width}
      height={height}
      options={chartOptions[type]({ options, labels })}
      series={series}
    />
  );
};

export default Chart;
