import { match, placeholder as _ } from "@core/match";

export function parseGitUser(user: string) {
  const pattern = _`${_("name")} <${_("email")}>`;
  const matched = match(pattern, user);

  const name = matched?.name.trim();
  const email = matched?.email.trim();

  if (!matched || !name || !email) {
    throw new Error(
      `${user} is not a valid format. Expected "Display Name <email@address.com>".`,
    );
  }
  return { name, email };
}
