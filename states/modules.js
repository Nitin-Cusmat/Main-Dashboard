import { atom } from "recoil";

const moduleState = atom({
  key: "module",
  default: { modules: null, active: null }
});

export default moduleState;
