import { AppAuthOptions } from '@octokit/auth-app';

declare module 'github-types' {
  export interface AuthConfig extends AppAuthOptions {
    installationId?: string;
  }

  export interface DependabotPR {
    id: number;
    title: string;
    html_url: string;
    head: {
      repo: {
        name: string;
      };
    };
  }
}
