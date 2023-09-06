import deviceState from "states/deviceState";
import { useSetRecoilState } from "recoil";
import { useEffect } from "react";

const MOBILE_SCREEN_SIZE = 425;
const PHABLET_SCREEN_SIZE = 640;
const TAB_SCREEN_SIZE = 769;
// add something for 1023

const InitState = ({ children }) => {
  const setDeviceInfo = useSetRecoilState(deviceState);

  const deviceScreenType = () => {
    const values =
      window.innerWidth <= MOBILE_SCREEN_SIZE
        ? {
            isMobile: true,
            isPhablet: false,
            isTablet: false,
            isDesktop: false
          }
        : window.innerWidth <= PHABLET_SCREEN_SIZE
        ? {
            isMobile: false,
            isPhablet: true,
            isTablet: false,
            isDesktop: false
          }
        : window.innerWidth <= TAB_SCREEN_SIZE
        ? {
            isMobile: false,
            isPhablet: false,
            isTablet: true,
            isDesktop: false
          }
        : {
            isMobile: false,
            isPhablet: false,
            isTablet: false,
            isDesktop: true
          };
    setDeviceInfo({
      ...values,
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight
    });
  };

  useEffect(() => {
    // Update device screen info
    deviceScreenType();
    window.addEventListener("resize", () => deviceScreenType());
  }, []);

  return children;
};
export default InitState;
