import { defineCliConfig } from 'sanity/cli';

export default defineCliConfig({
  api: { projectId: process.env.SANITY_STUDIO_PROJECT_ID || 'YOUR_PROJECT_ID', dataset: 'production' },
  studioHost: 'eatliketheboss', // → https://eatliketheboss.sanity.studio
  deployment: { appId: 'x0ndkmg9en3ek9a3o1n7nf9l' },
});
