import ComparativeTable from "components/ComparitiveTable";
import React from "react";

export const TableKpis = ({ tableKpis, tableKpis2, compare}) => {
  const hasData = tableKpis && tableKpis.length > 0 && Object.keys(tableKpis[0]).length > 0;

  if (!hasData) return null; // Return null (or some placeholder) if there's no data

  return (
    <div className={`my-4 bg-white p-4 rounded-lg shadow-md animate-fade-in slide-effect`}>
      <div className="font-bold text-lg text-dark py-2">General KPI Assessment</div>
      <div className="overflow-x-auto"></div>
      <ComparativeTable
        rows={tableKpis}
        rows2={tableKpis2 && tableKpis2.length > 0 ? tableKpis2 : null}
        compare={compare}
        columns={Object.keys(tableKpis[0])}
        staticColumns={["name"]}
      />
    </div>
  );
};






