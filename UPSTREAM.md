# UPSTREAM.md — changes worth PRing back to piratewebsite/pirate-at

- **Document (or fix) the public-repo requirement.** The Pirate OAuth
  gateway (piratesocial.app/api/decap/auth) requests `public_repo,user`
  scope, so a PRIVATE site repo can never authenticate — and the failure
  mode is brutal: the GitHub popup flashes and closes with no error, or
  the CMS reports "You don't have access to the repository." Either the
  README should say plainly that site repos must be public, or the
  gateway should offer a `repo`-scope option for private sites.
  (Cost us a debugging round on altermedia.app, 2026-07-24.)
