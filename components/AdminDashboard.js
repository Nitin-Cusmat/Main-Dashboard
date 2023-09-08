import React, { useEffect, useState } from "react";
import BoxData from "./BoxData";
import request from "utils/api";
import { HTTP_METHODS, HTTP_STATUSES } from "utils/constants";
import apiRoutes from "utils/api-routes";
import PercentChangeLabel from "./PercentChangeLabel";
import AdminDashboardChart from "./AdminDashboardChart";
import { Disclosure } from "./Disclosure";
import AdminTable from "./AdminTable";
import useUserProfile from "hooks/useUserProfile";
import { timeConverter, getDayTimeFormat } from "utils/utils";

const AdminDashboard = () => {
  const [userAndModuleCount, setUserAndModuleCount] = useState(null);
  const [organizationAnalytics, setOrganizationAnalytics] = useState(null);
  const [moduleAnalytics, setModuleAnalytics] = useState(null);
  const boxsize = " w-full md:w-1/2 xl:w-1/4";
  const { setOrganization } = useUserProfile();

  const getOrganizationDetails = async slug => {
    const response = await request(
      `${apiRoutes.organization.orgDetails}${slug}/`,
      {
        isAuthenticated: true
      }
    );
    let resJson = response;
    if (response.status === HTTP_STATUSES.OK) {
      resJson = await response.json();
      return resJson;
    } else if (response.status === HTTP_STATUSES.BAD_REQUEST) {
      return;
    }
  };

  const getApplicationUsageAnalytics = async usecase => {
    const res = await request(
      `${apiRoutes.organization.applicationUsageAnalytics}${usecase}/`,
      {
        isAuthenticated: true,
        method: HTTP_METHODS.GET
      }
    );

    if (res && res.status == HTTP_STATUSES.OK) {
      const response = await res.json();
      if (usecase) setModuleAnalytics(response);
      else setOrganizationAnalytics(response);
    }
  };

  const organizationSlugMap = {};
  organizationAnalytics &&
    organizationAnalytics.forEach(org => {
      organizationSlugMap[org.name] = org.slug;
    });

  const getTotalActiveModuleAndUsers = async () => {
    const res = await request(
      `${apiRoutes.organization.totalActiveModuleAndUsers}`,
      {
        isAuthenticated: true,
        method: HTTP_METHODS.GET
      }
    );

    if (res && res.status == HTTP_STATUSES.OK) {
      const response = await res.json();
      setUserAndModuleCount(response);
    }
  };

  useEffect(() => {
    getTotalActiveModuleAndUsers();
    getApplicationUsageAnalytics(0);
    getApplicationUsageAnalytics(1);
  }, []);
  return (
    <div>
      {userAndModuleCount && (
        <div className="flex flex-wrap max-sm:mx-2 mx-4 mt-8 gap-y-4">
          <BoxData
            classnames="md:pr-2"
            heading={"Number of Active Users"}
            value={userAndModuleCount[0].users_count}
            size={boxsize}
            footer={
              <PercentChangeLabel
                value={userAndModuleCount[0].users_rate_of_change}
                isPositive={userAndModuleCount[0].users_rate_of_change >= 0}
                msg="since last month"
              />
            }
          />
          <BoxData
            classnames="md:pl-2 xl:pr-2"
            heading={"Number of Active Modules"}
            value={userAndModuleCount[0].modules_count}
            size={boxsize}
            footer={
              <PercentChangeLabel
                value={userAndModuleCount[0].modules_rate_of_change}
                isPositive={userAndModuleCount[0].modules_rate_of_change >= 0}
                msg="since last month"
              />
            }
          />
          <BoxData
            classnames="md:pr-2 xl:pl-2"
            heading={"Number of Organizations"}
            value={userAndModuleCount[0].organizations_count}
            size={boxsize}
            footer={
              <PercentChangeLabel
                value={userAndModuleCount[0].organizations_rate_of_change}
                isPositive={
                  userAndModuleCount[0].organizations_rate_of_change >= 0
                }
                msg="since last month"
              />
            }
          />
          <BoxData
            classnames="md:pl-2"
            heading={"Total Usage"}
            value={timeConverter(userAndModuleCount[0].total_usage)}
            size={boxsize}
            footer={
              <PercentChangeLabel
                value={timeConverter(
                  userAndModuleCount[0].total_duration_rate_of_change
                )}
                isPositive={
                  userAndModuleCount[0].total_duration_rate_of_change >= 0
                }
                msg="since last month"
              />
            }
          />
        </div>
      )}
      <AdminDashboardChart />
      {organizationAnalytics && (
        <Disclosure
          classname="mt-4 mx-2 md:mx-4 "
          title="Organization Application Usage"
          show
        >
          <div className="mt-4">
            <AdminTable
              headings={[
                "Organization Name",
                "Total Modules",
                "Total Active Users",
                "Total Time Spent"
              ]}
              rows={organizationAnalytics}
              columns={[
                "name",
                "total_modules",
                "total_users",
                "total_duration"
              ]}
              anchor={{
                name: async organizationName => {
                  const organizationSlug =
                    organizationSlugMap[organizationName];
                  const orgDetails = await getOrganizationDetails(
                    organizationSlug
                  );
                  sessionStorage.setItem(
                    "organization",
                    JSON.stringify(orgDetails)
                  );
                  setOrganization(orgDetails);
                }
              }}
            />
          </div>
        </Disclosure>
      )}
      {moduleAnalytics && (
        <Disclosure
          classname="mt-4 mx-2 md:mx-4 "
          title="Module Application Usage"
          show
        >
          <div className="mt-4">
            <AdminTable
              headings={[
                "Module Name",
                "Organizations Count",
                "Total Active Users",
                "Total Time Spent"
              ]}
              rows={moduleAnalytics}
              columns={[
                "name",
                "organization_count",
                "user_count",
                "total_duration"
              ]}
            />
          </div>
        </Disclosure>
      )}
    </div>
  );
};
export default AdminDashboard;
