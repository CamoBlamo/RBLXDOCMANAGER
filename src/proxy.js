import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/workspace(.*)",
]);

const isOwnerOnlyRoute = createRouteMatcher([
  "/dashboard/employee/owner(.*)",
  "/api/owner/users(.*)",
]);

const isEmployeeOnlyRoute = createRouteMatcher([
  "/dashboard/employee(.*)",
]);

function getRoleFromClaims(sessionClaims) {
  const roleValue =
    sessionClaims?.metadata?.role ??
    sessionClaims?.public_metadata?.role ??
    sessionClaims?.publicMetadata?.role ??
    "";

  return String(roleValue).trim().toLowerCase();
}

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) await auth.protect();

  const { sessionClaims } = await auth();
  const role = getRoleFromClaims(sessionClaims);
  const canAccessOwnerRoutes = role === "owner" || role === "admin";
  const canAccessEmployeeRoutes = [
    "employee",
    "supervisor",
    "manager",
    "admin",
    "owner",
  ].includes(role);

  if (isEmployeeOnlyRoute(req) && !canAccessEmployeeRoutes) {
    return Response.redirect(new URL("/dashboard", req.url));
  }

  if (!isOwnerOnlyRoute(req)) return;

  if (canAccessOwnerRoutes) return;

  if (req.nextUrl.pathname.startsWith("/api/")) {
    return new Response("Forbidden", { status: 403 });
  }

  return Response.redirect(new URL("/dashboard", req.url));
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
