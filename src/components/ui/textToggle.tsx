import { useState } from "react";

interface TextToggleOption {
  value: string;
  label: string;
}

interface TextToggleProps {
  options?: [TextToggleOption, TextToggleOption];
  backgroundColor?: string;
  toggleColor?: string;
  defaultSelected?: string;
  onChange?: (selected: string) => void;
}

export default function TextToggle({
  options = [
    { value: "long", label: "Long" },
    { value: "short", label: "Short" },
  ],
  backgroundColor = "#E5E5E5",
  toggleColor = "#2D2D2D",
  defaultSelected = "short",
  onChange,
}: TextToggleProps) {
  const [selected, setSelected] = useState(defaultSelected);

  const handleToggle = () => {
    const newSelected =
      selected === options[0].value ? options[1].value : options[0].value;
    setSelected(newSelected);
    onChange?.(newSelected);
  };

  return (
    <>
      <div
        className="relative flex items-center w-full max-w-md h-16 rounded-2xl cursor-pointer transition-all duration-200 group"
        style={{ backgroundColor, padding: "0.5rem" }}
        onClick={handleToggle}
      >
        <div
          className="absolute w-1/2 rounded-2xl transition-transform duration-300 my-2"
          style={{
            backgroundColor: toggleColor,
            height: "calc(100% - 1rem)",
            transform:
              selected === options[0].value
                ? "translateX(0%)"
                : "translateX(calc(100% - 1rem))",
          }}
        />
        <div className="relative z-10 flex max-w-md items-center justify-between w-full">
          {options.map((opt) => (
            <div
              key={opt.value}
              className={`flex-1 text-center text-md font-medium transition-colors ${
                selected === opt.value
                  ? "text-white"
                  : "text-gray-800 group-hover:text-gray-900"
              }`}
            >
              {opt.label}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
