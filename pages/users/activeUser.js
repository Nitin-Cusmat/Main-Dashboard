import DefaultLayout from "components/DefaultLayout";
import {
  HTTP_METHODS,
  HTTP_STATUSES,
  SIDENAV_ITEM_OBJS
} from "utils/constants";
import DataTable from "components/DataTable";
import Breadcrumbs from "components/BreadCrumbs";
import Button from "components/Button";
import { useState } from "react";
import Modal from "components/Modal";
import apiRoutes from "utils/api-routes";
import request from "utils/api";
import { useRouter } from "next/router";
import Image from "next/image";
import useUserProfile from "hooks/useUserProfile";
import { toast } from "react-toastify";

const ActiveUser = () => {
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [successErrorModal, setSuccessErrorModal] = useState(false);
  const [checkboxStatus, setCheckboxStatus] = useState(false);

  const [selectedIds, setSelectedIds] = useState([]);
  const [rerender, setRerender] = useState(0);
  const [message, setMessage] = useState("");
  const router = useRouter();
  const [modules, setModules] = useState(null);
  const { organization } = useUserProfile();
  const [selectedModuleIds, setSelectedModuleIds] = useState([]);

  const getOrgModules = async () => {
    const res = await request(
      `${apiRoutes.organization.modules}?organization_id=${organization.id}`,
      {
        isAuthenticated: true
      }
    );
    if (res.status == HTTP_STATUSES.OK) {
      const resJson = await res.json();
      setModules(resJson.results);
    } else if (res.status == HTTP_STATUSES.SERVER_ERROR) {
      setMessage("Something went wrong");
    }
  };

  const handleAssignDeassignClick = async () => {
    setShowModuleModal(true);
    if (!modules) {
      getOrgModules();
    }
  };
  const usersActions = (
    <div className="flex gap-x-2 mb-5 w-full">
      <Button
        btnVariant="outline"
        disabled={selectedIds.length > 0 ? false : true}
        onClick={handleAssignDeassignClick}
        className="px-2 py-2 md:px-5 rounded font-medium text-sm md:text-lg "
      >
        <Image
          src="/images/assign.svg"
          width={12}
          height={10}
          alt="assign-deassign"
          className="inline mr-1"
        />
        Assign/Deassign Modules
      </Button>
      <Button
        btnVariant="outline"
        disabled={selectedIds.length > 0 ? false : true}
        onClick={() => setShowDeleteModal(true)}
        className="px-2 py-2 md:px-5 rounded font-medium text-sm md:text-lg "
      >
        <Image
          src="/images/delete.svg"
          width={12}
          height={12}
          alt="delete-users"
          className="inline mr-1"
        />
        Delete Users
      </Button>
    </div>
  );

  const assignDeassignModules = async (assign = true) => {
    const res = await request(apiRoutes.organization.moduleAssignment, {
      method: HTTP_METHODS.POST,
      isAuthenticated: true,
      body: {
        user_ids: selectedIds,
        module_ids: selectedModuleIds,
        assign: assign
      }
    });
    if (res.status == HTTP_STATUSES.POST_OK) {
      setSelectedIds([]);
      setSelectedModuleIds([]);
      toast.success(`Successfully ${assign ? "assigned" : "deassigned"}`);
      // setMessage(` Successfully ${assign ? "assigned" : "deassigned"}`);

      // setSuccessErrorModal(true);
    } else {
      // setSuccessErrorModal(true);
      // setMessage("Something went wrong");
      toast.error("Something went wrong");
    }
    setShowModuleModal(false);
  };

  const handleDeleteUsers = async () => {
    const org = sessionStorage.getItem("organization");
    const res = await request(`${apiRoutes.accounts.deleteUsers}`, {
      body: {
        pk_ids: selectedIds.join(","),
        organization_id: JSON.parse(org).id
      },
      method: HTTP_METHODS.DELETE,
      isAuthenticated: true
    });
    if (res.status == HTTP_STATUSES.NO_RESPONSE) {
      setShowDeleteModal(false);
      setRerender(rerender + 1);
      setSelectedIds([]);
      toast.success("Users successfully deleted");
      // router.reload();
    } else {
      toast.success("Unable to delete users");
      // setMessage("Unable to delete users");
    }
  };

  return (
    <DefaultLayout
      activeItemId={SIDENAV_ITEM_OBJS.ACTIVE_USER.id}
      pageTitle={SIDENAV_ITEM_OBJS.ACTIVE_USER.title}
    >
      <Breadcrumbs
        navList={[
          {
            name: SIDENAV_ITEM_OBJS.USERS.title,
            link: SIDENAV_ITEM_OBJS.USERS.link
          },
          {
            name: SIDENAV_ITEM_OBJS.ACTIVE_USER.title,
            link: SIDENAV_ITEM_OBJS.ACTIVE_USER.link,
            active: true
          }
        ]}
      />
      <DataTable
        userActions={usersActions}
        selectedIds={selectedIds}
        setSelectedIds={setSelectedIds}
        router={router}
        refreshData={rerender}
        checkboxStatus={checkboxStatus}
        setCheckboxStatus={setCheckboxStatus}
        isImmertiveOrg={
          organization && organization.name.toLowerCase() === "immertive"
        }
      />
      <div className="relative">
        <Modal
          show={successErrorModal}
          title=""
          onHide={() => setSuccessErrorModal(false)}
        >
          <div className="p-4 text-black">{message}</div>
        </Modal>
        <Modal
          show={showModuleModal}
          title="Assign / Deassign Modules"
          onHide={() => setShowModuleModal(false)}
        >
          <div>
            <p className=" text-dark pb-4 font-medium">
              {selectedIds.length} Learners are selected
            </p>
            <div>
              {modules && modules.length > 1 && (
                <div className="pb-2">
                  <input
                    type="checkbox"
                    id="selectAll"
                    value="Select All"
                    onChange={e => {
                      if (e.target.checked) {
                        const moduleIds = modules.map(m => m.id);
                        setSelectedModuleIds(moduleIds);
                      } else {
                        setSelectedModuleIds([]);
                      }
                    }}
                    checked={
                      selectedModuleIds.length === modules.length &&
                      modules.length > 0
                    }
                  />
                  <label
                    className="text-sm md:text-md p-2 text-dark font-medium"
                    htmlFor="selectAll"
                  >
                    Select All
                  </label>
                </div>
              )}
              <hr className="pb-2" />

              <div className="overflow-scroll">
                {modules &&
                  modules.map(module => {
                    return (
                      <div key={module.id}>
                        <input
                          type="checkbox"
                          id={module.id}
                          value={module.module.name}
                          checked={selectedModuleIds.includes(module.id)}
                          onChange={e => {
                            if (
                              e.target.checked &&
                              !selectedModuleIds.includes(module.id)
                            ) {
                              setSelectedModuleIds([
                                ...selectedModuleIds,
                                module.id
                              ]);
                            } else {
                              const tempSelectedModuleIds =
                                selectedModuleIds.filter(id => id != module.id);
                              setSelectedModuleIds(tempSelectedModuleIds);
                            }
                          }}
                        />
                        <label
                          htmlFor={module.id}
                          className="text-sm md:text-md p-2 text-dark font-medium"
                        >
                          {module.module.name}
                        </label>
                      </div>
                    );
                  })}
              </div>

              <div className="flex gap-x-5 justify-center py-5">
                <Button
                  onClick={() => {
                    setCheckboxStatus(false);
                    assignDeassignModules(true);
                  }}
                  disabled={selectedModuleIds.length > 0 ? false : true}
                >
                  Assign
                </Button>
                <Button
                  onClick={() => {
                    setCheckboxStatus(false);
                    assignDeassignModules(false);
                  }}
                  disabled={selectedModuleIds.length > 0 ? false : true}
                >
                  Deassign
                </Button>
              </div>
            </div>
          </div>
        </Modal>
        <Modal
          show={showDeleteModal}
          title="Delete Users"
          onHide={() => setShowDeleteModal(false)}
        >
          <div className="">
            <p className="text-black">{selectedIds.length} are selected</p>
            <div className="p-5">
              <div className="text-center text-black">
                Are you sure you want to Delete
              </div>
              <div className="flex gap-x-5 justify-center pt-5">
                <Button
                  onClick={() => {
                    setCheckboxStatus(false);
                    handleDeleteUsers();
                  }}
                >
                  Yes
                </Button>
                <Button
                  onClick={() => {
                    setCheckboxStatus(false);
                    setShowDeleteModal(false);
                  }}
                >
                  No
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      </div>
    </DefaultLayout>
  );
};

export default ActiveUser;
