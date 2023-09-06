import React from "react";
import PropTypes from "prop-types";
import { BsFillCheckCircleFill } from "react-icons/bs";
import { MdCancel } from "react-icons/md";
const ComparativeTable = ({
  columns,
  rows,
  rows2,
  size,
  valueCss,
  table_key,
  staticColumns,
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
  const thCss = `bg-white text-dark font-medium text-sm md:text-md capitalize border ${alignmentCss}`;

  const getRecords = (row, rowIndex, rowLength) => (
    <tr
      key={`${row[table_key]}_${rowIndex}`}
      className={`even:bg-[#fafafa] odd:bg-[#f6f4f8] ${
        rowIndex === rowLength - 1 && isSpecialModule && "font-bold"
      }`}
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
                  typeof row[col] === "boolean" ? (
                    row[col] ? (
                      <BsFillCheckCircleFill size="20" color="green" />
                    ) : (
                      <MdCancel size="20" color="red" />
                    )
                  ) : (
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
                        rows2[rowIndex][col].toString()
                      ))}
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
            rows.map((row, rowIndex) => getRecords(row, rowIndex, rows.length))}
          {remainingRows &&
            remainingRows.map((row, rowIndex) => getRecords(row, rowIndex))}

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
