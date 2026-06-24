import { getPageAssets } from "@/lib/actions"
import { joinSlugParts } from "@/lib/helpers"
import AssetsModal from "./_ui/AssetsModal"

export default async function WikiAssetsModal(props: PageProps<"/assets/[[...slug]]">) {
  const { slug } = await props.params
  const fullSlug = joinSlugParts(slug)
  const pageAssets = () => getPageAssets(fullSlug)
  return <AssetsModal fullSlug={fullSlug} assets={pageAssets()} />
}
