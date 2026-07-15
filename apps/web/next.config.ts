import type { NextConfig } from 'next';

/**
 * Web is a projection viewer.
 * Allowed workspace packages: ontology types (transitive), resume, (future) portfolio, conversation types.
 * Do NOT add: compiler, retriever, embedding, graph-store, llm.
 */
const nextConfig: NextConfig = {
  transpilePackages: ['@career-os/resume', '@career-os/ontology'],
  eslint: {
    // Workspace eslint-config-next can conflict with root typescript-eslint; lint via `npm run lint` later.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
