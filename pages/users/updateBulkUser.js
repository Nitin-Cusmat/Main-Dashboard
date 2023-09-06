import Breadcrumbs from "components/BreadCrumbs";
import DefaultLayout from "components/DefaultLayout";
import UploadCsv from "components/UploadCsv";
import { SIDENAV_ITEM_OBJS } from "utils/constants";

const updateBulkUser = () => {
  return (
    <DefaultLayout
      activeItemId={SIDENAV_ITEM_OBJS.BULK_UPDATE_USER.id}
      pageTitle={SIDENAV_ITEM_OBJS.BULK_UPDATE_USER.title}
    >
      <Breadcrumbs
        navList={[
          {
            name: SIDENAV_ITEM_OBJS.USERS.title,
            link: SIDENAV_ITEM_OBJS.USERS.link
          },
          {
            name: SIDENAV_ITEM_OBJS.BULK_UPDATE_USER.title,
            link: SIDENAV_ITEM_OBJS.BULK_UPDATE_USER.link,
            active: true
          }
        ]}
      />
      <UploadCsv />
    </DefaultLayout>
  );
};

export default updateBulkUser;
