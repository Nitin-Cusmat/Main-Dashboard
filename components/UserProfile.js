import useUserProfile from "hooks/useUserProfile";
import React, { useEffect } from "react";
import {
  HTTP_METHODS,
  HTTP_STATUSES,
  TRAINER_PROFILE_FIELDS
} from "utils/constants";
import { useForm } from "react-hook-form";
import Label from "./Label";
import Button from "./Button";
import apiRoutes from "utils/api-routes";
import appRoutes from "utils/app-routes";
import request from "utils/api";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import useLogin from "hooks/useLogin";
import { FORM_VALIDATION } from "utils/formValidation";

const UserProfile = () => {
  const { profile, setUserDetails } = useUserProfile();
  const { status, id } = useLogin();

  useEffect(() => {
    reset(profile);
  }, [profile]);

  const {
    handleSubmit,
    register,
    reset,
    getValues,
    formState: { errors }
  } = useForm();
  const css = "w-full md:w-1/2 xl:w-1/3";
  const inputClass =
    "max-md:w-full md:w-[90%] !bg-white h-[40px] mt-2 text-dark border border-[#B3B3B3] focus:border-primary rounded-l  pl-4";
  const editable_field = [
    "designation",
    "department",
    "work_location",
    "password",
    "new_password",
    "confirm_password"
  ];
  const passwordFields = ["password", "new_password", "confirm_password"];
  const router = useRouter();

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

  const onSubmit = async data => {
    const org = sessionStorage.getItem("organization");
    const availableFieldsData = Object.keys(data).filter(x => data[x]);
    const refinedData = {
      user_id: profile.user_id,
      organization_id: JSON.parse(org).id
    };
    availableFieldsData.forEach(key => {
      refinedData[key] = data[key];
    });
    const response = await request(apiRoutes.accounts.updateTrainerProfile, {
      method: HTTP_METHODS.PATCH,
      body: refinedData,
      isAuthenticated: true
    });
    const jsonResponse = await response.json();
    if (response.status === HTTP_STATUSES.OK) {
      toast.success("Profile updated successfully");
      setUserDetails(id, status);
      reset();
      router.push(appRoutes.dashboard);
    } else {
      toast.error(jsonResponse.error);
    }
  };

  return (
    <form
      name="addUserForm"
      action="patch"
      encType="multipart/form-data"
      onSubmit={handleSubmit(onSubmit)}
    >
      {profile && (
        <>
          <div className="w-full flex flex-wrap max-md:p-2 md:p-4 !bg-white gap-y-4">
            {Object.keys(TRAINER_PROFILE_FIELDS).map(item => {
              return (
                <div key={`profile_field_${item}`} className={`${css}`}>
                  <Label>{TRAINER_PROFILE_FIELDS[item]}</Label>
                  <input
                    type={passwordFields.includes(item) ? "password" : "text"}
                    autoComplete="new-password"
                    {...register(item, {
                      required: "This field is required.",
                      pattern:
                        item === "new_password" && FORM_VALIDATION.password,
                      validate: value => {
                        if (value.toString().trim() == "")
                          return "This field cannot be blank";
                      }
                    })}
                    disabled={!editable_field.includes(item)}
                    className={`${inputClass} ${
                      !editable_field.includes(item) && "cursor-not-allowed"
                    }`}
                    defaultValue={profile[item]}
                  />
                  {errorFun(item)}
                </div>
              );
            })}
          </div>
          <div className="max-md:p-2 md:p-4 flex max-md:flex-col">
            <Button btnVariant="primary">Update Profile</Button>
          </div>
        </>
      )}
    </form>
  );
};

export default UserProfile;
