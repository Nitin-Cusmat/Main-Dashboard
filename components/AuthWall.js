import { useState } from "react";
import Button from "./Button";
import { setCookie } from "utils/storage";
import request, { parseJwt } from "utils/api";
import {
  cookieKeys,
  HTTP_METHODS,
  HTTP_STATUSES,
  loginStates
} from "utils/constants";
import { getDateFromEpoch } from "utils/utils";
import apiRoutes from "utils/api-routes";
import Label from "./Label";
import appRoutes from "utils/app-routes";
import { useRouter } from "next/router";

const AuthWall = props => {
  const { handleSubmit, setStatus, setId, org = null } = props;

  const [userEmail, setUserEmail] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [error, setError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const onSubmit = async e => {
    setSubmitting(true);
    const response = await request(apiRoutes.accounts.passwordLogin, {
      method: HTTP_METHODS.POST,
      body: {
        //Assuming all emails to be stored in lowercase
        //TODO: Remove this on ignoring case sensitivity from backend
        email: userEmail.toLowerCase(),
        password: userPassword
      }
    });
    if (response.status === HTTP_STATUSES.OK) {
      const tokenData = await response.json();
      const accessToken = tokenData.access;
      const refreshToken = tokenData.refresh;
      const parsedAccessToken = parseJwt(accessToken);
      const parsedRefreshjToken = parseJwt(refreshToken);
      const accessTokenExpiryDate = getDateFromEpoch(parsedAccessToken.exp);
      const refreshTokenExpiryDate = getDateFromEpoch(parsedRefreshjToken.exp);
      setCookie(cookieKeys.ACCESS, accessToken, accessTokenExpiryDate);
      setCookie(cookieKeys.REFRESH, refreshToken, refreshTokenExpiryDate);
      setStatus(loginStates.IS_LOGGED_IN);
      setId(parsedAccessToken.user_id);
      handleSubmit();
    } else {
      setError(true);
    }
    setSubmitting(false);
  };

  return (
    <div className="w-[90%] mx-auto sm:w-[500px] h-[400px] flex justify-center flex-col bg-white border rounded-xl px-10 mt-5">
      <div className="flex flex-col gap-6 w-full">
        <div className="text-dark text-center">
          Sign In to access the Dashboard
        </div>
        {error && (
          <div className="text-center text-red">Invalid email or password</div>
        )}
        <div className="w-full mx-auto">
          <Label>Email</Label>
          <input
            label="User Email"
            type="email"
            name="email"
            className="w-full !bg-white h-[40px]  text-dark border border-[#D9D9D9] focus:border-primary rounded-l pl-4"
            onChange={e => {
              setError(false);
              setUserEmail(e.target.value);
            }}
            required
          />
        </div>
        <div className="w-full">
          <Label>Password</Label>
          <input
            label="Password"
            type="password"
            name="password"
            className="w-full !bg-white h-[40px] text-dark border border-[#D9D9D9] focus:border-primary rounded-l pl-4"
            onChange={e => {
              setError(false);
              setUserPassword(e.target.value);
            }}
            onKeyDown={e => {
              if (e.code == "Enter") {
                e.preventDefault();
                e.stopPropagation();
                onSubmit();
              }
            }}
            required
          />
          <div className="text-right text-sm text-dark">
            <span
              className="cursor-pointer"
              onClick={() => router.push(appRoutes.forgotPassword)}
            >
              Forget Password ?
            </span>
          </div>
        </div>
      </div>
      <div className="my-4 mx-auto">
        <Button
          className="font-normal text-sm px-10 py-2 rounded"
          onClick={onSubmit}
          disabled={submitting}
          inProgress={submitting}
          login
        >
          LOGIN
        </Button>
      </div>
    </div>
  );
};

export default AuthWall;
