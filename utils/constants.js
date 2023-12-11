import appRoutes from "./app-routes";
import { HiOutlineUser } from "react-icons/hi";

const getEditUsersId = id => {
  return `${appRoutes.users.userDetails.self + id}`;
};

const SIDENAV_ITEM_OBJS = {
  DASHBOARD: {
    id: "dashboard",
    title: "Dashboard",
    link: appRoutes.dashboard
  },
  USERS: { id: "users", title: "Users", link: appRoutes.users.activeUser },
  USE_CASES: {
    id: "useCases",
    title: "Use Cases",
    link: appRoutes.useCases
  },
  REPORTS: {
    id: "reports",
    title: "Trend Report",
    link: appRoutes.reports.self
  },
  ACTIVE_USER: {
    id: "activeUser",
    title: "Active User",
    link: appRoutes.users.activeUser
  },
  ADD_USERS: {
    id: "addUsers",
    title: "Add new Users",
    link: appRoutes.users.addUsers
  },
  EDIT_USERS: {
    id: "editUsers",
    title: "Edit User",
    link: getEditUsersId
  },
  BULK_CREATE_USER: {
    id: "bulkCreateUser",
    title: "Bulk Create User",
    link: appRoutes.users.bulkCreateUser
  },
  BULK_UPDATE_USER: {
    id: "bulkUpdateUser",
    title: "Bulk Update User",
    link: appRoutes.users.bulkUpdateUser
  }
};

const SIDENAV_ITEMS = [
  {
    id: SIDENAV_ITEM_OBJS.DASHBOARD.id,
    title: SIDENAV_ITEM_OBJS.DASHBOARD.title,
    icon: "/images/dashboard.svg",
    activeIcon: "",
    route: SIDENAV_ITEM_OBJS.DASHBOARD.link
  },

  {
    id: SIDENAV_ITEM_OBJS.USE_CASES.id,
    title: SIDENAV_ITEM_OBJS.USE_CASES.title,
    icon: "/images/usecases.svg",
    activeIcon: "",
    route: SIDENAV_ITEM_OBJS.USE_CASES.link
  },
  {
    id: SIDENAV_ITEM_OBJS.REPORTS.id,
    title: SIDENAV_ITEM_OBJS.REPORTS.title,
    icon: "/images/reports.svg",
    activeIcon: "",
    route: SIDENAV_ITEM_OBJS.REPORTS.link
  },
  {
    id: SIDENAV_ITEM_OBJS.USERS.id,
    title: SIDENAV_ITEM_OBJS.USERS.title,
    icon: "/images/users.svg",
    activeIcon: <HiOutlineUser size="15" className="inline text-primary" />,
    route: SIDENAV_ITEM_OBJS.USERS.link,
    children: [
      {
        id: SIDENAV_ITEM_OBJS.ACTIVE_USER.id,
        title: SIDENAV_ITEM_OBJS.ACTIVE_USER.title,
        icon: "",
        activeIcon: "",
        route: SIDENAV_ITEM_OBJS.ACTIVE_USER.link
      },
      {
        id: SIDENAV_ITEM_OBJS.BULK_CREATE_USER.id,
        title: SIDENAV_ITEM_OBJS.BULK_CREATE_USER.title,
        icon: "",
        activeIcon: "",
        route: SIDENAV_ITEM_OBJS.BULK_CREATE_USER.link
      },
      {
        id: SIDENAV_ITEM_OBJS.BULK_UPDATE_USER.id,
        title: SIDENAV_ITEM_OBJS.BULK_UPDATE_USER.title,
        icon: "",
        activeIcon: "",
        route: SIDENAV_ITEM_OBJS.BULK_UPDATE_USER.link
      }
    ]
  }
];

const COOKIE_KEYS = {
  ACCESS: "access",
  REFRESH: "refresh",
  ORG_SLUG: "org"
};

const HTTP_METHODS = {
  GET: "GET",
  POST: "POST",
  PUT: "PUT",
  PATCH: "PATCH",
  DELETE: "DELETE"
};

const HTTP_STATUSES = {
  OK: 200,
  POST_OK: 201,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  NO_RESPONSE: 204,
  SERVER_ERROR: 500,
  FORBIDDEN: 403
};

