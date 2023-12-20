import React from "react";
import EChart from "components/Chart/EChart";
import { CHART_COLORS } from "utils/constants";
import deviceState from "states/deviceState";
import { useRecoilValue } from "recoil";

const MistakesScore = ({ mistakeScores, score }) => {
  const { screenWidth } = useRecoilValue(deviceState);
  const getColorForScoreKey = key => {
    const colorKeys = Object.keys(CHART_COLORS);
    const colorIndex = Object.keys(mistakeScores).indexOf(key);
    const colorKey = colorKeys[colorIndex % colorKeys.length];
    return `bg-[${CHART_COLORS[colorKey]}]`;
  };
  return (
    <div className="flex items-center h-[300px] w-full lg:w-[600px]">
      <div className="flex-grow h-full">
        <EChart
          options={{
            tooltip: {
              formatter: params => {
                return `${params.data.name}: ${params.data.value}%`;
              }
            },
            graphic: {
              type: "text",
              left: "center",
              top: "center",
              style: {
                text: `Score: ${score + "%"}`,
                textAlign: "center",
                fill: "#333",
                fontSize: 16,
                fontWeight: 800
              }
            },
            series: [
              {
                type: "gauge",
                radius: "90%",
                startAngle: 90,
                endAngle: -270,
                pointer: {
                  show: false
                },
                progress: {
                  show: true,
                  overlap: false,
                  roundCap: true,
                  clip: false,
                  itemStyle: {
                    borderWidth: 1,
                    borderColor: "#464646"
                  }
                },
                axisLine: {
                  lineStyle: {
                    width: 40
                  }
                },
                splitLine: {
                  show: false,
                  distance: 0,
                  length: 10
                },
                axisTick: {
                  show: false
                },
                axisLabel: {
                  show: false,
                  distance: 50
                },
                data: Object.keys(mistakeScores).map((item, idx) => {
                  return {
                    name: item,
                    value: mistakeScores[item],
                    title: {
                      show: false
                    },
                    detail: {
                      show: false
                    }
                  };
                })
              }
            ]
          }}
        />
      </div>
      {/* Vertical Divider */}
      {screenWidth > 700 && <div className="w-[2px] bg-black h-full"></div>}

      {/* Custom Vertical Legend */}
      {screenWidth > 700 && (
        <div className="flex flex-col space-y-2 p-4">
          {Object.entries(mistakeScores).map(([key, value]) => (
            <div key={key} className="flex items-center">
              <span
                className={`h-3 w-3 rounded-full ${getColorForScoreKey(key)}`}
              />
              <span className="ml-2 text-md">{`${key} = ${value}%`}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MistakesScore;
