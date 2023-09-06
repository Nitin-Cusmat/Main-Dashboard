import ComparativeTable from "components/ComparitiveTable";
import CustomTable from "components/CustomTable";
import React, { useEffect, useState } from "react";

const CasesReport = ({ cases, cases2, compare }) => {
  const getGroupedCases = tempCases => {
    let rightCases = [];
    let wrongCases = [];
    if (tempCases)
      tempCases.forEach(c => {
        if (c.value) {
          rightCases.push({
            "Correct Cases": c.name
          });
        } else {
          wrongCases.push({
            "Wrong Cases": c.name
          });
        }
      });

    const finalData = {
      rightCases: rightCases,
      wrongCases: wrongCases
    };
    return finalData;
  };

  return (
    <div className="mt-4">
      <div className="font-bold text-dark pb-5">Cases</div>
      <div className="flex flex-col md:flex-row gap-4">
        <ComparativeTable
          columns={["Correct Cases"]}
          rows={getGroupedCases(cases).rightCases}
          rows2={compare ? getGroupedCases(cases).rightCases : null}
          key={"Correct Cases"}
          compare={compare}
          addIndex
        />
        <ComparativeTable
          columns={["Wrong Cases"]}
          rows={getGroupedCases(cases).wrongCases}
          rows2={compare ? getGroupedCases(cases2).wrongCases : null}
          key={"Wrong Cases"}
          compare={compare}
          addIndex
        />
      </div>
    </div>
  );
};

export default CasesReport;
