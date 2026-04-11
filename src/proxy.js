import { NextResponse } from "next/server";

const protectedPathPattern = /^\/(dashboard|workspace)(?:\/|$)/;

const hasClerkKeys =
  Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) &&
  Boolean(process.env.CLERK_SECRET_KEY);

export const proxy = async (req, event) => {
  // Avoid hard crashes when env vars are missing in a deployment.
  if (!hasClerkKeys) return NextResponse.next();

  const { clerkMiddleware } = await import("@clerk/nextjs/server");
  const protectedProxy = clerkMiddleware(async (auth, request) => {
    if (protectedPathPattern.test(request.nextUrl.pathname)) {
      await auth.protect();
    }
  });

  return protectedProxy(req, event);
};

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpg|jpeg|png|gif|svg|ico|ttf|woff2?|webp)).*)",
    "/(api|trpc)(.*)",
  ],
};
