import Button from "components/Button";
import CustomTable from "components/CustomTable";
import Dropdown from "components/Dropdown";
import { useEffect, useState } from "react";
import appRoutes from "utils/app-routes";
import { useRouter } from "next/router";
import { reverse } from "named-urls";
import request from "utils/api";
import apiRoutes from "utils/api-routes";
import useUserProfile from "hooks/useUserProfile";
import { HTTP_STATUSES } from "utils/constants";
import { secondsToDuration, timeConverter } from "utils/utils";
import { trackPromise } from "react-promise-tracker";

const ModuleWiseUserReport = ({ modules, activeModule, setActiveModule }) => {
  const [reportType, setReportType] = useState("Individual report");
  const [selectedIds, setSelectedIds] = useState([]);
  const { organization } = useUserProfile();
  const [userData, setUserData] = useState();
  const [loading, setLoading] = useState(true);
  const [showTableData, setShowTableData] = useState();
  const [levels, setLevels] = useState([]);
  const [selectedLevel, setSelectedLevel] = useState("Select Level");
  const [activePage, setActivePage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(6);
  const [count, setCount] = useState(null);
  const [searchFilter, setSearchFilter] = useState("");

  const USER_TABLE_COLUMN_MAP = {
    name: "Name of the Trainee",
    user_id: "User ID",
    current_level: "Current Level",
    total_attempts: "Total Attempts",
    level_date: "Last Attempt Date",
    module_usage: "Total Time Spent",
    progress: "Progress %"
  };

  useEffect(() => {
    if (modules && modules.length > 0) {
      const selectedModule = modules.filter(mod => activeModule == mod.name);
      if (selectedModule.length == 1) setLevels(selectedModule[0].levels);
      else setLevels([]);
    }
  }, [modules, activeModule]);

  useEffect(() => {
    if (levels && levels.length > 0) {
      setSelectedLevel(levels[0].name);
    } else {
      setSelectedLevel("NO LEVELS");
    }
  }, [levels, modules]);

  const getParsedData = (field, data) => {
    let value = "";
    switch (field) {
      case "name":
        value = (
          <Button
            className={"px-5 py-2 rounded font-semibold text-left"}
            btnVariant={`${data.total_attempts > 0 ? "link" : "plainText"}`}
            onClick={() => {
              if (data.total_attempts > 0) {
                router.replace({
                  pathname: reverse(appRoutes.reports.individual.performance, {
                    userId: data.user_id
                  }),
                  query: { module: activeModule }
                });
              }
            }}
          >
            {data.name.toUpperCase()}
          </Button>
        );
        break;

      case "current_level":
        const level = data.current_level || "Not Started";
        value = (
          <span className={level === "Not Started" ? "text-red" : ""}>
            {level}
          </span>
        );
        break;

      case "total_attempts":
        value = data.total_attempts;
        break;

      case "level_date":
        const level_date = data.level_date || "Not Started";
        value = (
          <span className={level_date === "Not Started" ? "text-red" : ""}>
            {level_date}
          </span>
        );
        break;

      case "module_usage":
        value = timeConverter(data.module_usage);

        break;
      case "progress":
        value = data.progress;
        break;
      case "user_id":
        value = data.user_id || "";
        break;

      default:
        value = data[field] || "";
        break;
    }
    return value;
  };

  const getUserInfo = async () => {
    setLoading(true);
    setShowTableData(null);
    trackPromise(
      request(
        `${apiRoutes.organization.reportBoard}?org_id=${
          organization.id
        }&modules=${activeModule}&search=${searchFilter}&limit=${rowsPerPage}&offset=${
          rowsPerPage * (activePage - 1)
        }`,
        {
          isAuthenticated: true
        }
      )
        .then(async res => {
          if (res.status === HTTP_STATUSES.OK) {
            const resJson = await res.json();
            // parse the data into the format needed for tabular representation
            let data = [];
            setCount(resJson.count);
            resJson.results.forEach(user => {
              let r = {};
              const keys = [
                "name",
                "user_id",
                "current_level",
                "total_attempts",
                "level_date",
                "module_usage",
                "progress"
              ];
              keys.forEach(key => {
                r[key] = getParsedData(key, user);
              });
              data.push(r);
            });
            setUserData(data);
            setShowTableData(data);
            setLoading(false);
          } else {
            setLoading(false);
          }
        })
        .catch(error => {
          setLoading(false);
        })
    );
  };

  useEffect(() => {
    if (organization && organization.name && activeModule) {
      getUserInfo();
    }
  }, [organization, activeModule, activePage, rowsPerPage, searchFilter]);

  const router = useRouter();
  return (
    <div className="my-2 w-full">
      <div className="flex justify-between flex-wrap w-full">
        <div className="flex items-center justify-between w-full flex-wrap max-md:px-2 md:p-4">
          <div className="flex items-center">
            <span className="underline text-slate-500">Reports</span>
          </div>

          <div className="flex gap-2 max-sm:mt-2 max-md:w-full md:w-[350px] lg:w-[500px]">
            <input
              type="text"
              placeholder="Search"
              className="text-black rounded border p-1 md:p-2 inline text-sm md:text-md w-1/2"
              onChange={e => {
                setTimeout(() => {
                  setSearchFilter(e.target.value);
                }, 1000);
              }}
            />

            <div className="dropdown md:mr-2 relative !text-black w-1/2 flex-shrink">
              <Dropdown
                btnCss="p-1 md:p-2 text-center border text-sm md:text-md bg-[#F4F3F8] rounded"
                dropdownCss="inline"
                handleClick={type => {
                  setReportType(type);
                  setSelectedIds([]);
                }}
                selectedValue={reportType}
                isSelection
                menuItems={[
                  {
                    id: 1,
                    name: "Individual report"
                  },
                  {
                    id: 2,
                    name: "Comparitive report"
                  }
                ]}
              />
            </div>
          </div>

          <Button
            disabled={
              reportType !== "Comparitive report" || selectedIds.length < 2
            }
            btnVariant={
              reportType === "Comparitive report" ? "primary" : "plainBg"
            }
            className="text-center py-2 my-2 mr-0 rounded font-semibold text-dm md:text-md max-md:w-[132px] md:w-[150px] lg:w-[200px]"
            onClick={() =>
              router.replace(
                "reports" +
                  "/" +
                  [selectedIds[0]] +
                  "/" +
                  [selectedIds[1]] +
                  "/" +
                  activeModule +
                  "/comparitive"
              )
            }
          >
            Compare
          </Button>
        </div>
        <div className="px-2 md:px-4 w-full">
          <CustomTable
            selectedIds={selectedIds}
            setSelectedIds={setSelectedIds}
            showSelect={reportType === "Comparitive report"}
            selectField={"user_id"}
            columnsMap={USER_TABLE_COLUMN_MAP}
            showViewReportBtn
            fieldToDisableReportBtn="module_usage"
            columns={[
              "name",
              "user_id",
              "current_level",
              "total_attempts",
              "level_date",
              "module_usage",
              "progress"
            ]}
            rows={showTableData}
            table_key="user_id"
            size="max-h-[500px] w-full"
            addPagination
            loading={loading}
            updatePaginationInfo={(activePage, rowsPerPage) => {
              setActivePage(activePage);
              setRowsPerPage(rowsPerPage);
            }}
            rowCount={count}
            searchFilter={searchFilter}
          />
        </div>
      </div>
    </div>
  );
};

export default ModuleWiseUserReport;
