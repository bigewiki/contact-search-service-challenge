// Start your code here!
// You should not need to edit any other existing files (other than if you would like to add tests)
// You do not need to import anything as all the necessary data and events will be delivered through
// updates and service, the 2 arguments to the constructor
// Feel free to add files as necessary
import { sanitizePhoneNumber, formatContact } from "../utilities/helpers";

export default class {
  // NOTE: I've over-commented so reviewers can more easily follow the code

  constructor(updates, service) {
    // Listen for new contacts and push those to the cache
    updates.on("add", async (id) => {
      const res = await service.getById(id);

      this.contactCache.push({
        ...res,
        // Sanitize phone numbers on contact
        primaryPhoneNumber: sanitizePhoneNumber(res.primaryPhoneNumber),
        secondaryPhoneNumber: sanitizePhoneNumber(res.secondaryPhoneNumber),
      });
    });

    // Listen for changes and update the cache
    updates.on("change", (id, key, value) => {
      const index = this.contactCache.findIndex((contact) => contact.id === id);
      this.contactCache[index][key] = value;
    });

    // Listen for removals then splicing those out of the contact cache
    updates.on("remove", (id) => {
      const index = this.contactCache.findIndex((contact) => contact.id === id);
      this.contactCache.splice(index, 1);
    });
  }

  contactCache = [];

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
          const sanitized = sanitizePhoneNumber(query);

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
        // Format the output
        .map((contact) => formatContact(contact))
    );
  }
}
