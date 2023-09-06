import React, { useState } from "react";
import Button from "components/Button";
import DragAndDrop from "components/DragAndDrop";
import { AiOutlineCloudUpload } from "react-icons/ai";
import request from "utils/api";
import apiRoutes from "utils/api-routes";
import { HTTP_METHODS, HTTP_STATUSES } from "utils/constants";
import { useRouter } from "next/router";
import appRoutes from "utils/app-routes";
import useUserProfile from "hooks/useUserProfile";
import { toast } from "react-toastify";

const downloadFile = async (res, filename) => {
  const blob = await res.blob();
  const href = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = href;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const UploadCsv = props => {
  const router = useRouter();

  const uploadBtn = `Bulk ${props.create ? "Create" : "Update"} Users`;
  const [files, setFiles] = useState([]);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState(null);
  const { organization } = useUserProfile();

  const getSampleCsv = async () => {
    let res = await request(
      `${apiRoutes.accounts.csvTemplate}${
        props.create ? "create/" : "update/"
      }${organization.id}/`,
      {
        isAuthenticated: true
      }
    );
    if (res.status == HTTP_STATUSES.OK) {
      await downloadFile(res, organization.name + " Users.csv");
    }
  };

  const handleFileUpload = async () => {
    toast.dismiss();
    setImporting(true);
    const org = sessionStorage.getItem("organization");
    const formData = new FormData();
    formData.append("file", files[0]);
    formData.append("organization_id", JSON.parse(org).id);
    const response = await request(apiRoutes.accounts.importUsers, {
      body: formData,
      file: true,
      method: props.create ? HTTP_METHODS.POST : HTTP_METHODS.PUT,
      isAuthenticated: true
    });
    let resJson = null;
    if (
      response.status === HTTP_STATUSES.OK ||
      response.status === HTTP_STATUSES.POST_OK
    ) {
      resJson = await response.json();
      toast.success(resJson.message);
      router.push(appRoutes.users.activeUser);
    } else {
      resJson = await response.json();
      toast.error(resJson.error);
      setError(resJson.error);
    }
  };
  return (
    <div className="p-2">
      <div className="flex justify-between items-center pb-0 mb-0">
        <div className="text-slate-600 max-md:text-md md:text-lg lg:text-lx font-bold">
          Upload CSV File
        </div>
        <Button
          btnVariant="outline"
          onClick={getSampleCsv}
          className="px-2 py-2 rounded font-semibold"
        >
          <AiOutlineCloudUpload className="inline " size="25" />
          <span className="font-medium text-sm md:text-lg px-2">
            CSV Template
          </span>
        </Button>
      </div>

      <div className="text-zinc-400 text-md font-medium mt-3">
        Upload the csv file with accounts to bulk create the learners
      </div>
      <div className="bg-[#FFEF95] text-orange-500 rounded p-2 w-fit my-2 text-sm">
        <span className="rounded bg-orange-500 w-[2px] mr-1">i</span>
        Admin and the Trainer accounts must be created manually using Add User
        feature
      </div>
      {/* {error && <div className="text-red"> {error} </div>} */}
      <div className="flex flex-col items-center justify-center w-full">
        <DragAndDrop files={files} setFiles={setFiles} setError={setError} />
      </div>
      <div className=" w-full text-center">
        <Button
          className="bg-primary text-white px-6 py-2 rounded font-semibold text-md"
          disabled={files.length > 0 ? false : true}
          onClick={() => handleFileUpload()}
        >
          {uploadBtn}
        </Button>
      </div>
    </div>
  );
};

export default UploadCsv;
