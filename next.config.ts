import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /*
   * `next dev` and `next build` share one output directory, so running a build
   * while the dev server is up overwrites the state underneath it: the dev
   * server stops discovering routes and every page except the one already
   * compiled starts returning 404, with nothing wrong in the code.
   *
   * `npm run dev` and `npm run build` keep the normal `.next`. Only
   * `npm run build:check` — the "does this still compile" build — writes
   * somewhere else, so it never disturbs a running dev server.
   *
   * npm exposes the script name as `npm_lifecycle_event`, which avoids both a
   * `cross-env` dependency and inline `VAR=value` syntax that cmd.exe cannot
   * parse. `NEXT_BUILD_DIR` is honoured too, for running the binary directly.
   */
  distDir:
    process.env.NEXT_BUILD_DIR ||
    (process.env.npm_lifecycle_event === "build:check" ? ".next-check" : ".next"),

  images: {
    /*
     * Product and category images come back from the API as ready-to-use
     * Cloudinary URLs, and `next/image` refuses any host that is not listed
     * here.
     *
     * `res.cloudinary.com` is Cloudinary's standard delivery host, but no real
     * response from the API has been inspected yet — if images 500 with
     * "hostname is not configured", read the actual `path` value the API sends
     * and add that host here.
     */
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com", pathname: "/**" },
    ],
  },
};

export default nextConfig;
