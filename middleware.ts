// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";
// import { createServerClient } from "@supabase/ssr";

// export async function middleware(req: NextRequest) {
//   const res = NextResponse.next();

//   const supabase = createServerClient(
//     process.env.NEXT_PUBLIC_SUPABASE_URL!,
//     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
//     {
//       cookies: {
//         getAll() {
//           return req.cookies.getAll();
//         },
//         setAll(cookiesToSet) {
//           cookiesToSet.forEach(({ name, value, options }) =>
//             res.cookies.set({ name, value, ...options })
//           );
//         },
//       },
//     }
//   );

//   const { data: { session } } = await supabase.auth.getSession();

//   // only protect admin group
//   if (!session && req.nextUrl.pathname.startsWith("/")) {
//     const url = req.nextUrl.clone();
//     url.pathname = "/login";
//     return NextResponse.redirect(url);
//   }

//   return res;
// }

// export const config = {
//   matcher: ["/((admin).*)"], // we’ll tighten later if needed
// };


import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const { pathname } = req.nextUrl;

  // ✅ Public/auth routes that should NOT be protected
  const publicRoutes = ["/login", "/forgot-password", "/update-password"];

  // ✅ Skip Next internals + public routes
  if (
    publicRoutes.some((p) => pathname.startsWith(p)) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/favicon.ico")
  ) {
    return res;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            res.cookies.set({ name, value, ...options })
          );
        },
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // ❌ not logged in → go login
  if (!session) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return res;
}

// ✅ Match everything (no regex groups)
export const config = {
  matcher: ["/:path*"],
};
