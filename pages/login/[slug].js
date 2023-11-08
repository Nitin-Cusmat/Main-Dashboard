import { HTTP_STATUSES, cookieKeys, loginStates } from "utils/constants";
import { useEffect, useState, useRef } from "react";
import useLogin from "hooks/useLogin";
import appRoutes from "utils/app-routes";
import apiRoutes from "utils/api-routes";
import request from "utils/api";
import AuthWall from "components/AuthWall";
import Custom404 from "pages/404";
import { setCookie } from "utils/storage";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import Head from "next/head";

export default function OrgLogin({ orgDetails, isValid }) {
  const router = useRouter();
  const { setStatus, setId, status } = useLogin();
  const [org, setOrg] = useState(orgDetails);

  useEffect(() => {
    const { query } = router;
    if (query.error) {
      toast.error(
        "Your License has been expired. Please contact cusmat administrator",
        {
          toastId: "error",
          position: "top-center",
          autoClose: false,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "colored"
        }
      );
    }
  }, [router.query]);

  useEffect(() => {
    if (status === loginStates.IS_LOGGED_IN) {
      router.replace(appRoutes.dashboard);
    } else if (status === loginStates.IS_NOT_LOGGED_IN) {
      setCookie(
        cookieKeys.ORG_SLUG,
        org && JSON.stringify({ slug: org.slug, logo: org.logo }),
        new Date(Date.now() + 1000 * 60 * 60 * 24 * 365 * 10)
      );
    }
  }, [status, router]);

  return isValid ? (
    <div className="w-full flex-col flex items-center justify-center my-auto  h-screen login-bg">
      <div>
        {status == loginStates.IS_NOT_LOGGED_IN && (
          <>
            <Head>
              <title>{`${org.name} Login`}</title>
            </Head>
            {org?.logo && (
              <img
                src={org?.logo}
                width="120px"
                height="auto"
                alt="logo"
                className="mx-auto mt-4"
              />
            )}
            <AuthWall
              org={org}
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
  ) : (
    <Custom404 />
  );
}
export const getServerSideProps = async ctx => {
  const { slug } = ctx.query;
  let isValid = false;
  const response = await request(`${apiRoutes.organization.details}${slug}/`);
  let resJson = null;
  if (response.status === HTTP_STATUSES.OK) {
    resJson = await response.json();
    isValid = true;
  }

  return {
    props: {
      orgDetails: resJson,
      isValid: isValid
    }
  };
};
