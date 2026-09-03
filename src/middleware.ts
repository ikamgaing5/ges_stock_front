import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes publiques ne nécessitant pas d'authentification
const ROUTES_PUBLIQUES = [
  "/connexion",
  "/inscription",
  "/mot-de-passe-oublie",
  "/merci",
  "/faq",
  "/confidentialite",
  "/conditions",
  "/mentions-legales",
];

const CLE_TOKEN = "gestion-stock-token";
const CLE_RETOUR = "gestion-stock-dernier-chemin";

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Ignorer les fichiers statiques, images et API interne Next.js
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get(CLE_TOKEN)?.value;
  const cheminComplet = pathname + search;

  const estRoutePublique =
    ROUTES_PUBLIQUES.some(
      (route) => pathname === route || pathname.startsWith(`${route}/`),
    ) || pathname.startsWith("/invitations/");

  // 1. Accès à la page de connexion
  if (pathname === "/connexion") {
    // Si l'utilisateur est déjà connecté avec un token valide
    if (token) {
      const retourParam = request.nextUrl.searchParams.get("retour");
      const dernierChemin = request.cookies.get(CLE_RETOUR)?.value;
      const destination = retourParam || dernierChemin || "/";

      if (
        destination &&
        destination.startsWith("/") &&
        !destination.startsWith("/connexion") &&
        !destination.startsWith("/inscription")
      ) {
        return NextResponse.redirect(new URL(destination, request.url));
      }

      return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
  }

  // 2. Accès à une route protégée de l'application
  if (!estRoutePublique) {
    // Si l'utilisateur n'a pas de token actif
    if (!token) {
      const urlConnexion = new URL("/connexion", request.url);
      urlConnexion.searchParams.set("retour", cheminComplet);

      const reponse = NextResponse.redirect(urlConnexion);
      reponse.cookies.set(CLE_RETOUR, cheminComplet, {
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 jours
        sameSite: "lax",
      });

      return reponse;
    }

    // Mémoriser la dernière page active pour restauration automatique en cas de reconnexion
    const reponse = NextResponse.next();
    reponse.cookies.set(CLE_RETOUR, cheminComplet, {
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 jours
      sameSite: "lax",
    });

    return reponse;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
