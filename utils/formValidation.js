export const FORM_VALIDATION = {
  email: {
    value:
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    message: "Please enter a valid email"
  },
  number: {
    value: /^[0-9]*$/,
    message: "This should only contains digits"
  },
  phone: {
    value:
      /^(\+{0,})(\d{0,})([(]{1}\d{1,3}[)]{0,}){0,}(\s?\d+|\+\d{2,3}\s{1}\d+|\d+){1}[\s|-]?\d+([\s|-]?\d+){1,2}(\s){0,}$/gm,
    message: "This should only contains digits"
  },
  password: {
    // value: /^(?!.*[\s])(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,15}$/,
    value: /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/,
    message:
      "Should contain at least 1 upper and 1 lower case letter, 1 special character, 1 digit, minimum  8 characters and should not contain white space"
  }
};
