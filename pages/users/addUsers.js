import AddUserForm from "components/AddUserForm";
import Breadcrumbs from "components/BreadCrumbs";
import DefaultLayout from "components/DefaultLayout";
import React, { useState } from "react";
import { SIDENAV_ITEM_OBJS } from "utils/constants";

const AddUsers = () => {
  return (
    <DefaultLayout
      activeItemId={SIDENAV_ITEM_OBJS.ADD_USERS.id}
      pageTitle={SIDENAV_ITEM_OBJS.ADD_USERS.title}
    >
      <Breadcrumbs
        navList={[
          {
            name: SIDENAV_ITEM_OBJS.USERS.title,
            link: SIDENAV_ITEM_OBJS.USERS.link
          },
          {
            name: SIDENAV_ITEM_OBJS.ADD_USERS.title,
            link: SIDENAV_ITEM_OBJS.ADD_USERS.link,
            active: true
          }
        ]}
      />
      <div className="max-md:px-2 px-4">
        <p className="text-gray-700">Add user to allow access to the app</p>
        <AddUserForm />
      </div>
    </DefaultLayout>
  );
};

export default AddUsers;
