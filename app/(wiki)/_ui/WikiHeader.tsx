"use client"
import { Breadcrumbs, Link } from "@mui/material";
import NextLink from "@/components/NextLink";
import HomeIcon from '@mui/icons-material/Home';
import { joinSlugParts } from "@/lib/helpers";
import { createContext, useContext, useEffect, useState } from "react";

interface HeaderMenuContextType {
  menu: React.ReactNode | null
  setMenu: (v: React.ReactNode | null) => unknown
}

const HeaderMenuContext = createContext<HeaderMenuContextType | null>(null)

export function useHeaderMenu() {
  const context = useContext(HeaderMenuContext);
  if (!context) {
    throw new Error(
      "useHeader must be used within HeaderMenuProvider"
    );
  }
  return context;
}

export function HeaderMenu({
  children,
}: {
  children: React.ReactNode;
}) {
  const { setMenu } = useHeaderMenu();

  useEffect(() => {
    setMenu(children);

    return () => {
      setMenu(null);
    };
  }, [children, setMenu]);

  return null;
}

export function HeaderMenuProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [menu, setMenu] = useState<React.ReactNode>(null);

  return (
    <HeaderMenuContext.Provider value={{ menu, setMenu }}>
      {children}
    </HeaderMenuContext.Provider>
  );
}

export default function WikiHeader(props: { breadcrumb: string[] }) {
  const { menu } = useHeaderMenu()
  return (
    <>
      <Breadcrumbs
        aria-label="breadcrumb"
        sx={{
          flexGrow: 1,
          overflowX: "auto",
          "& ol": { flexWrap: 'nowrap' },
          "& li": { whiteSpace: "nowrap" },
        }}>
        {/* TODO add aria-current="page" support and primary text color */}
        <Link
          color="inherit"
          underline="hover"
          component={NextLink}
          href="/-"
          sx={{ display: 'flex', alignItems: 'center' }}
        ><HomeIcon fontSize="inherit" />
        </Link>
        {props.breadcrumb.map((crumb, i) => {
          const joinedCrumb = joinSlugParts(props.breadcrumb.slice(0, i + 1))
          return (
            <Link
              key={joinedCrumb}
              color="inherit"
              underline="hover"
              component={NextLink}
              href={`/-/${joinedCrumb}`}
            >{crumb}</Link>
          )
        })}
      </Breadcrumbs>
      {menu}
    </>
  )
}
