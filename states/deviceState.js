import { atom } from "recoil";

const deviceState = atom({
  key: "device",
  default: {
    isMobile: false,
    isPhablet: false,
    isTablet: false,
    isDesktop: false,
    screenWidth: 0,
    screenHeight: 0
  }
});

export default deviceState;
