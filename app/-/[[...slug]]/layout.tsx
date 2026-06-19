import AppDrawer from "@/components/AppDrawer";

export default async function WikiPageLayout(props: LayoutProps<'/-/[[...slug]]'>) {
  const { slug } = await props.params
  return (
    <AppDrawer breadcrumb={slug ?? []} >{props.children}</AppDrawer>
  )
}
