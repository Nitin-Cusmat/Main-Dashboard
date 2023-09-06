import { include } from "named-urls";

const appRoutes = include("", {
  root: "/",
  login: "/login/:slug",
  dashboard: "dashboard/",
  profile: "profile/",
  resetPassword: "password/reset/",
  forgotPassword: "password/forgot/",
  users: include("users", {
    activeUser: "activeUser/",
    bulkCreateUser: "createBulkUser/",
    bulkUpdateUser: "updateBulkUser/",
    addUsers: "addUsers/",
    userDetails: include("userDetails", {
      self: ""
    })
  }),
  useCases: "useCases/",
  details: include(":id", {
    self: "",
    edit: "edit/"
  }),
  reports: include("reports", {
    self: "",
    individual: include(":userId", {
      performance: "individual-performance/",
      report: "Individual-report/"
    }),
    compartitive: include(":userId", {
      self: ":userId2/comparitive/"
    })
  })
});

export default appRoutes;
