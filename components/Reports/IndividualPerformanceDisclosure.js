import { Disclosure } from "@headlessui/react";
import React from "react";
import GaugeChartBox from "./GuageChartBox";
import BoxData from "components/BoxData";
import Chart from "components/Chart/Chart";
import { CHART_TYPES } from "utils/constants";
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
ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  ArcElement
);

const IndividualPerformanceDisclosure = () => {
  const boxsize = "xl:w-1/4 w-full lg:w-1/2 h-[150px]";

  return (
    <div>
      <div className="flex justify-between w-full flex-wrap gap-x-4 gap-y-4 mt-8">
        <div className="xl:w-1/4 lg:w-1/2 ">
          <GaugeChartBox
            title={"Over all Performance Trend"}
            value={70}
            footer={<span className="text-black text-right">Footer</span>}
          />
        </div>
        <BoxData
          size={boxsize}
          heading={"Time spent across all Use-case"}
          value="13m 13s"
          classnames="!px-0 flex-1"
        />
        <div className="xl:w-1/4 lg:w-1/2 ">
          <GaugeChartBox
            title={"Over all Performance "}
            value={85}
            footer={<span className="text-black text-right">Footer</span>}
          />
        </div>
        <div className="xl:w-1/4 lg:w-1/2 ">
          <GaugeChartBox
            title={"Over all Performance "}
            value={85}
            footer={<span className="text-black text-right">Footer</span>}
          />
        </div>
      </div>

      <div className="pb-5 mx-auto mt-5 xl:w-4/6 border">
        <div className="px-4 py-5 text-lg text-dark">
          Performance Comparison - Across use case
        </div>
        <Chart
          type={CHART_TYPES.BAR}
          series={[
            {
              name: "Attempt 1",
              data: [44, 55, 57, 56, 61, 58, 63, 60, 66]
            },
            {
              name: "Attempt 2",
              data: [76, 85, 101, 98, 87, 105, 91, 114, 94]
            },
            {
              name: "Attempt 3",
              data: [35, 41, 36, 26, 45, 48, 52, 53, 41]
            }
          ]}
          options={{
            // title: {
            //   text: "Performance Comparison - Across use case",
            //   style: {
            //     fontWeight: "bold",
            //     fontSize:
            //       screenWidth > 1024 ? 18 : screenWidth >= 768 ? 12 : 8
            //   }
            // },
            legend: {
              position: "top",
              horizontalAlign: "right"
            },
            responsive: [
              {
                breakpoint: 480,
                options: {
                  legend: {
                    fontSize: "8px",
                    width: "100%",
                    markers: {
                      width: 6,
                      height: 6
                    }
                  }
                }
              }
            ]
          }}
        />
        {/* <GroupedBarChart
        title="Performance Comparison - Across use case"
        dataset={dataset1}
      /> */}
      </div>
    </div>
  );
};

export default IndividualPerformanceDisclosure;
