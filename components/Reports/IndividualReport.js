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
  HTTP_STATUSES,
  ORG_MAPPING
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
import KpiReport2 from "./KpiReport2";
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
import CycleDataVisual from "./CycleDataVisual";
import { Newtable } from "./newtable";
import { Pathtable } from "./pathtable";
import KpiReport1 from "./KpiReport1";
import dynamic from "next/dynamic";

// function getRandomInt(min, max) {
//   min = Math.ceil(min);
//   max = Math.floor(max);
//   return Math.floor(Math.random() * (max - min) + min);
// }

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
  graph,
  graph2,
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
    router.query.module &&
    (router.query.module.toLocaleLowerCase() === "shovel" ||
      router.query.module.toLocaleLowerCase() === "mining - shovel");

  const isForkLift =
    router.query.module &&
    router.query.module.toLocaleLowerCase() === "forklift";

  const pieColors = ["#580000", "#FF8C00", "#006400", "#00CED1"];
  let pieIndex = -1;
  const [orgChart, setOrgChart] = useState(null);

  const moduleMistakeToLevelRecommendation = {
    "pendent control": {
      "Did not horn before moving in reverse": "Level 1",
      "Did not horn before moving forward": "Level 2",
      "Drove over the speed limit": "Level 3",
      "Did not maintain forkheight above 15 cm": "Level 4",
      "Stacking error": "Level 5",
      "Engagement error": "Level 6"
    },
    "Reach Truck": {
      "Did not horn before starting the engine": "Level 2",
      "Did not horn before moving forward": "Level 3",
      "Drove over the speed limit": "Level 4"
    }
    // ... and so on
  };
  const isThriveniOrg1 =
    organization && organization.name.toLowerCase() === "thriveni";

  // const getRandomRecommendation = () => {
  //   // Assuming levels is an array of all available levels or modules
  //   const levels = ["Level 1", "Level 2", "Level 3", "Level 4", "Level 5"]; // example levels
  //   const currentLevelIndex = levels.indexOf(level); // Get index of current level
  //   if (currentLevelIndex > -1) {
  //     levels.splice(currentLevelIndex, 1); // Remove current level from the list
  //   }
  //   const randomLevel = levels[getRandomInt(0, levels.length)]; // Get a random level
  //   return randomLevel;
  // }

  const aresOfImprovement =
    attemptData && attemptData.mistakes
      ? attemptData.mistakes.map(mistake => {
          return {
            "Areas of Improvement":
              mistake.name.charAt(0).toUpperCase() + mistake.name.slice(1)
          };
        })
      : [];

  let recommendation = null;
  let firstMistake = null;

  //   if (aresOfImprovement && aresOfImprovement.length > 0) {
  //     const firstMistake = aresOfImprovement[0]["Areas of Improvement"];
  //     recommendation = getRecommendationForMistake(module, firstMistake);
  // }
  //   const levels = ["Remote control level 3", "Zip1 test data", "Level 8", "Level 4", "Level 5"];
  //   const currentLevelIndex = levels.indexOf(level);
  //   const recommendedLevel =
  //     currentLevelIndex >= 0 && currentLevelIndex < levels.length - 1
  //       ? levels[currentLevelIndex + 1]
  //       : null;  // If
  //       // console.log(recommendedLevel)

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
    if (
      organization &&
      Object.keys(organization).length > 0 &&
      attemptData &&
      Object.keys(attemptData).length > 0
    ) {
      const valueToFind = organization.name;
      let foundKey = null;
      for (const key in ORG_MAPPING) {
        if (ORG_MAPPING[key] === valueToFind) {
          foundKey = key;
          break;
        }
      }
      if (foundKey !== null) {
        let LazyComponent;
        try {
          LazyComponent = dynamic(
            () => import(`../OrganizationCharts/${foundKey}`),
            { ssr: false }
          );
        } catch (error) {
          LazyComponent = null;
        }
        setOrgChart(<LazyComponent attemptData={attemptData} />);
      }
    }
  }, [organization, attemptData]);

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

    let obstaclesArray = Array.isArray(attemptData.obstacles)
      ? attemptData.obstacles
      : [attemptData.obstacles];

    let obstacles1Array = Array.isArray(attemptData.obstacles1)
      ? attemptData.obstacles1
      : [attemptData.obstacles1];

    const mergedPaths = [];

    let axisLines = attemptData.hAxisLines ? attemptData.hAxisLines : null;
    let vAxisLines = attemptData.vAxisLines ? attemptData.vAxisLines : null;
    let extraPlots = [];

    const noPathData =
      !attemptData.path ||
      !attemptData.path.actual_path ||
      !attemptData.path.ideal_path;

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
    const getObstaclesForPath = pathNames => {
      if (!obstaclesArray || obstaclesArray.length === 0) {
        return [];
      }

      return obstaclesArray
        .filter(
          obstacle =>
            obstacle &&
            obstacle.paths &&
            obstacle.paths.some(path => pathNames.includes(path))
        )
        .flatMap(obstacle => obstacle.coordinates);
    };
    const getObstacles1ForPath = pathNames => {
      if (!obstacles1Array || obstacles1Array.length === 0) {
        return [];
      }

      return obstacles1Array
        .filter(
          obstacle1 =>
            obstacle1 &&
            obstacle1.paths &&
            obstacle1.paths.some(path => pathNames.includes(path))
        )
        .flatMap(obstacle1 => obstacle1.coordinates);
    };

    if (isReachTruck) {
      const actual = attemptData.path.actual_path[paths[0]];
      const ideal = attemptData.path.ideal_path[paths[0]];
      const extraPlotPoits = extraPlots.filter(p =>
        [paths[0]].includes(p.path)
      );
      const obstacleCoords = getObstaclesForPath([paths[0]]);
      const obstacle1Coords = getObstacles1ForPath([paths[0]]);

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
          obstacles={obstacleCoords.length > 0 ? obstacleCoords : null}
          obstacles1={obstacle1Coords.length > 0 ? obstacle1Coords : null}
          extraPlots={extraPlotPoits}
          isReachTruck={isReachTruck}
          isForkLift={isForkLift}
        />
      );
    }

    let pathCount = 1;
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
      const obstacleCoords = getObstaclesForPath(pathNames);
      const obstacle1Coords = getObstacles1ForPath(pathNames);

      mergedPaths.push(
        <IdealActualPath
          ideal={ideal2 ? [...ideal1, ...ideal2] : [...ideal1]}
          actual={[...actual1, ...actual2]}
          title={
            isReachTruck
              ? extraPlotPoits && extraPlotPoits.length > 0
                ? "Box" + extraPlotPoits[0]?.index
                : ""
              : i == paths.length - 1
              ? paths[i]
              : paths[i] + ", " + paths[i + 1]
          }
          titleSuffix={pathCount % 2 !== 0 ? "for Pickup" : "for Dropping"}
          axisLines={axisLines}
          vAxisLines={vAxisLines}
          obstacles={obstacleCoords.length > 0 ? obstacleCoords : null}
          obstacles1={obstacle1Coords.length > 0 ? obstacle1Coords : null}
          extraPlots={extraPlotPoits}
          isReachTruck={isReachTruck}
          isForkLift={isForkLift}
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
        <div className="pl-1 text-black"> Generating report</div>
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
            <ScoreRow
              score={[score]}
              attemptDuration={[attemptDuration]}
              mistakeScores={attemptData.mistakesScore}
            />
          )}
          {attemptData.tableKpis && (
            <TableKpis tableKpis={attemptData.tableKpis} />
          )}
          {attemptData && (
            <DrivingModuleReport
              attemptData={attemptData}
              organization={organization} // Make sure you pass the organization here
            />
          )}
          {attemptData.tableKpis && (
            <TableKpis tableKpis={attemptData.tableKpis} />
          )}

          {attemptData && (
            <DrivingModuleReport
              attemptData={attemptData}
              organization={organization} // Make sure you pass the organization here
            />
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
                {/* {attemptData.tableKpis && (
                  <TableKpis tableKpis={attemptData.tableKpis} />
                )} */}
                {attemptData.kpitable && (
                  <Newtable kpitable={attemptData.kpitable} />
                )}
                {attemptData.pathtable && (
                  <Pathtable pathtable={attemptData.pathtable} />
                )}
                {/* {attemptData.generalkpis &&
                  Object.keys(attemptData.generalkpis).length > 0 &&
                  Object.keys(attemptData.generalkpis).map((gkpis, index) => (
                    <TableKpis
                      key={`gkpis_${index}`}
                      tableKpis={attemptData.generalkpis[gkpis]}
                    />
                  ))} */}
                {attemptData.kpis && attemptData.kpis.length > 0 && (
                  <KpiReport kpis1={attemptData.kpis} /> // Make sure to pass the organization here/>
                )}

                {attemptData.loading && attemptData.loading.length > 0 && (
                  <KpiReport1
                    kpitask1={attemptData.loading}
                    organization={organization} // Make sure to pass the organization here
                  />
                )}

                {attemptData.unloading && attemptData.unloading.length > 0 && (
                  <KpiReport2
                    kpis3={attemptData.unloading}
                    organization={organization} // Make sure to pass the organization here
                  />
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
                        ["pie", "doughnut"].includes(graph?.type) &&
                        !["Time Taken by KPIS"].includes(graph?.name)
                      )
                        pieIndex = pieIndex + 1;
                      let total_pies = attemptData.graphs.filter(g =>
                        ["pie", "doughnut"].includes(g.type)
                      );
                      let deviationGraph = false;
                      if (
                        graph?.type === "line" &&
                        graph.hAxisLines !== null &&
                        organization.name.toLowerCase() === "tata steel"
                      ) {
                        deviationGraph = true;
                      }
                      const isApolloOrg =
                        organization.name.toLowerCase() === "apollo";
                      const isVCTPLOrg =
                        organization.name.toLowerCase() === "vctpl";
                      const isThriveniOrg =
                        organization.name.toLowerCase() === "thriveni";

                      const shouldRenderGraph =
                        !(
                          isApolloOrg &&
                          ["pie", "doughnut"].includes(graph.type)
                        ) &&
                        !(
                          isThriveniOrg &&
                          graph.hAxisLines == null &&
                          ["line"].includes(graph.type)
                        ) &&
                        !(
                          isVCTPLOrg &&
                          graph.hAxisLines == null &&
                          ["line"].includes(graph.type)
                        );
                      return (
                        shouldRenderGraph && (
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
                        )
                      );
                    })}
                  </div>
                )}
                {attemptData.cycleData && attemptData.cycleData.length > 0 && (
                  <CycleDataVisual cycleData={attemptData.cycleData} />
                )}
                {attemptData.path &&
                  attemptData.path.actual_path &&
                  !isThriveniOrg1 && ( // Render GearCollisionGraph only if it's not "Thriveni"
                    <GearCollisionGraph
                      graphs={attemptData.graphs}
                      actualPath={attemptData.path.actual_path}
                    />
                  )}
                {attemptData.generalkpis &&
                  Object.keys(attemptData.generalkpis).length > 0 &&
                  Object.keys(attemptData.generalkpis).map((gkpis, index) => (
                    <TableKpis
                      key={`gkpis_${index}`}
                      tableKpis={attemptData.generalkpis[gkpis]}
                    />
                  ))}
                {orgChart}
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
              {/* {organization && organization.name.toLowerCase() === "edwards"}{" "} */}
              {
                // aresOfImprovement.length === 0 && (
                //   <div className="hurray-message pl-0 lg:pl-2">
                //   <CustomTable
                //       columns={["Areas of Improvement (Mistakes)"]}
                //       rows={[{ "Areas of Improvement (Mistakes)": "🎉 No mistakes. Great job! 👏" }]}                  />
                //     {/* {organization && organization.name && organization.name.toLowerCase() === "tata steel" ? (
                //     // <p className="recommendation-text">
                //     //   As a member of TataSteel, we recommend trying out {getRandomRecommendation()} for a new challenge!
                //     // </p>
                //   ) : null} */}
                // </div>
                //              )}
                //     aresOfImprovement.length === 0 && recommendedLevel && (
                //       <div className="recommendation-box mt-4 p-5 rounded-lg shadow-2xl bg-gradient-to-r from-blue-400 via-blue-500 to-purple-600 border-4 border-dashed border-yellow-300 relative overflow-hidden">
                //       <div className="absolute top-0 right-0 -mt-3 -mr-3 bg-yellow-300 text-yellow-700 rounded-full p-2 shadow-lg transform translate-x-1/2 -translate-y-1/2">
                //         <span className="text-xl font-bold">+15%</span>
                //       </div>
                //       <div className="flex items-start text-white">
                //         {/* <svg
                //           xmlns="http://www.w3.org/2000/svg"
                //           className="h-12 w-12 mr-4 animate-pulse"
                //           fill="none"
                //           viewBox="0 0 24 24"
                //           stroke="currentColor"
                //         >
                //           <path
                //             strokeLinecap="round"
                //             strokeLinejoin="round"
                //             strokeWidth="4"
                //             d="M13 10V3L4 14h7v7l9-11h-7z"
                //           ></path>
                //         </svg> */}
                //         <div className="flex flex-col justify-between">
                //           <div>
                //           <h3 className="text-2xl font-bold mb-1 animate-darkToLight bg-clip-text text-transparent">
                //           🌟 Recommendation
                //           </h3>
                //           <p className="recommendation-text" style={{ fontSize: '14.5px' }}>
                //             Awesome job with no mistakes! 🎉 Based on analytics, we strongly recommend trying out <span className="underline highlighted">{recommendedLevel}</span> level for a new challenge!
                //           </p>
                //           </div>
                //           <div className="flex items-center mt-2">
                //             <span className="bg-green-300 px-2 py-1 rounded-lg text-green-800 font-semibold">Efficiency Boost</span>
                //             <p className="ml-2 text-sm">
                //               Users observed a <span className="font-bold">+15% efficiency</span> boost by following this recommendation.
                //             </p>
                //           </div>
                //         </div>
                //       </div>
                //     </div>
                // )
              }
              {aresOfImprovement.length > 0 && (
                <div className="mistakes-section">
                  <h2 className="mistakes-title">
                    Reason for Decrease in Efficiency (Mistakes)
                  </h2>
                  <ul className="mistakes-list">
                    {aresOfImprovement.map((mistake, index) => (
                      <li key={index}>{mistake["Areas of Improvement"]}</li>
                    ))}
                  </ul>
                </div>
              )}
              {/* Enhanced Recommendation Box
           {aresOfImprovement.length > 0 && (
  <div className="recommendation-box mt-4 p-5 rounded-lg shadow-2xl bg-gradient-to-r from-blue-400 via-blue-500 to-purple-500">
    <div className="flex items-center text-white">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-8 w-8 mr-3"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M13 10V3L4 14h7v7l9-11h-7z"
        ></path>
      </svg>
      <div>
        <h3 className="text-2xl font-bold mb-1"> 🌟Recommendation</h3>
        <ul className="recommendation-text">
          {aresOfImprovement.map(mistakeObj => {
            const mistake = mistakeObj["Areas of Improvement"];
            const recommendedLevel = moduleMistakeToLevelRecommendation[module]?.[mistake];
            return (
              <li key={mistake}>
                To overcome the mistake "{mistake}", we recommend trying out {recommendedLevel}.
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  </div>
)} */}
              {/* {console.log(attemptData&&attemptData.graphs)} */}
            </div>
          </div>
        </div>
      </Disclosure>

      <div className="h-[100px]" />
    </div>
  );
};

export default IndividualReport;
