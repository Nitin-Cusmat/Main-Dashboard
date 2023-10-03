import Button from "components/Button";
import CustomTable from "components/CustomTable";
import Dropdown from "components/Dropdown";
import { useEffect, useState, useRef } from "react";
import appRoutes from "utils/app-routes";
import { useRouter } from "next/router";
import { IoFilterSharp } from "react-icons/io5";
import { reverse } from "named-urls";
import request from "utils/api";
import apiRoutes from "utils/api-routes";
import useUserProfile from "hooks/useUserProfile";
import { HTTP_STATUSES, USER_TABLE_COLUMN_MAP } from "utils/constants";
import { secondsToDuration, timeConverter } from "utils/utils";
import { trackPromise } from "react-promise-tracker";

const ReportPage = ({
  modules,
  activeModules,
  setActiveModules,
  isReportPage
}) => {
  const [reportType, setReportType] = useState("Individual report");
  const [selectedIds, setSelectedIds] = useState([]);
  const { organization } = useUserProfile();
  const [userData, setUserData] = useState();
  const [showTableData, setShowTableData] = useState();
  const [showFilter, setShowFilter] = useState(false);
  const filterRef = useRef(null);
  const [activePage, setActivePage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(6);
  const [count, setCount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchFilter, setSearchFilter] = useState("");

  useEffect(() => {
    if (modules && modules.length > 0) {
      const tempActiveModules = modules.map(m => m.name);
      setActiveModules(tempActiveModules);
    }
  }, [modules]);

  const getParsedData = (field, data) => {
    let value = "";
    switch (field) {
      case "name":
        value = (
          <Button
            btnVariant={`${data.total_attempts > 0 ? "link" : "plainText"}`}
            className="text-left"
            onClick={() => {
              if (data.modules.length > 0)
                router.push(
                  reverse(appRoutes.reports.individual.performance, {
                    userId: data.user_id
                  })
                );
            }}
          >
            {data.name}
          </Button>
        );
        break;
      case "modules":
        value = data.modules;
        break;
      case "module_usage":
        value = timeConverter(data[field]);
        break;

      default:
        value = data[field];
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
        }&modules=${activeModules.join(
          ","
        )}&search=${searchFilter}&limit=${rowsPerPage}&offset=${
          rowsPerPage * (activePage - 1)
        }`,
        {
          isAuthenticated: true
        }
      )
        .then(async res => {
          if (res.status == HTTP_STATUSES.OK) {
            const resJson = await res.json();
            let data = [];
            setCount(resJson.count);
            resJson.results.forEach(user => {
              let r = {};
              Object.keys(user).forEach(field => {
                r[USER_TABLE_COLUMN_MAP[field]] = getParsedData(field, user);
              });
              data.push(r);
            });
            setShowTableData(data);
            setUserData(data);
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
    if (organization && organization.name && activeModules.length > 0) {
      getUserInfo();
    }
  }, [organization, activeModules, activePage, rowsPerPage, searchFilter]);

  useEffect(() => {
    const handleOutsideClick = event => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setShowFilter(false);
      }
    };

    document.addEventListener("click", handleOutsideClick);

    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, []);

  const router = useRouter();
  return (
    <div className="p-2 md:p-4 my-2">
      <div className="flex flex-row flex-wrap">
        <div className="flex gap-x-2 flex-wrap">
          <input
            type="text"
            placeholder="Search"
            className="rounded border p-2 mb-2 inline text-black text-sm md:text-md"
            onChange={e => {
              setTimeout(() => {
                setSearchFilter(e.target.value);
              }, 1000);
            }}
          />
        </div>
        {isReportPage && (
          <div className="dropdown mr-2 relative !text-black">
            <Dropdown
              btnCss="p-2 text-center border text-sm md:text-md bg-[#F4F3F8] rounded"
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
        )}
        <div className="mx-2 my-auto w-[100px]" ref={filterRef}>
          <button
            className="text-primary flex items-center border p-2 mb-2 rounded"
            onClick={() => setShowFilter(!showFilter)}
          >
            <span className="pr-2 font-bold text-sm md:text-md">Modules</span>
            <IoFilterSharp />
          </button>
          {showFilter && (
            <div className="absolute p-2 shadow z-50 bg-white max-h-[300px] overflow-scroll">
              {modules.map(module => (
                <div key={module.id} className="flex justify-between ">
                  <span className="p-1 text-dark text-sm md:text-md capitalize">
                    {module.name}
                  </span>
                  <input
                    type="checkbox"
                    className="bg-white"
                    checked={activeModules.includes(module.name)}
                    onChange={e => {
                      let selected = [...activeModules];
                      if (e.target.checked) {
                        selected = [...selected, module.name];
                      } else {
                        if (
                          selected.length > 1 ||
                          (selected.length === 1 &&
                            selected.includes(module.name))
                        ) {
                          selected = selected.filter(
                            item => item !== module.name
                          );
                        }

                        selected = selected.filter(
                          item => item !== module.name
                        );
                      }
                      setActiveModules(selected);
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <CustomTable
        selectedIds={selectedIds}
        setSelectedIds={setSelectedIds}
        showSelect={reportType === "Comparitive report"}
        selectField={"User ID"}
        showViewReportBtn
        fieldToDisableReportBtn="Total Time Spent"
        columns={[
          "Name of the Trainee",
          "User ID",
          "Modules",
          "Total Time Spent",
          "Progress%"
        ]}
        rows={showTableData}
        key="User ID"
        size="max-h-[500px]"
        addPagination
        loading={loading}
        updatePaginationInfo={(activePage, rowsPerPage) => {
          setActivePage(activePage);
          setRowsPerPage(rowsPerPage);
        }}
        activePageProp={activePage}
        rowsPerPageProp={rowsPerPage}
        rowCount={count}
        searchFilter={searchFilter}
      />
    </div>
  );
};

export default ReportPage;
