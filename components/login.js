import React from "react";
import appRoutes from "utils/app-routes";
import AuthWall from "./AuthWall";

const Login = ({ loginStates, setStatus, setId, router, status }) => {
  return (
    <div className="w-full flex-col flex items-center justify-center my-auto  h-screen login-bg">
      {status == loginStates.IS_NOT_LOGGED_IN && (
        <AuthWall
          setStatus={setStatus}
          setId={setId}
          handleSubmit={() => {
            router.push(appRoutes.dashboard);
          }}
        />
      )}
      <div className="text-sm md:text-md my-auto text-white text-center">
        © 2023 Powered by Cusmat Technologies
      </div>
    </div>
  );
};

export default Login;
