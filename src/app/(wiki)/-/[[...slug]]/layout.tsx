import WikiDrawer from "./_ui/WikiDrawer";
import { joinSlugParts } from "@/lib/helpers";
import { getRelPageTree } from "@/lib/actions";
import Container from '@mui/material/Container';
import { getPageTitle } from "@/lib/search/db";

export default async function WikiLayout(props: LayoutProps<"/-/[[...slug]]">) {
  const { slug } = await props.params
  const fullSlug = joinSlugParts(slug)
  const parentSlug = slug?.slice(undefined, -1) ?? []
  const parentTitle = getPageTitle(joinSlugParts(parentSlug))
  if (parentTitle === undefined) throw new Error("failed to get page title")

  return (
    <WikiDrawer
      parentTitle={parentTitle}
      slugParts={slug ?? []}
      relPageTree={getRelPageTree(fullSlug)}
    >
      <Container>
        {props.children}
      </Container>
    </WikiDrawer>
  )
}
