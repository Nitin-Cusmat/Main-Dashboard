import React, { useEffect, useState } from "react";
import BoxData from "components/BoxData";
import DefaultLayout from "components/DefaultLayout";
import {
  CHART_COLORS,
  CHART_TYPES,
  HTTP_METHODS,
  HTTP_STATUSES,
  SIDENAV_ITEM_OBJS
} from "utils/constants";
import request from "utils/api";
import apiRoutes from "utils/api-routes";
import ComparitiveAttemptReport from "components/Reports/ComparitiveAttemptReport";
import { Disclosure } from "components/Disclosure";
import { formatTimeDay, timeConverter } from "utils/utils";
import ReactLoading from "react-loading";
import useUserProfile from "hooks/useUserProfile";
import Chart from "components/Chart/Chart";

export const Compartitive = ({ userIds, module }) => {
  const [levels, setLevels] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [attemptsData, setAttemptsData] = useState([]);
  const [durations, setDurations] = useState([]);
  const [fetchAttemptData, setFetchAttemptData] = useState(true);
  const [users, setUsers] = useState(["User 1, User 2"]);
  const [scores, setScores] = useState(null);
  const [loading, setLoading] = useState(false);
  const [comparisionErrorMessage, setComparisionErrorMessage] = useState(null);

  const { organization } = useUserProfile();
  useEffect(() => {
    if (organization) getLevels();
  }, [organization]);
  const getLevels = async () => {
    const response = await request(apiRoutes.organization.listLevels, {
      method: HTTP_METHODS.POST,
      body: {
        module_name: module,
        user_ids: userIds,
        organization_id: organization.id
      },
      isAuthenticated: true
    });
    if (response.status === HTTP_STATUSES.OK) {
      const data = await response.json();
      setLevels(data);
    } else {
      setComparisionErrorMessage("Comparision not possible");
    }
  };

  const getAttemptData = async () => {
    const res = await request(apiRoutes.organization.attemptData, {
      method: HTTP_METHODS.POST,
      body: {
        user_ids: userIds,
        module: module,
        level: selectedLevel,
        organization_id: organization.id
      },
      isAuthenticated: true
    });

    if (res.status == HTTP_STATUSES.OK) {
      const resJson = await res.json();
      if (resJson.length > 0) {
        setAttemptsData([resJson[0].data, resJson[1].data]);
        setDurations([resJson[0].duration, resJson[1].duration]);
        setUsers([resJson[0].user, resJson[1].user]);
        setScores([resJson[0].data.score, resJson[1].data.score]);
      }
    } else {
      setAttemptsData([]);
      setDurations([]);
    }
    setFetchAttemptData(false);
    setLoading(false);
  };

  useEffect(() => {
    if (organization) {
      if (selectedLevel) {
        setLoading(true);
        getAttemptData();
      }
    }
  }, [selectedLevel, organization]);

  useEffect(() => {
    if (levels && levels.length > 0) {
      setSelectedLevel(levels[0]?.name);
    }
  }, [levels]);

  const boxsize = "w-full max-w-[400px] h-[180px] pt-4";
  if (loading) {
    return (
      <div className="fixed left-0 top-0 z-100 text-center items-center bg-black/40 h-screen w-screen flex justify-center">
        <ReactLoading
          type={"spin"}
          color={"var(--primary-color)"}
          height={20}
          width={20}
        />
        <div className="pl-1 text-black">Generating Report</div>
      </div>
    );
  }

  return (
    <DefaultLayout
      activeItemId={SIDENAV_ITEM_OBJS.REPORTS.id}
      pageTitle={SIDENAV_ITEM_OBJS.REPORTS.title}
    >
      {comparisionErrorMessage ? (
        <div className="text-center text-sm md:text-md absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          {comparisionErrorMessage}
        </div>
      ) : (
        <>
          <div className="p-4">
            <div className="text-black flex justify-end">
              {levels && (
                <select
                  className="bg-slate-100 py-2 px-8 mb-4"
                  value={selectedLevel}
                  onChange={e => {
                    setSelectedLevel(e.target.value);
                  }}
                >
                  {levels.map(lvl => (
                    <option key={lvl.id}>{lvl.name}</option>
                  ))}
                </select>
              )}
            </div>

            {/* <Disclosure show title={"Module wise comparison" + module}>
          <div className="flex flex-col lg:flex-row w-full">
            <div className="text-dark  w-full border rounded p-4">
              <span className="text-dark lg:text-lg text-md">
                Performance trends - Monthly
              </span>
              <Chart
                type={CHART_TYPES.AREA}
                height={"100%"}
                series={[
                  {
                    name: "First dataset",
                    data: [33, 53, 85, 41, 44, 65]
                  },
                  {
                    name: "Second dataset",
                    data: [33, 25, 35, 51, 54, 76]
                  }
                ]}
                options={{
                  grid: { show: false },
                  xaxis: {
                    categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]
                  },
                  legend: {
                    position: "top",
                    horizontalAlign: "right"
                  }
                }}
              />
            </div>
            <div className="flex flex-row lg:flex-col w-full lg:w-1/4">
              <BoxData
                heading={"Number of active users"}
                value={20}
                footer={
                  <PercentChangeLabel value="+10%" msg="since last month" />
                }
              />
              <BoxData
                heading={"Number of active users"}
                value={20}
                footer={
                  <PercentChangeLabel
                    value="-15%"
                    msg="since last month"
                    isPositive={false}
                  />
                }
              />
              <BoxData heading={"Number of active users"} value={20} />
              <BoxData heading={"Number of active users"} value={20} />
            </div>
          </div>
        </Disclosure> */}
          </div>
          <Disclosure
            classname="px-1 md:px-4"
            title={`Level wise comparison - ${selectedLevel}`}
            show
          >
            <div className="flex">
              <div className="flex">
                {/* overall performance */}
                {/* <div className="p-4 border w-full">
              <span className="text-dark lg:text-lg text-md">
                Overall Performance
              </span>
              <div className="h-full ">
                <Chart
                  type={CHART_TYPES.RADIAL}
                  labels={["A", "B"]}
                  series={[90, 95]}
                  height={"100%"}
                  // height={screenWidth > 1280 ?  : "auto"}
                  options={{
                    legend: {
                      position: "top",
                      horizontalAlign: "right",
                      offsetY: 0
                    }
                  }}
                />
              </div>
            </div> */}
                {/* time taken for each chart */}
                {/* <div className="p-4 border w-full">
              <span className="text-dark lg:text-lg text-md">
                Time taken to perform each task
              </span>
              <div className="h-full">
                <Chart
                  type={CHART_TYPES.RADAR}
                  labels={[
                    "Thing 1",
                    "Thing 2",
                    "Thing 3",
                    "Thing 4",
                    "Thing 5",
                    "Thing 6"
                  ]}
                  series={[
                    {
                      name: "dataset1",
                      data: [40, 60, 80, 40, 60]
                    },
                    {
                      name: "dataset2",
                      data: [20, 40, 60, 80, 10]
                    }
                  ]}
                  height={"90%"}
                  // height={screenWidth > 1280 ? 400 : "auto"}
                  options={{
                    legend: { position: "top", horizontalAlign: "right" }
                  }}
                />
              </div>
            </div> */}
              </div>

              <div className="w-full flex flex-wrap pb-2 gap-4">
                {users.map((user, index) => {
                  return (
                    <BoxData
                      key={`time_taken_${user}`}
                      size={boxsize}
                      heading={"Time taken by " + user}
                      value={
                        durations[index] ? timeConverter(durations[index]) : ""
                      }
                    >
                      <div className="flex justify-between mt-4">
                        <div
                          key={`name_${user}`}
                          className="text-dark font-bold inline pr-4"
                        >
                          User {index + 1} :{" "}
                          <span className="text-primary">{user}</span>
                        </div>
                        {scores && scores[index] !== undefined && (
                          <div className="">
                            {`Passing Score: ${scores[index].passing_score}%`}
                          </div>
                        )}
                      </div>
                      {scores && scores[index] !== undefined && (
                        <div className="absolute right-0 top-0">
                          <Chart
                            type={CHART_TYPES.RADIAL}
                            series={
                              scores && scores[index] !== undefined
                                ? [scores[index].score]
                                : [0]
                            }
                            options={{
                              legend: { show: false },
                              colors: [
                                scores && scores[index] !== undefined
                                  ? scores[index].score >
                                    scores[index].passing_score
                                    ? CHART_COLORS.chartGreen
                                    : CHART_COLORS.chartRed
                                  : CHART_COLORS.chartRed
                              ],
                              plotOptions: {
                                radialBar: {
                                  dataLabels: {
                                    show: true,
                                    name: { show: false },
                                    value: {
                                      show: true,
                                      offsetY: 8,
                                      color:
                                        scores && scores[index] !== undefined
                                          ? scores[index].score >
                                            scores[index].passing_score
                                            ? CHART_COLORS.chartGreen
                                            : CHART_COLORS.chartRed
                                          : CHART_COLORS.chartRed,
                                      fontWeight: "bold",
                                      fontSize: "16px"
                                    }
                                  }
                                }
                              }
                            }}
                            width={150}
                            height={150}
                          />
                        </div>
                      )}
                    </BoxData>
                  );
                })}
              </div>
            </div>
            {selectedLevel && attemptsData.length > 1 && (
              <ComparitiveAttemptReport
                attemptData={attemptsData[0]}
                attemptData2={attemptsData[1]}
                users={users}
                module={module}
                score={scores}
                attemptDuration={durations}
              />
            )}
          </Disclosure>
        </>
      )}
    </DefaultLayout>
  );
};

export const getServerSideProps = async context => {
  return {
    props: {
      userIds: [context.params.userId, context.params.userId2],
      module: context.params.module
    } // will be passed to the page component as props
  };
};

export default Compartitive;
