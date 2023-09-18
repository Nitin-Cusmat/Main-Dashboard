import { Disclosure } from "components/Disclosure";
import React, { useEffect, useState } from "react";
import BoxData from "components/BoxData";
import CustomTable from "components/CustomTable";
import Chart from "components/Chart/Chart";
import SequenceReport from "./sequenceReport";
import {
  CHART_COLORS,
  CHART_TYPES,
  HTTP_METHODS,
  HTTP_STATUSES
} from "utils/constants";
import KpiReport from "./KpiReport";
import useUserProfile from "hooks/useUserProfile";
import request from "utils/api";
import apiRoutes from "utils/api-routes";
import PercentChangeLabel from "components/PercentChangeLabel";
import CasesReport from "./CasesReport";
import Maintenance from "./Maintenance";
import SubActivitiesReport from "./SubActivitiesReport";
import CarsomeReport from "./CarsomeReport";
import WiredConnectionReport from "./WiredConnectionReport";
import ObjectPlacementReport from "./ObjectPlacementReport";
import AssemblyReport from "./AssemblyReport";
import GraphReport from "./GraphReport";
import IdealActualPath from "./IdealActualPath";
import DrivingModuleReport from "./DrivingModuleReport";
import {
  formatTimeDay,
  getFormattedTime,
  getSum,
  secondsToDuration,
  timeConverter
} from "utils/utils";
import GearCollisionGraph from "./GearCollisionGraph";
import ScoreRow from "components/ScoreRow";
import { useRouter } from "next/router";
import { TableKpis } from "./TableKpis";
import ReactLoading from "react-loading";

