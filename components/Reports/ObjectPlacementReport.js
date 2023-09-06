import ComparativeTable from "components/ComparitiveTable";
import CustomTable from "components/CustomTable";
import React from "react";

const ObjectPlacementReport = ({
  objectPlacements,
  objectPlacements2,
  compare
}) => {
  const columnsMap = {
    ideal: "Ideal Object Placement",
    placement: "placement",
    actual: "User Object PLacement"
  };

  return (
    <div>
      <div className="font-bold text-dark py-5">Object Placement</div>
      <ComparativeTable
        columns={["ideal", "placement", "actual"]}
        rows={objectPlacements.map(item => {
          return {
            ...item,
            placement: item.placement ? "Correct" : "Not Correct"
          };
        })}
        rows2={
          compare
            ? objectPlacements2.map(item => {
                return {
                  ...item,
                  placement: item.placement ? "Correct" : "Not Correct"
                };
              })
            : null
        }
        columnsMap={columnsMap}
        staticColumns={["ideal"]}
        compare={compare}
      />
    </div>
  );
};

export default ObjectPlacementReport;
