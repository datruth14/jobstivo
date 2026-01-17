import { withAuth } from "next-auth/middleware";

export default withAuth(
    function proxy(req) {
        // Custom proxy logic can be added here
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token,
        },
    }
);

export const config = {
    matcher: ["/dashboard/:path*"],
};
