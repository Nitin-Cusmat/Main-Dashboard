import DefaultLayout from "components/DefaultLayout";
import {
  HTTP_METHODS,
  HTTP_STATUSES,
  SIDENAV_ITEM_OBJS
} from "utils/constants";
import Dropdown from "components/Dropdown";
import { useEffect, useState, useRef } from "react";
import CustomTable from "components/CustomTable";
import { HiOutlineDownload } from "react-icons/hi";
import DateRangeSelector from "components/DateRangeSelector";
import { useRecoilValue } from "recoil";
import deviceState from "states/deviceState";
import {
  formatDayDisplay,
  secondsToDuration,
  getTimeFromDate
} from "utils/utils";
import request from "utils/api";
import apiRoutes from "utils/api-routes";
import { RiArrowDropDownLine } from "react-icons/ri";
import { SlCalender } from "react-icons/sl";
import useUserProfile from "hooks/useUserProfile";
import { useRouter } from "next/router";
import { trackPromise } from "react-promise-tracker";
import ReactLoading from "react-loading";
import Modal from "components/Modal";

let html2pdf;
if (typeof window !== "undefined") {
  html2pdf = require("html2pdf.js");
}

const Individual = () => {
  const componentRef = useRef();
  const moduleRef = useRef();
  const calenderRef = useRef();
  const { organization } = useUserProfile();

  const [show, setShow] = useState(false);
  const { screenWidth } = useRecoilValue(deviceState);
  const [reportData, setReportData] = useState(null);
  const [modules, setModules] = useState([]); //modules assigned to the user
  const [showFilter, setShowFilter] = useState(false);
  const [boxData, setBoxData] = useState(null);
  const [mistakes, setMistakes] = useState([]);
  const [error, setError] = useState("");
  const router = useRouter();
  const { userId } = router.query;
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pdfloading, setPdfloading] = useState(false);
  const [showUsersModal, setShowUsersModal] = useState(false);
  const [message, setMessage] = useState("");
  const [description, setDescription] = useState(null);

  const today = new Date(); // current date and time
  const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const initialDate = {
    startDate: lastWeek,
    endDate: today,
    key: "selection"
  };

  //NOTE: Here the module ids are module activity ids
  const [selectedModulesIds, setSelectedModulesIds] = useState([]);
  const [selectedDateRange, setSelectedDateRange] = useState(initialDate);

  const periods = {
    monthly: "Monthly",
    weekly: "Weekly",
    attemptWise: "Attempt Wise"
  };
  let count = 0;

  const dropdownDataPeriod = Object.keys(periods).map(key => {
    count = count + 1;
    return { id: count, name: periods[key] };
  });
  const [selectedPeriod, setSelectedPeriod] = useState(periods["attemptWise"]);

  useEffect(() => {
    if (user) {
      if (user["modules"] && user["modules"].length > 0) {
        const tempModules = user["modules"].map(m => {
          return { id: m.id, name: m["module_name"] };
        });
        tempModules.unshift({ id: 0, name: "All" });
        setModules(tempModules);
      }
    }
  }, [user]);

  // update the selected modules default all on loading modules
  useEffect(() => {
    if (modules) {
      let tempSelectedModulesIds = modules.map(m => m.id);
      setSelectedModulesIds(tempSelectedModulesIds);
    }
  }, [modules]);

  const getCorrectDateAfterISOString = unformattedDate => {
    const startDate = new Date(unformattedDate);
    const localStartDate = new Date(
      startDate.getTime() - startDate.getTimezoneOffset() * 60000
    );
    const date = localStartDate.toISOString().split("T")[0];
    return date;
  };

  const getReportData = async () => {
    const requestBody = {
      category_filter: selectedPeriod.replace(" ", "_").toLowerCase(),
      start_date: getCorrectDateAfterISOString(selectedDateRange.startDate),
      end_date: getCorrectDateAfterISOString(selectedDateRange.endDate),
      module_names: selectedModulesIds
        .map(id => modules.find(module => module.id == id)?.name)
        .filter(name => name != "All"),
      user_id: userId,
      organization_id: organization.id
    };
    trackPromise(
      request(`${apiRoutes.organization.individualReport}`, {
        method: HTTP_METHODS.POST,
        body: requestBody,
        isAuthenticated: true
      }).then(async res => {
        const boxesResponse = await request(
          `${apiRoutes.organization.attemptWiseReport}`,
          {
            method: HTTP_METHODS.POST,
            body: {
              filter_type: selectedDateRange.label
                ? selectedDateRange.label
                : "custom_range",
              start_date: getCorrectDateAfterISOString(
                selectedDateRange.startDate
              ),
              end_date: getCorrectDateAfterISOString(selectedDateRange.endDate),
              module_names: selectedModulesIds
                .map(id => modules.find(module => module.id == id)?.name)
                .filter(name => name != "All"),
              user_id: userId,
              organization_id: organization.id
            },
            isAuthenticated: true
          }
        );
        if (boxesResponse.status == HTTP_STATUSES.OK) {
          const resJson = await boxesResponse.json();
          const briefDataList = [
            {
              title: "Success Rate",
              value: resJson.success_rate + "%",
              extraInfo: (
                <span className="text-sm">{`Attempts passed: ${resJson.completed_levels}`}</span>
              )
            },
            selectedPeriod === "Attempt Wise" && {
              title: "Assigned Modules",
              value: resJson.assigned_modules
            },
            {
              title: "Total Attempts",
              value: resJson.total_attempts
            },
            {
              title: "Total time Spent",
              value: resJson.total_time_spent?.toString().slice(0, 8)
            },
            {
              title: "Mistakes",
              value: resJson.mistakes_count
            }
          ].filter(Boolean);
          setBoxData(briefDataList);
          setMistakes(resJson.mistakes_content);
        }
        if (res.status == HTTP_STATUSES.OK) {
          const resJson = await res.json();
          let resData = [];
          if (selectedPeriod !== periods.attemptWise) {
            resJson.map(item => {
              resData.push({
                "Start date": item.start_date,
                "End date": item.end_date,
                Module: item.module,
                Level: item.level,
                "Total Attempts": item.total_attempts,
                "Time Spent": secondsToDuration(item.time_spent),
                "Success Rate": item.success_rate
              });
            });
          } else {
            resJson.forEach(item => {
              resData.push({
                Date: item.date,
                Module: item.module,
                Level: item.level,
                "Time Spent": secondsToDuration(item.time_spent),
                Completed: item.completed.toString(),
                "Start Time": getTimeFromDate(item.start_time),
                "End Time": getTimeFromDate(item.end_time),
                "Attempt Number": item.attempt_number
              });
            });
          }
          setReportData(resData);
        } else {
          setError("No Data");
        }
        setLoading(false);
      })
    );
  };

  useEffect(() => {
    if (organization && selectedModulesIds.length > 0) {
      setReportData(null);
      setMistakes(null);
      setLoading(true);
      getReportData();
    }
  }, [selectedModulesIds, selectedDateRange, selectedPeriod, organization]);

  const getUserDetails = async () => {
    const response = await request(apiRoutes.accounts.userDetails, {
      method: HTTP_METHODS.POST,
      isAuthenticated: true,
      body: {
        organization_id: organization.id,
        user_id: userId
      }
    });
    let jsonResponse = {};
    if (response.status === HTTP_STATUSES.OK) {
      jsonResponse = await response.json();
      setUser(jsonResponse);
    }
  };
  useEffect(() => {
    if (organization) getUserDetails();
  }, [organization]);

  const mistakeData =
    mistakes &&
    mistakes.length > 0 &&
    mistakes.map(mistake => {
      return {
        Mistake: mistake.name,
        Modules: mistake.module_names,
        Count: mistake.count
      };
    });

  const fileName = user
    ? `${
        user.user_details?.first_name + " " + user.user_details?.last_name
      } - ${selectedPeriod} Report`
    : "";

  useEffect(() => {
    const handleOutsideClick = event => {
      if (moduleRef.current && !moduleRef.current.contains(event.target)) {
        setShowFilter(false);
      }
      if (calenderRef.current && !calenderRef.current.contains(event.target)) {
        setShow(false);
      }
    };

    document.addEventListener("click", handleOutsideClick);

    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, []);

  const downloadPdf = () => {
    setPdfloading(true);
    const content = componentRef.current;
    const pdfOptions = {
      margin: 10,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "mm", format: "a1", orientation: "portrait" }
    };
    const filename = user
      ? user.user_details?.first_name +
        " " +
        user.user_details?.last_name +
        "-report.pdf"
      : "report" + ".pdf";

    html2pdf()
      .from(content)
      .set(pdfOptions)
      .outputPdf("save", filename)
      .then(() => {
        setPdfloading(false);
        setShowUsersModal(true);
        setMessage("PDF downloaded successfully");
        const moduleNames = selectedModulesIds
          .map(id => modules.find(module => module.id == id)?.name)
          .filter(name => name != "All");
        const name =
          user.user_details?.first_name + " " + user.user_details?.last_name;
        setDescription(
          `The file contains ${selectedPeriod} report of "${name}" for the module "${moduleNames.join(
            ", "
          )}".`
        );
      })
      .catch(err => {
        setPdfloading(false);
        setShowUsersModal(true);
        setMessage(
          "An error occurred during PDF generation. Please try again."
        );
        setDescription(`${err}`);
      });
  };

  return (
    <DefaultLayout
      activeItemId={SIDENAV_ITEM_OBJS.REPORTS.id}
      pageTitle={SIDENAV_ITEM_OBJS.REPORTS.title}
    >
      <div className="p-2 lg:p-4 w-full text-dark" ref={componentRef}>
        <div className="flex justify-between w-full flex-col md:flex-row lg:items-center">
          <div className="text-primary capitalize text-md font-semibold min-w-max">
            {user ? fileName : ""}
          </div>
          <div className="flex gap-2 xl:gap-6  justify-end flex-col lg:flex-row items-center mb-2">
            {/* Date range selection */}
            <div
              id="date-range-selection"
              className="relative"
              ref={calenderRef}
            >
              <button
                onClick={() => {
                  setShow(!show);
                }}
                className="flex justify-between p-3 pb-2 text-center border text-md bg-[#F4F3F8] rounded"
              >
                <SlCalender size={20} className="inline mr-2" />
                {formatDayDisplay(selectedDateRange.startDate)} -{" "}
                {formatDayDisplay(selectedDateRange.endDate)}
              </button>

              {show && (
                <div className="absolute  right-0 w-full md:w-auto lg:-left-[100%] lg:-right-10 top-12 z-[999]">
                  <DateRangeSelector
                    setShow={setShow}
                    show={show}
                    initialDate={initialDate}
                    setSelectedDateRange={setSelectedDateRange}
                    screenWidth={screenWidth}
                  />
                </div>
              )}
            </div>

            {/* dropdown to select attempt */}
            <div className="dropdown relative block ">
              <Dropdown
                btnCss="p-2 text-center border text-md bg-[#F4F3F8] rounded"
                dropdownCss="min-w-[200px] absolute "
                handleClick={type => setSelectedPeriod(type)}
                selectedValue={selectedPeriod}
                isSelection
                menuItems={dropdownDataPeriod}
              />
            </div>
            {/* dropdown to select module */}
            <div className="my-auto w-[200px]" ref={moduleRef}>
              <button
                className="flex justify-between p-2 text-center border text-md bg-[#F4F3F8] rounded w-full"
                onClick={() => setShowFilter(!showFilter)}
              >
                <span className="pr-2 ">Modules</span>
                <RiArrowDropDownLine size="25" />
              </button>
              {showFilter && (
                <div className="absolute bg-white shadow w-[200px] max-h-[200px] overflow-scroll">
                  {modules.map(module => (
                    <div
                      key={module.id}
                      className="flex justify-between border-b p-1 pr-3"
                    >
                      <span className="p-1 text-dark">{module.name}</span>
                      <input
                        type="checkbox"
                        className="bg-white "
                        checked={
                          module.name === "All"
                            ? selectedModulesIds.length === modules.length
                            : selectedModulesIds.includes(module.id)
                        }
                        onChange={e => {
                          let selected = [...selectedModulesIds];
                          if (e.target.checked) {
                            if (module.name == "All") {
                              selected = modules.map(m => m.id);
                            } else {
                              selected = [...selected, module.id];
                            }
                          } else {
                            if (module.name == "All") {
                              selected = [];
                            } else {
                              selected = selected.filter(
                                item => item !== module.id
                              );
                            }
                          }
                          setSelectedModulesIds(selected);
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button onClick={downloadPdf}>
              <HiOutlineDownload size={20} color="black" />
            </button>
            <Modal
              show={showUsersModal}
              title={message}
              onHide={() => setShowUsersModal(false)}
            >
              {description && (
                <div className="p-4 text-black">{description}</div>
              )}
            </Modal>
          </div>
        </div>
        {!loading ? (
          <>
            <div className="flex flex-col md:flex-row  w-full md:w-[90%] lg:w-[70%] py-2">
              {boxData &&
                boxData.map((element, index) => {
                  return (
                    <div key={index} className="w-full p-4 border-r">
                      <div className="text-sm text-[#A1A3A8] lg:h-[36px]">
                        {element && element.title}
                      </div>
                      <div className="text-primary font-md font-semibold pt-4">
                        {element && element.value}
                      </div>
                      <div className="underline">
                        {element && element.extraInfo}
                      </div>
                    </div>
                  );
                })}
            </div>
            <hr />
            {/* Mistakes */}
            <div className="mt-8 underline">Mistakes-</div>
            <CustomTable
              columns={["Mistake", "Modules", "Count"]}
              columnsWidth={["60%", "30%", "10%"]}
              rows={mistakeData}
              // size="max-h-[200px]"
              valueCss="text-left !p-3"
            />
            {/* Report table */}
            <div className="py-4">
              <div className="underline">Report-</div>
              <CustomTable
                columns={
                  selectedPeriod == periods.attemptWise
                    ? [
                        "Date",
                        "Module",
                        "Level",
                        "Time Spent",
                        "Completed",
                        "Start Time",
                        "End Time",
                        "Attempt Number"
                      ]
                    : [
                        "Start date",
                        "End date",
                        "Module",
                        "Level",
                        "Time Spent",
                        "Total Attempts",
                        "Success Rate"
                      ]
                }
                rows={reportData}
              />
            </div>
          </>
        ) : (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2">
            <ReactLoading
              type={"spin"}
              color={"var(--primary-color)"}
              height={20}
              width={20}
            />
          </div>
        )}
      </div>
    </DefaultLayout>
  );
};

export default Individual;
