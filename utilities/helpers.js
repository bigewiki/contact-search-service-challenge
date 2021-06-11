export const sanitizePhoneNumber = (input) =>
  input.replace(/[^\d]/g, "").slice(-10);

export const formatContact = (input) => {
  const {
    id,
    firstName,
    nickName,
    lastName,
    primaryEmail,
    primaryPhoneNumber,
    secondaryPhoneNumber,
  } = input;

  return {
    id,
    name: [nickName || firstName, lastName].filter((e) => e !== "").join(" "),
    phones: [primaryPhoneNumber, secondaryPhoneNumber]
      .filter((e) => e !== "")
      .map((e) => formatPhoneNumber(e)),
    email: primaryEmail,
    address: formatAddress(input),
  };
};

const formatPhoneNumber = (input) =>
  `(${input.slice(0, 3)}) ${input.slice(3, 6)}-${input.slice(6, 10)}`;

const formatAddress = (input) => {
  const { addressLine1, addressLine2, addressLine3, city, state, zipCode } =
    input;

  // Combine state/zip for proper address format
  const stateZip = [state, zipCode].filter((e) => e !== "").join(" ");

  // Filter and format all address components
  return [addressLine1, addressLine2, addressLine3, city, stateZip]
    .filter((e) => e !== "")
    .join(", ");
};
