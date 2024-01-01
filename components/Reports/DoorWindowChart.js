import React from "react";
import { Stage, Layer, Rect, Text, Line } from "react-konva";

const WallObject = ({ wall }) => {
  return (
    <div className="mt-4 items-center justify-between">
      <h2 className="text-lg font-bold text-left mb-2">
        Wall {wall.wallNumber} (Dimensions: {wall.wallWidth}x{wall.wallHeight})
      </h2>
      <Stage width={wall.wallWidth} height={wall.wallHeight}>
        <Layer>
          {/* Draw the wall */}
          <Rect
            x={0}
            y={0}
            width={wall.wallWidth}
            height={wall.wallHeight}
            stroke="blue"
            strokeWidth={2}
          />

          {/* Draw non-paintable objects, dashed lines, and labels */}
          {wall.nonPaintables.map((obj, objIndex) => {
            const yPos =
              wall.wallHeight - obj.bottonDistance - obj.heightOfObject;

            return (
              <React.Fragment key={objIndex}>
                {/* Object */}
                <Rect
                  x={obj.leftDistance}
                  y={yPos}
                  width={obj.widthOfObject}
                  height={obj.heightOfObject}
                  stroke="red"
                  strokeWidth={1}
                />

                {/* Dimension label */}
                <Text
                  x={obj.leftDistance}
                  y={yPos}
                  text={`${obj.widthOfObject}x${obj.heightOfObject}`}
                  fontSize={12}
                  fill="black"
                  width={obj.widthOfObject}
                  height={obj.heightOfObject}
                  align="center"
                  verticalAlign="middle"
                />

                {/* Dashed lines and labels */}
                {/* Bottom distance */}
                <Line
                  points={[
                    obj.leftDistance + obj.widthOfObject / 2,
                    yPos + obj.heightOfObject,
                    obj.leftDistance + obj.widthOfObject / 2,
                    wall.wallHeight
                  ]}
                  stroke="green"
                  strokeWidth={1}
                  dash={[4, 2]}
                />
                <Text
                  x={obj.leftDistance + obj.widthOfObject / 2}
                  y={yPos + obj.heightOfObject + obj.bottonDistance / 2}
                  text={obj.bottonDistance.toString()}
                  fontSize={10}
                  fill="green"
                  align="center"
                />

                {/* Left distance */}
                <Line
                  points={[
                    obj.leftDistance,
                    yPos + obj.heightOfObject / 2,
                    0,
                    yPos + obj.heightOfObject / 2
                  ]}
                  stroke="green"
                  strokeWidth={1}
                  dash={[4, 2]}
                />
                <Text
                  x={obj.leftDistance / 2}
                  y={yPos + obj.heightOfObject / 2}
                  text={obj.leftDistance.toString()}
                  fontSize={10}
                  fill="green"
                  align="center"
                  verticalAlign="middle"
                />
              </React.Fragment>
            );
          })}
        </Layer>
      </Stage>
    </div>
  );
};

const DoorWindowChart = ({ data }) => {
  return (
    <div className="flex flex-col xl:flex-row">
      <div className="container xl:w-1/2">
        <p> IDEAL </p>
        {data.idealWalls.map((wall, index) => (
          <WallObject key={index} wall={wall} userType="IDEAL" />
        ))}
      </div>

      <div className="container md:w-1/2">
        <p> USER </p>
        {data.userWalls.map((wall, index) => (
          <WallObject key={index} wall={wall} userType="USER" />
        ))}
      </div>
    </div>
  );
};

export default DoorWindowChart;
