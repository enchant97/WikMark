import { Container } from "@mui/material";
import WikiDrawer from "./_ui/WikiDrawer";
import { joinSlugParts } from "@/lib/helpers";
import { getRelPageSlugs } from "@/lib/actions";

export default async function WikiLayout(props: LayoutProps<"/-/[[...slug]]">) {
  const { slug } = await props.params
  const fullSlug = joinSlugParts(slug)

  return (
    <WikiDrawer slugParts={slug ?? []} relPageSlugs={getRelPageSlugs(fullSlug)}>
      <Container>
        {props.children}
      </Container>
    </WikiDrawer>
  )
}
