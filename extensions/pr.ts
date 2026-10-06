/**
 * PR mod — adds a `/pr` command that opens a GitHub pull request.
 *
 * Flow: verify clean tree (warn if dirty) -> push branch -> `gh pr create`
 * with the current branch's commit subjects as the PR body.
 *
 * Install: pi install git:github.com/tkoyama010/pi-mod
 */

import { execSync } from "node:child_process";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

function run(cmd: string, cwd: string): string {
	return execSync(cmd, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
}

export default function (pi: ExtensionAPI) {
	pi.registerCommand("pr", {
		description: "Push the current branch and open a GitHub pull request (usage: /pr [title])",
		handler: async (args, ctx) => {
			if (!ctx.hasUI) return;

			const cwd = process.cwd();

			try {
				run("git rev-parse --is-inside-work-tree", cwd);
			} catch {
				ctx.ui.notify("Not a git repository", "error");
				return;
			}

			let branch: string;
			try {
				branch = run("git branch --show-current", cwd);
				if (!branch || branch === "main" || branch === "master") {
					ctx.ui.notify("Refusing to open a PR from the default branch", "error");
					return;
				}
			} catch {
				ctx.ui.notify("Could not determine current branch", "error");
				return;
			}

			const dirty = run("git status --porcelain", cwd);
			if (dirty && !(await ctx.ui.confirm("Uncommitted changes", "Commit and push pending changes first?"))) {
				ctx.ui.notify("PR cancelled", "info");
				return;
			}

			const commits = run(`git log --format=%s origin/main..HEAD 2>/dev/null || git log -5 --format=%s`, cwd);
			const title = args || commits.split("\n")[0] || branch;

			if (!(await ctx.ui.confirm("Open PR", `Push '${branch}' and open a PR titled:\n${title}`))) {
				ctx.ui.notify("PR cancelled", "info");
				return;
			}

			try {
				if (dirty) run("git add -A && git commit -m " + JSON.stringify(title), cwd);
				run(`git push -u origin ${JSON.stringify(branch)}`, cwd);
				const body = commits.split("\n").map((c) => `- ${c}`).join("\n");
				const url = run(
					`gh pr create --title ${JSON.stringify(title)} --body ${JSON.stringify(body)} --head ${JSON.stringify(branch)}`,
					cwd,
				);
				ctx.ui.notify(`PR opened: ${url}`, "info");
			} catch (e) {
				ctx.ui.notify(`PR failed: ${e instanceof Error ? e.message : String(e)}`, "error");
			}
		},
	});
}
