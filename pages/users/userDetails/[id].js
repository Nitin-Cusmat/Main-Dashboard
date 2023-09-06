import AddUserForm from "components/AddUserForm";
import DefaultLayout from "components/DefaultLayout";
import { Disclosure } from "components/Disclosure";
import React, { useEffect, useState } from "react";
import request from "utils/api";
import apiRoutes from "utils/api-routes";
import { RxCrossCircled } from "react-icons/rx";
import { HiOutlineCheckCircle } from "react-icons/hi";
import {
  HTTP_METHODS,
  HTTP_STATUSES,
  SIDENAV_ITEM_OBJS
} from "utils/constants";
import { formatDateDisplay } from "utils/utils";
import Breadcrumbs from "components/BreadCrumbs";
import appRoutes from "utils/app-routes";
import { useRouter } from "next/router";
import useUserProfile from "hooks/useUserProfile";

const Index = () => {
  const router = useRouter();
  const { id } = router.query;
  const [data, setData] = useState(null);
  const { organization } = useUserProfile();

  const getUserDetails = async () => {
    const response = await request(apiRoutes.accounts.userDetails, {
      method: HTTP_METHODS.POST,
      isAuthenticated: true,
      body: {
        organization_id: organization.id,
        user_id: id
      }
    });
    let jsonResponse = null;
    if (response.status === HTTP_STATUSES.OK) {
      jsonResponse = await response.json();
      setData(jsonResponse);
    }
  };

  useEffect(() => {
    if (organization) getUserDetails();
  }, [organization]);

  return (
    <DefaultLayout
      activeItemId={SIDENAV_ITEM_OBJS.ACTIVE_USER.id}
      pageTitle={SIDENAV_ITEM_OBJS.ACTIVE_USER.title}
    >
      <Breadcrumbs
        navList={[
          {
            name: SIDENAV_ITEM_OBJS.USERS.title,
            link: SIDENAV_ITEM_OBJS.USERS.link
          },
          {
            name: SIDENAV_ITEM_OBJS.EDIT_USERS.title,
            link: SIDENAV_ITEM_OBJS.EDIT_USERS.link(id),
            active: true
          }
        ]}
      />
      {data && data.user_details && (
        <>
          <Disclosure
            title="Personal Information"
            show
            classname={"mt-5 max-sm:px-2 md:px-4"}
            titleCss="!text-lg !lg:text-xl "
          >
            <AddUserForm userDetails={data.user_details} />
          </Disclosure>
          <Disclosure
            title="Organization Information"
            show
            classname={"mt-5 max-sm:px-2 md:px-4"}
            titleCss="!text-lg !lg:text-xl "
          >
            <div className="w-full mt-4">
              <p className="text-black text-sm"> Organization Name</p>
              <input
                type="text"
                disabled="true"
                className="w-full h-[40px] text-black border-slate-700 focus:border-primary rounded-l !bg-input pl-4"
                value={
                  data.user_details.organization &&
                  data.user_details.organization.name
                }
              />
            </div>
          </Disclosure>
        </>
      )}
      {data && data.modules.length > 0 && (
        <Disclosure
          title="Module Information"
          show
          classname={"mt-5 max-sm:px-2 md:px-4"}
          titleCss="!text-lg !lg:text-xl "
        >
          <div className="w-full mt-4">
            {data.modules.map(({ module_name, complete, assigned_on }) => {
              return (
                <div
                  className="flex flex-wrap max-md:flex-col max-md:w-full"
                  key={module_name}
                >
                  <div className={`basis-1/3`}>
                    <p className="text-black text-sm"> Module Name </p>
                    <input
                      type="text"
                      disabled="true"
                      className="max-md:w-full md:w-[90%] h-[40px] text-black border-slate-700 focus:border-primary rounded-l !bg-input max-md:pl-2 md:pl-4"
                      value={module_name}
                    />
                  </div>
                  <div className={`basis-1/3 max-md:mt-4`}>
                    <p className="text-black text-sm"> Assigned On </p>
                    <input
                      type="text"
                      disabled="true"
                      className="max-md:w-full md:w-[90%] h-[40px] text-black border-slate-700 focus:border-primary rounded-l !bg-input max-md:pl-2 md:pl-4"
                      value={formatDateDisplay(assigned_on)}
                    />
                  </div>
                  <div className={`basis-1/3 max-md:mt-4 flex flex-col`}>
                    <p className="text-black text-sm"> Status </p>
                    <div className="flex items-center h-[40px]">
                      {complete ? (
                        <HiOutlineCheckCircle
                          size={20}
                          color="green"
                          className="inline"
                        />
                      ) : (
                        <RxCrossCircled
                          size={20}
                          color="red"
                          className="inline"
                        />
                      )}
                      <span className="pl-2">
                        {complete ? "Completed" : "Not Completed"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Disclosure>
      )}
    </DefaultLayout>
  );
};

export default Index;
