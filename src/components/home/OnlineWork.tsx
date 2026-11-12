import { useMemo, type ReactNode } from "react";
import { formatDistanceToNowStrict } from "date-fns";
import { ArrowUpRight, BookMarked, GitBranch, Github, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { actionClass, externalLinkProps } from "@/lib/ui";
import { profile, projects, type Project } from "@/data/profile";
import { useGithubRepos } from "@/hooks/use-github-repos";
import Reveal from "@/components/common/Reveal";
import SectionHeading from "@/components/common/SectionHeading";

const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  HTML: "#e34c26",
  CSS: "#663399",
  SCSS: "#c6538c",
  Python: "#3572a5",
  Vue: "#41b883",
};

interface RepoView {
  slug: string;
  url: string;
  description: string;
  language?: string;
  stars?: number;
  pushedAt?: string;
}

function SubHeader({ eyebrow, title, action }: { eyebrow: string; title: string; action?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h3 className="mt-2 font-display text-2xl font-bold tracking-tight">{title}</h3>
      </div>
      {action}
    </div>
  );
}

function relativeDate(iso?: string) {
  if (!iso) return null;
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? null : formatDistanceToNowStrict(date, { addSuffix: true });
}

function RepoCard({ repo, loading }: { repo: RepoView; loading: boolean }) {
  const updated = relativeDate(repo.pushedAt);
  return (
    <a
      href={repo.url}
      {...externalLinkProps}
      className="group panel flex h-full flex-col p-5 transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="inline-flex min-w-0 items-center gap-1.5 font-mono text-xs text-muted-foreground">
          <BookMarked className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span className="truncate">{profile.github.username} /</span>
        </p>
        <ArrowUpRight
          className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary"
          aria-hidden="true"
        />
      </div>
      <p className="mt-1 font-display text-lg font-bold text-foreground transition-colors group-hover:text-primary">
        {repo.slug}
      </p>
      <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{repo.description}</p>
      <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 pt-5 text-xs text-muted-foreground">
        {repo.language && (
          <span className="inline-flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className="h-2.5 w-2.5"
              style={{ background: LANGUAGE_COLORS[repo.language] ?? "hsl(var(--muted-foreground))" }}
            />
            {repo.language}
          </span>
        )}
        {loading ? (
          <span aria-hidden="true" className="h-3 w-14 animate-pulse bg-border" />
        ) : (
          typeof repo.stars === "number" && (
            <span className="inline-flex items-center gap-1" aria-label={`${repo.stars} stars`}>
              <Star className="h-3.5 w-3.5" aria-hidden="true" />
              {repo.stars}
            </span>
          )
        )}
        {updated && <span>Updated {updated}</span>}
      </div>
    </a>
  );
}

function MoreOnGithubCard() {
  return (
    <a
      href={profile.github.url}
      {...externalLinkProps}
      className="group flex h-full min-h-[11rem] flex-col justify-between gap-6 border border-dashed border-border p-5 transition-colors hover:border-primary hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Github className="h-6 w-6 text-muted-foreground transition-colors group-hover:text-primary" aria-hidden="true" />
      <div>
        <p className="font-display text-lg font-bold transition-colors group-hover:text-primary">More on GitHub</p>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          Experiments, side projects and everything else I’m building.
        </p>
      </div>
      <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
        @{profile.github.username}
        <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
      </span>
    </a>
  );
}

function ProjectCard({ project }: { project: Project }) {
  const onNpm = project.liveUrl.includes("npmjs.com");
  return (
    <article className="group flex h-full flex-col overflow-hidden border border-border bg-card transition-colors hover:border-primary">
      <a
        href={project.liveUrl}
        {...externalLinkProps}
        tabIndex={-1}
        aria-hidden="true"
        className={cn(
          // grow: when a row is taller than this card, the screenshot absorbs the extra height.
          "relative block grow overflow-hidden border-b border-border bg-surface",
          project.featured ? "aspect-[16/9] lg:aspect-[16/7.6]" : "aspect-[16/10]",
        )}
      >
        <img
          src={project.image}
          alt=""
          width={project.imageWidth}
          height={project.imageHeight}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.04]"
        />
      </a>
      <div className="flex shrink-0 flex-col gap-4 p-5 sm:p-6">
        <h4 className="font-display text-lg font-bold tracking-tight sm:text-xl">
          <a
            href={project.liveUrl}
            {...externalLinkProps}
            className="transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {project.title}
          </a>
        </h4>
        <p className={cn("text-sm leading-relaxed text-muted-foreground", !project.featured && "line-clamp-3")}>
          {project.description}
        </p>
        <ul className="flex flex-wrap gap-2" aria-label="Technologies">
          {project.tags.map((tag) => (
            <li key={tag} className="border border-border bg-surface px-2.5 py-1 text-xs text-muted-foreground">
              {tag}
            </li>
          ))}
        </ul>
        <div className="mt-auto flex flex-wrap gap-x-5 gap-y-2 pt-1 text-sm font-semibold">
          <a
            href={project.liveUrl}
            {...externalLinkProps}
            className="inline-flex items-center gap-1.5 text-primary underline-offset-4 hover:underline"
          >
            {onNpm ? "View on npm" : "Live demo"}
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </a>
          <a
            href={project.repoUrl}
            {...externalLinkProps}
            className="inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground"
          >
            <Github className="h-4 w-4" aria-hidden="true" />
            Source
          </a>
        </div>
      </div>
    </article>
  );
}

export default function OnlineWork() {
  const { data, isLoading, isError } = useGithubRepos(profile.github.username);

  const repos = useMemo<RepoView[]>(
    () =>
      projects.map((project) => {
        const slug = project.repoUrl.split("/").filter(Boolean).pop() ?? project.title;
        const live = data?.find((repo) => repo.name.toLowerCase() === slug.toLowerCase());
        return {
          slug,
          url: live?.html_url ?? project.repoUrl,
          description: live?.description?.trim() || project.description,
          language: live?.language ?? project.fallbackLanguage,
          stars: live?.stargazers_count,
          pushedAt: live?.pushed_at,
        };
      }),
    [data],
  );

  return (
    <>
      <SectionHeading
        id="work-title"
        eyebrow="Elsewhere"
        title="Code on GitHub, products in the wild"
        description="Open-source repositories and shipped projects — proof beyond the résumé."
      />

      <div className="space-y-16">
        <div className="space-y-6">
          <SubHeader
            eyebrow="Code"
            title="Selected repositories"
            action={
              <a href={profile.github.url} {...externalLinkProps} className={actionClass("outline", "sm")}>
                <GitBranch className="h-4 w-4" aria-hidden="true" />
                View GitHub
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </a>
            }
          />
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {repos.map((repo, index) => (
              <Reveal as="li" key={repo.slug} delay={index * 0.05}>
                <RepoCard repo={repo} loading={isLoading} />
              </Reveal>
            ))}
            <Reveal as="li" delay={repos.length * 0.05}>
              <MoreOnGithubCard />
            </Reveal>
          </ul>
          {isError && (
            <p className="text-xs text-muted-foreground">
              Live GitHub stats are unavailable right now — showing saved project details.
            </p>
          )}
        </div>

        <div className="space-y-6">
          <SubHeader eyebrow="Live" title="Shipped projects" />
          <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project, index) => (
              <Reveal
                as="li"
                key={project.title}
                delay={index * 0.05}
                className={cn(project.featured && "sm:col-span-2")}
              >
                <ProjectCard project={project} />
              </Reveal>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
