import { ErrorDTO } from "@/lib/errors";
import { Alert } from "@mui/material";

export enum AlertLevel {
  Success = "success",
  Info = "info",
  Warning = "warning",
  Error = "error",
}

export function InlineAlert(props: { message: string, level: AlertLevel }) {
  return (
    <Alert
      variant={"filled"}
      severity={props.level}
    >
      {props.message}
    </Alert>
  )
}
export function InlineSuccessAlert(props: { message: string }) {
  return (
    <Alert
      variant={"filled"}
      severity={AlertLevel.Success}
    >
      {props.message}
    </Alert>
  )
}

export function InlineAppErrorAlert(props: { err: ErrorDTO }) {
  return (
    <InlineAlert
      message={props.err.message}
      level={AlertLevel.Error}
    />
  )
}
