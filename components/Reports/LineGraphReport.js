import React from "react";

import Chart from "components/Chart/Chart";
import { CHART_COLORS, CHART_TYPES } from "utils/constants";

const LineGraphReport = () => {
  /* this is for line graph with single line */
  return (
    <div className="rounded border p-3 text-slate-500 col-start-1 col-end-3 mt-8">
      <div className="text-lg text-dark">Working of Hand brake</div>
      <div className="">
        <Chart
          type={CHART_TYPES.LINE}
          series={[
            {
              name: "Anupam Rawat",
              data: [30, 45, 45, 21, 10, 25]
            }
          ]}
          labels={["Jan", "Feb", "Mar", "Apr", "May", "Jun"]}
          options={{
            colors: [CHART_COLORS.chartGreen],
            markers: {
              size: 3
            }
          }}
        />
      </div>
    </div>
  );
};

export default LineGraphReport;
