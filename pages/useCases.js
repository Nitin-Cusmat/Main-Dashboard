import Breadcrumbs from "components/BreadCrumbs";
import DefaultLayout from "components/DefaultLayout";
import LoadingSpinner from "components/LoadingSpinner";
import ModulesNav from "components/ModulesNav";
import useUserProfile from "hooks/useUserProfile";
import { useEffect, useState } from "react";
import { trackPromise } from "react-promise-tracker";
import { useRecoilState, useRecoilValue } from "recoil";
import moduleState from "states/modules";
import request from "utils/api";
import apiRoutes from "utils/api-routes";
import {
  HTTP_STATUSES,
  SIDENAV_ITEMS,
  SIDENAV_ITEM_OBJS
} from "utils/constants";

const useCases = () => {
  // const [modules, setModules] = useState([]);
  const { organization } = useUserProfile();
  const [users, setUsers] = useState(0);
  const [moduleUsers, setModuleUsers] = useState(0);
  const [modules, setModules] = useRecoilState(moduleState);
  const [loading, setLoading] = useState(true);

  const getUserAnalytics = async (module = null) => {
    trackPromise(
      request(
        `${apiRoutes.organization.userAnalytics}?organization_id=${organization.id}&module=${module}`,
        {
          isAuthenticated: true
        }
      )
        .then(async res => {
          if (res.status == HTTP_STATUSES.OK) {
            const resJson = await res.json();
            if (module) {
              setModuleUsers(resJson.module_active_users_count);
            } else {
              setUsers(resJson.active_users_count);
            }
          } else {
            setLoading(false);
          }
        })
        .catch(error => {
          setLoading(false);
        })
    );
  };
  // const getModules = async () => {
  //   const tempModules = await getModuleAnalytics(organization);
  //   // setModules(tempModules);
  // };
  // useEffect(() => {
  //   if (organization) getModuleAnalytics();
  // }, [organization]);

  useEffect(() => {
    if (organization) {
      // getModuleAnalytics(organization);
      getUserAnalytics();
    }
  }, [organization]);
  return (
    <DefaultLayout
      activeItemId={
        !modules.active
          ? SIDENAV_ITEM_OBJS.USE_CASES.id
          : SIDENAV_ITEM_OBJS[modules.active.toUpperCase()]?.id
      }
      pageTitle={SIDENAV_ITEM_OBJS.USE_CASES.title}
    >
      <div className="mt-4">
        <Breadcrumbs
          navList={[
            {
              name: SIDENAV_ITEM_OBJS.USE_CASES.title,
              link: "useCases?searchModule=" + modules.active
            },
            {
              name: modules.active,
              link: "useCases?searchModule=" + modules.active,
              active: true
            }
          ]}
        />
        {/* <Breadcrumbs
          navList={[
            {
              name: SIDENAV_ITEM_OBJS.USE_CASES.title + " / Modules",
              link: appRoutes.useCases,
              active: false
            }
          ]}
        /> */}
        {/* {modules && organization && (
          <ModuleAnalytics
            modules={modules}
            setModules={setModules}
            users={users}
            organization={organization}
            getUserAnalytics={getUserAnalytics}
          />
        )} */}
        {organization && modules.modules && modules.modules.length > 0 ? (
          <ModulesNav
            tabs={modules.modules}
            moduleUsers={moduleUsers}
            getUserAnalytics={getUserAnalytics}
            navModules={modules}
            setNavModules={setModules}
            setLoading={setLoading}
          />
        ) : loading ? (
          <></>
        ) : (
          <div className="text-dark mt-5 text-center">
            <hr />
            <span className="text-md font-bold mt-10"> No Modules Found</span>
          </div>
        )}
      </div>
    </DefaultLayout>
  );
};

export default useCases;
