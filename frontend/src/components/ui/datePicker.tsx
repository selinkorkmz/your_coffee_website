import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";

export function DatePicker({selected, setSelected}: {selected: Date | undefined, setSelected: (date: Date) => void}) {

  return (
    <DayPicker
      required
      mode="single"
      selected={selected}
      onSelect={setSelected}
    />
  );
}