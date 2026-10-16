export default function RadioInput({ name, value, defaultChecked }: {
  name: string,
  value: string,
  defaultChecked: boolean,
}) {
  return (
    <input
      className="inputRadio"
      type="radio"
      name={name}
      value={value}
      defaultChecked={defaultChecked}
      required
    />
  )
}
