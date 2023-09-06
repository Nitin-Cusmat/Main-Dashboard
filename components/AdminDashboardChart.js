import React, { useEffect, useState } from "react";
import LoadingSpinner from "./LoadingSpinner";
import apiRoutes from "utils/api-routes";
import { trackPromise } from "react-promise-tracker";
import request from "utils/api";
import { CHART_TYPES, HTTP_METHODS, HTTP_STATUSES } from "utils/constants";
import Chart from "./Chart/Chart";
import { useRecoilValue } from "recoil";
import deviceState from "states/deviceState";
import { timeConverter, getFormattedTime } from "utils/utils";
import ReactLoading from "react-loading";

const AdminDashboardChart = () => {
  const { screenWidth } = useRecoilValue(deviceState);
  const [applicationChartFreq, setApplicationChartFreq] = useState("monthly");
  const [lineData, setLineData] = useState(null);
  const [loading, setLoading] = useState(true);

  const getLineData = async () => {
    trackPromise(
      request(apiRoutes.organization.adminUserPerformance, {
        isAuthenticated: true,
        method: HTTP_METHODS.GET
      })
        .then(async res => {
          if (res && res.status == HTTP_STATUSES.OK) {
            const response = await res.json();
            setLineData(response);
            setLoading(false);
          } else {
            setLoading(false);
          }
        })
        .catch(error => {
          setLoading(false);
        })
    );
  };
  useEffect(() => {
    getLineData();
  }, []);

  const applicationChartData =
    applicationChartFreq && lineData && lineData[applicationChartFreq];
  let maxValue = -Infinity;
  if (applicationChartData) {
    for (const value of Object.values(applicationChartData)) {
      if (value > maxValue) {
        maxValue = value;
      }
    }
  }

  return (
    <div className="mt-4 max-sm:mx-2 md:mx-4">
      <div className="w-full mb-4 md:mb-0 min-h-full">
        <div className="flex flex-col rounded border py-5 text-slate-500 h-full">
          <div className="px-3 text-dark lg:text-lg text-md flex justify-between">
            <span className="text-sm md:text-md">Application Usage</span>
            <select
              className="outline-none text-sm md:text-md"
              onChange={e => {
                setApplicationChartFreq(e.target.value);
              }}
            >
              <option value="monthly" selected={true}>
                Monthly
              </option>
              <option value="quaterly">Quarterly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
          <div className="flex flex-1 justify-center items-end relative">
            {applicationChartFreq &&
            lineData &&
            Object.keys(lineData[applicationChartFreq]).length > 0 &&
            !Object.values(lineData[applicationChartFreq]).every(
              value => value === 0
            ) ? (
              <Chart
                type={CHART_TYPES.BAR}
                // labels={Object.keys(lineData[applicationChartFreq])}
                series={[
                  {
                    data: Object.keys(lineData[applicationChartFreq]).map(
                      key => {
                        return {
                          x: key,
                          y: lineData[applicationChartFreq][key]
                        };
                      }
                    )
                  }
                ]}
                options={{
                  tooltip: {
                    enabled: true,
                    custom: function ({
                      series,
                      seriesIndex,
                      dataPointIndex,
                      w
                    }) {
                      const month = w.config.series[0].data[dataPointIndex].x;
                      const color = w.config.colors[seriesIndex];
                      const tooltipStyle = `background-color: ${color}; color: white; padding: 10px;`;
                      return `<div style="${tooltipStyle}">${month}: ${timeConverter(
                        series[seriesIndex][dataPointIndex],
                        true
                      )} </div>`;
                    }
                  },
                  yaxis: {
                    min: 0,
                    max:
                      maxValue > 3600
                        ? maxValue + 7200
                        : maxValue > 60
                        ? maxValue + 120
                        : maxValue + 2,
                    tickAmount: 5,
                    labels: {
                      formatter: function (value) {
                        let returnValue = "";
                        if (maxValue > 3600) {
                          returnValue = Math.ceil(value / 3600) + "h";
                        } else if (maxValue > 60) {
                          returnValue = Math.floor(value / 60) + "m";
                        } else {
                          returnValue = Math.floor(value / 1) + "s";
                        }
                        return returnValue;
                      }
                    }
                  }
                }}
                width={
                  screenWidth > 1600 ? 500 : screenWidth > 1280 ? 400 : 300
                }
                height={350}
              />
            ) : loading ? (
              <div className="flex items-center justify-center h-[400px]">
                <ReactLoading
                  type={"spin"}
                  color={"var(--primary-color)"}
                  height={20}
                  width={20}
                />
              </div>
            ) : (
              <div className="flex-1 h-[400px]">
                <div className="text-center text-sm md:text-md absolute top-1/2 left-1/2 -translate-x-1/2 ">
                  No data available
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardChart;
