import React, { useState, useMemo } from "react";
import MyChart from "./MyChart";
import { AiOutlineInfoCircle } from "react-icons/ai";
import CustomLegend from "components/CustomLegend";

const IdealActualPath = ({
  ideal,
  actual2,
  actual,
  title,
  axisLines,
  titleSuffix,
  extraPlots,
  isReachTruck,
  isForkLift,
  obstacles,
  obstacles1,
  vAxisLines
}) => {
  const memoisedChart = useMemo(
    () => (
      <MyChart
        ideal={ideal}
        actual={actual}
        actual2={actual2}
        extraPlots={extraPlots}
        axisLines={axisLines}
        compare
        isReachTruck={isReachTruck}
        isForkLift={isForkLift}
        obstacles={obstacles}
        obstacles1={obstacles1}
        vAxisLines={vAxisLines}
        title={title}
      />
    ),
    [extraPlots, actual, actual2, axisLines, isReachTruck, ideal]
  );

  let mainTitle = `Ideal path vs actual Path (Collision, overtaking) ${title}`;

  if (axisLines) {
    if (isReachTruck) {
      mainTitle = `Reach Truck ideal and Actual path ${titleSuffix} ${title}`;
    } else if (isForkLift) {
      mainTitle = `Forklift ideal and Actual path ${titleSuffix} ${title}`;
    }
  }
  const [showLegend, setShowLegend] = useState(false);
  return (
    <div className="px-1 -mx-1 text-slate-500 w-full xl:w-1/2 mt-3 ">
      <div className="rounded border p-4">
        <div className="flex justify-between">
          <div className="text-sm md:text-md lg:text-lg text-dark">
            {mainTitle}
          </div>
          <div className="relative ">
            <AiOutlineInfoCircle
              size={20}
              onMouseOver={() => setShowLegend(true)}
              onMouseLeave={() => setShowLegend(false)}
            />
            <CustomLegend
              showLegend={showLegend}
              obstacles={obstacles}
              obstacles1={obstacles1}
              isForkLift={isForkLift}
            />
          </div>
        </div>

        {ideal.length > 0 ? (
          <div className="">{memoisedChart}</div>
        ) : (
          <div className="flex justify-center items-center h-[300px]">
            No data available
          </div>
        )}
      </div>
    </div>
  );
};

export default IdealActualPath;