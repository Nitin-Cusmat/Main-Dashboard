import { include } from "named-urls";

const apiRoutes = include("api/v1", {
  accounts: include("accounts", {
    sendOtp: "send-otp/",
    otpLogin: "otp-login/",
    passwordLogin: "login/",
    csvTemplate: "download-csv-template/",
    importUsers: "import-users-from-csv/",
    createUser: "create-user/",
    updateUser: "update-user/",
    downloadUsersList: "download-list/",
    listUsers: "list-users/",
    deleteUsers: "delete-users/",
    userProfile: include("user-profile", {
      self: ":id/"
    }),
    userDetails: "user-details/",
    token: include("token", {
      self: "",
      refresh: "refresh/",
      logout: "logout/"
    }),
    resetPassword: "reset-password/",
    forgotPassword: "forgot-password/",
    validateResetPasswordToken: "validate-reset-password-token/",
    updateTrainerProfile: "update-trainer-profile/",
    learners: "learners/"
  }),
  organization: include("organization", {
    details: "details/",
    orgDetails: "details/",
    list: "list/",
    listLevels: "list-levels/",
    modules: "modules/",
    moduleAssignment: "assign-deassign/",
    moduleAnalytics: "module-analytics/",
    userAnalytics: "user-analytics/",
    userPerformance: "user-performance/",
    reportBoard: "assigned-users-list/",
    latestAttempts: "latest-attempts/",
    userModules: "user-assigned-module-level/",
    individualReport: "attempt-wise-report-table/",
    calculatePerformances: "calculate-performances/",
    applicationUsage: "application-usage/",
    levelAnalytics: "level-wise-analytics/",
    attempts: "attempts/",
    attemptData: "attempt-data/",
    attemptWiseReport: "attempt-wise-report/",
    applicationUsageAnalytics: "application-usage-analytics/",
    totalActiveModuleAndUsers: "total-active-module-and-users/",
    adminUserPerformance: "admin-organization-application-usage/",
    levelUserInfo:"level-user-info/"
  })
});
export default apiRoutes;
