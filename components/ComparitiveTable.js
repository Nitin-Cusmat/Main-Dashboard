import React from "react";
import PropTypes from "prop-types";
import { BsFillCheckCircleFill } from "react-icons/bs";
import { MdCancel } from "react-icons/md";
import { FaCheck, FaTimes } from "react-icons/fa"; // New imports for correct and wrong icons

const ComparativeTable = ({
  columns,
  rows,
  rows2,
  size,
  valueCss,
  table_key,
  staticColumns,
  additionalRowData,

  compare,
  addIndex,
  columnsMap,
  isSpecialModule,
  columnsWidth = null,
  users = ["User 1", "User 2"]
}) => {
  const alignmentCss = compare ? "text-center" : valueCss;
  const remainingRows =
    compare && rows2 && rows2.length >= rows.length
      ? rows2.slice(rows.length)
      : null;
  const thCss = `bg-blue-100 text-dark font-medium text-sm md:text-md capitalize border ${alignmentCss}`;

  const rowContainsSpecificTask = (row, task) => {
    return Object.values(row).some(value => String(value).includes(task));
  };
  const renderTaskHeading = (taskName) => (
    
    <tr>
      <td colSpan={columns.length + (addIndex ? 1 : 0)} className="text-center p-2">
        <div className={`font-bold text-xl text-white animatedGradient border border-blue-300 rounded-lg shadow-md py-2 px-4 hover:shadow-lg transition-shadow duration-300`}>
          Key Performance indicators for : {taskName}
        </div>
      </td>
    </tr>
  );
  

const rowContainsSpecificString = (row) => {
  return Object.values(row).some(value => String(value) === "Sdfdsf");
};

  const getRecords = (row, rowIndex, rowLength) => (
    <tr
        key={`${row[table_key]}_${rowIndex}`}
        className={`even:bg-[#fafafa] odd:bg-[#f6f4f8] hover:bg-yellow ${
          rowIndex === rowLength - 1 && isSpecialModule && "font-bold"
        } ${rowContainsSpecificString(row) ? "mb-104" : ""}`} // Add this part
    >
      {columns &&
        columns.map((col, colIndex) => {
          return (
            <>
              {addIndex && (
                <td
                  key={`Index_user1${row[col]}_${colIndex}`}
                  className={`text-sm md:text-md p-3 ${alignmentCss} text-dark border`}
                >
                  <div
                    className={`p-3 ${
                      columnsWidth
                        ? `min-w-[${columnsWidth[colIndex]}]`
                        : "auto"
                    }`}
                  >
                    {rowIndex}
                  </div>
                </td>
              )}
              <td
                key={`user1_${row[col]}_${colIndex}`}
                className={`text-sm md:text-md p-3 ${alignmentCss} text-dark border`}
                colSpan={
                  compare &&
                  (col.toLowerCase() === "score kpi" ||
                    col.toLowerCase() === "defined score by dhl")
                    ? 2
                    : 1
                }
              >
               {row[col] != null ? (
                              (col === "steps_taken_by_user_to_stop_the_EDP_pump" || col === "steps_taken_by_user_to_start_the_EDP_pump") ? (
                                (row[col] === row["ideal_process_steps_to_stop_EDP_pump"] || row[col] === row["ideal_process_steps_to_start_EDP_pump"]) ? (
                                    <div style={{ color: 'green' }}>{row[col]}</div>
                                    ) : (
                                        <div style={{ color: 'red' }}>{row[col]}</div>
                                    )
                                ) : typeof row[col] === "boolean" ? (
                                    row[col] ? (
                                        <BsFillCheckCircleFill size="20" color="green" />
                                    ) : (
                                        <MdCancel size="20" color="red" />
                                    )
                                ) : (
                                    typeof row[col] === 'object' && row[col].value ? 
                                    <div style={row[col].style}>{row[col].value}</div> : 
                                    row[col].toString()
                                )
                            ) : (
                  ""
                )}
              </td>
              {compare &&
                !staticColumns.includes(col) &&
                col.toLowerCase() !== "precheckcondition" &&
                col.toLowerCase() != "score kpi" &&
                col.toLowerCase() != "defined score by dhl" && (
                  <td
                    key={`user2_${row[col]}_${colIndex}`}
                    className={`text-sm md:text-md  p-3 ${alignmentCss} text-dark border`}
                  >
                    {rows2 &&
                      rows2[rowIndex] != null &&
                      rows2[rowIndex][col] != null &&
                      
                      (typeof row[col] === "boolean" ? (
                        row[col] ? (
                          <BsFillCheckCircleFill size="20" color="green" />
                        ) : (
                          <MdCancel size="20" color="red" />
                        )
                      ) : (
                        typeof rows2[rowIndex][col] === 'object' && rows2[rowIndex][col].value ?
                        <div style={rows2[rowIndex][col].style}>{rows2[rowIndex][col].value}</div> :
                        rows2[rowIndex][col].toString()                      ))}
                  </td>
                )}
            </>
          );
        })}
    </tr>
  );
  return (
    <div key="table" className={`w-full overflow-x-auto ${size}`}>
      <table className="table-auto w-full border shadow-sm h-full">
        <thead>
          <tr>
            {addIndex && (
              <th rowSpan={2} key={`col_index`} className={thCss}>
                <div className="p-3">Index</div>
              </th>
            )}
            {columns &&
              columns.map((heading, index) => (
                <th
                  colSpan={
                    heading.toLowerCase() === "precheckcondition"
                      ? index === 0
                        ? 1
                        : 2
                      : staticColumns.includes(heading)
                      ? 1
                      : compare
                      ? 2
                      : 1
                  }
                  key={`col_${heading}`}
                  className={`${thCss} ${alignmentCss}`}
                >
                  {heading == "showEmpty" ? (
                    ""
                  ) : (
                    <div
                      className={`p-3 ${
                        columnsWidth ? `min-w-[${columnsWidth[index]}]` : "auto"
                      }`}
                    >
                      {columnsMap
                        ? columnsMap[heading]
                        : heading.split("_").join(" ")}
                    </div>
                  )}
                </th>
              ))}
          </tr>
        </thead>
        <tbody className="relative h-[50px]">
          {/* for users */}
          {compare &&
            columns &&
            columns.map(heading => (
              <>
                {addIndex && (
                  <td
                    key={`Index_user1`}
                    className={`text-sm md:text-md p-3 ${alignmentCss} text-dark border`}
                  ></td>
                )}
                <td
                  key={`col_${heading}`}
                  className={thCss}
                  colSpan={
                    heading.toLowerCase() === "score kpi" ||
                    heading.toLowerCase() === "defined score by dhl"
                      ? 2
                      : 1
                  }
                >
                  {heading == "showEmpty" ? (
                    ""
                  ) : heading.toLowerCase() === "precheckcondition" ? (
                    "Conditions"
                  ) : heading.toLowerCase() === "score kpi" ||
                    heading.toLowerCase() === "defined score by dhl" ? (
                    ""
                  ) : (
                    <div className="p-3">
                      {!staticColumns.includes(heading) ? users[0] : ""}
                    </div>
                  )}
                </td>
                {heading.toLowerCase() !== "precheckcondition" &&
                  heading.toLowerCase() != "score kpi" &&
                  heading.toLowerCase() != "defined score by dhl" &&
                  !staticColumns.includes(heading) && (
                    <td className={thCss}>
                      {heading == "showEmpty" ? (
                        ""
                      ) : (
                        <div className="p-3">
                          {!staticColumns.includes(heading) ? users[1] : ""}
                        </div>
                      )}
                    </td>
                  )}
              </>
            ))}
          {/* records */}
          {rows &&
        rows.length > 0 &&
        rows.map((row, rowIndex) => (
          <>
            {rowContainsSpecificTask(row, "Task 1") && 
            !rows.slice(0, rowIndex).some(prevRow => rowContainsSpecificTask(prevRow, "Task 1")) && 
            renderTaskHeading("Task 1")}
            
            {rowContainsSpecificTask(row, "Task 2") && 
            !rows.slice(0, rowIndex).some(prevRow => rowContainsSpecificTask(prevRow, "Task 2")) && 
            renderTaskHeading("Task 2")}
            
            {rowContainsSpecificTask(row, "Task 3") && 
            !rows.slice(0, rowIndex).some(prevRow => rowContainsSpecificTask(prevRow, "Task 3")) && 
            renderTaskHeading("Task 3")}
            
            {getRecords(row, rowIndex, rows.length)}
          </>
        ))}
          {remainingRows &&
            remainingRows.map((row, rowIndex) => getRecords(row, rowIndex))}

          {/* Insert new code here */}
          {additionalRowData && (
            <tr>
              {columns.map((col, colIndex) => (
                <td key={`additional_${col}_${colIndex}`} className={`text-sm md:text-md p-3 ${alignmentCss} text-dark border`}>
                  {additionalRowData[col]}
                </td>
              ))}
            </tr>
          )}
          {/* End of new code */}
          {!rows ||
            (rows.length < 1 && (
              <tr>
                <td className="text-sm md:text-md absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-500 ">
                  No data found
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};

ComparativeTable.propTypes = {
  size: PropTypes.string,
  valueCss: PropTypes.string,
  key: PropTypes.string,
  staticColumns: PropTypes.array
};

ComparativeTable.defaultProps = {
  size: "",
  valueCss: "text-left",
  key: "",
  staticColumns: []
};

export default ComparativeTable;