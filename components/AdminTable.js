import React from "react";
import { timeConverter } from "utils/utils";

const AdminTable = ({ headings, rows, columns, hover, anchor, onClick }) => {
  return (
    <div className="overflow-auto">
      <table className="border w-full">
        <thead>
          <tr>
            {headings.map(heading => {
              return (
                <th
                  key={`${heading}`}
                  className="bg-white text-dark font-medium text-sm md:text-md capitalize text-left p-3"
                >
                  {heading}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr
              key={`${row}_${index}`}
              className="even:bg-[#fafafa] odd:bg-[#f6f4f8]"
            >
              {columns.map((column, columnIndex) => (
                <td
                  key={`${column}_${columnIndex}`}
                  className="text-sm md:text-md  p-3 text-left text-dark"
                >
                  <span className="group relative">
                    {anchor && Object.keys(anchor).indexOf(column) !== -1 ? (
                      <a
                        className="hover:underline text-primary cursor-pointer"
                        onClick={() => anchor[column](row[column])}
                      >
                        {row[column]}
                      </a>
                    ) : column === "total_time_spent" ||
                      column === "total_duration" ? (
                      timeConverter(row[column], true)
                    ) : (
                      row[column]
                    )}
                    {/* {Object.keys(hover).indexOf(column) !== -1 && (
                      <span
                        className={`absolute hidden group-hover:flex top-0 max-md:w-[140px] md:w-[192px] px-2 py-1 bg-gray-600 rounded-lg text-center text-white text-sm before:content-[''] before:absolute before:border-8 " ${
                          columns.length - 1 !== columnIndex
                            ? "left-[calc(100%+10px)] before:right-[99%] before:border-y-transparent before:border-l-transparent before:border-r-gray-600"
                            : "right-[120%] before:-right-[15px] before:border-y-transparent before:border-r-transparent before:border-l-gray-600"
                        } `}
                      >
                        <span className="w-full">
                          {Array.isArray(rows[index][hover[column]])
                            ? rows[index][hover[column]].map((x, idx) => (
                                <p
                                  key={`${x}`}
                                  className="text-center max-sm:text-[12px] md:text-md"
                                >
                                  {rows[index][hover[column]][idx]}
                                </p>
                              ))
                            : Object.keys(rows[index][hover[column]]).map(x => (
                                <p
                                  key={`${x}`}
                                  className="text-center max-sm:text-[12px] md:text-md"
                                >
                                  {x + " : " + rows[index][hover[column]][x]}
                                </p>
                              ))}
                        </span>
                      </span>
                    )} */}
                  </span>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminTable;
