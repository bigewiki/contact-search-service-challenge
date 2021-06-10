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

  async retrieveNewContact(id) {
    // Get raw result from db
    const {
      firstName,
      nickName,
      lastName,
      primaryEmail,
      primaryPhoneNumber,
      secondaryPhoneNumber,
    } = await this.service.getById(id);

    // Return desired format
    return {
      id,
      name: [firstName, nickName, lastName].filter((e) => e !== "").join(" "),
      phones: [primaryPhoneNumber, secondaryPhoneNumber].filter(
        (e) => e !== ""
      ),
      email: primaryEmail,
    };
  }

  contactCache = [];

  search(query) {
    // Setting up regex expression using query
    const regex = new RegExp(query, "i");

    // Filter contactCache for any matches
    return this.contactCache.filter((contact) =>
      Object.values(contact).some((val) => regex.test(val))
    );
  }
}
