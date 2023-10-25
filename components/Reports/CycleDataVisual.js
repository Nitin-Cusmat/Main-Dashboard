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
  };

   // Identify the present columns in the provided dataset
   const getPresentColumns = data => {
    return Object.keys(cycleDataFields).filter(field => {
      return data.some(item => item[field] !== undefined);
    });
  };

  const presentColumnsCycleData = getPresentColumns(cycleData);
  const presentColumnsCycleData2 = compare && cycleData2 ? getPresentColumns(cycleData2) : [];

  const columnsToDisplay = ["Truck Cycle Count", ...new Set([...presentColumnsCycleData, ...presentColumnsCycleData2].map(field => cycleDataFields[field]))];
  const parsedCycleData = (data, presentColumns) => {
    return data.map((item, index) => {
      let cycleObj = {};
      presentColumns.forEach(field => {
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
        columns={columnsToDisplay}
        rows={parsedCycleData(cycleData, presentColumnsCycleData)}
        rows2={compare && cycleData2 ? parsedCycleData(cycleData2, presentColumnsCycleData2) : null}
        compare={compare}
        staticColumns={["Truck Cycle Count"]}
      />
    </div>
  );
};

export default CycleDataVisual;
