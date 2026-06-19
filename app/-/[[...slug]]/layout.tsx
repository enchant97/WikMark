import WikiDrawer from "./_components/WikiDrawer";
import { joinSlugParts } from "./_lib/helpers";
import { getChildrenBySlug } from "./_lib/data";

export default async function WikiPageLayout(props: LayoutProps<'/-/[[...slug]]'>) {
  const { slug } = await props.params
  const currentSlug = joinSlugParts(slug)
  const relSlugs = await Array.fromAsync(getChildrenBySlug(currentSlug))
  return (
    <WikiDrawer slugParts={slug ?? []} relSlugs={relSlugs} >{props.children}</WikiDrawer>
  )
}
