import createIntlMiddleware from "next-intl/middleware";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "./i18n/routing";

const handleI18nRouting = createIntlMiddleware(routing);

export async function middleware(request: NextRequest) {
  // Step 1: Run next-intl middleware for locale routing
  const response = handleI18nRouting(request);

  // Step 2: Check if this is a protected admin route
  // The rewritten URL after i18n has the locale prefix stripped for matching
  const pathname = request.nextUrl.pathname;
  // Match /<locale>/admin/* but not /<locale>/admin/login, callback, accept-invite
  const localeAdminPattern = /^\/(?:en|it)\/admin(?:\/|$)/;
  const publicAdminPattern =
    /^\/(?:en|it)\/admin\/(login|callback|accept-invite)/;

  const isAdminRoute =
    localeAdminPattern.test(pathname) && !publicAdminPattern.test(pathname);

  if (!isAdminRoute) {
    return response;
  }

  // Step 3: For admin routes, check Supabase auth
  let supabaseResponse = response;

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(
          cookiesToSet: {
            name: string;
            value: string;
            options: CookieOptions;
          }[]
        ) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          // Copy over i18n headers
          response.headers.forEach((val, key) => {
            supabaseResponse.headers.set(key, val);
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Extract locale from pathname
  const localeMatch = pathname.match(/^\/(en|it)\//);
  const locale = localeMatch ? localeMatch[1] : "en";

  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}/admin/login`;
    return NextResponse.redirect(url);
  }

  // Verify user is in admins table
  const { data: admin } = await supabase
    .from("admins")
    .select("id")
    .eq("id", user.id)
    .single();

  if (!admin) {
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}/admin/login`;
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
