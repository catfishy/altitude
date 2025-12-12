import { NextResponse, NextRequest } from "next/server";

async function isAuthenticated(request: NextRequest): Promise<boolean> {
  const authHeader = request.headers.get("Authorization");
  const token =
    request.cookies.get("token")?.value ||
    request.cookies.get("__session")?.value ||
    (authHeader && authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null);

  if (!token) return false;

  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!apiKey) return false;

  try {
    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: token }),
      }
    );
    const data = await response.json();
    return !!data.users && data.users.length > 0;
  } catch {
    return false;
  }
}



// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  if (!(await isAuthenticated(request))) {
    // Respond with JSON indicating an error message
    return NextResponse.json(
      { success: false, message: "authentication failed" },
      { status: 401 }
    );
  }
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("X-Custom-Auth-Key", "password12345");

  const url = new URL(request.url);
  const pathname = url.pathname.replace(/^\/tours/, "");
  const targetUrl = `https://tours-fe.andyhorng1.workers.dev${pathname}`;
  console.log("Target URL:", targetUrl);
  console.log("Target headers:", Array.from(requestHeaders.entries()));

  return NextResponse.rewrite(new URL(targetUrl), {
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: "/tours/:function*",
};
