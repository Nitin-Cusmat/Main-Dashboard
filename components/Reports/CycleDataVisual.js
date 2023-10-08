import React from "react";
import ComparativeTable from "components/ComparitiveTable";

const CycleDataVisual = ({ cycleData, cycleData2, compare }) => {
  const cycleDataFields = {
    cycleTime: "Cycle Time",
    loadingTime: "Loading Time",
    dumpingTime: "Dumping Time",
    totalCollisionOfBucketWithDumperWhileDumping:
      "Total Collision of bucket with dumper while dumping",
    bucketanglewhileloading: "bucket angle while loading (Ideal +/-45 angle)",
    bucketanglewhiledumping: "bucket angle while dumping (Ideal +/-45 angle)",
    spilled: "Spilled",
    dumperRockCount: "Dumper Rock Count"
  };

  const parsedCycleData = data => {
    return data.map((item, index) => {
      let cycleObj = {};
        Object.keys(cycleDataFields)
            .slice(0, 6)
            .forEach(field => {
                if (field === 'cycleTime' || field === 'loadingTime' || field === 'dumpingTime') {
                    if (item[field] >= 60) {
                        cycleObj[cycleDataFields[field]] = `${(item[field] / 60).toFixed(2)} min`;
                    } else {
                        cycleObj[cycleDataFields[field]] = `${item[field].toFixed(2)} sec`;
                    }
                } else if (field === 'bucketanglewhileloading' || field === 'bucketanglewhiledumping') {
                    let angle = item[field];
                    if (angle < -45 || angle > 45) {
                      cycleObj[cycleDataFields[field]] = {
                          value: `${angle}°`,
                          style: { color: 'red' }
                      };
                  } else {
                      cycleObj[cycleDataFields[field]] = {
                          value: `${angle}°`,
                          style: { color: 'green' }
                      };
                  }
                } else {
                    cycleObj[cycleDataFields[field]] = item[field];
                }
            });
        return { ...cycleObj, "Truck Cycle Count": cycleData[index].name };
    });
};

  return (
    <div className="pb-5 mt-6">
      <ComparativeTable
        columns={[
          "Truck Cycle Count",
          ...Object.values(cycleDataFields).slice(0, 6)
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
