import { joinSlugParts } from "@/lib/helpers";
import NewPageModal from "./_ui/NewPageModal";

export default async function WikiNewModal(props: PageProps<"/new/[[...slug]]">) {
  const { slug } = await props.params
  return <NewPageModal parentSlug={joinSlugParts(slug)} />
}
