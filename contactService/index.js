// Start your code here!
// You should not need to edit any other existing files (other than if you would like to add tests)
// You do not need to import anything as all the necessary data and events will be delivered through
// updates and service, the 2 arguments to the constructor
// Feel free to add files as necessary

export default class {
  constructor(updates, service) {
    // Moving service to a method
    this.service = service;

    // Listening for new contacts and pushing those to the cache
    updates.on("add", async (id) =>
      this.contactCache.push(await this.retrieveNewContact(id))
    );
  }

  contactCache = [];

  formatPhoneNumber(input) {
    // Sanitize the input by removing non digits
    input = input.replace(/[^\d]/g, "");

    // Return per desired format
    return `(${input.slice(0, 3)}) ${input.slice(3, 6)}-${input.slice(6, 10)}`;
  }

  async retrieveNewContact(id) {
    // Get raw result from db
    const {
      firstName,
      nickName,
      lastName,
      primaryEmail,
      primaryPhoneNumber,
      secondaryPhoneNumber,
      addressLine1,
      addressLine2,
      addressLine3,
    } = await this.service.getById(id);

    // Return desired format
    return {
      id,
      name: [firstName, nickName, lastName].filter((e) => e !== "").join(" "),
      phones: [primaryPhoneNumber, secondaryPhoneNumber]
        .filter((e) => e !== "")
        .map((e) => this.formatPhoneNumber(e)),
      email: primaryEmail,
      address: [addressLine1, addressLine2, addressLine3]
        .filter((e) => e !== "")
        .join(", "),
    };
  }

  search(query) {
    // Setting up regex expression using query
    const regex = new RegExp(query, "i");

    // Filter contactCache for any matches
    return this.contactCache.filter((contact) =>
      Object.values(contact).some((val) => regex.test(val))
    );
  }
}
