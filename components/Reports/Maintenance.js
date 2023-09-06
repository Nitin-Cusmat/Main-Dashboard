import ComparativeTable from "components/ComparitiveTable";
import CustomTable from "components/CustomTable";
import React from "react";

const Maintenance = ({ maintenance, maintenance2, compare }) => {
  const maintenanceMap = {
    name: "General KPI",
    value: "User Performed"
  };

  return (
    <div className="my-4 py-5">
      <div className="font-bold text-dark pb-4">Maintenance</div>
      <div className="flex flex-wrap w-full justify-between">
        <div className="w-full lg:w-[48%] text-dark">
          <div className="py-2">Before Maintenance</div>
          <ComparativeTable
            columns={["name", "value"]}
            rows={maintenance.before.map(item => {
              return {
                name: item.name,
                value: item.value ? "Yes" : "No"
              };
            })}
            rows2={
              compare && maintenance2?.before
                ? maintenance2.before.map(item => {
                    return {
                      name: item.name,
                      value: item.value ? "Yes" : "No"
                    };
                  })
                : null
            }
            columnsMap={maintenanceMap}
            compare={compare}
            staticColumns={["name"]}
          />
        </div>
        <div className="w-full lg:w-[48%] text-dark">
          <div className="py-2">After Maintenance</div>

          <ComparativeTable
            columns={["name", "value"]}
            rows={maintenance.after.map(item => {
              return {
                name: item.name,
                value: item.value ? "Yes" : "No"
              };
            })}
            rows2={
              compare && maintenance2?.after
                ? maintenance2.after.map(item => {
                    return {
                      name: item.name,
                      value: item.value ? "Yes" : "No"
                    };
                  })
                : null
            }
            columnsMap={maintenanceMap}
            compare={compare}
            staticColumns={["name"]}
          />
        </div>
      </div>
    </div>
  );
};

export default Maintenance;
