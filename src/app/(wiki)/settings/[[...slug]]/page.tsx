import { redirect } from "next/navigation";

export default async function SettingsWikiPage(props: PageProps<"/settings/[[...slug]]">) {
  const { slug } = await props.params
  redirect(`/-/${(slug ?? []).join("/")}`)
}
