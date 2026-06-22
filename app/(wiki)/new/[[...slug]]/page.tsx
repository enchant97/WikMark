import { redirect } from "next/navigation";

export default async function NewWikiPage(props: PageProps<"/new/[[...slug]]">) {
  const { slug } = await props.params
  redirect(`/-/${(slug ?? []).join("/")}`)
}
