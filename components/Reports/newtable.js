import ComparativeTable from "components/ComparitiveTable";
import React from "react";

export const Newtable = ({ kpitable, compare }) => {
  return (
    <div className="my-4 bg-white p-4 rounded-lg shadow-md animate-fade-in">
      <div className="font-bold text-lg text-dark py-2">Table KPI Assessment 1</div>
      <div className="overflow-x-auto"></div>
      <ComparativeTable
        rows={kpitable && kpitable.length > 0 ? kpitable : null}
        compare={compare}
        columns={kpitable.length > 0 ? Object.keys(kpitable[0]) : null}
        staticColumns={["name"]}
      />
    </div>
  );
};