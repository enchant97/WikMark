import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';

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
