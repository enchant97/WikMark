import WikiDrawer from "./_components/WikiDrawer";

export default async function WikiPageLayout(props: LayoutProps<'/-/[[...slug]]'>) {
  const { slug } = await props.params
  return (
    <WikiDrawer breadcrumb={slug ?? []} >{props.children}</WikiDrawer>
  )
}
