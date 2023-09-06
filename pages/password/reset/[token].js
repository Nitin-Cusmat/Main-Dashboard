import Button from "components/Button";
import Label from "components/Label";
import { useRouter } from "next/router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import request from "utils/api";
import apiRoutes from "utils/api-routes";
import { HTTP_METHODS, HTTP_STATUSES, cookieKeys } from "utils/constants";
import { FORM_VALIDATION } from "utils/formValidation";
import appRoutes from "utils/app-routes";
import { getCookie } from "utils/storage";

const ResetPassword = ({ token, expired, orgLogo }) => {
  const {
    handleSubmit,
    register,
    formState: { errors }
  } = useForm({ defaultValues: {} });
  const [error, setError] = useState();
  const [alert, setAlert] = useState(null);
  const router = useRouter();

  const inputClass =
    "w-full !bg-white h-[40px] mt-2 text-dark border border-[#B3B3B3] focus:border-primary rounded-l  pl-4";
  const errorFun = field => {
    return (
      <p
        className={`text-xs md:text-md text-red py-[5px] ${
          errors[field] ? "visible" : "invisible"
        }`}
      >
        {errors && errors[field] ? errors[field].message : ""}
      </p>
    );
  };

  const onSubmit = async data => {
    setError(null);
    if (data.password != data.retype_password) {
      return setError("Passwords does not match");
    }
    const response = await request(apiRoutes.accounts.resetPassword, {
      method: HTTP_METHODS.POST,
      password_reset_token: token,
      body: {
        new_password: data.password,
        confirm_password: data.retype_password
      }
    });
    if (response.status === HTTP_STATUSES.OK) {
      setAlert("User password reset successfully");
      router.push(
        getCookie(cookieKeys.ORG_SLUG)
          ? appRoutes.login.replace(":slug", getCookie(cookieKeys.ORG_SLUG))
          : appRoutes.root
      );
    } else if (response.status === HTTP_STATUSES.FORBIDDEN) {
      setError("Password link is expired");
    } else {
      setError("Something went wrong");
    }
  };

  return (
    <div className="w-full flex-col flex items-center justify-center my-auto  h-screen login-bg ">
      <img
        src={
          orgLogo
            ? process.env.NEXT_PUBLIC_API_ROOT + "/media/Mobiux_LyMMI9t.png"
            : "/images/cusmat-logo.svg"
        }
        width="120px"
        height="auto"
        alt="logo"
        className="mx-auto my-4"
      />
      <div className="w-[90%] sm:w-[500px] h-[400px] flex justify-center flex-col bg-white border rounded-xl px-10">
        {expired ? (
          <div className="text-red text-center">
            Your password link is expired
          </div>
        ) : (
          <>
            <div className="text-dark text-center">Reset password</div>
            <div className="w-full flex flex-col gap-y-3 mt-8">
              <form
                name="resetPasswordForm"
                action="post"
                onSubmit={handleSubmit(onSubmit)}
              >
                <div className="w-full">
                  <Label>
                    Password <span className="text-red-700"></span>
                  </Label>

                  <input
                    type={"password"}
                    {...register("password", {
                      required: "This field is required.",
                      pattern: FORM_VALIDATION.password,
                      validate: value => {
                        if (value.trim() == "")
                          return "This field cannot be blank";
                      }
                    })}
                    className={inputClass}
                  />

                  {errorFun("password")}
                </div>
                <div>
                  <Label>
                    Retype Password <span className="text-red-700"></span>
                  </Label>

                  <input
                    type={"password"}
                    {...register("retype_password", {
                      required: "This field is required.",
                      minLength: 1,
                      validate: value => {
                        if (value.trim() == "")
                          return "This field cannot be blank";
                      }
                    })}
                    className={inputClass}
                  />

                  {errorFun("retype_password")}
                </div>
                <Button
                  btnVariant="primary"
                  className="w-[160px] py-2 bg-red rounded font-medium mx-auto"
                  onClick={() => handleSubmit(onSubmit)}
                >
                  Reset Password
                </Button>
              </form>

              {error && <div className="text-red text-center">{error}</div>}
              {alert && <p className="p-5 text-green-700 mx-auto"> {alert} </p>}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export const getServerSideProps = async ctx => {
  const { token } = ctx.query;
  let expired = true;
  const response = await request(
    apiRoutes.accounts.validateResetPasswordToken,
    {
      password_reset_token: token
    }
  );
  let orgLogo = null;

  if (response.status === HTTP_STATUSES.OK) {
    expired = false;
    orgLogo = await response.json();
  }

  return {
    props: {
      token: token,
      expired: expired,
      orgLogo: orgLogo
    }
  };
};

export default ResetPassword;
