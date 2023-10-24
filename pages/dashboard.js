import Breadcrumbs from "components/BreadCrumbs";
import CustomTable from "components/CustomTable";
import DefaultLayout from "components/DefaultLayout";
import { Disclosure } from "components/Disclosure";
import appRoutes from "utils/app-routes";
import {
  CHART_COLORS,
  CHART_TYPES,
  HTTP_METHODS,
  HTTP_STATUSES,
  SIDENAV_ITEM_OBJS
} from "utils/constants";

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
import BoxData from "components/BoxData";
import DashBoardCharts from "components/DashBoardCharts";
import apiRoutes from "utils/api-routes";
import request from "utils/api";
import { useEffect, useRef, useState } from "react";
import useUserProfile from "hooks/useUserProfile";
import PercentChangeLabel from "components/PercentChangeLabel";
import Chart from "components/Chart/Chart";
import {
  formatDateDisplay,
  formatTimeDisplay,
  timeConverter
} from "utils/utils";
import { trackPromise } from "react-promise-tracker";
import LoadingSpinner from "components/LoadingSpinner";
import AdminTable from "components/AdminTable";
import AdminDashboardChart from "components/AdminDashboardChart";
import AdminDashboard from "components/AdminDashboard";

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  ArcElement
);



const Dashboard = () => {
  // const [isHovered, setIsHovered] = useState(false);
  const [hoveredTooltip, setHoveredTooltip] = useState(null);

  const infoButtonStyle = {
    background: "linear-gradient(45deg, #FFC107, #FF9800)",
    border: "2px solid white",
    cursor: "pointer",
    fontSize: "14px",
    borderRadius: "50%",
    width: "25px",
    height: "25px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0px 0px 8px rgba(0,0,0,0.3)",
    marginLeft: "auto",
    marginRight: "5px",
    transition: "all 0.3s ease",  // This will make the scale effect smooth
  };
  
  const infoButtonHoverStyle = {
    transform: "scale(1.2)"  // This will scale the button to 120% of its original size on hover
  };
  const completionRateTooltipAdjustment = hoveredTooltip === 'completionRate' ? { bottom: "calc(100% + 12px)" } : {};
  const tooltipStyle = {
    bottom: "100%",
    ...completionRateTooltipAdjustment,
    padding: "8px",
    backgroundColor: "#F2D2BD",
    color: "#333333",
    borderRadius: "6px",
    fontSize: "12px",  // Reduced font size
    whiteSpace: "normal",  // Allow wrapping
    overflowWrap: "break-word",  // Break words as needed
    wordWrap: "break-word",  // Alternative property for word wrapping
    position: "absolute",
    bottom: "100%",
    left: "50%",
    transform: "translateX(-50%)",
    marginBottom: "8px",
    boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.1)",
    width: '200px'  // Set a max-width for the tooltip to ensure it doesn't grow too large
  };




  // TO-DO: show % value in pie chart
  const { organization, cusmatAdmin } = useUserProfile();
  const [modules, setModules] = useState(0);
  const [users, setUsers] = useState(0);
  const [data, setData] = useState(null);
  const [userData, setUserData] = useState();

  const getUserInfo = async () => {
    const res = await trackPromise(
      request(
        `${apiRoutes.organization.latestAttempts}?organization_id=${organization.id}`,
        {
          isAuthenticated: true
        }
      ),
      "user-data"
    );
    if (res.status == HTTP_STATUSES.OK) {
      const resJson = await res.json();
      let resultsJson = resJson.results;
      // parse the data into format needed for tabular representation
      let data = resultsJson.map(attempt => {
        return {
          "User Id": attempt["user_id"],
          Name: attempt["first_name"] + " " + attempt["last_name"],
          Module: attempt["module"],
          Level: attempt["level"],
          "Time Spent": timeConverter(attempt["duration"]),
          "Start Time": formatTimeDisplay(new Date(attempt["start_time"])),
          Date: formatDateDisplay(new Date(attempt["start_time"])),
          "End Time": formatTimeDisplay(new Date(attempt["end_time"])),
          Result: (
            <span className={attempt["result"] ? "text-green-600" : "text-red"}>
              {attempt["result"] ? "Pass" : "Fail"}
            </span>
          )
        };
      });
      setUserData(data);
    } else {
    }
  };

  const getModuleAnalytics = async () => {
    const res = await request(
      `${apiRoutes.organization.moduleAnalytics}?organization_id=${organization.id}&count_only=True`,
      { isAuthenticated: true }
    );
    if (res.status == HTTP_STATUSES.OK) {
      const resJson = await res.json();
      setModules(resJson.active_modules);
    }
  };
  const getUserAnalytics = async () => {
    const res = await request(
      `${apiRoutes.organization.userAnalytics}?organization_id=${organization.id}`,
      { isAuthenticated: true }
    );
    if (res.status == HTTP_STATUSES.OK) {
      const resJson = await res.json();
      setUsers(resJson.active_users_count);
    }
  };

  useEffect(() => {
    if (
      organization &&
      organization.id &&
      organization.name.toLowerCase() !== "cusmat"
    ) {
      getUserInfo();
      getModuleAnalytics();
      getUserAnalytics();
      getData();
    } else {
      setUserData(null);
      setModules(null);
      setUsers(null);
      setData(null);
    }
  }, [organization]);

  const boxsize = " w-full md:w-1/2 xl:w-1/4";
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

  const getData = async () => {
    const res = await request(
      `${apiRoutes.organization.calculatePerformances}`,
      {
        isAuthenticated: true,
        method: HTTP_METHODS.POST,
        body: {
          organization_id: organization.id
        }
      }
    );

    if (res.status == HTTP_STATUSES.OK) {
      const response = await res.json();
      setData(response);
    }
  };

  return (
    <DefaultLayout
      activeItemId={SIDENAV_ITEM_OBJS.DASHBOARD.id}
      pageTitle={SIDENAV_ITEM_OBJS.DASHBOARD.title}
    >
      <Breadcrumbs
        navList={[
          {
            name: SIDENAV_ITEM_OBJS.DASHBOARD.title,
            link: appRoutes.dashboard,
            active: false
          }
        ]}
      />
      <LoadingSpinner area="user-data" />
      {data && (
        <>
          <div className="flex flex-wrap max-sm:mx-2 mx-4 mt-8 gap-y-4">
            <BoxData
              classnames="md:pr-2"
              heading={
                <div className="flex items-center">
                  Completion rate
                    <div className="relative ml-2">
                      <button 
                        style={
                          hoveredTooltip === 'completionRate' 
                            ? {...infoButtonStyle, ...infoButtonHoverStyle} 
                            : infoButtonStyle
                        }
                        onMouseOver={() => setHoveredTooltip('completionRate')}
                        onMouseOut={() => setHoveredTooltip(null)}
                      >
                        i
                      </button>
                    {hoveredTooltip === 'completionRate' && (
                      <div style={tooltipStyle}>
                        This indicates out of the total number of active users, how many have completed all the levels.
                      </div>
                    )}
                  </div>
                </div>
              }
              value={data.completion_rate}
              footerFlex={true}
              footer={
                <PercentChangeLabel
                  value={data.completion_rate_comparison}
                  isPositive={data.completion_rate_comparison >= 0}
                  msg="since last month"
                />
              }
              size={boxsize}
            >
              <div className="absolute right-0">
                <Chart
                  type={CHART_TYPES.RADIAL}
                  series={[data.completion_rate_chart]}
                  options={options}
                  width={120}
                  height={150}
                />
              </div>
            </BoxData>
            <BoxData
              classnames="md:pl-2 xl:pr-2"
              heading={
                <div className="flex items-center">
                  Performance trends - Monthly
                  <div className="relative ml-2">
                    <button 
                      style={
                        hoveredTooltip === 'performanceTrend' 
                          ? {...infoButtonStyle, ...infoButtonHoverStyle} 
                          : infoButtonStyle
                      }
                      onMouseOver={() => setHoveredTooltip('performanceTrend')}
                      onMouseOut={() => setHoveredTooltip(null)}
                    >
                      i
                    </button>
                    {hoveredTooltip === 'performanceTrend' && (
                      <div style={tooltipStyle}>
                        This indicates % of user's who have completed all the levels in current month.
                      </div>
                    )}
                  </div>
                </div>
              }
              value={data.current_month_performance_trends}
              size={boxsize}
              footer={
                <PercentChangeLabel
                  value={data.performance_comparison + "%"}
                  isPositive={data.performance_comparison >= 0}
                  msg="since last month"
                />
              }
            />
            <BoxData
              classnames="md:pr-2 xl:pl-2"
              heading={"Number of Active Modules"}
              value={modules}
              size={boxsize}
            />
            <BoxData
              classnames="md:pl-2"
              heading={
                <div className="flex items-center">
                  Number of active users
                  <div className="relative ml-2">
                    <button 
                      style={
                        hoveredTooltip === 'activeUsers' 
                          ? {...infoButtonStyle, ...infoButtonHoverStyle} 
                          : infoButtonStyle
                      }
                      onMouseOver={() => setHoveredTooltip('activeUsers')}
                      onMouseOut={() => setHoveredTooltip(null)}
                    >
                      i
                    </button>
                    {hoveredTooltip === 'activeUsers' && (
                      <div style={tooltipStyle}>
                        This represents the total number of active users who have been assigned on modules.
                      </div>
                    )}
                  </div>
                </div>
              }
              value={users}
              size={boxsize}
            />
          </div>
          <DashBoardCharts data={data} />

          <Disclosure
            classname="mt-4 mx-2 md:mx-4 "
            title="Recent Attempts"
            show
            alwaysOpen
          >
            <CustomTable
              selectField={"User ID"}
              columns={[
                "User Id",
                "Name",
                "Module",
                "Level",
                "Time Spent",
                "Date",
                "Start Time",
                "End Time"
                // "Result"
              ]}
              key="User ID"
              rows={userData}
            // size="max-h-[500px]"
            />
          </Disclosure>
          <div className="h-[50px]" />
        </>
      )}
      {cusmatAdmin &&
        (organization === null ||
          organization.name.toLowerCase() === "cusmat") && <AdminDashboard />}
    </DefaultLayout>
  );
};

export default Dashboard;
