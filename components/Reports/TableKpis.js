import ComparativeTable from "components/ComparitiveTable";
import React from "react";

export const TableKpis = ({ tableKpis, tableKpis2, compare }) => {
  return (
    <div className="py-4">
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
