import React from "react";
import dynamic from "next/dynamic";
import PropTypes from "prop-types";
import { getRadialBarChartOptions } from "utils/chartOptionUtils";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const RadialBar = ({ data, width, height, border, options }) => {
  return (
    <div className={`donut ${border}`}>
      <Chart
        options={getRadialBarChartOptions({
          options,
          labels: ["A", "B", "C", "D"]
        })}
        series={data.series}
        type="radialBar"
        width={width}
        height={height}
      />
    </div>
  );
};

RadialBar.propTypes = {
  border: PropTypes.string,
  width: PropTypes.string,
  height: PropTypes.string
};
RadialBar.defaultProps = {
  width: "",
  height: "",
  border: "border border-[#E9EAED]"
};

export default RadialBar;
