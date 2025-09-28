const ROOT_URL =
  process.env.NEXT_PUBLIC_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'http://localhost:3000');

/**
 * MiniApp configuration object. Must follow the Farcaster MiniApp specification.
 *
 * @see {@link https://miniapps.farcaster.xyz/docs/guides/publishing}
 */
export const minikitConfig = {
  accountAssociation: {
    header: "",
    payload: "",
    signature: ""
  },
  miniapp: {
    version: "1",
    name: "Pirate vs Octopus", 
    subtitle: "Epic Pirate Adventure", 
    description: "Join the pirate crew and battle the legendary octopus! Test your fishing skills in this exciting pirate adventure game.",
    screenshotUrls: [`${ROOT_URL}/screenshot-portrait.png`],
    iconUrl: `${ROOT_URL}/fisherman-icon.png`,
    splashImageUrl: `${ROOT_URL}/fishing-hero.png`,
    splashBackgroundColor: "#0066cc",
    homeUrl: ROOT_URL,
    webhookUrl: `${ROOT_URL}/api/webhook`,
    primaryCategory: "games",
    tags: ["pirate", "fishing", "arcade", "octopus", "battle", "mini-game", "adventure", "treasure"],
    heroImageUrl: `${ROOT_URL}/fishing-hero.png`, 
    tagline: "The ultimate pirate adventure awaits!",
    ogTitle: "Pirate vs Octopus - Epic Pirate Adventure",
    ogDescription: "Join the pirate crew and battle the legendary octopus in this exciting adventure game!",
    ogImageUrl: `${ROOT_URL}/fishing-hero.png`,
  },
} as const;

