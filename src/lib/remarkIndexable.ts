import { visit } from 'unist-util-visit';

/**
 * Transform markdown into a indexable string.
 */
export default function remarkIndexable() {
  const self = this
  self.compiler = function(tree): string {
    const parts: string[] = [];
    visit(tree, (node) => {
      if (node.type === "text") {
        parts.push((node as any).value);
      }
      if (node.type === "image" && (node).alt) {
        parts.push((node).alt as string);
      }
    })
    return parts.join(" ").replace(/\s+/g, " ").trim()
  }
}
