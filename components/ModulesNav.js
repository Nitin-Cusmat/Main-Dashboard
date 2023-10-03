import React, { useEffect, useState } from "react";
import BoxData from "./BoxData";
import Chart from "./Chart/Chart";
import {
  CHART_COLORS,
  CHART_TYPES,
  HTTP_METHODS,
  HTTP_STATUSES
} from "utils/constants";
import PercentChangeLabel from "./PercentChangeLabel";
import { useRecoilValue } from "recoil";
import deviceState from "states/deviceState";
import apiRoutes from "utils/api-routes";
import request from "utils/api";
import useUserProfile from "hooks/useUserProfile";
import ModuleWiseUserReport from "./ModuleWiseUserReport";
import LevelAnalytics from "./Module/LevelAnalytics";
import { useRouter } from "next/router";
import ReactLoading from "react-loading";
import { trackPromise } from "react-promise-tracker";
import GaugeBox from "./GaugeBox";
import LoadingSpinner from "./LoadingSpinner";

const DataBox = ({ title, value, footerText }) => {
  return (
    <div className="border rounded w-full lg:w-full md:w-[unset] p-2 md:flex-1 lg:flex-none">
      <div className="flex justify-between flex-wrap">
        <span className="text-dark whitespace-nowrap text-md lg:text-lg pl-4">
          {title}
        </span>
        <button className="text-primary text-md pr-3">Weekly</button>
      </div>
      <div className="flex flex-col xl:flex-row items-center ">
        <div className="xl:flex-1 w-[unset] h-full relative pl-0">
          <GaugeBox value={value} />
        </div>
        <div className="text-center">
          <span
            className={`text-secondary md:text-[30px] text-[30px] font-bold`}
          >
            {value}%
          </span>
          <p className="text-dark text-md">{footerText}</p>
        </div>
      </div>
    </div>
  );
};
const ModulesNav = ({
  tabs,
  moduleUsers,
  getUserAnalytics,
  navModules,
  setNavModules,
  setLoading
}) => {
  const { screenWidth } = useRecoilValue(deviceState);
  const { organization } = useUserProfile();
  const [modules, setModules] = useState(null);
  const [activeModuleName, setActiveModuleName] = useState("");
  const router = useRouter();
  const { searchModule } = router.query;

  useEffect(() => {
    if (![undefined, "", null].includes(activeModuleName)) {
      setNavModules({ ...navModules, active: activeModuleName });
      getUserAnalytics(activeModuleName);
      setLoading(false);
    }
  }, [activeModuleName]);

  useEffect(() => {
    if (tabs.length > 0 && organization) {
      if (searchModule) {
        setActiveModuleName(searchModule);
      } else if (activeModuleName) {
        setActiveModuleName(activeModuleName);
      } else if (tabs[0].module.name != undefined) {
        setActiveModuleName(tabs[0]?.module.name);
      }
    }
  }, [tabs, organization, searchModule]);

  useEffect(() => {
    if (![undefined, "", null].includes(navModules.active)) {
      setActiveModuleName(navModules.active);
    }
  }, [navModules.active]);

  const getCalculatePerformances = async () => {
    const res = await trackPromise(
      request(`${apiRoutes.organization.calculatePerformances}`, {
        method: HTTP_METHODS.POST,
        body: {
          organization_id: organization.id,
          module_name: searchModule
        },
        isAuthenticated: true
      }),
      "modules"
    );
    if (res.status == HTTP_STATUSES.OK) {
      const resJson = await res.json();
      setModules(resJson);
    }
  };
  useEffect(() => {
    if (organization) getCalculatePerformances();
  }, [organization, searchModule]);

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
            fontSize: "16px"
          }
        }
      }
    }
  };

  return (
    <div className="mt-10 max-md:w-full">
      {/* <div className="-ml-3 hidden md:flex flex-nowrap justify-between overflow-auto">
        {tabs &&
          tabs.map((tab, i) => {
            return (
              <span
                key={`${tab}_${i}`}
                className={`text-md md:!text-lg tab tab-bordered  min-w-fit max-w-full flex-1 text-black ${
                  activeModuleName == tab.module.name &&
                  "tab-active && text-primary font-bold !border-b-primary"
                }`}
                onClick={() => {
                  setActiveModuleName(tab.module.name);
                }}
              >
                {tab.module.name}
              </span>
            );
          })}
      </div> */}
      <div className="text-center md:pr-3 block md:hidden max-md:px-2">
        <select
          name="tabs"
          onChange={e => {
            setActiveModuleName(e.target.value);
            router.push("/useCases?searchModule=" + e.target.value);
          }}
          value={activeModuleName}
          className="select select-bordered w-full bg-white text-primary"
        >
          {tabs.map((tab, i) => {
            return (
              <option
                key={`${tab}_${i}`}
                // value={activeModuleName}
                className={`tab tab-bordered flex-1 text-black ${activeModuleName == tab.module.name &&
                  "tab-active && text-primary font-bold !border-b-primary"
                  }`}
                onClick={() => {
                  setActiveModuleName(tab.module.name);
                }}
              >
                {tab.module.name}
              </option>
            );
          })}
        </select>
      </div>
       <div className="flex flex-col max-md:items-center mt-8">
       {modules &&<div className="flex flex-wrap gap-y-4 max-md:w-full max-md:flex-col max-md:items-center relative max-md:px-2">
          <LoadingSpinner area="user-analytics" />
          <BoxData
            heading={"Completion rate"}
            classnames={"md:pl-4"}
            value={modules.module_completion_rate}
            footerFlex={true}
            footer={
              <PercentChangeLabel
                value={modules.module_completion_rate_comparison}
                isPositive={modules.module_completion_rate_comparison >= 0}
                msg="since last month"
              />
            }
            size=" w-full md:w-1/2 xl:w-1/4"
          >
            <div className="absolute right-0">
              <Chart
                type={CHART_TYPES.RADIAL}
                series={[modules.module_completion_rate_chart
                ]}
                options={options}
                width={150}
                height={150}
              />
            </div>
          </BoxData>
          <BoxData
            heading={"Performance trends - Monthly"}
            classnames={"md:px-2 lg:pl-4 lg:pr-0"}
            value={modules.current_month_performance_trends}
            footer={
              <PercentChangeLabel
                value={modules.performance_comparison + "%"}
                isPositive={modules.performance_comparison}
                msg="since last month"
              />
            }
            size=" w-full md:w-1/2 xl:w-1/4"
          />
          <BoxData
            heading={"Number of active users"}
            classnames="md:pl-4"
            value={moduleUsers}
            size=" w-full md:w-1/2 xl:w-1/4"
          />
        </div>}
        <div className=" w-full mt-5 min-h-[40vh] h-full">
          <div className="text-lg text-slate-500 underline max-md:px-2 md:px-4">
            Level wise progress
          </div>
          <div className="flex flex-wrap mt-3 max-md:px-2 ">
            <div className="lg:w-3/5 w-full rounded text-black ">
              <LevelAnalytics
                activeModuleName={activeModuleName}
                organization={organization}
              />
            </div>
            <div className="flex flex-wrap lg:w-2/5 gap-y-2 lg:gap-x-0 w-full lg:m-0 mt-4 gap-x-2 max-md:px-2 md:px-4 lg:pl-0 lg:pt-2">
              <div className="flex flex-col w-full justify-between rounded border py-3 text-slate-500 h-full">
                <div className="px-5 text-dark lg:text-lg text-md flex justify-between underline relative">
                  <span>Quarterly report</span>
                </div>
                {modules ? (
                  <div
                    className={`relative flex justify-center items-center ${screenWidth > 1280 ? "min-h-[350px]" : "min-h-auto"
                      }`}
                  >
                    {modules.quarter_trends? (
                      <Chart
                        type={CHART_TYPES.RADIAL}
                        series={Object.values(
                          modules.quarter_trends ?? {}
                        )}
                        width={screenWidth > 1000 ? 500 : 400}
                        // height={screenWidth > 1000 ? 500 : "auto"}
                        labels={Object.keys(
                          modules.quarter_trends ?? {}
                        )}
                        options={{
                          legend: {
                            offsetX: -5
                          }
                        }}
                      />
                    ) : (
                      <div className="h-[50px]">
                        <div className="text-center text-sm md:text-md absolute top-1/2 left-1/2 -translate-x-1/2">
                          No data found
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <ReactLoading
                      type={"spin"}
                      color={"var(--primary-color)"}
                      height={20}
                      width={20}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <ModuleWiseUserReport
          modules={tabs}
          activeModule={activeModuleName}
          setActiveModule={setActiveModuleName}
        />
      </div>
    </div>
  );
};

export default ModulesNav;
