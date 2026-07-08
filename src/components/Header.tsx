import AppBar, { AppBarProps } from "@mui/material/AppBar";

export default function Header({ children, ...props }: AppBarProps) {
  return (
    <AppBar
      color="default"
      enableColorOnDark
      {...props}
    >{children}</AppBar>
  )
}
