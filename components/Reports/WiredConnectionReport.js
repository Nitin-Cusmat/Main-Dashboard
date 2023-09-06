import ComparativeTable from "components/ComparitiveTable";
import CustomTable from "components/CustomTable";
import React from "react";

const WiredConnectionReport = ({
  wiredConnections,
  wrongConnections,
  wiredConnections2,
  wrongConnections2,
  compare
}) => {
  const allWireConnections =
    compare && wiredConnections2
      ? [wiredConnections, wiredConnections2]
      : [wiredConnections];
  return (
    <div className="">
      <div className="font-bold text-dark py-5">Wire Connection</div>
      {allWireConnections.map((wiredConnectionsList, index) => {
        return (
          <div key={`wiredConnection_${index}`}>
            {compare && <div className="text-dark py-4">user {index}</div>}
            <CustomTable
              rows={wiredConnectionsList.map(item => {
                return {
                  Item: item.wire,
                  Connection: item.connection ? "Connected" : "Not connected",
                  "Wire Colour": item.color,
                  "Connected to Item": item.connectedTo
                };
              })}
              columns={[
                "Item",
                "Connection",
                "Wire Colour",
                "Connected to Item"
              ]}
            />
          </div>
        );
      })}

      {wrongConnections.length > 0 && (
        <div>
          <div className="font-bold text-dark py-5">Wrong Connections</div>
          <ComparativeTable
            columns={["Wrong Connection"]}
            rows={wrongConnections.map((item, index) => {
              return { "Wrong Connection": item };
            })}
            addIndex
            rows2={
              compare && wrongConnections2
                ? wrongConnections2.map((item, index) => {
                    return { "Wrong Connection": item };
                  })
                : null
            }
            staticColumns={[]}
            compare={compare}
          />
        </div>
      )}
    </div>
  );
};

export default WiredConnectionReport;
