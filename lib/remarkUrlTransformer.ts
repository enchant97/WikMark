import { Node } from "unist"
import { visit } from "unist-util-visit"

interface PluginOptions {
  transformer: (url: string) => string
}

export default function({ transformer }: PluginOptions) {
  function visitor(node: Node) {
    node.url = transformer(node.url)
  }

  function transform(tree: Node) {
    visit(tree, "link", visitor)
    visit(tree, "image", visitor)
  }

  return transform
}
