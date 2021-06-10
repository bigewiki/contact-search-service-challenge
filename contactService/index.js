// Start your code here!
// You should not need to edit any other existing files (other than if you would like to add tests)
// You do not need to import anything as all the necessary data and events will be delivered through
// updates and service, the 2 arguments to the constructor
// Feel free to add files as necessary

export default class {
  constructor(updates, service) {
    // initialize the contactCache
    this.contactCache = [];

    // Listening for new contacts and push those to the cache
    updates.on("add", async (id) =>
      this.contactCache.push(await service.getById(id))
    );
  }

  formatPhoneNumber(input) {
    // Sanitize the input by removing non digits and remove country code
    input = input.replace(/[^\d]/g, "").slice(-10);

    // Return per desired format
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

    // Return desired format
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
    // Setting up regex expression using query
    const regex = new RegExp(query, "i");

    // Filter contactCache for any matches
    return (
      this.contactCache
        .filter((contact) => {
          // Build the search index
          const index = [
            contact.firstName,
            contact.lastName,
            contact.nickName,
            contact.primaryPhoneNumber,
            contact.secondaryPhoneNumber,
            contact.primaryEmail,
            contact.secondaryEmail,
          ];

          return index.some((val) => regex.test(val));
        })
        // format the output
        .map((contact) => this.formatContact(contact))
    );
  }
}
