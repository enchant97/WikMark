import { Save } from "@mui/icons-material";
import { Badge } from "@mui/material";

export default function SaveIcon(props: { isSaved: boolean }) {
  if (props.isSaved) {
    return <Save />
  }
  return (
    <Badge variant="dot" color="secondary">
      <Save />
    </Badge>
  )
}
