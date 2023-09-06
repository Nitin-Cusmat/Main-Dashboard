import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import request from "utils/api";
import apiRoutes from "utils/api-routes";
import { HTTP_METHODS, HTTP_STATUSES } from "utils/constants";
import { FORM_VALIDATION } from "utils/formValidation";
import Button from "./Button";
import { BiUserPlus } from "react-icons/bi";
import Label from "./Label";
import { useRouter } from "next/router";
import appRoutes from "utils/app-routes";
import { toast } from "react-toastify";
import useUserProfile from "hooks/useUserProfile";

const AddUserForm = ({ userDetails }) => {
  const inputClass =
    "max-md:w-full md:w-[90%] !bg-white h-[40px] mt-2 text-dark border border-[#B3B3B3] focus:border-primary rounded-l  pl-4";
  const {
    handleSubmit,
    register,
    reset,
    watch,
    setValue,
    formState: { errors }
  } = useForm({ defaultValues: userDetails ? userDetails : {} });

  const [error, setError] = useState(null);
  const [alert, setAlert] = useState(null);
  const [updatedFields, setUpdatedFields] = useState({});
  const [buttonContent, setButtonContent] = useState("");
  const router = useRouter();
  const { organization } = useUserProfile();
  const id = router.query.id;
  const isImmertive =
    organization && organization.name.toLowerCase() === "immertive";
  const immertiveExtraFields = [
    {
      label: "Date of Birth",
      type: "date",
      editable: false
    },
    {
      label: "Gender",
      type: "select",
      editable: false
    },
    {
      label: "Course",
      type: "text",
      editable: true
    },
    {
      label: "Batch",
      type: "text",
      editable: true
    },
    {
      label: "Roll No.",
      type: "text",
      editable: true
    },
    {
      label: "Institute",
      type: "text",
      editable: true
    },
    {
      label: "City",
      type: "text",
      editable: true
    },
    {
      label: "State",
      type: "text",
      editable: true
    },
    {
      label: "VR Lab",
      type: "text",
      editable: true
    }
  ];

  const regexString = /^[0-9]+$/;
  const pattern = new RegExp(regexString);
  const handleKeyPress = event => {
    if (
      !/[0-9]/.test(event.key) &&
      event.key !== "Backspace" && // Allow backspace
      event.key !== "Delete" && // Allow delete
      event.key !== "ArrowLeft" && // Allow arrow left
      event.key !== "ArrowRight" // Allow arrow right
    ) {
      event.preventDefault();
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [alert || error]);

  const field = watch();
  useEffect(() => {
    if (Object.values(field).every(val => val == "")) {
      setAlert("");
    }
  }, [field]);

  const errorFun = fieldName => {
    return (
      <p
        className={`text-xs md:text-md text-red pt-[5px]  ${
          errors[fieldName] ? "visible" : "invisible"
        }`}
      >
        {errors && errors[fieldName] ? errors[fieldName].message : ""}
      </p>
    );
  };

  const handleInputChange = event => {
    const { name, value } = event.target;
    setUpdatedFields(prevState => ({ ...prevState, [name]: value }));
  };

  const onSubmit = async data => {
    setError(null);
    if (buttonContent == "createUser") {
      const org = sessionStorage.getItem("organization");
      if (isImmertive) {
        data.password = data.pin;
        delete data.pin;
      }
      const response = await request(apiRoutes.accounts.createUser, {
        method: HTTP_METHODS.POST,
        body: {
          first_name: data.first_name,
          last_name: data.last_name,
          designation: data.designation,
          department: data.department,
          work_location: data.work_location,
          user_id: data.user_id,
          password: data.password,
          organization_id: JSON.parse(org).id,
          date_of_birth: data.date_of_birth || null,
          gender: data.gender || null,
          course: data.course || null,
          batch: data.batch || null,
          roll_no: data.roll_no || null,
          institute: data.institute || null,
          city: data.city || null,
          state: data.state || null,
          vr_lab: data.vr_lab || null
        },
        isAuthenticated: true
      });
      if (response.status === HTTP_STATUSES.OK) {
        // setAlert("User created successfully");
        toast.success("Users created successfully");
        reset();
        router.push(appRoutes.users.activeUser);
      } else {
        // setError("User with same employee code already exists");
        if (isImmertive) {
          toast.error("User with same mobile number already exists");
        } else {
          toast.error("User with same user id already exists");
        }
      }
    } else if (buttonContent == "updateUser") {
      const response = await request(`${apiRoutes.accounts.updateUser}${id}/`, {
        method: HTTP_METHODS.PATCH,
        body: updatedFields,
        isAuthenticated: true
      });
      if (response.status === HTTP_STATUSES.OK) {
        // setAlert("User updated successfully");
        toast.success("User updated successfully");
        router.push(appRoutes.users.activeUser);

        // router.replace(router.asPath);
      } else {
        // setError("User with the given employee code already exists");
        toast.error("User with the given user id already exists");
      }
    }
  };

  const css = "w-full md:w-1/2 xl:w-1/3";
  const requiredSpan = !userDetails && <span className="text-red">*</span>;
  return (
    <>
      {error && <p className="p-5 text-red"> {error} </p>}
      {alert && <p className="p-5 text-green-700"> {alert} </p>}
      <form
        name="addUserForm"
        action="post"
        encType="multipart/form-data"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="w-full flex flex-wrap max-md:py-2 md:py-4 !bg-white gap-y-4">
          <div className={`${css}`}>
            <Label> First Name {requiredSpan} </Label>
            <input
              type={"text"}
              {...register("first_name", {
                required: "This field is required.",
                validate: value => {
                  if (value.trim() == "") return "This field cannot be blank";
                }
              })}
              disabled={userDetails ? true : false}
              className={`${inputClass} ${
                userDetails ? "cursor-not-allowed" : ""
              }`}
              onChange={handleInputChange}
            />
            {errorFun("first_name")}
          </div>

          <div className={`${css}`}>
            <Label>Last Name {requiredSpan}</Label>
            <input
              type={"text"}
              {...register("last_name", {
                required: "This field is required.",
                validate: value => {
                  if (value.trim() == "") return "This field cannot be blank";
                }
              })}
              disabled={userDetails ? true : false}
              className={`${inputClass} ${
                userDetails ? "cursor-not-allowed" : ""
              }`}
              onChange={handleInputChange}
            />
            {errorFun("last_name")}
          </div>

          <div className={`${css}`}>
            <Label>Designation {requiredSpan}</Label>
            <input
              type={"text"}
              {...register("designation", {
                required: "This field is required."
              })}
              className={inputClass}
              onChange={handleInputChange}
            />
            {errorFun("designation")}
          </div>

          <div className={`${css}`}>
            <Label>Department {requiredSpan}</Label>
            <input
              type={"text"}
              {...register("department", {
                required: "This field is required."
              })}
              className={inputClass}
              onChange={handleInputChange}
            />
            {errorFun("department")}
          </div>

          <div className={`${css}`}>
            <Label>Work Location</Label>
            <input
              type={"text"}
              {...register("work_location", {
                required: false
              })}
              className={inputClass}
              onChange={handleInputChange}
            />
          </div>
          <div className={`${css}`}>
            <Label>
              {isImmertive ? "Mobile No." : "User ID"} {requiredSpan}
            </Label>
            <input
              type={"text"}
              {...register("user_id", {
                required: "This field is required.",
                validate: value => {
                  if (value.trim() == "") return "This field cannot be blank";
                  const regex = new RegExp(/^\d{10}$/);
                  if (isImmertive && !regex.test(value))
                    return "Invalid mobile number";
                }
              })}
              disabled={userDetails ? true : false}
              className={`${inputClass} ${
                userDetails ? "cursor-not-allowed" : ""
              }`}
              onChange={handleInputChange}
            />
            {errorFun("user_id")}
          </div>

          {/* Immertive Extra Fields */}

          {isImmertive &&
            immertiveExtraFields.map((field, index) => (
              <div className={`${css}`} key={index}>
                <Label>
                  {field.label} {requiredSpan}
                </Label>
                {field.type === "select" ? (
                  <select
                    name={field.label}
                    disabled={userDetails && field.editable}
                    className={`${inputClass} ${
                      userDetails &&
                      (field.editable ? "" : "cursor-not-allowed")
                    }`}
                    {...register(
                      field.label
                        .split(" ")
                        .join("_")
                        .replaceAll(".", "")
                        .toLowerCase(),
                      {
                        required: "select one option"
                      }
                    )}
                    onChange={handleInputChange}
                  >
                    <option value="" disabled selected>
                      Select Option
                    </option>
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                  </select>
                ) : (
                  <input
                    type={field.type}
                    name={field.label}
                    disabled={userDetails && !field.editable}
                    className={`${inputClass} ${
                      userDetails &&
                      (field.editable ? "" : "cursor-not-allowed")
                    }`}
                    {...register(
                      field.label
                        .split(" ")
                        .join("_")
                        .replaceAll(".", "")
                        .toLowerCase(),
                      {
                        required: "This field is required.",
                        validate: value => {
                          if (value.trim() == "")
                            return "This field cannot be blank";
                        }
                      }
                    )}
                    onChange={handleInputChange}
                  />
                )}
                {errorFun(
                  field.label
                    .split(" ")
                    .join("_")
                    .replaceAll(".", "")
                    .toLowerCase()
                )}
              </div>
            ))}

          {!userDetails && !isImmertive && (
            <div className={`${css}`}>
              <Label>Password {requiredSpan}</Label>

              <input
                type={"password"}
                {...register("password", {
                  required: "This field is required.",
                  pattern: FORM_VALIDATION.password,
                  validate: value => {
                    if (value.toString().trim() == "")
                      return "This field cannot be blank";
                  }
                })}
                className={inputClass}
              />

              {errorFun("password")}
            </div>
          )}
          {!userDetails && isImmertive && (
            <div className={`${css}`}>
              <Label>PIN {requiredSpan}</Label>

              <input
                type={"password"}
                className={inputClass}
                onKeyDown={handleKeyPress}
                {...register("pin", {
                  required: "This field is required.",
                  validate: value => {
                    if (value.toString().trim() == "")
                      return "This field cannot be blank";
                    else if (value.toString().length > 4) {
                      return "Cannot exceed 4 characters";
                    } else if (value.toString().length < 4) {
                      return "Cannot be less than 4 characters";
                    } else if (!pattern.test(value)) {
                      return "Only number values are allowed";
                    }
                  }
                })}
              />

              {errorFun("pin")}
            </div>
          )}
          {!userDetails && !isImmertive && (
            <div className={`${css}`}>
              <Label>Retype Password {requiredSpan}</Label>

              <input
                type={"password"}
                autoComplete="new-password"
                {...register("retype_password", {
                  required: "This field is required.",
                  minLength: 1,
                  validate: value => {
                    if (value.trim() == "") return "This field cannot be blank";
                    else if (value != watch("password")) {
                      return "Password's didn't matched";
                    }
                  }
                })}
                className={inputClass}
              />

              {errorFun("retype_password")}
            </div>
          )}
          {!userDetails && isImmertive && (
            <div className={`${css}`}>
              <Label>Confirm PIN {requiredSpan}</Label>

              <input
                type={"password"}
                className={inputClass}
                onKeyDown={handleKeyPress}
                autoComplete="new-password"
                {...register("confirm_pin", {
                  required: "This field is required.",
                  validate: value => {
                    if (value.toString().trim() == "")
                      return "This field cannot be blank";
                    else if (value.toString().length > 4) {
                      return "Cannot exceed 4 characters";
                    } else if (value.toString().length < 4) {
                      return "Cannot be less than 4 characters";
                    } else if (!pattern.test(value)) {
                      return "Only number values are allowed";
                    } else if (value != watch("pin")) {
                      return "Pin's didn't matched";
                    }
                  }
                })}
              />

              {errorFun("confirm_pin")}
            </div>
          )}
        </div>
        <div className="mt-3 flex max-md:flex-col">
          {!userDetails ? (
            <Button
              btnVariant="primary"
              onClick={() => setButtonContent("createUser")}
            >
              <BiUserPlus size={20} className="inline mr-1" />
              Create User
            </Button>
          ) : (
            <Button
              btnVariant="primary"
              onClick={() => setButtonContent("updateUser")}
            >
              Update User
            </Button>
          )}
          {!userDetails && (
            <Button
              btnVariant="secondary"
              className="w-[160px] rounded p-[6px] md:ml-4 max-md:mt-4 max-md:w-full"
              onClick={() => router.push(appRoutes.users.activeUser)}
            >
              Back
            </Button>
          )}
        </div>
      </form>
    </>
  );
};

export default AddUserForm;
