import Chart from "components/Chart/Chart";
import React from "react";
import { CHART_COLORS, CHART_TYPES } from "utils/constants";
import BoxData from "./BoxData";
import { timeConverter } from "utils/utils";
import MistakesScore from "./Reports/MistakesScore";
import { useRouter } from "next/router";

const ScoreRow = ({ score, attemptDuration, compare, mistakeScores }) => {
  const boxsize = " w-full min-w-[250px] h-[250px]";
  const module_names = ["reach truck", "Forklift"];
  const router = useRouter();
  const lowerCaseModule = router.query.module?.toLowerCase();
  const isAnyModule =
    lowerCaseModule &&
    module_names.some(name => lowerCaseModule.includes(name));

  return (
    <div className="w-full">
      {score.map((item, index) => {
        if (!item) return null;
        const options = {
          legend: { show: false },
          colors: [
            item.result ? CHART_COLORS.chartGreen : CHART_COLORS.chartRed
          ],
          plotOptions: {
            radialBar: {
              dataLabels: {
                show: true,
                name: { show: false },
                value: {
                  show: true,
                  offsetY: 8,
                  color: item.result
                    ? CHART_COLORS.chartGreen
                    : CHART_COLORS.chartRed,
                  fontWeight: "bold",
                  fontSize: "16px"
                }
              }
            }
          }
        };

        return (
          <div
            key={index}
            className="flex max-md:flex-col justify-between items-center my-4"
          >
            {isAnyModule && (
              <div className="flex flex-col items-center border p-3 min-w-[200px] h-[200px]">
                {compare && (
                  <div className="text-center"> User {index + 1}</div>
                )}
                <Chart
                  type={CHART_TYPES.RADIAL}
                  series={[Math.round(item.score)]}
                  options={options}
                  width={200}
                  height={200}
                />
                <div className="text-black">{`Passing Score: ${item.passing_score}%`}</div>
              </div>
            )}
            {!isAnyModule && mistakeScores && (
              <MistakesScore
                mistakeScores={mistakeScores}
                score={[Math.round(item.score)]}
              />
            )}
            <div className="max-md:mt-5">
              <BoxData
                size={boxsize}
                heading={`${
                  compare ? `Time Spent By User ${index + 1}` : "Time Spent"
                }`}
                classnames={"!border-none"}
                value={timeConverter(attemptDuration[index].split(".")[0])}
              ></BoxData>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ScoreRow;
