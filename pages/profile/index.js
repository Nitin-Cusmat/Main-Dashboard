import DefaultLayout from "components/DefaultLayout";
import { SIDENAV_ITEM_OBJS } from "utils/constants";
import Breadcrumbs from "components/BreadCrumbs";
import appRoutes from "utils/app-routes";
import UserProfile from "components/UserProfile";

const index = () => {
  return (
    <DefaultLayout
      activeItemId={SIDENAV_ITEM_OBJS.ACTIVE_USER.id}
      pageTitle={SIDENAV_ITEM_OBJS.ACTIVE_USER.title}
    >
      <Breadcrumbs
        navList={[
          {
            name: "Profile",
            link: appRoutes.profile
          }
        ]}
      />
      <UserProfile />
    </DefaultLayout>
  );
};

export default index;
