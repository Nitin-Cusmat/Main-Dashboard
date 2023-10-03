import CustomTable from "components/CustomTable";
import React, { useEffect, useState } from "react";
import request from "utils/api";
import apiRoutes from "utils/api-routes";
import { HTTP_STATUSES } from "utils/constants";
import { secondsToDuration, timeConverter } from "utils/utils";
import { trackPromise } from "react-promise-tracker";
import Modal from "components/Modal";

const LevelAnalytics = ({ activeModuleName, organization }) => {
  const [levelWiseData, setLevelWiseData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUsersModal, setShowUsersModal] = useState(false);
  const [data, setData] = useState(null);
  const [searchString, setSearchString] = useState("");

  const getLevelUserInfo = levelName => {
    trackPromise(
      request(
        `${apiRoutes.organization.levelUserInfo}?organization_id=${organization.id}&module_name=${activeModuleName}&level_name=${levelName}`,
        {
          isAuthenticated: true
        }
      ).then(async res => {
        if (res.status == HTTP_STATUSES.OK) {
          const resJson = await res.json();
          setData(resJson);
          setLoading(false);
        } else {
          setLoading(false);
        }
      })
    );
  };

  const getParsedData = (field, data) => {
    let value = "";

    switch (field) {
      case "total_time":
        value = (
          <div>
            <a
              onClick={() => {
                getLevelUserInfo(data.level_name);
                setShowUsersModal(true);
              }}
              className="group relative inline-block text-blue-500 underline hover:text-red-500 duration-300 cursor-pointer"
            >
              {timeConverter(data[field])}
            </a>
          </div>
        );
        break;
      case "users_completed":
        value = `${data[field]}`;
        break;
      default:
        value = data[field];
        break;
    }
    return value;
  };

  const getLevelWiseData = async () => {
    setLevelWiseData([]);
    trackPromise(
      request(
        `${apiRoutes.organization.levelAnalytics}?org_id=${organization.id}&module_name=${activeModuleName}`,
        {
          isAuthenticated: true
        }
      ).then(async res => {
        if (res.status == HTTP_STATUSES.OK) {
          const resJson = await res.json();
          let data = [];
          Object.keys(resJson[0]).length > 0 &&
            resJson.forEach(levelActivity => {
              let r = {};
              [
                "level_name",
                "category",
                "total_time",
                "users_completed",
                "progress_%"
              ].forEach(field => {
                r[field] = getParsedData(field, levelActivity);
              });
              data.push(r);
            });

          setLevelWiseData(data);
          setLoading(false);
        } else {
          setLoading(false);
        }
      })
    );
  };
  useEffect(() => {
    if (activeModuleName) {
      setLoading(true);
      getLevelWiseData();
    }
  }, [activeModuleName]);

  useEffect(() => {
    if (!showUsersModal) {
      setSearchString("");
    }
  }, [showUsersModal]);

  return (
    <div className="text-dark h-full mx-2 md:mx-4">
      <CustomTable
        columns={[
          "level_name",
          "category",
          "total_time",
          "users_completed",
          "progress_%"
        ]}
        rows={levelWiseData}
        table_key={"level_name"}
        size="max-h-[450px]"
        loading={loading}
        columnsWidth={["40%", "20%", "15%", "15%", "15%"]}
      />
      <Modal
        show={showUsersModal}
        title="Users Time Spent"
        onHide={() => setShowUsersModal(false)}
      >
        {data && (
          <div className="py-4 text-black">
            <div className="flex flex-col gap-2 max-h-[300px] min-h-[100px]">
              <div className="px-3">
                {data && (
                  <input
                    type="text"
                    className="border text-md px-2 py-2 rounded font-light"
                    placeholder="Search user"
                    value={searchString}
                    onChange={e => setSearchString(e.target.value)}
                  />
                )}
              </div>
              {data && (
                <div className="flex justify-between text-dark px-3">
                  <span className="px-1 font-bold">Name </span>
                  <span className="px-1 font-bold">Time Spent</span>
                </div>
              )}
              <div className="overflow-scroll">
                {data && searchString.length === 0 ? (
                  Object.keys(data).map(user => {
                    return (
                      <div
                        key={user}
                        className="text-sm md:text-md flex justify-between text-dark px-3"
                      >
                        <span className="px-1">{user} </span>
                        <span className="px-1">
                          {timeConverter(data[user])}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center text-dark text-sm md:text-md">
                    {searchString.length === 0 && "No data available"}
                  </div>
                )}

                {data &&
                Object.keys(data).filter(user =>
                  user.toLowerCase().includes(searchString.trim().toLowerCase())
                ).length > 0 &&
                searchString.length !== 0 ? (
                  Object.keys(data).map(user => {
                    if (
                      user
                        .toLowerCase()
                        .includes(searchString.trim().toLowerCase())
                    )
                      return (
                        <div
                          key={user}
                          className="flex justify-between text-dark text-sm md:text-md px-3"
                        >
                          <span className="px-1">{user} </span>
                          <span className="px-1">
                            {secondsToDuration(data[user])}
                          </span>
                        </div>
                      );
                  })
                ) : (
                  <div className="text-center text-dark text-sm md:text-md">
                    {searchString.length !== 0 &&
                      "User not found in the search results"}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default LevelAnalytics;