const IndividualReport = ({
  module,
  level,
  attempt,
  userId,
  fetchAttemptData,
  setFetchAttemptData,
  users,
  setUsers,
  loading,
  getAttemptDataCallback = () => {},
  setLoading
}) => {
  const [userPerformanceData, setUserPerformanceData] = useState(null);
  const { organization } = useUserProfile();
  const [attemptData, setAttemptdata] = useState({});
  const [attemptDuration, setAttemptDuration] = useState("");
  const [score, setScore] = useState(null);
  const router = useRouter();
  const isReachTruck =
    router.query.module &&
    router.query.module.toLocaleLowerCase() === "reach truck";
  const isWinder =
    router.query.module && router.query.module.toLocaleLowerCase() === "winder";
  const isShovel =
    router.query.module && router.query.module.toLocaleLowerCase() === "shovel";
  const isForkLift =
    router.query.module &&
    router.query.module.toLocaleLowerCase() === "forklift";

  const pieColors = ["#580000", "#FF8C00", "#006400", "#00CED1"];
  let pieIndex = -1;

  const aresOfImprovement =
    attemptData && attemptData.mistakes
      ? attemptData.mistakes.map(mistake => {
          return {
            "Areas of Improvement":
              mistake.name.charAt(0).toUpperCase() + mistake.name.slice(1)
          };
        })
      : [];

  // const boxsize = "flex-1 min-w-[290px] max-w-[500px]";
  const boxsize = " w-full md:w-1/2 xl:w-1/3";
  const options = {
    legend: { show: false },
    colors: [CHART_COLORS.chartBlue],
    plotOptions: {
      radialBar: {
        dataLabels: {
          show: true,
          name: { show: false },
          value: {
            show: true,
            offsetY: 8,
            color: CHART_COLORS.chartBlue,
            fontWeight: "bold",
            fontSize: "20px"
          }
        }
      }
    }
  };

  const getAttemptData = async () => {
    const res = await request(apiRoutes.organization.attemptData, {
      method: HTTP_METHODS.POST,
      body: {
        user_ids: [userId],
        module: module,
        level: level,
        attempt: parseInt(attempt),
        organization_id: organization.id
      },
      isAuthenticated: true
    });

    if (res.status == HTTP_STATUSES.OK) {
      const resJson = await res.json();
      if (resJson.length > 0) {
        setAttemptdata(resJson[0].data);
        getAttemptDataCallback(resJson[0].data);
        setAttemptDuration(resJson[0].duration);
        setScore(resJson[0].data.score);
        setUsers([resJson[0].user]);
      }
    } else {
      setAttemptdata({});
      setAttemptDuration("");
    }
    setFetchAttemptData(false);
    setLoading(false);
  };

  useEffect(() => {
    if (organization) {
      if (!["Attempt", ""].includes(attempt) && fetchAttemptData) {
        setLoading(true);
        getAttemptData();
      }
    }
  }, [attempt, fetchAttemptData, organization]);

  const getUserPerformance = async () => {
    const res = await request(
      `${apiRoutes.organization.userPerformance}${userId}/`,
      {
        method: HTTP_METHODS.POST,
        body: {
          organization_id: organization.id
        },
        isAuthenticated: true
      }
    );
    if (res.status == HTTP_STATUSES.OK) {
      const resJson = await res.json();
      setUserPerformanceData(resJson);
    }
  };

  const isDataAvailable =
    userPerformanceData?.module_wise_total_time_spent_monthly &&
    Object.keys(userPerformanceData.module_wise_total_time_spent_monthly).every(
      key => {
        const monthValues = Object.values(
          userPerformanceData.module_wise_total_time_spent_monthly[key]
        );
        return monthValues.every(value => value === 0);
      }
    );

  useEffect(() => {
    if (organization) getUserPerformance();
  }, [userId, organization]);

  const getPairPaths = attemptData => {
    let paths = Object.keys(attemptData.path.actual_path).filter(
      path => path != "path-1"
    );

    let obstacles = attemptData.obstacles;
    const mergedPaths = [];

    let axisLines = attemptData.hAxisLines ? attemptData.hAxisLines : null;

    let vAxisLines = attemptData.vAxisLines ? attemptData.vAxisLines : null;

    let extraPlots = [];
    if (attemptData.boxPickupData) {
      attemptData.boxPickupData.forEach((d, index) => {
        extraPlots.push({
          x: d.x,
          y: d.y,
          path: d?.path?.toLowerCase(),
          pickup: true,
          index: index + 1
        });
      });
    }
    if (attemptData.boxKeptData) {
      attemptData.boxKeptData.forEach((d, index) => {
        extraPlots.push({
          x: d.x,
          y: d.y,
          path: d?.path?.toLowerCase(),
          pickup: false,
          index: index + 1
        });
      });
    }
    let sendObstacles = false;

    if (isReachTruck) {
      const actual = attemptData.path.actual_path[paths[0]];
      const ideal = attemptData.path.ideal_path[paths[0]];
      const extraPlotPoits = extraPlots.filter(p =>
        [paths[0]].includes(p.path)
      );
      if (obstacles) {
        sendObstacles = obstacles.paths.some(path => [paths[0]].includes(path));
      }

      mergedPaths.push(
        <IdealActualPath
          ideal={ideal ? [...ideal] : []}
          actual={actual ? [...actual] : []}
          title={
            extraPlotPoits && extraPlotPoits.length > 0
              ? "Box" + extraPlotPoits[0]?.index
              : ""
          }
          titleSuffix={
            extraPlotPoits && extraPlotPoits.length > 0 ? "for Pickup" : ""
          }
          axisLines={axisLines}
          vAxisLines={vAxisLines}
          obstacles={sendObstacles ? obstacles.coordinates : null}
          extraPlots={extraPlotPoits}
          isReachTruck={isReachTruck}
          isForkLift={isForkLift}
        />
      );
    }
    let pathCount = 1;
    sendObstacles = false;

    for (let i = isReachTruck ? 1 : 0; i < paths.length; i += 2) {
      pathCount += 1;
      const actual1 = attemptData.path.actual_path[paths[i]];
      const actual2 =
        i == paths.length - 1 ? [] : attemptData.path.actual_path[paths[i + 1]];
      const ideal1 = attemptData.path.ideal_path[paths[i]] || [];
      const ideal2 =
        i == paths.length - 1 ||
        attemptData.path.ideal_path[paths[i + 1]] === undefined
          ? []
          : attemptData.path.ideal_path[paths[i + 1]];

      const pathNames =
        i == paths.length - 1 ? [paths[i]] : [paths[i], paths[i + 1]];
      const extraPlotPoits = extraPlots.filter(p => pathNames.includes(p.path));
      if (obstacles) {
        sendObstacles = obstacles.paths.some(path => pathNames.includes(path));
      }

      mergedPaths.push(
        <IdealActualPath
          extraPlots={extraPlotPoits}
          isReachTruck={isReachTruck}
          isForkLift={isForkLift}
          axisLines={axisLines}
          vAxisLines={vAxisLines}
          obstacles={sendObstacles ? obstacles.coordinates : null}
          key={`path_index${i}`}
          ideal={ideal2 ? [...ideal1, ...ideal2] : [...ideal1]}
          actual={[...actual1, ...actual2]}
          titleSuffix={
            extraPlotPoits && extraPlotPoits.length > 0
              ? pathCount % 2 !== 0
                ? "for Pickup"
                : "for Droping"
              : ""
          }
          title={
            isReachTruck
              ? extraPlotPoits && extraPlotPoits.length > 0
                ? "Box" + extraPlotPoits[0]?.index
                : ""
              : i == paths.length - 1
              ? paths[i]
              : paths[i] + ", " + paths[i + 1]
          }
        />
      );
    }
    return mergedPaths;
  };

  if (loading) {
    return (
      <div className="fixed left-0 top-0 z-100 text-center items-center bg-black/40 h-screen w-screen flex justify-center">
        <ReactLoading
          type={"spin"}
          color={"var(--primary-color)"}
          height={20}
          width={20}
        />
        <div className="pl-1"> Generating report</div>
      </div>
    );
  }

  const monthwiseTimeSpent =
    userPerformanceData?.module_wise_total_time_spent_monthly;
  let maxValue = -Infinity;
  if (monthwiseTimeSpent) {
    for (const category in monthwiseTimeSpent) {
      for (const month in monthwiseTimeSpent[category]) {
        const value = monthwiseTimeSpent[category][month];
        if (value > maxValue) {
          maxValue = value;
        }
      }
    }
  }

  return (
    <div className="px-2 md:px-4">
      {userPerformanceData && !loading && (
        <Disclosure classname="mt-6" title="Performance Overview" show>
          {/* <div className="flex w-full flex-wrap gap-x-4 gap-y-4 mt-8 justify-between xl:w-10/12"> */}
          <div className="flex flex-wrap mt-8 gap-y-4">
            <BoxData
              heading={"Over all Performance Trend"}
              value={userPerformanceData.current_month_overall_performace}
              footerFlex={true}
              footer={
                <PercentChangeLabel
                  value={
                    userPerformanceData.overall_monthly_performance_comparison
                  }
                  isPositive={
                    userPerformanceData.overall_monthly_performance_comparison >=
                    0
                  }
                  msg="since last month"
                />
              }
              size={boxsize}
            >
              <div className="absolute right-0">
                <Chart
                  type={CHART_TYPES.RADIAL}
                  series={[
                    Math.round(
                      userPerformanceData.current_month_overall_performace_chart
                    )
                  ]}
                  options={options}
                  width={150}
                  height={150}
                />
              </div>
            </BoxData>
            <BoxData
              size={boxsize}
              classnames="md:pl-2 xl:pr-2"
              heading={"Time spent across all Use-case"}
              value={timeConverter(userPerformanceData.total_time_spent)}
            />
          </div>

          {userPerformanceData && (
            <div className="pb-5 mt-5 lg:w-10/12  border">
              <div className="px-5 py-5 text-lg text-dark">
                Time Comparison - Across use case
              </div>
              {isDataAvailable ? (
                <div className="text-center text-sm md:text-md h-[350px] flex items-center justify-center">
                  No data available
                </div>
              ) : (
                <Chart
                  type={CHART_TYPES.BAR}
                  series={Object.keys(
                    userPerformanceData.module_wise_total_time_spent_monthly
                  ).map(key => {
                    const finalObj = {
                      name: key,
                      data: Object.values(
                        userPerformanceData
                          .module_wise_total_time_spent_monthly[key]
                      )
                    };
                    return finalObj;
                  })}
                  options={{
                    xaxis: {
                      categories: Object.keys(
                        Object.values(
                          userPerformanceData.module_wise_total_time_spent_monthly
                        )[0]
                      )
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
                            returnValue = Math.floor(value / 60) + "m";
                          } else {
                            returnValue = Math.floor(value / 1) + "s";
                          }
                          return returnValue;
                        }
                      }
                    },
                    tooltip: {
                      enabled: true,
                      custom: function ({
                        series,
                        seriesIndex,
                        dataPointIndex,
                        w
                      }) {
                        const moduleName = w.config.series[seriesIndex].name;
                        const color = w.config.colors[seriesIndex];
                        const tooltipStyle = `background-color: ${color}; color: white; padding: 10px;`;
                        return `<div style="${tooltipStyle}">${moduleName}: ${getFormattedTime(
                          series[seriesIndex][dataPointIndex]
                        )} </div>`;
                      }
                    },
                    plotOptions: {
                      bar: {
                        dataLabels: {
                          position: "top"
                        }
                      }
                    },
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
                  height={450}
                />
              )}
            </div>
          )}
        </Disclosure>
      )}
      <Disclosure
        classname="mt-6"
        title={
          <div className="">
            Performance Report -{" "}
            <span className="text-lg md:text-lx  ">
              <span className="pr-2">{level};</span>
              <span className="pr-2">{module}; </span>
              <span className="pr-2">Attempt-number:{attempt}</span>
            </span>
          </div>
        }
        show
        disabled={
          !["Module", ""].includes(module) &&
          !["Select Level", ""].includes(level) &&
          !["Attempt", ""].includes(attempt)
        }
      >
        <div className="pt-4">
          {attemptData && attemptData.score && (
            <ScoreRow score={[score]} attemptDuration={[attemptDuration]} />
          )}
          {attemptData.path && (
            <DrivingModuleReport attemptData={attemptData} />
          )}
          {attemptData &&
            attemptData.subActivities &&
            attemptData.subActivities.length > 0 && (
              <SubActivitiesReport
                subactivities={attemptData.subActivities}
                score={score}
                attemptDuration={attemptDuration}
              />
            )}
          {attemptData &&
            attemptData.path &&
            attemptData.path.actual_path &&
            attemptData.path.ideal_path && (
              <div className="flex flex-wrap justify-between gap-x-2">
                {getPairPaths(attemptData).map(e => e)}
              </div>
            )}

          <div className="flex flex-wrap ">
            {attemptData && (
              <div className="flex flex-col gap-4 w-full lg:w-3/4">
                {attemptData.cases && attemptData.cases.length > 0 && (
                  <CasesReport cases={attemptData.cases} />
                )}
                {attemptData.tasks && attemptData.tasks.idealSequence && (
                  <SequenceReport
                    tasks={attemptData.tasks}
                    users={users}
                    attemptDuration={attemptDuration}
                    attemptData={attemptData}
                  />
                )}
                {attemptData.assembly && attemptData.disAssembly && (
                  <AssemblyReport
                    assembly={attemptData.assembly}
                    disAssembly={attemptData.disAssembly}
                    measurement={attemptData.measurement}
                  />
                )}
                {attemptData.tableKpis && (
                  <TableKpis tableKpis={attemptData.tableKpis} />
                )}
                {attemptData.generalkpis &&
                  Object.keys(attemptData.generalkpis).length > 0 &&
                  Object.keys(attemptData.generalkpis).map((gkpis, index) => (
                    <TableKpis
                      key={`gkpis_${index}`}
                      tableKpis={attemptData.generalkpis[gkpis]}
                    />
                  ))}
                {attemptData.kpis && attemptData.kpis.length > 0 && (
                  <KpiReport kpis1={attemptData.kpis} />
                )}
                {attemptData.inspections &&
                  attemptData.inspections.length > 0 && (
                    <CarsomeReport attemptData={attemptData} module={module} />
                  )}
                {attemptData.wiredConnections &&
                  attemptData.wiredConnections.length > 0 && (
                    <WiredConnectionReport
                      wiredConnections={attemptData.wiredConnections}
                      wrongConnections={attemptData.wrongConnections}
                    />
                  )}
                {attemptData.objectPlacements &&
                  attemptData.objectPlacements.length > 0 && (
                    <ObjectPlacementReport
                      objectPlacements={attemptData.objectPlacements}
                    />
                  )}
                {attemptData.maintenance && (
                  <Maintenance maintenance={attemptData.maintenance} />
                )}
                {attemptData.graphs && attemptData.graphs.length > 0 && (
                  <div className={"flex flex-wrap mt-3"}>
                    {attemptData.graphs.map((graph, index) => {
                      if (
                        ["pie", "doughnut"].includes(graph.type) &&
                        !["Time Taken by KPIS"].includes(graph.name)
                      )
                        pieIndex = pieIndex + 1;
                      let total_pies = attemptData.graphs.filter(g =>
                        ["pie", "doughnut"].includes(g.type)
                      );
                      let deviationGraph = false;
                      if (
                        graph.type === "line" &&
                        graph.hAxisLines !== null &&
                        organization.name.toLowerCase() === "tata steel"
                      ) {
                        deviationGraph = true;
                      }
                      return (
                        <div
                          key={`doughnut_${index}`}
                          className={`w-full ${
                            ["pie", "doughnut"].includes(graph.type)
                              ? total_pies.length > 2
                                ? ["Time Taken by KPIS"].includes(graph.name)
                                  ? "md:w-full"
                                  : "md:w-1/2"
                                : "lg:w-full"
                              : ""
                          }${deviationGraph && "xl:w-1/2 pl-2"}`}
                        >
                          <GraphReport
                            graph={graph}
                            index={index}
                            isWinder={isWinder}
                            isShovel={isShovel}
                            pieColor={
                              ["pie", "doughnut"].includes(graph.type) &&
                              !["Time Taken by KPIS"].includes(graph.name) &&
                              pieColors[pieIndex]
                            }
                            cycleData={
                              graph.name
                                .toLowerCase()
                                .includes("loading and spillage") &&
                              attemptData.cycleData
                            }
                          />
                          {module == "EOT-Crane" &&
                            graph.name == "LT & CT Speed vs Time" &&
                            graph.data && (
                              <div className="text-dark border text-sm md:text-md w-full flex justify-around gap-4 py-2 mb-4">
                                {graph.data.map((dataObj, index) => {
                                  return (
                                    <span
                                      className=""
                                      key={`average_speed_${index}`}
                                    >
                                      {dataObj.name} Average:
                                      <span className="text-primary font-semibold pl-2">
                                        {(
                                          getSum(dataObj.data) /
                                          dataObj.data.length
                                        ).toFixed(2)}
                                      </span>
                                    </span>
                                  );
                                })}
                              </div>
                            )}
                        </div>
                      );
                    })}
                  </div>
                )}
                {attemptData.path && attemptData.path.actual_path && (
                  <GearCollisionGraph
                    graphs={attemptData.graphs}
                    actualPath={attemptData.path.actual_path}
                  />
                )}
              </div>
            )}
            <div className="mt-0  pl-0 pt-4 md:pt-0 w-full lg:w-1/4 ">
              <div className="pl-0 lg:pl-2 mt-2">
                {attemptDuration && (
                  <BoxData
                    size={"w-full"}
                    heading={"Time Taken"}
                    value={timeConverter(attemptDuration)}
                    classnames="w-full text-dark"
                  />
                )}
              </div>

              {aresOfImprovement.length > 0 && (
                <div className="pl-0 lg:pl-2 ">
                  <CustomTable
                    columns={["Areas of Improvement"]}
                    rows={aresOfImprovement}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </Disclosure>

      <div className="h-[100px]" />
    </div>
  );
};

export default IndividualReport;
