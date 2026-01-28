import * as esbuild from "esbuild";

async function build() {
  // Build client with Vite
  const { execSync } = await import("child_process");
  console.log("Building client...");
  execSync("npx vite build", { stdio: "inherit", cwd: process.cwd() });

  // Build server with esbuild
  console.log("Building server...");
  await esbuild.build({
    entryPoints: ["server/index.ts"],
    bundle: true,
    platform: "node",
    target: "node20",
    outfile: "dist/index.cjs",
    format: "cjs",
    external: ["pg-native"],
  });

  console.log("Build complete!");
}

build().catch(console.error);
