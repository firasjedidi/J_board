import { authMiddleware, redirectToSignIn } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export default authMiddleware({
  publicRoutes: ["/","/api/webhook"],
  afterAuth(auth, req) {
    if (auth.userId && auth.isPublicRoute) {
      let path = `/selct-org`;
      if (auth.orgId) {
        path = `/organization/${auth.orgId}`;
      }

      const orgSelction = new URL(path, req.url);
      return NextResponse.redirect(orgSelction);
    }
    if (!auth.userId && !auth.isPublicRoute) {
      return redirectToSignIn({ returnBackUrl: req.url });
    }
    if (auth.userId && !auth.orgId && req.nextUrl.pathname !== "/select-org") {
      const orgSelction = new URL("/select-org", req.url);
      return NextResponse.redirect(orgSelction);
    }
  },
});

export const config = {
  // Protects all routes, including api/trpc.
  // See https://clerk.com/docs/references/nextjs/auth-middleware
  // for more information about configuring your Middleware
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
