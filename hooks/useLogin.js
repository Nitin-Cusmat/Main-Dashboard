import { useContext, createContext, useState, useEffect } from "react";
import { loginStates } from "utils/constants";
import PropTypes from "prop-types";
import { getAccessToken, parseJwt } from "utils/api";

const LoginContext = createContext({
  status: loginStates.IS_LOADING,
  id: null
});  

const LoginProvider = props => {
  const { children } = props;
  const [status, setStatus] = useState(loginStates.IS_LOADING);
  const [id, setId] = useState(null);

  useEffect(() => {
    const checkLoginStatus = async () => {
      const accessToken = await getAccessToken();
      if (!accessToken) {
        setStatus(loginStates.IS_NOT_LOGGED_IN);
      } else {
        const parsedAccessToken = parseJwt(accessToken);
        setStatus(loginStates.IS_LOGGED_IN);
        setId(parsedAccessToken.user_id);
      }
    };
    checkLoginStatus();
  }, []);

  return (
    <LoginContext.Provider
      value={{
        status,
        setStatus,
        id,
        setId
      }}
    >
      {children}
    </LoginContext.Provider>
  );
};

LoginProvider.propTypes = {
  children: PropTypes.oneOfType([PropTypes.object, PropTypes.array]).isRequired
};

const useLogin = () => useContext(LoginContext);

export default useLogin;
export { LoginProvider };
