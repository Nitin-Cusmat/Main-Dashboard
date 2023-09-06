import React, { useEffect, useState } from "react";
import { Pagination } from "./Pagination";
import { HiArrowNarrowDown, HiArrowNarrowUp } from "react-icons/hi";
import Button from "./Button";
import request from "utils/api";
import apiRoutes from "utils/api-routes";
import {
  HTTP_METHODS,
  HTTP_STATUSES,
  USER_PROFILE_FIELDS,
  USER_PROFILE_FIELDS_FOR_IMMERTIVE
} from "utils/constants";
import appRoutes from "utils/app-routes";
import useUserProfile from "hooks/useUserProfile";
import { trackPromise } from "react-promise-tracker";
import LoadingSpinner from "./LoadingSpinner";
const DataTable = ({
  userActions,
  selectedIds,
  setSelectedIds,
  router,
  refreshData,
  isImmertiveOrg,
  checkboxStatus,
  setCheckboxStatus
}) => {
  const [sort, setSort] = useState({ order: "asc", orderBy: "id" });
  const [rows, setRows] = useState([]);
  const [filters, setFilters] = useState({});
  const [activePage, setActivePage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(6);
  const [count, setCount] = useState(0);
  const [searchFilter, setSearchFilter] = useState("");
  const [error, setError] = useState("");
  const { organization } = useUserProfile();

  const getUsers = async () => {
    let filterString = "";
    Object.keys(filters).forEach(accessor => {
      filterString = filterString + "&" + accessor + "=" + filters[accessor];
    });

    let url = `${apiRoutes.accounts.listUsers}?ordering=${
      sort.order == "asc" ? "" : "-"
    }${
      sort.orderBy
    }&search=${searchFilter}${filterString}&limit=${rowsPerPage}&offset=${
      rowsPerPage * (activePage - 1)
    }`;
    if (organization) {
      url = url + "&organization_id=" + organization.id;
    }
    const res = await trackPromise(
      request(url, {
        isAuthenticated: true
      }),
      "get-users"
    );
    if (res.status == HTTP_STATUSES.OK) {
      let resJson = await res.json();
      setRows(resJson.results);
      setCount(resJson.count);
    }
  };

  const downloadFile = async (res, filename) => {
    try {
      const blob = await res.blob();
      const href = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = href;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      setError(`Error downloading file: ${error.message}`);
    }
  };

  const downloadUsersList = async () => {
    const org = sessionStorage.getItem("organization");
    let filterString = "";
    Object.keys(filters).forEach(accessor => {
      filterString = filterString + "&" + accessor + "=" + filters[accessor];
    });

    let res = await request(
      `${apiRoutes.accounts.downloadUsersList}?organization_id=${organization.id}&${filterString}`,
      {
        isAuthenticated: true
      }
    );
    if (res.status == HTTP_STATUSES.OK) {
      await downloadFile(res, JSON.parse(org).name + " Users.csv");
    } else {
      let resJson = await res.json();
      setError(resJson.error);
    }
  };

  const columns = isImmertiveOrg
    ? Object.keys(USER_PROFILE_FIELDS_FOR_IMMERTIVE).map(key => {
        return { accessor: key, label: USER_PROFILE_FIELDS_FOR_IMMERTIVE[key] };
      })
    : Object.keys(USER_PROFILE_FIELDS).map(key => {
        return { accessor: key, label: USER_PROFILE_FIELDS[key] };
      });

  const extraActionsClass =
    "px-3 max-sm:py-2 md:px-8 rounded font-semibold max-md:text-sm text-lg";

  const extraActions = (
    <div className="flex my-2 md:my-[unset] gap-4">
      <Button
        btnVariant="secondary"
        className={extraActionsClass}
        onClick={downloadUsersList}
        disabled={rows.length > 0 ? false : true}
      >
        Download List
      </Button>

      <Button
        btnVariant="primary"
        onClick={() => router.replace(appRoutes.users.addUsers)}
        className={`${extraActionsClass} !mx-0`}
      >
        Add new users
      </Button>
    </div>
  );

  const handleSort = accessor => {
    setActivePage(1);
    setSort(prevSort => ({
      order:
        prevSort.order === "asc" && prevSort.orderBy === accessor
          ? "desc"
          : "asc",
      orderBy: accessor
    }));
  };

  const handleSearch = (value, accessor) => {
    setActivePage(1);

    if (value) {
      setFilters(prevFilters => ({
        ...prevFilters,
        [accessor]: value
      }));
    } else {
      setFilters(prevFilters => {
        const updatedFilters = { ...prevFilters };
        delete updatedFilters[accessor];

        return updatedFilters;
      });
    }
  };

  const handleOnChangeSelectAll = async event => {
    setCheckboxStatus(!checkboxStatus);
    const isChecked = event.target.checked;
    if (isChecked) {
      let filterString = "";
      Object.keys(filters).forEach(accessor => {
        filterString = filterString + "&" + accessor + "=" + filters[accessor];
      });
      const url = `${apiRoutes.accounts.learners}${organization.id}/?search=${filterString}`;
      const res = await request(url, {
        isAuthenticated: true
      });

      if (res.status == HTTP_STATUSES.OK) {
        const resJson = await res.json();
        const ids = resJson.map(result => result.id);
        setSelectedIds(ids);
      }
    } else {
      setSelectedIds([]);
    }
  };
  const totalPages = Math.ceil(count / rowsPerPage);
  const showSelectBox = true;

  const sortIcon = column => {
    const sortImage = (asc = true) => (
      <div>
        <HiArrowNarrowUp className={`inline pr-0 ${asc && "text-slate-400"}`} />
        <HiArrowNarrowDown
          className={`inline -ml-1 ${!asc && "text-slate-400"}`}
        />
      </div>
    );
    return column.accessor === sort.orderBy
      ? sort.order === "asc"
        ? sortImage(true)
        : sortImage(false)
      : "";
  };
  useEffect(() => {
    if (organization) getUsers();
    // getUsers() not adding to dependency since it causes too many rerenders
  }, [
    activePage,
    sort.order,
    sort.orderBy,
    searchFilter,
    filters,
    rowsPerPage,
    organization,
    refreshData
  ]);

  useEffect(() => {
    setActivePage(1);
  }, [rowsPerPage]);
  return (
    <>
      <LoadingSpinner area="get-users" />
      <div className="w-full max-md:p-2 md:p-4">
        {userActions}
        <div className="flex flex-wrap justify-between mb-3">
          <div className="flex flex-wrap items-center gap-4">
            <div className="inline text-black text-sm md:text-md">
              Show
              <select
                defaultValue={rowsPerPage}
                className="px-2 border rounded mx-2 border-1 bg-white"
                onChange={e => setRowsPerPage(e.target.value)}
              >
                {[6, 50, 100].map(item => (
                  <option key={item}>{item}</option>
                ))}
              </select>
              entries
            </div>
            <div className="">
              <input
                className="border p-2 my-1 rounded h-[30px] md:h-full text-sm md:text-md lg:text-lg"
                type="text"
                placeholder="Search"
                value={searchFilter}
                onChange={e => setSearchFilter(e.target.value)}
              />
            </div>
          </div>
          {extraActions}
        </div>
        {error && (
          <div className="text-red-500 text-center my-3 w-full">{error}</div>
        )}
        {rows ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full shadow-sm table-auto">
                <thead>
                  <tr>
                    {showSelectBox && (
                      <td className="text-left border border-slate-100 px-4 w-[50px]">
                        <input
                          type="checkbox"
                          className="text-left"
                          // onChange={e => {
                          //   let selected = [...selectedIds];
                          //   if (e.target.checked) {
                          //     selected = rows.map(i => i.id);
                          //   } else {
                          //     selected = [];
                          //   }
                          //   setSelectedIds(selected);
                          // }}
                          onChange={handleOnChangeSelectAll}
                          checked={checkboxStatus}
                        />
                      </td>
                    )}
                    {columns.map(column => {
                      return (
                        <th
                          key={column.accessor}
                          onClick={() => handleSort(column.accessor)}
                          className="bg-white text-left font-semibold text-sm md:text-md text-slate-600 p-2 border border-slate-100 whitespace-nowrap"
                        >
                          <div className="flex justify-between cursor-pointer">
                            <div className="inline">{column.label}</div>
                            {sortIcon(column)}
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                  <tr className="">
                    {showSelectBox && (
                      <td className="text-left border border-slate-100 "></td>
                    )}
                    {columns.map(column => {
                      return (
                        <th
                          key={column.accessor}
                          className="text-sm md:text-md p-2 border border-slate-100 text-left"
                        >
                          <input
                            className="border p-2 text-left font-normal rounded text-slate-900 w-full"
                            key={`${column.accessor}-search`}
                            type="search"
                            placeholder={`Search ${column.label}`}
                            value={filters[column.accessor]}
                            onChange={event =>
                              handleSearch(event.target.value, column.accessor)
                            }
                          />
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {rows.length > 0 ? (
                    rows.map(row => {
                      return (
                        <tr key={row.id} className=" text-left">
                          {showSelectBox && (
                            <td className="border border-slate-100 px-4">
                              <input
                                type="checkbox"
                                checked={selectedIds.includes(row.id)}
                                onChange={e => {
                                  let selected = [...selectedIds];
                                  if (e.target.checked) {
                                    selected = [...selected, row.id];
                                  } else {
                                    selected = selected.filter(
                                      item => item !== row.id
                                    );
                                  }
                                  setSelectedIds(selected);
                                }}
                              />
                            </td>
                          )}
                          {columns.map(column => {
                            if (column.format) {
                              return (
                                <td
                                  key={column.accessor}
                                  className="text-sm md:text-md text-slate-700 text-left p-2  border border-slate-100"
                                >
                                  {column.format(row[column.accessor])}
                                </td>
                              );
                            }
                            return (
                              <td
                                key={column.accessor}
                                className="text-sm md:text-md text-slate-700 text-left p-2 py-2 md:py-4 border border-slate-100"
                              >
                                <button
                                  className={`${
                                    column.accessor == "user_id"
                                      ? "text-primary "
                                      : "cursor-default"
                                  } text-left"`}
                                  onClick={() => {
                                    if (column.accessor == "user_id")
                                      router.push(
                                        `${appRoutes.users.userDetails.self}${row["user_id"]}`
                                      );
                                  }}
                                  href=""
                                >
                                  {row[column.accessor]}
                                </button>
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })
                  ) : Object.keys(filters).length > 0 ? (
                    <tr className="h-[50px]">
                      <td
                        colSpan={columns.length + 1}
                        className="text-center p-2 py-2 md:py-4 border border-slate-100 text-dark"
                      >
                        User not found in the search results
                      </td>
                    </tr>
                  ) : (
                    <tr className="h-[50px]">
                      <td
                        colSpan={columns.length + 1}
                        className="text-center p-2 py-2 md:py-4 border border-slate-100 text-dark"
                      >
                        No data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <Pagination
              activePage={activePage}
              count={count}
              rowsPerPage={rowsPerPage}
              totalPages={totalPages}
              setActivePage={setActivePage}
            />
          </>
        ) : (
          <div className="text-center text-sm md:text-md h-[200px] flex items-center absolute top-1/2 left-1/2 -translate-x-1/2 ">
            No active users found
          </div>
        )}
      </div>
    </>
  );
};

export default DataTable;
