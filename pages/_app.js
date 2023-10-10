import "../styles/globals.css";
import "styles/mistakes.css";

import { RecoilRoot } from "recoil";
import InitState from "components/InitState";
import { LoginProvider } from "hooks/useLogin";
import { UserProfileProvider } from "hooks/useUserProfile";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function App({ Component, pageProps }) {
  return (
    <RecoilRoot>
      <InitState>
        <LoginProvider>
          <ToastContainer position="bottom-right" />
          <UserProfileProvider>
            <Component {...pageProps} />
          </UserProfileProvider>
        </LoginProvider>
      </InitState>
    </RecoilRoot>
  );
}
