import { useRouter } from "next/router";
import { deleteCookie, getCookie } from "utils/storage";
import { cookieKeys, HTTP_METHODS, loginStates } from "utils/constants";
import appRoutes from "utils/app-routes";
import request from "utils/api";
import apiRoutes from "utils/api-routes";
import useLogin from "./useLogin";
import useUserProfile from "./useUserProfile";

const useLogout = () => {
  const { setStatus } = useLogin();
  const { cusmatAdmin, organization, setOrganization } = useUserProfile();
  const router = useRouter();

  return async () => {
    const refreshToken = getCookie(cookieKeys.REFRESH);
    try {
      deleteCookie(cookieKeys.ACCESS);
      deleteCookie(cookieKeys.REFRESH);
      await request(apiRoutes.accounts.token.logout, {
        isAuthenticated: true,
        body: {
          refresh: refreshToken
        },
        method: HTTP_METHODS.POST
      });
    } catch (exc) {
      // Ignore exception and log the user out
      // Refresh token can still be valid till the time it expires
    }
    setOrganization(null);
    router.push(
      organization === null || cusmatAdmin
        ? appRoutes.root
        : appRoutes.login.replace(":slug", organization.slug)
    );
    sessionStorage.removeItem("organization");
    setStatus(loginStates.IS_NOT_LOGGED_IN);
  };
};

export default useLogout;
