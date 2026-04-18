import { Outlet, Link, createRootRoute, Scripts } from "@tanstack/react-router";

import "../styles.css";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  ssr: false,
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "IGH Tour — Premium Umrah Bintang 5 Calculator & Manifest" },
      {
        name: "description",
        content:
          "Platform resmi IGH Tour untuk kelola paket Umrah premium Bintang 5: tiered pricing calculator, manifest jamaah, dan PDF quotation otomatis.",
      },
      { name: "author", content: "IGH Tour" },
      { property: "og:title", content: "IGH Tour Admin Platform" },
      {
        property: "og:description",
        content:
          "Pilihanmu untuk menjelajah Timur Tengah. Calculator LA, manifest jamaah, dan quotation PDF dalam satu dashboard premium.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@IGHTour" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head suppressHydrationWarning>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>IGH Tour — Premium Umrah Bintang 5 Calculator & Manifest</title>
        <meta
          name="description"
          content="Platform resmi IGH Tour untuk kelola paket Umrah premium Bintang 5: tiered pricing calculator, manifest jamaah, dan PDF quotation otomatis."
        />
        {import.meta.env.DEV ? (
          <script src="/__replco/static/devtools/injected.js" suppressHydrationWarning />
        ) : null}
      </head>
      <body suppressHydrationWarning>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return <Outlet />;
}
