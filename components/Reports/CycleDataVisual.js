import React from "react";
import ComparativeTable from "components/ComparitiveTable";

const CycleDataVisual = ({ cycleData, cycleData2, compare }) => {
  const cycleDataFields = {
    cycleTime: "CycleTime(sec)",
    loadingTime: "LoadingTime(sec)",
    dumpingTime: "DumpingTime(sec)",
    totalCollisionOfBucketWithDumperWhileDumping:
      "Total Collision of bucket with dumper while dumping",
    loaderBucketRockCount: "LoaderBucketRockCount",
    spilled: "Spilled",
    dumperRockCount: "Dumper Rock Count"
  };

  const parsedCycleData = data => {
    return data.map((item, index) => {
      let cycleObj = {};
      Object.keys(cycleDataFields)
        .slice(0, 4)
        .forEach((field, idx) => {
          if (idx < Object.keys(cycleDataFields).slice(0, 4).length - 1)
            cycleObj[cycleDataFields[field]] = item[field].toFixed(2);
          else cycleObj[cycleDataFields[field]] = item[field];
        });

      return { ...cycleObj, "Truck Cycle Count": cycleData[index].name };
    });
  };

  return (
    <div className="pb-5 mt-6">
      <ComparativeTable
        columns={[
          "Truck Cycle Count",
          ...Object.values(cycleDataFields).slice(0, 4)
        ]}
        rows={parsedCycleData(cycleData)}
        rows2={compare && cycleData2 ? parsedCycleData(cycleData2) : null}
        compare={compare}
        staticColumns={["Truck Cycle"]}
      />
    </div>
  );
};

export default CycleDataVisual;
