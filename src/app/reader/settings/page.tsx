import Form from "next/form";
import { getReaderSettings, setReaderSettings } from "@/lib/actions";
import RadioInput from "./_ui/RadioInput";
import SubmitBtn from "./_ui/SubmitBtn";

export default async function SettingsPage() {
  const settings = await getReaderSettings()
  return (
    <>
      <h1>Settings</h1>
      <Form action={setReaderSettings}>
        <fieldset>
          <legend>Font Scale</legend>
          <label className="fontScale-sm">
            <RadioInput name="fontScale" value="sm" defaultChecked={settings.fontScale === "sm"} />
            Small
          </label>
          <label className="fontScale-md">
            <RadioInput name="fontScale" value="md" defaultChecked={settings.fontScale === "md"} />
            Normal
          </label>
          <label className="fontScale-lg">
            <RadioInput name="fontScale" value="lg" defaultChecked={settings.fontScale === "lg"} />
            Large
          </label>
          <label className="fontScale-xl">
            <RadioInput name="fontScale" value="xl" defaultChecked={settings.fontScale === "xl"} />
            Extra Large
          </label>
        </fieldset>
        <fieldset>
          <legend>Text Alignment</legend>
          <label>
            <RadioInput name="textAlign" value="normal" defaultChecked={settings.textAlign === "normal"} />
            Normal
          </label>
          <label>
            <RadioInput name="textAlign" value="justify" defaultChecked={settings.textAlign === "justify"} />
            Justify
          </label>
          <label>
            <RadioInput name="textAlign" value="center" defaultChecked={settings.textAlign === "center"} />
            Center
          </label>
        </fieldset>
        <fieldset>
          <legend>Page Width</legend>
          <label>
            <RadioInput name="maxWidth" value="sm" defaultChecked={settings.maxWidth === "sm"} />
            Narrow
          </label>
          <label>
            <RadioInput name="maxWidth" value="md" defaultChecked={settings.maxWidth === "md"} />
            Normal
          </label>
          <label>
            <RadioInput name="maxWidth" value="lg" defaultChecked={settings.maxWidth === "lg"} />
            Wide
          </label>
          <label>
            <RadioInput name="maxWidth" value="full" defaultChecked={settings.maxWidth === "full"} />
            Full
          </label>
        </fieldset>
        <SubmitBtn />
      </Form>
    </>
  )
}
