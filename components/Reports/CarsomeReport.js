import ComparativeTable from "components/ComparitiveTable";
import CustomTable from "components/CustomTable";
import React from "react";

const CarsomeReport = ({ attemptData, attemptData2, compare, module }) => {
  const specialModule = ["Reach Truck", "Forklift"];
  const isSpecialModule = specialModule.includes(module);
  const specialModuleColumns = [
    "Score KPI",
    "Defined Score By DHL",
    "Score Earned By User"
  ];
  const getParsedInspection = inspections => {
    const parsedInspections = inspections.map(inspection => {
      const userFlows = Object.keys(inspection.UserFlow);
      const parsedInspection = inspection.actualFlow.map((step, index) => {
        const parsedSteps = {};
        userFlows.map((userFlowKey, flowIndex) => {
          const userFlow = inspection.UserFlow[userFlowKey];
          if (isSpecialModule) {
            parsedSteps[specialModuleColumns[flowIndex + 1]] = userFlow[index];
          } else {
            parsedSteps[`User Flow Assembly ${flowIndex + 1}`] = isSpecialModule
              ? `${userFlow[index]}`
              : `${index}: ${userFlow[index]}`;
          }
        });
        return isSpecialModule
          ? {
              "Score KPI": `${index}: ${step}`,
              ...parsedSteps
            }
          : {
              "Ideal Flow Assembly Inspection": `${index}: ${step}`,
              ...parsedSteps
            };
      });
      return { name: inspection.name, rows: parsedInspection };
    });
    return parsedInspections;
  };

  const transformedData = attemptData2 => {
    if (
      attemptData2 &&
      attemptData2.inspections &&
      attemptData2.inspections.length > 0 &&
      attemptData2.inspections[0].UserFlow &&
      attemptData2.inspections[0].UserFlow.user_score
    ) {
      const user_score = attemptData2.inspections[0].UserFlow.user_score;

      const transformedData = user_score.map(score => {
        return { "Score Earned By User": score };
      });
      return transformedData;
    } else {
      return null;
    }
  };

  return (
    <div className="border">
      <div className="w-full">
        {/* inspection data visual */}
        {attemptData.inspections &&
          getParsedInspection(attemptData.inspections).map(
            (inspection, index) => {
              return (
                <div key={`inspection_${index}`} className="p-4">
                  <div className="text-dark py-2 underline">
                    {inspection.name}
                  </div>

                  {
                    <ComparativeTable
                      columns={
                        isSpecialModule
                          ? specialModuleColumns
                          : [
                              "Ideal Flow Assembly Inspection",
                              ...Object.keys(
                                attemptData.inspections[0].UserFlow
                              ).map(
                                (_, index) => `User Flow Assembly ${index + 1}`
                              )
                            ]
                      }
                      rows={inspection.rows}
                      rows2={
                        compare && isSpecialModule
                          ? transformedData(attemptData2)
                          : compare && attemptData2?.inspections
                          ? getParsedInspection(attemptData2.inspections)[index]
                              .rows
                          : null
                      }
                      staticColumns={["Ideal Flow Assembly Inspection"]}
                      compare={compare}
                      columnsWidth={Array(
                        Object.keys(attemptData.inspections[0].UserFlow).length
                      ).fill("160px")}
                      isSpecialModule={isSpecialModule}
                    />
                  }
                </div>
              );
            }
          )}
        <div className="flex flex-wrap p-4 gap-4 w-full">
          {attemptData.interactionError &&
            attemptData.interactionError.length > 0 && (
              <div className="w-full">
                <div className="text-dark pt-2 ">Interaction Errors</div>
                <ComparativeTable
                  rows={attemptData.interactionError}
                  rows2={
                    compare && attemptData2
                      ? attemptData2.interactionError
                      : null
                  }
                  staticColumns={["task"]}
                  columns={["task", "error"]}
                  compare={compare}
                />
              </div>
            )}
          {attemptData.wrongCases && attemptData.wrongCases.length > 0 && (
            <div className="w-full">
              <div className="text-dark pt-2">Cases</div>
              <ComparativeTable
                rows={
                  attemptData.wrongCases && attemptData.wrongCases.length
                    ? attemptData.wrongCases.map((item, index) => {
                        return { Index: index, "Wrong Cases": item };
                      })
                    : []
                }
                rows2={
                  compare && attemptData2
                    ? attemptData2?.wrongCases.map((item, index) => {
                        return { Index: index, "Wrong Cases": item };
                      })
                    : null
                }
                staticColumns={["Index"]}
                columns={["Index", "Wrong Cases"]}
                compare={compare}
              />
            </div>
          )}
          {attemptData.skippedCases && attemptData.skippedCases.length > 0 && (
            <div className="pt-5 w-full">
              <CustomTable
                rows={
                  attemptData.skippedCases
                    ? attemptData.skippedCases.map((item, index) => {
                        return { Index: index, "Skipped Cases": item };
                      })
                    : []
                }
                columns={["Index", "Skipped Cases"]}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CarsomeReport;
