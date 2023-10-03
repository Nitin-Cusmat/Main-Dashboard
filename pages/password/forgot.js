import Button from "components/Button";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import request from "utils/api";
import apiRoutes from "utils/api-routes";
import { HTTP_METHODS, HTTP_STATUSES, cookieKeys } from "utils/constants";
import { FORM_VALIDATION } from "utils/formValidation";
import { getCookie } from "utils/storage";

const Forgot = () => {
  const {
    handleSubmit,
    register,
    formState: { errors }
  } = useForm({ defaultValues: {} });
  const [error, setError] = useState();
  const [alert, setAlert] = useState(null);
  const [linkSent, setLinkSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [orgLogo, setOrgLogo] = useState(null);
  const ref = useRef(null);

  const inputClass =
    "w-full !bg-white h-[40px] mt-2 text-dark border border-[#B3B3B3] focus:border-primary rounded-l  pl-4";
  const errorFun = field => {
    return (
      <p
        className={`text-xs md:text-md text-red ${
          errors[field] && errors[field].isTouched ? "visible" : "invisible"
        }`}
      >
        {errors && errors[field] ? errors[field].message : ""}
      </p>
    );
  };

  const resetError = () => {
    setError(null);
  };

  const onSubmit = async data => {
    setSubmitting(true);
    const res = await request(apiRoutes.accounts.forgotPassword, {
      method: HTTP_METHODS.POST,
      body: data
    });
    if (res.status == HTTP_STATUSES.OK) {
      setLinkSent(true);
      setAlert("Password reset link has been sent.");
    } else if (res.status === HTTP_STATUSES.SERVER_ERROR) {
      setError("Something went wrong");
    } else if (res.status === HTTP_STATUSES.BAD_REQUEST) {
      setError("This email is not associated with any user account.");
    } else if (res.status === HTTP_STATUSES.FORBIDDEN) {
      setError(
        "You are not authorized to perform this action. Please contact your organization admin."
      );
    }
    setSubmitting(false);
  };

  useEffect(() => {
    ref.current = getCookie(cookieKeys.ORG_SLUG);
    setOrgLogo(ref && ref.current ? JSON.parse(ref.current).logo : null);
  }, []);

  return (
    <div className="w-full flex-col flex items-center justify-center my-auto  h-screen login-bg ">
      <img
        src={orgLogo ? orgLogo : "/images/cusmat-logo.svg"}
        width="120px"
        height="auto"
        alt="logo"
        className="mx-auto my-4"
      />
      <div className="w-[90%] sm:w-[500px] h-[300px] flex justify-center flex-col bg-white border rounded-xl px-10">
        <div className="text-dark text-center mb-5">Reset password</div>
        <form
          name="ForgotPasswordForm"
          action="post"
          onSubmit={handleSubmit(onSubmit)}
          className="w-full flex flex-col"
        >
          <div className="w-full">
            <input
              placeholder="Enter Email"
              type={"email"}
              {...register("email", {
                required: "This field is required.",
                pattern: FORM_VALIDATION.email,
                validate: value => {
                  if (value.trim() == "") return "This field cannot be blank";
                  else return true;
                }
              })}
              className={inputClass}
              onChange={() => resetError()}
            />

            {errorFun("email")}
          </div>
          {error && <div className="text-red text-sm text-left">{error}</div>}
          {!linkSent && (
            <div className="w-full flex justify-center mt-5">
              <Button
                btnVariant="primary"
                className="w-[160px] py-2 bg-red rounded font-medium"
                onClick={() => handleSubmit(onSubmit)}
                disabled={submitting}
              >
                Send login link
              </Button>
            </div>
          )}
        </form>
        {alert && <p className="p-5 text-green-700 mx-auto"> {alert} </p>}
      </div>
    </div>
  );
};

export default Forgot;
