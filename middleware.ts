import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth({
  callbacks: {
    authorized: ({ token }) => !!token
  },
});

export const config = {
  matcher: ["/add-food/:path*", "/flavor-journal/:path*"]
};
