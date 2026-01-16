import { auth0 } from "@/lib/auth0";
import NavbarClient from "./NavbarClient";

export async function Navbar() {
  // Get Auth0 session on the server
  const session = await auth0.getSession();

  const auth0User = session?.user ? {
    name: session.user.name || "User",
    email: session.user.email || "",
    picture: session.user.picture || null,
  } : null;

  return <NavbarClient auth0User={auth0User} />;
}
