import { auth } from "@/lib/auth";

import {
  NextResponse,
} from "next/server";

export default auth(
  (req: any) => {
    const { nextUrl } = req;

    const session =
      req.auth;

    const isLoggedIn =
      !!session;

    const role =
      session?.user?.role;

    /*
    |--------------------------------------------------------------------------
    | Public Routes
    |--------------------------------------------------------------------------
    */

    const publicRoutes = [
      "/",
      "/login",
      "/register",
      "/forgot-password",
      "/reset-password",
    ];

    if (
      publicRoutes.includes(
        nextUrl.pathname
      )
    ) {
      return NextResponse.next();
    }

    /*
    |--------------------------------------------------------------------------
    | Admin Routes
    |--------------------------------------------------------------------------
    |
    | ADMIN and EMPLOYEE can access the current staff dashboard.
    |
    */

    if (
      nextUrl.pathname.startsWith(
        "/admin"
      )
    ) {
      if (
        !isLoggedIn ||
        (
          role !== "ADMIN" &&
          role !== "EMPLOYEE"
        )
      ) {
        return NextResponse.rewrite(
          new URL(
            "/not-found",
            nextUrl
          )
        );
      }

      return NextResponse.next();
    }

    /*
    |--------------------------------------------------------------------------
    | Staff Routes
    |--------------------------------------------------------------------------
    |
    | These routes are restricted to ADMIN and EMPLOYEE.
    |
    */

    if (
      nextUrl.pathname.startsWith(
        "/dashboard"
      ) ||
      nextUrl.pathname.startsWith(
        "/reservations"
      ) ||
      nextUrl.pathname.startsWith(
        "/users"
      ) ||
      nextUrl.pathname.startsWith(
        "/visitors"
      ) ||
      nextUrl.pathname.startsWith(
        "/reports"
      ) ||
      nextUrl.pathname.startsWith(
        "/calendar"
      ) ||
      nextUrl.pathname.startsWith(
        "/announcements"
      ) ||
      nextUrl.pathname.startsWith(
        "/settings"
      ) ||
      nextUrl.pathname.startsWith(
        "/profile"
      )
    ) {
      if (
        !isLoggedIn
      ) {
        return NextResponse.redirect(
          new URL(
            "/login",
            nextUrl
          )
        );
      }

      if (
        role !== "ADMIN" &&
        role !== "EMPLOYEE"
      ) {
        return NextResponse.rewrite(
          new URL(
            "/not-found",
            nextUrl
          )
        );
      }

      return NextResponse.next();
    }

    /*
    |--------------------------------------------------------------------------
    | Organizer Routes
    |--------------------------------------------------------------------------
    |
    | ORGANIZER will have a separate dashboard and workflow.
    |
    */

    if (
      nextUrl.pathname.startsWith(
        "/organizer"
      )
    ) {
      if (
        !isLoggedIn
      ) {
        return NextResponse.redirect(
          new URL(
            "/login",
            nextUrl
          )
        );
      }

      if (
        role !== "ORGANIZER"
      ) {
        return NextResponse.rewrite(
          new URL(
            "/not-found",
            nextUrl
          )
        );
      }

      return NextResponse.next();
    }

    /*
    |--------------------------------------------------------------------------
    | User Home Route
    |--------------------------------------------------------------------------
    |
    | USER is the normal tourist account.
    |
    */

    if (
      nextUrl.pathname.startsWith(
        "/user"
      )
    ) {
      if (
        !isLoggedIn
      ) {
        return NextResponse.redirect(
          new URL(
            "/login",
            nextUrl
          )
        );
      }

      if (
        role !== "USER"
      ) {
        return NextResponse.rewrite(
          new URL(
            "/not-found",
            nextUrl
          )
        );
      }

      return NextResponse.next();
    }

    /*
    |--------------------------------------------------------------------------
    | Unknown Routes
    |--------------------------------------------------------------------------
    */

    return NextResponse.next();
  }
);

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};