import { Skeleton, Typography } from "@mui/material"

export default function RenderedPageLoading() {
  return (
    <>
      <Typography variant="h1">
        <Skeleton />
      </Typography>
      <Skeleton />
      <Skeleton />
      <Skeleton />
    </>
  )
}
