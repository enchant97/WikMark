import { PropsWithChildren } from "react";
import { HeaderMenuProvider } from "@/components/WikiHeader";

export default function WikiLayout(props: PropsWithChildren) {
  return (
    <HeaderMenuProvider>
      {props.children}
    </HeaderMenuProvider>
  )
}
