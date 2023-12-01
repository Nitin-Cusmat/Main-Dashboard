import { loginStates } from "utils/constants";
import { useRouter } from "next/router";
import { useEffect } from "react";
import AuthWall from "components/AuthWall";
import useLogin from "hooks/useLogin";
import appRoutes from "utils/app-routes";
import Head from "next/head";

export default function Home() {
  const router = useRouter();
  const { setStatus, setId, status } = useLogin();
  useEffect(() => {
    if (status === loginStates.IS_LOGGED_IN) {
      router.replace(appRoutes.dashboard);
    }
  }, [status, router]);
  return (
    <div className="w-full flex-col flex items-center justify-center my-auto  h-screen login-bg">
      <div>
        {status == loginStates.IS_NOT_LOGGED_IN && (
          <>
            <Head>
              <title>Cusmat Login</title>
            </Head>
            <img
              src={"/images/cusmat-logo.svg"}
              width="120px"
              height="auto"
              alt="logo"
              className="mx-auto mt-4"
            />
            <AuthWall
              setStatus={setStatus}
              setId={setId}
              handleSubmit={() => {
                router.push(appRoutes.dashboard);
              }}
            />
          </>
        )}
        <div className="text-sm md:text-md mt-14 text-white text-center">
          © 2023 Powered by Cusmat Technologies
        </div>
      </div>
    </div>
  );
}
