import Breadcrumbs from "components/BreadCrumbs";
import DefaultLayout from "components/DefaultLayout";
import IndividualReport from "components/Reports/IndividualReport";
import appRoutes from "utils/app-routes";
import { HTTP_STATUSES, SIDENAV_ITEM_OBJS } from "utils/constants";
import Dropdown from "components/Dropdown";
import { useEffect, useState, useRef } from "react";
import apiRoutes from "utils/api-routes";
import request from "utils/api";
import { useRouter } from "next/router";
import { reverse } from "named-urls";
import useUserProfile from "hooks/useUserProfile";
import { HiOutlineDownload } from "react-icons/hi";
import ReactLoading from "react-loading";
import Modal from "components/Modal";

let html2pdf;
if (typeof window !== "undefined") {
  html2pdf = require("html2pdf.js");
}

const IndividualPerformance = ({ userIdfromProp }) => {
  const [userId, setUserId] = useState(userIdfromProp);
  const [module, setModule] = useState("Module");
  const [level, setLevel] = useState("Select Level");
  const [attempt, setAttempt] = useState("Attempt");
  const { organization } = useUserProfile();

  const [attempts, setAttempts] = useState([]);
  const [levels, setLevels] = useState([]);
  const [modules, setModules] = useState([]);
  const [moduleLevels, setModuleLevels] = useState([]);
  const [fetchAttemptData, setFetchAttemptData] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const componentRef = useRef(null);
  const [pdfloading, setPdfloading] = useState(false);
  const [showUsersModal, setShowUsersModal] = useState(false);
  const [message, setMessage] = useState("");
  const [description, setDescription] = useState(null);
  const [pdfState, setPdfState] = useState(null);
  const [attemptData, setAttemptData] = useState(null);

  const findMaxIdObject = dataArray => {
    return dataArray.reduce((maxObj, currentObj) => {
      if (currentObj.id > maxObj.id) {
        return currentObj;
      }
      return maxObj;
    });
  };

  const getAttempts = async () => {
    let level_activity = levels.find(l => l.name == level);
    if (!level_activity) {
      level_activity = {};
    }
    const res = await request(
      `${apiRoutes.organization.attempts}?level_activity_id=${level_activity?.id}`,
      { isAuthenticated: true }
    );
    if (res.status == HTTP_STATUSES.OK) {
      const resjson = await res.json();
      if (resjson.results.length > 0) {
        let tempAttempts = resjson.results.map((a, index) => {
          return { id: index, name: a.attempt_number };
        });
        setAttempts(tempAttempts);
        const tempAttempt = findMaxIdObject(tempAttempts).name;
        setAttempt(tempAttempt);
      }
      setFetchAttemptData(true);
    }
  };

  const getModulesLevels = async () => {
    const res = await request(
      `${apiRoutes.organization.userModules}?user_id=${userId}&organization_id=${organization.id}`,
      { isAuthenticated: true }
    );
    if (res.status == HTTP_STATUSES.OK) {
      const resjson = await res.json();
      setModuleLevels(resjson);
      let tempModuls = resjson.map(mod => mod.module);
      setModules(tempModuls);
    }
  };

  useEffect(() => {
    const { userId } = router.query;
    setUserId(userId);
    setUsers([]);
  }, [router.query]);

  useEffect(() => {
    if (organization) getModulesLevels();
  }, [organization, userId]);

  useEffect(() => {
    if (modules.length > 0) {
      setLoading(true);
      if (router.query.module) {
        setModule(router.query.module);
      } else {
        setModule(modules[0].name);
        setLevels(moduleLevels[0].level_activities);
      }
    } else {
      setModule("Module");
      setLevels([]);
      setLoading(false);
    }
  }, [modules]);

  useEffect(() => {
    if (!["Module", ""].includes(module)) {
      setLoading(true);
      let levelActivities = moduleLevels.find(m => m.module.name == module);
      if (levelActivities) {
        setLevels(levelActivities["level_activities"]);
      } else {
        setLevels([]);
      }
    }
  }, [module]);

  useEffect(() => {
    if (levels && levels.length > 0) {
      setLevel(levels[0].name);
    } else {
      setLevel("Select Level");
    }
  }, [levels]);

  useEffect(() => {
    if (!["Select Level", ""].includes(level)) {
      setLoading(true);
      getAttempts();
    } else setAttempt("Attempt");
  }, [level]);

  useEffect(() => {
    if (attemptData != null) {
      const content = componentRef.current;
      const pdfOptions = {
        margin: 10,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "mm", format: "a1", orientation: "portrait" },
        pagebreak: { mode: ["avoid-all", "css", "legacy"] }
      };
      const createPdf = html2pdf().from(content).set(pdfOptions);
      setPdfState(createPdf);
    }
  }, [attemptData]);

  const dropdowncss =
    "dropdown mx-auto sm:mr-0 sm:ml-0 relative text-black min-w-[250px]";

  const downloadPdf = () => {
    setPdfloading(true);
    const fileName = users[0]
      ? `${users[0]}-performance`
      : "performance" + ".pdf";
    pdfState
      .outputPdf("save", fileName)
      .then(() => {
        setPdfloading(false);
        setShowUsersModal(true);
        setMessage("PDF downloaded successfully");
        setDescription(
          `The file contains performance of "${users[0]}" for the module "${module}".`
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
      <div className="inline sm:flex justify-between w-full pr-4">
        <Breadcrumbs
          navList={[
            {
              name: SIDENAV_ITEM_OBJS.REPORTS.title,
              link: appRoutes.reports.self,
              active: false
            },

            {
              name: users.length > 0 ? users[0] : userId,
              link: appRoutes.reports.self,
              active: false
            },
            {
              name: "Individual",
              link: appRoutes.reports.self,
              active: true
            }
          ]}
        />
        <div className="flex flex-col items-center xl:flex-row gap-2 my-2">
          <div className={dropdowncss}>
            <Dropdown
              btnCss="p-2 text-center border text-md bg-[#F4F3F8] rounded "
              dropdownCss="min-w-[200px]"
              handleClick={type => {
                router.replace({
                  pathname: reverse(appRoutes.reports.individual.performance, {
                    userId: userId
                  }),
                  query: { module: type }
                });
                setModule(type);
              }}
              selectedValue={module}
              isSelection
              menuItems={modules}
            />
          </div>
          <div className={dropdowncss}>
            <Dropdown
              btnCss="p-2 text-center border text-md bg-[#F4F3F8] rounded "
              dropdownCss="min-w-[200px]"
              handleClick={type => setLevel(type)}
              selectedValue={level}
              isSelection
              menuItems={levels}
            />
          </div>
          <div className={dropdowncss}>
            <Dropdown
              btnCss="p-2 text-center border text-md bg-[#F4F3F8] rounded "
              dropdownCss="min-w-[200px]"
              handleClick={type => {
                setFetchAttemptData(true);
                setAttempt(type);
              }}
              selectedValue={attempt}
              isSelection
              menuItems={attempts}
            />
          </div>
          <button onClick={downloadPdf}>
            {pdfloading ? (
              <ReactLoading
                type={"spin"}
                color={"var(--primary-color)"}
                height={20}
                width={20}
              />
            ) : (
              <HiOutlineDownload size={20} color="black" />
            )}
          </button>
          <Modal
            show={showUsersModal}
            title={message}
            onHide={() => setShowUsersModal(false)}
          >
            <div className="p-4 text-black">{description}</div>
          </Modal>
        </div>
      </div>

      <div
        ref={componentRef}
        className="w-full"
        style={{ backgroundColor: "white" }}
      >
        {module === "Module" &&
        level === "Select Level" &&
        attempt === "Attempt" &&
        loading ? (
          <div className="flex justify-center items-center h-[500px]">
            No reports to show
          </div>
        ) : (
          <IndividualReport
            fetchAttemptData={fetchAttemptData}
            setFetchAttemptData={setFetchAttemptData}
            module={module}
            level={level}
            attempt={attempt}
            userId={userId}
            users={users}
            setUsers={setUsers}
            loading={loading}
            setLoading={setLoading}
            getAttemptDataCallback={attemptData => {
              setAttemptData(attemptData);
            }}
          />
        )}
      </div>
    </DefaultLayout>
  );
};

export const getServerSideProps = async ctx => {
  const { userId } = ctx.query;

  return {
    props: {
      userIdfromProp: userId
    }
  };
};

export default IndividualPerformance;
