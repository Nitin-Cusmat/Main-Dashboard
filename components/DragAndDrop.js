import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { BsFileEarmarkText } from "react-icons/bs";
import Button from "./Button";
import Image from "next/image";

const DragAndDrop = ({ files, setFiles, setError }) => {
  const onDrop = useCallback(
    acceptedFiles => {
      setError([]);
      setFiles([acceptedFiles[0]]);
    },
    [setFiles]
  );
  const { getRootProps, getInputProps, inputRef } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"]
    }
  });
  return (
    <div
      {...getRootProps({ className: "dropzone" })}
      className="border-2 border-dashed border-zinc-30 rounded p-2 h-[250px] my-8 mx-2 w-full flex justify-center items-center cursor-pointer"
    >
      <input
        className="input-zone"
        {...getInputProps()}
        onChange={() => setError([])}
      />
      <div className="">
        <Image
          className="mx-auto"
          src="/images/upload.svg"
          width={60}
          height={50}
          alt="upload"
        />

        {files.length > 0 ? (
          <div className="border-y-1px py-2 flex items-center justify-between gap-x-4 ">
            <div className="flex justify-between">
              <BsFileEarmarkText className="text-2xl" />
              <div className="text-black">{files[0].name}</div>
            </div>
            <Button
              btnVariant="outline"
              // onClick={() => inputRef.current.click()}
            >
              Replace
            </Button>
          </div>
        ) : (
          <div className="dropzone-content text-center text-slate-700 pt-6">
            Drop files here and click upload
          </div>
        )}
      </div>
    </div>
  );
};

export default DragAndDrop;
