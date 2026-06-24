import { joinSlugParts } from "@/lib/helpers";
import { redirect } from "next/navigation";

export default async function WikiAssetsPage(props: PageProps<"/assets/[[...slug]]">) {
  const { slug } = await props.params
  redirect(`/-/${joinSlugParts(slug)}`)
}
