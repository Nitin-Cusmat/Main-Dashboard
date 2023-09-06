import Breadcrumbs from "components/BreadCrumbs";
import DefaultLayout from "components/DefaultLayout";
import UploadCsv from "components/UploadCsv";

import { SIDENAV_ITEM_OBJS } from "utils/constants";

const createBulkUser = () => {
  return (
    <DefaultLayout
      activeItemId={SIDENAV_ITEM_OBJS.BULK_CREATE_USER.id}
      pageTitle={SIDENAV_ITEM_OBJS.BULK_CREATE_USER.title}
    >
      <Breadcrumbs
        navList={[
          {
            name: SIDENAV_ITEM_OBJS.USERS.title,
            link: SIDENAV_ITEM_OBJS.USERS.link
          },
          {
            name: SIDENAV_ITEM_OBJS.BULK_CREATE_USER.title,
            link: SIDENAV_ITEM_OBJS.BULK_CREATE_USER.link,
            active: true
          }
        ]}
      />
      <UploadCsv create />
    </DefaultLayout>
  );
};

export default createBulkUser;
