import ComparativeTable from "components/ComparitiveTable";
import ScoreRow from "components/ScoreRow";
import React from "react";

const SubActivitiesReport = ({ subactivities, compare, subactivities2 }) => {
  const columnsMap = {
    subActivity: "Subactivity",
    name: "Name",
    avgAngleRotation: "Angle of Engagement",
    avgHandRotation: "Avg Hand Rotation",
    time: "Time",
    accuracy: "Values", //if 100 then correct else incorrect
    toolPickedAttempt: "Tool Picked Attempt",
    toolPlaced: "Tool Picked", //if 0 placed at wrong place else placed at right place
    size: "Size",
    quantity: "Quantity"
  };

  const getParsedData = subactivitiesList => {
    let parsed = subactivitiesList.map(subactivity => {
      return {
        ...subactivity,
        accuracy: subactivity.accuracy == 100 ? "Correct" : "Incorrect",
        toolPlaced:
          subactivity.toolPlaced == 100
            ? "Placed at Right Place"
            : "Placed at Wrong Place"
      };
    });
    return parsed;
  };
  return (
    <div className="py-4">
      {/* <ScoreRow
        score={compare ? score : [score]}
        attemptDuration={compare ? attemptDuration : [attemptDuration]}
        compare={compare}
      /> */}
      <div className="font-bold text-dark py-5">Sub Activities</div>
      <ComparativeTable
        rows={getParsedData(subactivities)}
        rows2={compare ? getParsedData(subactivities2) : null}
        columns={Object.keys(columnsMap)}
        columnsMap={columnsMap}
        staticColumns={["subActivity", "name"]}
        compare={compare}
      />
    </div>
  );
};

export default SubActivitiesReport;