const HTTP_HEADERS = {
  CONTENT_TYPE: "Content-Type",
  AUTHORIZATION: "Authorization",

  // Custom Headers
  REQUEST_ORIGIN_SYSTEM: "Request-Origin-System"
};

const loginStates = {
  IS_LOADING: -1,
  IS_LOGGED_IN: 1,
  IS_NOT_LOGGED_IN: 0
};

const cookieKeys = {
  ACCESS: "access",
  REFRESH: "refresh",
  ORG_SLUG: "org"
};

const USER_PROFILE_FIELDS = {
  user_id: "User ID",
  first_name: "First Name",
  last_name: "Last Name",
  designation: "Designation",
  department: "Department",
  work_location: "Work Location"
};

const USER_PROFILE_FIELDS_FOR_IMMERTIVE = {
  user_id: "Mobile No.",
  first_name: "First Name",
  last_name: "Last Name",
  designation: "Designation",
  department: "Department",
  work_location: "Work Location",
  date_of_birth: "Date of Birth",
  gender: "Gender",
  course: "Course",
  batch: "Batch",
  roll_no: "Roll No.",
  institute: "Institute",
  city: "City",
  state: "State",
  vr_lab: "VR Lab"
};

const TRAINER_PROFILE_FIELDS = {
  user_id: "User ID",
  first_name: "First Name",
  last_name: "Last Name",
  designation: "Designation",
  department: "Department",
  work_location: "Work Location",
  password: "Old Password",
  new_password: "New Password",
  confirm_password: "Confirm Password"
};

const USER_TABLE_COLUMN_MAP = {
  name: "Name of the Trainee",
  user_id: "User ID",
  modules: "Modules",
  module_usage: "Total Time Spent",
  progress: "Progress%"
};
const CHART_COLORS = {
  chartGreen: "#5AB281",
  chartPurple: "#5256B8",
  chartRed: "#EB6C64",
  chartBlue: "#63A4E9",
  chartYellow: "#F5C266",
  chartSteelBlue: "#4682b4",
  sienna: "#a0522d",
  rosybrown: "#bc8f8f",
  palevioletred: "#db7093",
  maroon: "#800000",
  red: "#FF0000",
  purple: "#800080",
  fuchsia: "#FF00FF",
  green: "#008000",
  lime: "#00FF00",
  olive: "#808000",

  yellow: "#FFFF00"
};
const CHART_TYPES = {
  BAR: "bar",
  LINE: "line",
  PIE: "pie",
  RADIAL: "radialBar",
  AREA: "area",
  RADAR: "radar",
  DOUGHNUT: "donut"
};

const AXIS_LINES = [
  {
    y: 4.286424,
    xmin: -11.85076,
    xmax: 14.53123,
    linewidth: 1,
    color: "b"
  },
  {
    y: -0.9447651,
    xmin: -11.85076,
    xmax: 14.53123,
    linewidth: 1,
    color: "b"
  },
  {
    y: -6.871126,
    xmin: -11.85076,
    xmax: 14.53123,
    linewidth: 1,
    color: "b"
  },
  {
    y: -12.75767,
    xmin: -11.85076,
    xmax: 14.53123,
    linewidth: 1,
    color: "b"
  },
  {
    y: -17.83196,
    xmin: -11.85076,
    xmax: 14.53123,
    linewidth: 1,
    color: "b"
  }
];
const ORG_MAPPING = {
  Thriveni: "Thriveni",
  // DhlIndia: "DHL India",
  Apollo: "Apollo",
  // VCTPL: "VCTPL",
};
export {
  SIDENAV_ITEMS,
  SIDENAV_ITEM_OBJS,
  COOKIE_KEYS,
  HTTP_METHODS,
  HTTP_STATUSES,
  HTTP_HEADERS,
  loginStates,
  cookieKeys,
  USER_PROFILE_FIELDS,
  USER_PROFILE_FIELDS_FOR_IMMERTIVE,
  TRAINER_PROFILE_FIELDS,
  USER_TABLE_COLUMN_MAP,
  CHART_COLORS,
  CHART_TYPES,
  AXIS_LINES,
  ORG_MAPPING
};
