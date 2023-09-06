import { reverse } from "named-urls";
import { createContext, useState, useEffect, useContext } from "react";
import request from "utils/api";
import apiRoutes from "utils/api-routes";
import { loginStates, HTTP_STATUSES } from "utils/constants";
import useLogin from "./useLogin";
import PropTypes from "prop-types";

const UserProfileContext = createContext({
  userDetails: {},
  permissions: null,
  id: null,
  organization: ""
});

const UserProfileProvider = props => {
  const { children } = props;
  const [permissions, setPermissions] = useState(null);
  const [organization, setOrganization] = useState(null);
  const [cusmatAdmin, setCusmatAdmin] = useState(false);
  const [profile, setProfile] = useState(null);
  const { status, id } = useLogin();

  const setUserDetails = async (id, loggedInStatus) => {
    if (loggedInStatus === loginStates.IS_LOGGED_IN) {
      const response = await request(
        reverse(apiRoutes.accounts.userProfile.self, { id: id }),
        {
          isAuthenticated: true
        }
      );

      let userDetails = {};
      if (response.status === HTTP_STATUSES.OK) {
        userDetails = await response.json();
        if (userDetails.organization) {
          setOrganization(userDetails.organization);
        } else {
          const org = sessionStorage.getItem("organization");
          setOrganization(JSON.parse(org));
        }
        if (userDetails.access_type == "Cusmat") {
          setCusmatAdmin(true);
        }
        delete userDetails.organization;
        setProfile(userDetails);
      }
    }
  };
  useEffect(() => {
    setUserDetails(id, status);
  }, [id, status]);

  useEffect(() => {
    if (organization) {
      organization.logo = organization.logo?.startsWith("/")
        ? process.env.NEXT_PUBLIC_API_ROOT + organization.logo
        : organization.logo;
      sessionStorage.setItem("organization", JSON.stringify(organization));
    }
  }, [organization]);

  return (
    <UserProfileContext.Provider
      value={{
        permissions,
        setPermissions,
        profile,
        setProfile,
        organization,
        setOrganization,
        setUserDetails,
        cusmatAdmin
      }}
    >
      {children}
    </UserProfileContext.Provider>
  );
};

UserProfileProvider.propTypes = {
  children: PropTypes.oneOfType([PropTypes.object, PropTypes.array]).isRequired
};

const useUserProfile = () => useContext(UserProfileContext);

export default useUserProfile;
export { UserProfileProvider };
