import validator from "validator";

export const validateForm = (data) => {
  let errors = {};

  // Name
  if (validator.isEmpty(data.name || "")) {
    errors.name = "Name is required";
  }

  // Email
  if (validator.isEmpty(data.email || "")) {
    errors.email = "Email is required";
  } else if (!validator.isEmail(data.email)) {
    errors.email = "Invalid email";
  }

  // Password
  if (validator.isEmpty(data.password || "")) {
    errors.password = "Password is required";
  } else if (!validator.isLength(data.password, { min: 6 })) {
    errors.password = "Minimum 6 characters required";
  }

  // Mobile
  if (validator.isEmpty(data.phone || "")) {
    errors.phone = "Mobile is required";
  } else if (!validator.isMobilePhone(data.phone, "en-IN")) {
    errors.phone = "Invalid mobile number";
  }

  return errors;
};