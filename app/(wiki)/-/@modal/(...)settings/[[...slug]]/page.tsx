import { slugPartsBase, joinSlugParts } from "@/lib/helpers";
import SettingsPageModal from "./_ui/SettingsPageModal";
import { getPageContentParts } from "@/lib/data/page";

export default async function WikiSettingsModal(props: PageProps<"/settings/[[...slug]]">) {
  const { slug } = await props.params
  const fullSlug = joinSlugParts(slug)
  const pageParts = await getPageContentParts(fullSlug)
  return <SettingsPageModal fullSlug={fullSlug} title={pageParts.metadata?.title ?? slugPartsBase(slug)} />
}
