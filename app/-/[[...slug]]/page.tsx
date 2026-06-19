import AppDrawer from "@/components/AppDrawer";

export default async function WikiPage(props: PageProps<'/-/[[...slug]]'>) {
  const { slug } = await props.params
  return (
    <AppDrawer breadcrumb={slug ?? []}>
      <h1>Wiki Page</h1>
    </AppDrawer>
  );
}
