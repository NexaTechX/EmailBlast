import * as React from "react";
import { Input } from "./input";
import { cn } from "@/lib/utils";

interface PhoneInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  countryCode?: string;
  onCountryCodeChange?: (code: string) => void;
}

const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ className, countryCode = "+1", onCountryCodeChange, ...props }, ref) => {
    const handleCountryCodeChange = (
      e: React.ChangeEvent<HTMLSelectElement>,
    ) => {
      if (onCountryCodeChange) {
        onCountryCodeChange(e.target.value);
      }
    };

    return (
      <div className={cn("flex", className)}>
        <select
          className="flex h-10 w-20 rounded-l-md border border-r-0 border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          value={countryCode}
          onChange={handleCountryCodeChange}
        >
          <option value="+1">+1</option>
          <option value="+44">+44</option>
          <option value="+33">+33</option>
          <option value="+49">+49</option>
          <option value="+81">+81</option>
          <option value="+86">+86</option>
          <option value="+91">+91</option>
        </select>
        <Input className="rounded-l-none" type="tel" ref={ref} {...props} />
      </div>
    );
  },
);

PhoneInput.displayName = "PhoneInput";

export { PhoneInput };
