import { useQuery } from "@tanstack/react-query";

export interface GithubRepo {
  name: string;
  html_url: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  pushed_at: string;
  fork: boolean;
}

/** Live repository data (stars, language, last push) from the public GitHub API. */
export function useGithubRepos(username: string) {
  return useQuery({
    queryKey: ["github", "repos", username],
    queryFn: async ({ signal }) => {
      const response = await fetch(
        `https://api.github.com/users/${encodeURIComponent(username)}/repos?per_page=100&sort=pushed`,
        { signal, headers: { Accept: "application/vnd.github+json" } },
      );
      if (!response.ok) throw new Error(`GitHub responded with ${response.status}`);
      return (await response.json()) as GithubRepo[];
    },
    staleTime: 60 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    retry: 0,
  });
}
