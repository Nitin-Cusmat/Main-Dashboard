import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import Button from "./Button";
import { useRouter } from "next/router";
import appRoutes from "utils/app-routes";
import { reverse } from "named-urls";
import { Pagination } from "./Pagination";
import ReactLoading from "react-loading";
import { BsDot } from "react-icons/bs";
const CustomTable = ({
  columns,
  rows,
  showSelect,
  selectedIds,
  setSelectedIds,
  selectField,
  showViewReportBtn,
  size,
  valueCss,
  table_key,
  addPagination,
  columnsMap,
  fieldToDisableReportBtn,
  loading,
  updatePaginationInfo = () => {},
  activePageProp = 1,
  rowsPerPageProp = 6,
  rowCount = 0,
  searchFilter = "",
  columnsWidth = null,
  colorField = "time_difference_color",

}) => {
  const router = useRouter();
  const [activePage, setActivePage] = useState(activePageProp);
  const [rowsPerPage, setRowsPerPage] = useState(rowsPerPageProp);
  const [count, setCount] = useState(0);
  const totalPages = Math.ceil(count / rowsPerPage);

  let beginning1 = 0;
  let end1 = rows?.length - 1;

  if (addPagination && rows) {
    beginning1 = activePage === 1 ? 0 : rowsPerPage * (activePage - 1);
    end1 = activePage === totalPages ? count : beginning1 + rowsPerPage - 1;
  }

  useEffect(() => {
    if (rows && rows.length > 0) setCount(rows.length);
  }, [!addPagination && rows]);

  useEffect(() => {
    updatePaginationInfo(activePage, rowsPerPage);
    setCount(rowCount ? rowCount : 0);
  }, [activePage, rowsPerPage, rowCount]);
  

  return (
    <div className="w-full">
      {addPagination && (
        <div className="inline text-dark text-sm md:text-md  w-full h-full ">
          Show
          <select
            defaultValue={rowsPerPage}
            className="px-2 border rounded mx-2 lg:mx-2 border-1 bg-white"
            onChange={e => {
              setRowsPerPage(Number(e.target.value));
              setActivePage(1);
              e.target.blur();
            }}
          >
            {[6, 50, 100].map(item => (
              <option key={item}>{item}</option>
            ))}
          </select>
          entries
        </div>
      )}
      <div className="pt-2">
        <div key="table" className={`w-full overflow-y-scroll border ${size}`}>
          <table className="table-auto w-full shadow-sm h-full">
            <thead>
              <tr className="sticky top-0 z-10">
                {showSelect && (
                  <td className="text-center border border-slate-100 px-4 !min-w-[50px] bg-white sticky top-0"></td>
                )}
                {columns.map((heading, index) => (
                  <th
                    key={`col_${heading}`}
                    style={{
                      width: columnsWidth ? columnsWidth[index] : ""
                    }}
                    className={`bg-blue-100 text-dark font-medium text-sm md:text-md capitalize text-left`}
                  >
                    {heading == "showEmpty" ? (
                      ""
                    ) : (
                      <div className="p-3">
                        {columnsMap
                          ? columnsMap[heading]
                          : heading && heading.split("_").join(" ")}
                      </div>
                    )}
                  </th>
                ))}
                {showViewReportBtn && (
                  <th className="bg-white text-dark font-medium text-sm md:text-md p-3"></th>
                )}
              </tr>
            </thead>

            <tbody className="relative h-[50px]">
              {rows && rows.length > 0 ? (
                rows.map((row, index) => {
                  if (addPagination || (index >= beginning1 && index <= end1))
                    return (
                      <tr
                        key={`${row[table_key]}_${index}`}
                        className={`slide-effect even:bg-[#fafafa] odd:bg-[#f6f4f8] hover:bg-yellow`}
                        >
                        {showSelect && (
                          <td

                          
                            style={{
                              width: columnsWidth ? columnsWidth[index] : ""
                            }}
                            className={`border text-center border-slate-100 px-4 !min-w-[50px]`}
                          >
                            <input
                              type="checkbox"
                              disabled={
                                row["total_attempts"] > 0 ? false : true
                              }
                              checked={selectedIds.includes(row[selectField])}
                              onChange={e => {
                                let selected = [...selectedIds];
                                if (
                                  e.target.checked &&
                                  selectedIds.length < 2
                                ) {
                                  selected = [...selected, row[selectField]];
                                } else {
                                  selected = selected.filter(
                                    item => item !== row[selectField]
                                  );
                                }
                                setSelectedIds(selected);
                              }}
                            />
                          </td>
                        )}
                        {columns.map((col, index) => {
                          return (
                            <td
                            key={`${row[col]}_${index}`}

                            style={
                              col === "time_difference_user1" && row["time_difference_color_user1"]
                                ? { color: row["time_difference_color_user1"] }
                                : col === "time_difference_user2" && row["time_difference_color_user2"]
                                ? { color: row["time_difference_color_user2"] }
                                : col === "time_difference" && row["time_difference_color"]
                                ? { color: row["time_difference_color"] }
                                : {}
                            }                            
                            className={`text-sm md:text-md  p-3 ${valueCss} ${row[col] === "-" ? "text-white" : "text-dark"}`}
                          >
                              {col === "users_completed" && (
                                <div className="flex items-center">
                                  <BsDot size={40} color={"#006400"} />
                                  {row[col]}
                                </div>
                              )}
                              {col !== "users_completed" && row[col]}
                            </td>
                          );
                        })}
                        {showViewReportBtn && (
                          <td
                            className={`text-sm md:text-md ${valueCss} p-3 text-dark w-[180px] md:w-[240px] `}
                          >
                            <Button
                              className={`pl-2 md:pl-4 py-2  rounded font-semibold text-sm md:text-md ${
                                showSelect &&
                                row[fieldToDisableReportBtn]?.toString() ==
                                  "00:00:00" &&
                                "cursor-not-allowed"
                              }`}
                              btnVariant={
                                !showSelect &&
                                row[fieldToDisableReportBtn]?.toString() !==
                                  "00:00:00"
                                  ? "link"
                                  : selectedIds.includes(row[selectField])
                                  ? "oulinePrimary"
                                  : "disbaledLink"
                              }
                              onClick={() => {
                                if (
                                  !showSelect &&
                                  row[fieldToDisableReportBtn]?.toString() !==
                                    "00:00:00"
                                ) {
                                  router.push(
                                    reverse(
                                      appRoutes.reports.individual.report,
                                      {
                                        userId: row["user_id"] || row["User ID"]
                                      }
                                    )
                                  );
                                }
                              }}
                            >
                              {selectedIds.includes(row[selectField]) ? (
                                <span className="-ml-4 px-[50px]">
                                  Selected
                                </span>
                              ) : (
                                <span className="-ml-4">
                                  {!selectedIds.includes(row[selectField]) && (
                                    <img
                                      src={
                                        showSelect ||
                                        row[
                                          fieldToDisableReportBtn
                                        ]?.toString() == "00:00:00"
                                          ? "/images/inactive-report.svg"
                                          : "/images/active-report.svg"
                                      }
                                      width={13}
                                      className="inline "
                                      alt="view report"
                                    />
                                  )}
                                  <span> View report</span>
                                </span>
                              )}
                            </Button>
                          </td>
                        )}
                      </tr>
                    );
                })
              ) : loading ? (
                <tr className="h-[50px]">
                  <td colSpan={columns.length} className="text-center">
                    <div className="flex items-center justify-center h-full">
                      <ReactLoading
                        type={"spin"}
                        color={"var(--primary-color)"}
                        height={20}
                        width={20}
                      />
                    </div>
                  </td>
                </tr>
              ) : addPagination && searchFilter.length > 0 ? (
                <tr className="h-[50px]">
                  <td
                    colSpan={columns.length}
                    className="text-sm md:text-md text-center relative left-1/2 -translate-x-1/2  text-slate-500"
                  >
                    User not found in the search results
                  </td>
                </tr>
              ) : (
                <tr className="h-[50px]">
                  <td
                    colSpan={columns.length}
                    className="text-sm md:text-md text-center relative left-1/2 -translate-x-1/2  text-slate-500"
                  >
                    No data found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {addPagination && (
        <Pagination
          activePage={activePage}
          count={count}
          rowsPerPage={rowsPerPage}
          totalPages={totalPages}
          setActivePage={setActivePage}
        />
      )}
    </div>
  );
};

CustomTable.propTypes = {
  showSelect: PropTypes.bool,
  selectedIds: PropTypes.array,
  setSelectedIds: PropTypes.func,
  selectField: PropTypes.string,
  showViewReportBtn: PropTypes.bool,
  size: PropTypes.string,
  valueCss: PropTypes.string,
  key: PropTypes.string,
  colorField: PropTypes.string

};

CustomTable.defaultProps = {
  showSelect: false,
  selectedIds: [],
  setSelectedIds: () => {},
  selectField: "",
  showViewReportBtn: false,
  size: "",
  valueCss: "text-left",
  key: "",
  colorField: "time_difference_color"

};

export default CustomTable;
