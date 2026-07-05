"use client";
import NextLink from "@/components/NextLink";
import HomeIcon from '@mui/icons-material/Home';
import Logout from "@mui/icons-material/Logout";
import Login from "@mui/icons-material/Login";
import { joinSlugParts } from "@/lib/helpers";
import { createContext, startTransition, useActionState, useContext, useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import ResponsiveButton from "@/components/ResponsiveButton";
import { useRouter } from "next/navigation";
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Divider from '@mui/material/Divider';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';

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
  // TODO better logout system needed (this pulls in a lot of unused data)
  const router = useRouter()
  const { data: authData } = authClient.useSession()
  const [_logoutState, dispatchLogout, logoutPending] = useActionState(async () => {
    return await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/")
        }
      },
    })
  }, null)
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
      <Stack spacing={1} direction="row" divider={<Divider orientation="vertical" flexItem />}>
        {menu}
        {authData === null
          ? <ResponsiveButton variant="outlined" startIcon={<Login />} LinkComponent={NextLink} href="/auth/sign-in">Sign-In</ResponsiveButton>
          : <ResponsiveButton variant="outlined" startIcon={<Logout />} onClick={() => startTransition(dispatchLogout)} loading={logoutPending}>Sign-Out</ResponsiveButton>
        }
      </Stack>
    </>
  )
}
