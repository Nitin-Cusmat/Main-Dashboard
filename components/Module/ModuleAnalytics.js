import BoxData from "components/BoxData";
import React, { useEffect } from "react";
import { getModuleAnalytics } from "utils/utils";

const ModuleAnalytics = ({
  modules,
  setModules,
  getUserAnalytics,
  organization,
  users
}) => {
  useEffect(() => {
    if (organization) {
      getUserAnalytics();
    }
  }, [organization]);

  return (
    <></>
    // <div className="flex max-md:flex-col max-md:items-center gap-y-4">
    //   <BoxData
    //     heading={"Number of active users"}
    //     value={users}
    //     size=" w-full md:w-1/2 xl:w-1/4"
    //   />
    //   <BoxData
    //     heading={"Number of active modules"}
    //     value={modules.length}
    //     size=" w-full md:w-1/2 xl:w-1/4"
    //   />
    // </div>
  );
};

export default ModuleAnalytics;
