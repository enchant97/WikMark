import { Button, Typography, ButtonProps } from "@mui/material"

export default function ResponsiveButton(props: ButtonProps) {
  return (
    <Button
      sx={{ "& .MuiButton-startIcon": { margin: { xs: 0, sm: 0 }, marginRight: { md: 1 } } }}
      startIcon={props.startIcon}
      {...props}
    >
      <Typography
        sx={{ display: { xs: "none", sm: "none", md: "block" } }}
        variant={"button"}
      >{props.children}
      </Typography>
    </Button>
  )
}
