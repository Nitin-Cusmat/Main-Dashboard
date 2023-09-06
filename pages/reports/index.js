import Breadcrumbs from "components/BreadCrumbs";
import DefaultLayout from "components/DefaultLayout";
import ReportPage from "components/Reports/ReportPage";
import useUserProfile from "hooks/useUserProfile";
import { useEffect, useState } from "react";
import appRoutes from "utils/app-routes";
import { SIDENAV_ITEM_OBJS } from "utils/constants";
import { getModuleAnalytics } from "utils/utils";
const Index = () => {
  const [modules, setModules] = useState([]);
  const [activeModules, setActiveModules] = useState([]);
  const { organization } = useUserProfile();

  const getModules = async () => {
    const tempModules = await getModuleAnalytics(organization);
    setModules(tempModules);
  };

  useEffect(() => {
    if (organization) {
      getModules();
    }
  }, [organization]);

  return (
    <DefaultLayout
      activeItemId={SIDENAV_ITEM_OBJS.REPORTS.id}
      pageTitle={SIDENAV_ITEM_OBJS.REPORTS.title}
    >
      <Breadcrumbs
        navList={[
          {
            name: SIDENAV_ITEM_OBJS.REPORTS.title,
            link: appRoutes.reports.self,
            active: false
          }
        ]}
      />
      <ReportPage
        modules={modules}
        activeModules={activeModules}
        setActiveModules={setActiveModules}
      />
    </DefaultLayout>
  );
};
export default Index;
