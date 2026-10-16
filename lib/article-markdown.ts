import fs from "node:fs";
import path from "node:path";

export type InlineNode =
  | { type: "text"; value: string }
  | { type: "code"; value: string }
  | { type: "math"; value: string }
  | { type: "strong"; children: InlineNode[] }
  | { type: "link"; href: string; children: InlineNode[] };

export type ArticleBlock =
  | { type: "heading"; level: 2 | 3; id: string; text: string }
  | { type: "paragraph"; children: InlineNode[] }
  | { type: "list"; items: InlineNode[][] }
  | { type: "math"; tex: string }
  | { type: "code"; lang: string; code: string }
  | { type: "figure"; key: string; number: number; title: string; continuation: boolean }
  | { type: "quote"; children: InlineNode[][] };

export interface ParsedArticle {
  title: string;
  blocks: ArticleBlock[];
  wordCount: number;
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const INLINE_PATTERN = /(`[^`]+`)|(\$[^$\n]+?\$)|(\*\*[^*]+\*\*)|(\[[^\]]+\]\([^)\s]+\))/g;

export function parseInline(source: string): InlineNode[] {
  const nodes: InlineNode[] = [];
  let lastIndex = 0;

  for (const match of source.matchAll(INLINE_PATTERN)) {
    const index = match.index ?? 0;
    if (index > lastIndex) nodes.push({ type: "text", value: source.slice(lastIndex, index) });

    const token = match[0];
    if (match[1]) {
      nodes.push({ type: "code", value: token.slice(1, -1) });
    } else if (match[2]) {
      nodes.push({ type: "math", value: token.slice(1, -1) });
    } else if (match[3]) {
      nodes.push({ type: "strong", children: parseInline(token.slice(2, -2)) });
    } else {
      const [, label, href] = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(token) ?? [];
      nodes.push({ type: "link", href, children: parseInline(label) });
    }
    lastIndex = index + token.length;
  }

  if (lastIndex < source.length) nodes.push({ type: "text", value: source.slice(lastIndex) });
  return nodes;
}

const FIGURE_PATTERN = /^\*\*\[Figure (\d+) (placeholder|continuation) — (.+)\]\*\*$/;

/**
 * Parses the subset of Markdown used by long-form articles in `content/`.
 * HTML comments hold production notes and are never rendered.
 */
export function parseArticleMarkdown(markdown: string): ParsedArticle {
  const lines = markdown.replace(/<!--[\s\S]*?-->/g, "").replace(/\r\n/g, "\n").split("\n");
  const blocks: ArticleBlock[] = [];
  let title = "";
  let paragraph: string[] = [];
  let wordCount = 0;

  const flushParagraph = () => {
    if (paragraph.length === 0) return;
    const text = paragraph.join(" ");
    wordCount += text.split(/\s+/).filter(Boolean).length;
    blocks.push({ type: "paragraph", children: parseInline(text) });
    paragraph = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed.startsWith("```")) {
      flushParagraph();
      const lang = trimmed.slice(3).trim();
      const code: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        code.push(lines[i]);
        i++;
      }
      blocks.push({ type: "code", lang, code: code.join("\n") });
      continue;
    }

    if (trimmed.startsWith("$$")) {
      flushParagraph();
      const tex: string[] = [];
      if (trimmed.length > 4 && trimmed.endsWith("$$")) {
        tex.push(trimmed.slice(2, -2));
      } else {
        i++;
        while (i < lines.length && lines[i].trim() !== "$$") {
          tex.push(lines[i]);
          i++;
        }
      }
      blocks.push({ type: "math", tex: tex.join("\n").trim() });
      continue;
    }

    if (/^[-*]\s+/.test(trimmed)) {
      flushParagraph();
      const items: InlineNode[][] = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i].trim())) {
        const text = lines[i].trim().replace(/^[-*]\s+/, "");
        wordCount += text.split(/\s+/).filter(Boolean).length;
        items.push(parseInline(text));
        i++;
      }
      i--;
      blocks.push({ type: "list", items });
      continue;
    }

    if (trimmed.startsWith(">")) {
      flushParagraph();
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith(">")) {
        quoteLines.push(lines[i].trim().replace(/^>\s?/, ""));
        i++;
      }
      i--;
      const paragraphs = quoteLines.join("\n").split(/\n\s*\n/).map((p) => p.replace(/\n/g, " ").trim()).filter(Boolean);
      const figure = FIGURE_PATTERN.exec(paragraphs[0] ?? "");
      if (figure) {
        const number = Number(figure[1]);
        const continuation = figure[2] === "continuation";
        blocks.push({
          type: "figure",
          key: continuation ? `figure-${number}-continuation` : `figure-${number}`,
          number,
          title: figure[3],
          continuation,
        });
      } else {
        blocks.push({ type: "quote", children: paragraphs.map(parseInline) });
      }
      continue;
    }

    const heading = /^(#{1,3})\s+(.+)$/.exec(trimmed);
    if (heading) {
      flushParagraph();
      const level = heading[1].length;
      const text = heading[2].trim();
      if (level === 1) {
        title = text;
      } else {
        blocks.push({ type: "heading", level: level as 2 | 3, id: slugify(text), text });
      }
      continue;
    }

    if (trimmed === "") {
      flushParagraph();
      continue;
    }

    paragraph.push(trimmed);
  }

  flushParagraph();
  return { title, blocks, wordCount };
}

export function readArticle(fileName: string) {
  const source = fs.readFileSync(path.join(process.cwd(), "content", fileName), "utf8");
  return parseArticleMarkdown(source);
}
