const CommonCode = ({ children, title }) => (
  <li>
    <div className="w-[300px] flex justify-between items-center">
      <div className="w-[30%] flex items-center justify-center relative">
        {children}
      </div>
      <p className="w-[70%] text-xs">{title}</p>
    </div>
  </li>
);
import React from "react";

const CustomLegend = ({ showLegend, isForkLift, obstacles = null }) => {
  const legends = [
    {
      name: "Starting point",
      css: "w-[12px] h-[12px] bg-green-900 radius rounded-full"
    },
    {
      name: "Ending point",
      css: "w-[12px] h-[12px] bg-[#ff0000] radius"
    },
    {
      name: "Forward Ideal path",
      css: "w-[40px] h-[1px] border-b-2 border-[blue] border-dashed"
    },
    {
      name: "Backward Ideal path",
      css: "w-[40px] h-[1px] border-b-2 border-[orange] border-dashed"
    }
  ];
  if (isForkLift) {
    legends.push(
      {
        name: "Forklift Travel Path",
        css: "w-[40px] h-[1px] border-b-2 border-[red] border-dashed"
      },
      {
        name: "Box Racks",
        css: "w-[20px] h-[20px] border-y-2 border-[#FFA500] bg-[#DADADA]"
      }
    );
  }
  return (
    <div
      className={`${
        showLegend ? "" : "invisible"
      } absolute right-0  p-1 bg-gray-100 z-50 my-3`}
    >
      <ul className="flex flex-wrap justify-around gap-2">
        {legends.map(legendObjs => {
          return (
            <CommonCode key={`${legendObjs.name}`} title={legendObjs.name}>
              <div className={legendObjs.css}></div>
            </CommonCode>
          );
        })}
        <CommonCode title="Actual path">
          <div className="w-[40px] h-[1px] border-b-2 border-[green]" />
        </CommonCode>
        {/* <CommonCode title="Actual path directions">
          <div
            className="h-0 w-0 border-t-[9px] border-l-[14px] border-b-[9px]
  border-solid border-t-transparent border-b-transparent border-l-[orange] absolute"
          />
          <div className="w-[40px] h-[1px] border-b-2 border-black"></div>
        </CommonCode> */}
        <CommonCode title="Collisions">
          <div className="w-[10px] h-[10px] rounded-full bg-black absolute" />
          <div className="w-[40px] h-[1px] border-b-2 border-black"></div>
        </CommonCode>
        {obstacles && (
          <CommonCode title="Obstacle">
            <div className="w-[8px] h-[8px] transform rotate-45 bg-[#800000]"></div>
          </CommonCode>
        )}
      </ul>
    </div>
  );
};

export default CustomLegend;
