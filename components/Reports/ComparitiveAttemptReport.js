import React from "react";
import CasesReport from "./CasesReport";
import CycleDataVisual from "./CycleDataVisual";
import SequenceReport from "./sequenceReport";
import AssemblyReport from "./AssemblyReport";
import KpiReport from "./KpiReport";
import CarsomeReport from "./CarsomeReport";
import WiredConnectionReport from "./WiredConnectionReport";
import ObjectPlacementReport from "./ObjectPlacementReport";
import SubActivitiesReport from "./SubActivitiesReport";
import Maintenance from "./Maintenance";
import GraphReport from "./GraphReport";
import DrivingModuleReport from "./DrivingModuleReport";
import IdealActualPath from "./IdealActualPath";
import { getSum } from "utils/utils";
import GearCollisionGraph from "./GearCollisionGraph";
import ScoreRow from "components/ScoreRow";
import { TableKpis } from "./TableKpis";
import { useRouter } from "next/router";
import CustomTable from "components/CustomTable";
import { max } from "lodash";

const ComparitiveAttemptReport = ({
  score,
  attemptDuration,
  attemptData,
  attemptData2,
  users,
  module
}) => {
  const router = useRouter();
  const getAreasOfImprovement = (attemptData, user) => {
    if (attemptData && attemptData.mistakes) {
      return attemptData.mistakes.map(mistake => {
        return {
          [`Areas of Improvement for ${user}`]:
            mistake.name.charAt(0).toUpperCase() + mistake.name.slice(1)
        };
      });
    }
    return [];
  };

  const areasOfImprovement1 = getAreasOfImprovement(attemptData, "User 1");
  const areasOfImprovement2 = getAreasOfImprovement(attemptData2, "User 2");
  const maxLength = Math.max(
    areasOfImprovement1.length,
    areasOfImprovement2.length
  );

  while (areasOfImprovement1.length < maxLength) {
    areasOfImprovement1.push({ [`Areas of Improvement for User 1`]: "-" });
  }

  while (areasOfImprovement2.length < maxLength) {
    areasOfImprovement2.push({ [`Areas of Improvement for User 2`]: "-" });
  }
  const getPairPaths = (attemptData, attemptData2) => {
    const paths1 = Object.keys(attemptData.path.actual_path).filter(
      path => path != "path-1"
    );
    const paths2 = Object.keys(attemptData2.path.actual_path).filter(
      path => path != "path-1"
    );
    const maxLength = Math.max(paths1.length, paths2.length);
    let obstaclesArray = Array.isArray(attemptData.obstacles)
      ? attemptData.obstacles
      : [attemptData.obstacles];
    obstaclesArray =
      obstaclesArray &&
      obstaclesArray.filter(obstacle => obstacle && obstacle.paths);

    const mergedPaths = [];
    const isReachTruck =
      router.query.module &&
      router.query.module.toLocaleLowerCase() === "reach truck";
    const isForkLift =
      router.query.module &&
      router.query.module.toLocaleLowerCase() === "forklift";

    let axisLines = attemptData.hAxisLines || null;
    let vAxisLines = attemptData.vAxisLines || null;
    let extraPlots = [];

    const addToExtraPlots = (d, isPickup = true) => {
      extraPlots.push({
        x: d.x,
        y: d.y,
        path: d?.path?.toLowerCase(),
        pickup: isPickup
      });
    };

    [attemptData.boxPickupData, attemptData2.boxPickupData].forEach(
      boxPickupData => {
        if (boxPickupData) {
          boxPickupData.forEach(d => {
            addToExtraPlots(d);
          });
        }
      }
    );

    [attemptData.boxKeptData, attemptData2.boxKeptData].forEach(boxDropData => {
      if (boxDropData) {
        boxDropData.forEach(d => {
          addToExtraPlots(d, false);
        });
      }
    });

    const getPathObstacles = pathNames => {
      const relevantObstacles = obstaclesArray.filter(obstacle =>
        obstacle.paths.some(path => pathNames.includes(path))
      );
      return relevantObstacles.flatMap(obstacle => obstacle.coordinates);
    };

    if (isReachTruck) {
      const extraPlotPoits = extraPlots.filter(p =>
        [paths1[0]].includes(p.path)
      );
      let pathCount = 1;
      for (let i = 0; i < 2; i++) {
        pathCount += 1;
        const actual =
          i % 2 === 0
            ? attemptData.path.actual_path[paths1[0]]
            : attemptData2.path.actual_path[paths2[0]];
        const ideal = attemptData.path.ideal_path[paths1[0]];
        if (obstacles) {
          sendObstacles = obstacles.paths.some(path =>
            [paths1[0]].includes(path)
          );
        }

        mergedPaths.push(
          <IdealActualPath
            ideal={ideal ? [...ideal] : []}
            actual={actual ? [...actual] : []}
            title={`Box1 by ${i % 2 === 0 ? "User 1" : "User 2"}`}
            titleSuffix={pathCount % 2 !== 0 ? "Pickup" : "Droping"}
            extraPlots={extraPlotPoits}
            isReachTruck={isReachTruck}
            isForkLift={isForkLift}
            axisLines={axisLines}
            vAxisLines={vAxisLines}
            obstacles={sendObstacles ? obstacles.coordinates : null}
          />
        );
      }
    }
    let actual1 = null;
    let actual2 = null;
    let ideal1 = null;
    let ideal2 = null;
    let pathCount = 1;
    sendObstacles = false;
    for (let i = isReachTruck ? 1 : 0; i < maxLength; i += 2) {
      let pathNames1 =
        i == paths1.length - 1 ? [paths1[i]] : [paths1[i], paths1[i + 1]];
      let pathNames2 =
        i == paths2.length - 1 ? [paths2[i]] : [paths2[i], paths2[i + 1]];

      let currentObstacles1 = getPathObstacles(pathNames1);
      let currentObstacles2 = getPathObstacles(pathNames2);
      mergedPaths.push(
        <IdealActualPath
          ideal={
            ideal1 && ideal2
              ? [...ideal1, ...ideal2]
              : ideal1
              ? [...ideal1]
              : ideal2
              ? [...ideal2]
              : []
          }
          actual={
            actual1 && actual2
              ? [...actual1, ...actual2]
              : actual1
              ? [...actual1]
              : actual2
              ? [...actual2]
              : []
          }
          title={
            isReachTruck
              ? pathCount == 2
                ? "Box1 by User 1"
                : "Box2 by User 1"
              : i == paths1.length - 1
              ? `${paths1[i]} by User 1`
              : `${paths1[i]} , ${paths1[i + 1]} by User 1`
          }
          titleSuffix={pathCount % 2 !== 0 ? "Pickup" : "Droping"}
          isReachTruck={isReachTruck}
          axisLines={axisLines}
          vAxisLines={vAxisLines}
          obstacles={currentObstacles1.length ? currentObstacles1 : null}
          extraPlots={extraPlotPoits}
          isForkLift={isForkLift}
        />
      );
      actual1 = attemptData2.path.actual_path[paths2[i]];
      actual2 =
        i == paths2.length - 1
          ? []
          : attemptData.path.actual_path[paths2[i + 1]];
      ideal1 = attemptData2.path.ideal_path[paths2[i]];
      ideal2 =
        i == paths2.length - 1 ||
        attemptData.path.ideal_path[paths2[i + 1]] === undefined
          ? []
          : attemptData.path.ideal_path[paths2[i + 1]];
      pathNames =
        i == paths1.length - 1 ? [paths2[i]] : [paths2[i], paths2[i + 1]];
      extraPlotPoits = extraPlots.filter(p => pathNames.includes(p.path));
      mergedPaths.push(
        <IdealActualPath
          ideal={
            ideal1 && ideal2
              ? [...ideal1, ...ideal2]
              : ideal1
              ? [...ideal1]
              : ideal2
              ? [...ideal2]
              : []
          }
          actual={
            actual1 && actual2
              ? [...actual1, ...actual2]
              : actual1
              ? [...actual1]
              : actual2
              ? [...actual2]
              : []
          }
          title={
            isReachTruck
              ? pathCount == 2
                ? "Box1 by User 2"
                : "Box2 by User 2"
              : i == paths2.length - 1
              ? `${paths2[i]} by User 2`
              : `${paths2[i]} , ${paths2[i + 1]} by User 2`
          }
          titleSuffix={pathCount % 2 !== 0 ? "Pickup" : "Droping"}
          isReachTruck={isReachTruck}
          axisLines={axisLines}
          vAxisLines={vAxisLines}
          extraPlots={extraPlotPoits}
          obstacles={currentObstacles1.length ? currentObstacles2 : null}
          isForkLift={isForkLift}
        />
      );
    }
    return mergedPaths;
  };
  const getAverageSpeed = graph => {
    return graph.data.map((dataObj, index) => {
      return (
        <span className="" key={`average_speed_${index}`}>
          {dataObj.name} Average:
          <span className="text-primary font-semibold pl-2">
            {(getSum(dataObj.data) / dataObj.data.length).toFixed(2)}
          </span>
        </span>
      );
    });
  };
  return (
    <div className="p-1 pt-0">
      {attemptData && (
        <div className="flex flex-col gap-4 w-full ">
          {attemptData.path && (
            <DrivingModuleReport
              attemptData={attemptData}
              attemptData2={attemptData2}
              compare
            />
          )}
          <div className="w-full ">
            {attemptData.path &&
              attemptData2.path &&
              attemptData.path.actual_path &&
              attemptData.path.actual_path &&
              attemptData.path.ideal_path && (
                <div className="flex flex-wrap justify-between gap-x-2">
                  {getPairPaths(attemptData, attemptData2)}
                </div>
              )}
            {attemptData.cases && attemptData.cases.length > 0 && (
              <CasesReport
                cases={attemptData.cases}
                cases2={attemptData2.cases}
                compare
              />
            )}
            {attemptData.tasks && (
              <SequenceReport
                tasks={attemptData.tasks}
                tasks2={attemptData2.tasks}
                users={users}
                compare
              />
            )}
            {attemptData.assembly && attemptData.disAssembly && (
              <AssemblyReport
                assembly={attemptData.assembly}
                assembly2={attemptData2.assembly}
                disAssembly={attemptData.disAssembly}
                disAssembly2={attemptData2.disAssembly}
                measurement={attemptData.measurement}
                measurement2={attemptData2.measurement}
                users={users}
                compare
              />
            )}
            {attemptData.tableKpis && (
              <TableKpis
                tableKpis={attemptData.tableKpis}
                tableKpis2={attemptData?.tableKpis}
                compare
              />
            )}
            {attemptData.kpis && attemptData.kpis.length > 0 && (
              <KpiReport
                kpis1={attemptData.kpis}
                kpis2={attemptData2.kpis}
                compare
              />
            )}
            {attemptData.inspections && attemptData.inspections.length > 0 && (
              <CarsomeReport
                attemptData={attemptData}
                attemptData2={attemptData2}
                compare
                module={module}
              />
            )}
            {attemptData.wiredConnections &&
              attemptData.wiredConnections.length > 0 && (
                <WiredConnectionReport
                  wiredConnections={attemptData.wiredConnections}
                  wiredConnections2={attemptData2.wiredConnections}
                  wrongConnections={attemptData.wrongConnections}
                  wrongConnections2={attemptData2.wrongConnections}
                  compare
                />
              )}
            {attemptData.objectPlacements &&
              attemptData.objectPlacements.length > 0 && (
                <ObjectPlacementReport
                  objectPlacements={attemptData.objectPlacements}
                  objectPlacements2={attemptData2.objectPlacements}
                  compare
                />
              )}
            {attemptData.subActivities &&
              attemptData.subActivities.length > 0 && (
                <SubActivitiesReport
                  score={score}
                  attemptDuration={attemptDuration}
                  subactivities={attemptData.subActivities}
                  subactivities2={attemptData2.subActivities}
                  compare
                />
              )}
            {attemptData.maintenance && (
              <Maintenance
                maintenance={attemptData.maintenance}
                maintenance2={attemptData2.maintenance}
                compare
              />
            )}
            {attemptData.cycleData && attemptData.cycleData.length > 0 && (
              <CycleDataVisual
                cycleData={attemptData.cycleData}
                cycleData2={attemptData2.cycleData}
                compare
              />
            )}
            {attemptData.graphs && attemptData.graphs.length > 0 && (
              <div className="">
                {attemptData.graphs.map((graph, index) => {
                  attemptData.graphs[index];
                  return (
                    <div key={index} className="w-full">
                      <div className="w-full">
                        <GraphReport
                          graph={graph}
                          graph2={
                            attemptData2.graphs.filter(
                              x => x.name == graph.name
                            )[0]
                          }
                          index={index}
                          users={users}
                          compare
                        />
                      </div>
                      {module == "EOT-Crane" && (
                        <div>
                          {graph.name == "LT & CT Speed vs Time" &&
                            graph.data && (
                              <div className="text-dark border text-sm md:text-md w-full flex justify-around gap-4 py-2 mb-4">
                                {getAverageSpeed(graph)}
                              </div>
                            )}
                          {attemptData.graphs[1]?.name ==
                            "LT & CT Speed vs Time" &&
                            attemptData.graphs[1]?.data && (
                              <div className="text-dark border text-sm md:text-md w-full flex justify-around gap-4 py-2 mb-4">
                                {getAverageSpeed(attemptData.graphs[1].data)}
                              </div>
                            )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            <GearCollisionGraph
              graphs={attemptData.graphs}
              graphs2={attemptData2.graphs}
              actualPath={
                attemptData && attemptData.path && attemptData.path.actual_path
                  ? attemptData.path.actual_path
                  : null
              }
              compare
              actualPath2={
                attemptData2 &&
                attemptData2.path &&
                attemptData2.path.actual_path
                  ? attemptData2.path.actual_path
                  : null
              }
            />
            <div className="flex w-full">
              {areasOfImprovement1.length > 0 && (
                <div className="pl-0 flex-1 pr-5">
                  <CustomTable
                    columns={["Areas of Improvement for User 1"]}
                    rows={areasOfImprovement1}
                  />
                </div>
              )}

              {areasOfImprovement2.length > 0 && (
                <div className="flex-1 pl-5">
                  <CustomTable
                    columns={["Areas of Improvement for User 2"]}
                    rows={areasOfImprovement2}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComparitiveAttemptReport;
