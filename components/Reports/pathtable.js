import ComparativeTable from "components/ComparitiveTable";
import React from "react";

export const Pathtable = ({ pathtable, compare }) => {
  return (
    <div className="my-4 bg-white p-4 rounded-lg shadow-md animate-fade-in">
      <div className="font-bold text-lg text-dark py-2">Path table</div>
      <div className="overflow-x-auto"></div>
      <ComparativeTable
        rows={pathtable && pathtable.length > 0 ? pathtable : null}
        compare={compare}
        columns={pathtable.length > 0 ? Object.keys(pathtable[0]) : null}
        staticColumns={["name"]}
      />
    </div>
  );
};