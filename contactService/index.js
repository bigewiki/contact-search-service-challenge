// Start your code here!
// You should not need to edit any other existing files (other than if you would like to add tests)
// You do not need to import anything as all the necessary data and events will be delivered through
// updates and service, the 2 arguments to the constructor
// Feel free to add files as necessary

export default class {
  // NOTE: I've over-commented so reviewers can more easily follow the code

  constructor(updates, service) {
    // initialize the contactCache
    this.contactCache = [];

    // Listening for new contacts and push those to the cache
    updates.on("add", async (id) => {
      const res = await service.getById(id);

      this.contactCache.push({
        ...res,
        // Sanitizing phone numbers on contact
        primaryPhoneNumber: this.sanitizePhoneNumber(res.primaryPhoneNumber),
        secondaryPhoneNumber: this.sanitizePhoneNumber(
          res.secondaryPhoneNumber
        ),
      });
    });

    // Listening for changes and update the cache
    updates.on("change", (id, key, value) => {
      const index = this.contactCache.findIndex((contact) => contact.id === id);
      this.contactCache[index][key] = value;
    });

    // Listening for removals then splicing those out of the contact cache
    updates.on("remove", (id) => {
      const index = this.contactCache.findIndex((contact) => contact.id === id);
      this.contactCache.splice(index, 1);
    });
  }

  sanitizePhoneNumber(input) {
    return input.replace(/[^\d]/g, "").slice(-10);
  }

  formatPhoneNumber(input) {
    return `(${input.slice(0, 3)}) ${input.slice(3, 6)}-${input.slice(6, 10)}`;
  }

  formatAddress(input) {
    const { addressLine1, addressLine2, addressLine3, city, state, zipCode } =
      input;

    // Combine state/zip for proper address format
    const stateZip = [state, zipCode].filter((e) => e !== "").join(" ");

    // Filter and format all address components
    return [addressLine1, addressLine2, addressLine3, city, stateZip]
      .filter((e) => e !== "")
      .join(", ");
  }

  formatContact(input) {
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
        .map((e) => this.formatPhoneNumber(e)),
      email: primaryEmail,
      address: this.formatAddress(input),
    };
  }

  search(query) {
    let regex = new RegExp(query, "i");

    return (
      this.contactCache
        .filter((contact) => {
          // Validate against simple string matches first
          if (
            [
              "firstName",
              "lastName",
              "nickName",
              "primaryEmail",
              "secondaryEmail",
            ].some((e) => e !== "" && regex.test(contact[e]))
          )
            return true;

          // Phone number should be sanitized to ignore special characters
          const sanitized = this.sanitizePhoneNumber(query);

          if (
            // Verify the query input is a number
            !isNaN(parseInt(sanitized)) &&
            // Check the phone numbers against the sanitized query
            ["primaryPhoneNumber", "secondaryPhoneNumber"].some(
              (e) => contact[e] !== "" && new RegExp(sanitized).test(contact[e])
            )
          )
            return true;

          // Check against name combinations
          if (
            [
              `${contact.firstName} ${contact.lastName}`,
              `${contact.nickName} ${contact.lastName}`,
            ].some((e) => regex.test(e))
          )
            return true;
        })
        // format the output
        .map((contact) => this.formatContact(contact))
    );
  }
}
