import React, { useEffect, useState } from "react";
import deviceState from "states/deviceState";
import { useRecoilValue } from "recoil";
import Chart from "components/Chart/Chart";
import { CHART_TYPES, HTTP_METHODS, HTTP_STATUSES } from "utils/constants";
import request from "utils/api";
import apiRoutes from "utils/api-routes";
import { trackPromise } from "react-promise-tracker";
import LoadingSpinner from "./LoadingSpinner";
import useUserProfile from "hooks/useUserProfile";
import { getFormattedTime, timeConverter } from "utils/utils";
import EChart from "./Chart/EChart";
import ReactLoading from "react-loading";

const DashBoardCharts = ({ data }) => {
  const { screenWidth } = useRecoilValue(deviceState);
  const { organization } = useUserProfile();
  const [applicationChartFreq, setApplicationChartFreq] = useState("monthly");
  const [lineData, setLineData] = useState(null);
  const [pieData, setPieData] = useState(null);
  const [usecaseFreq, setUsecaseFreq] = useState("all");
  const [isLoadingLineData, setIsLoadingLineData] = useState(true);
  const [isLoadingPieData, setIsLoadingPieData] = useState(true);

  const getLineData = async () => {
    trackPromise(
      request(`${apiRoutes.organization.applicationUsage}0/`, {
        isAuthenticated: true,
        method: HTTP_METHODS.POST,
        body: {
          organization_id: organization.id
        }
      })
        .then(async res => {
          if (res.status == HTTP_STATUSES.OK) {
            const response = await res.json();
            setLineData(response);
            setIsLoadingLineData(false);
          } else {
            setIsLoadingLineData(false);
          }
        })
        .catch(err => {
          setIsLoadingLineData(false);
        })
    );
  };
  const getPieData = async () => {
    request(`${apiRoutes.organization.applicationUsage}1/`, {
      isAuthenticated: true,
      method: HTTP_METHODS.POST,
      body: {
        organization_id: organization.id
      }
    })
      .then(async res => {
        if (res.status == HTTP_STATUSES.OK) {
          const response = await res.json();
          setPieData(response);
          setIsLoadingPieData(false);
        } else {
          setIsLoadingPieData(false);
        }
      })
      .catch(err => {
        setIsLoadingPieData(false);
      });
  };
  useEffect(() => {
    getLineData();
    getPieData();
  }, [organization]);
  data.counts_by_month = {};

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
    <div>
      <div className="flex flex-wrap mt-4 max-sm:mx-2 md:mx-4">
        <div className="w-full mb-4 md:mb-0 md:w-2/4 xl:w-2/5 min-h-full md:pr-2">
          <div className="flex flex-col rounded border py-5 text-slate-500 h-full">
            <div className="px-3 text-dark lg:text-lg text-md flex justify-between">
              <LoadingSpinner area="line-data" />
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
                      tickAmount: 4,
                      labels: {
                        formatter: function (value) {
                          let returnValue = "";
                          if (maxValue > 3600) {
                            returnValue = Math.ceil(value / 3600) + "h";
                          } else if (maxValue > 60) {
                            returnValue = Math.floor((value % 3600) / 60) + "m";
                          } else {
                            returnValue = Math.floor(value % 60) + "s";
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
              ) : isLoadingLineData ? (
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

        <div className="w-full md:w-2/4 xl:w-2/5 min-h-full md:pl-2">
          <div className="flex flex-col rounded border py-5 text-slate-500 h-full">
            <div className="px-3 text-dark lg:text-lg text-md flex justify-between items-start">
              <span className="text-sm md:text-md">
                Application Usage - Usecases
              </span>
              <div className="flex">
                <label
                  for="usecase-all"
                  className={`px-3 mx-1 border border-gray-200 rounded-md cursor-pointer flex items-center text-sm md:text-md ${
                    usecaseFreq == "all" ? "bg-primary text-white" : ""
                  }`}
                >
                  <input
                    type={"radio"}
                    id="usecase-all"
                    name="usecase"
                    value={"all"}
                    className="hidden"
                    onChange={e => setUsecaseFreq(e.target.value)}
                  />
                  All
                </label>
                <label
                  for="usecase-1m"
                  className={`px-3 mx-1 border border-gray-200 rounded-md cursor-pointer flex items-center text-sm md:text-md ${
                    usecaseFreq == "1m" ? "bg-primary text-white" : ""
                  }`}
                >
                  <input
                    type={"radio"}
                    id="usecase-1m"
                    name="usecase"
                    value={"1m"}
                    className="hidden"
                    onChange={e => setUsecaseFreq(e.target.value)}
                  />
                  1M
                </label>
                <label
                  for="usecase-6m"
                  className={`px-3 mx-1 border border-gray-200 rounded-md cursor-pointer flex items-center text-sm md:text-md ${
                    usecaseFreq == "6m" ? "bg-primary text-white" : ""
                  }`}
                >
                  <input
                    type={"radio"}
                    id="usecase-6m"
                    name="usecase"
                    value={"6m"}
                    className="hidden"
                    onChange={e => setUsecaseFreq(e.target.value)}
                  />
                  6M
                </label>
                <label
                  for="usecase-1y"
                  className={`px-3 mx-1 border border-gray-200 rounded-md cursor-pointer flex items-center text-sm md:text-md ${
                    usecaseFreq == "1y" ? "bg-primary text-white" : ""
                  }`}
                >
                  <input
                    type={"radio"}
                    id="usecase-1y"
                    name="usecase"
                    value={"1y"}
                    className="hidden"
                    onChange={e => setUsecaseFreq(e.target.value)}
                  />
                  1Y
                </label>
              </div>
            </div>
            <div className="h-full flex-1  flex items-center justify-center">
              <div className="relative h-full w-full">
                {pieData && pieData[usecaseFreq].length > 0 ? (
                  <EChart
                    options={{
                      tooltip: {
                        formatter: params => {
                          const name = params.data.name;
                          const time = timeConverter(params.data.value, true);
                          const percentage = params.percent;
                          return `${name}: ${time} (${percentage}%)`;
                        }
                      },
                      series: [
                        {
                          data: pieData[usecaseFreq].map(item => {
                            return {
                              value: Object.values(item)[0],
                              name: Object.keys(item)[0]
                            };
                          })
                        }
                      ]
                    }}
                  />
                ) : isLoadingPieData ? (
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
      </div>
      <div className="sm:w-full md:w-3/4 xl:w-4/5  min-h-full mt-4 max-sm:px-2 md:pl-4 pr-2">
        <div className="flex flex-col rounded border py-5 text-slate-500 h-full">
          <div className="relative px-3 text-dark lg:text-lg text-md flex flex-col justify-between items-start min-h-[35vh]">
            <span className="text-sm md:text-md w-full">
              Performance trends across usecases over time
            </span>
            {data.monthly_counts &&
            Object.keys(data.monthly_counts).length > 0 ? (
              <div className="w-full">
                <Chart
                  type={CHART_TYPES.LINE}
                  height={350}
                  labels={Object.keys(
                    data.monthly_counts[Object.keys(data.monthly_counts)[0]]
                  )}
                  series={Object.keys(data.monthly_counts).map(key => {
                    return {
                      name: key,
                      data: Object.values(data.monthly_counts[key])
                    };
                  })}
                  options={{
                    stroke: {
                      width: [4, 3, 5],
                      dashArray: [0, 8, 5]
                    },
                    yaxis: {
                      max: 100,
                      tickAmount: 5
                    }
                  }}
                />
              </div>
            ) : (
              <div className="text-center text-sm md:text-md absolute top-1/2 left-1/2 -translate-x-1/2 ">
                No data available
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashBoardCharts;
