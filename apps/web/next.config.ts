import type { NextConfig } from 'next';

/**
 * Web is primarily a projection viewer.
 * Interview AI (`/api/ask`) is the exception — it orchestrates retrieve → ConversationIR → LLM.
 * Still do NOT import @career-os/compiler here.
 */
const nextConfig: NextConfig = {
  transpilePackages: [
    '@career-os/resume',
    '@career-os/ontology',
    '@career-os/conversation',
    '@career-os/retriever',
    '@career-os/embedding',
    '@career-os/llm',
    '@career-os/graph',
  ],
  serverExternalPackages: [],
  eslint: {
    // Workspace eslint-config-next can conflict with root typescript-eslint; lint via `npm run lint` later.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
