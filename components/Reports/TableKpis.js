import ComparativeTable from "components/ComparitiveTable";
import React from "react";

export const TableKpis = ({ tableKpis, tableKpis2, compare }) => {
  return (
    // <div className="py-4">
    <div className="my-4 bg-white p-4 rounded-lg shadow-md animate-fade-in slide-effect"> {/* Added slide-effect class here */}
      <div className="font-bold text-lg text-dark py-2">General KPI Assessment</div>
      <div className="overflow-x-auto"></div>
      <ComparativeTable
        rows={tableKpis && tableKpis.length > 0 ? tableKpis : null}
        rows2={tableKpis2 && tableKpis2.length > 0 ? tableKpis2 : null}
        compare={compare}
        columns={tableKpis.length > 0 ? Object.keys(tableKpis[0]) : null}
        staticColumns={["name"]}
      />
    </div>
  );
};
