import { fireEvent, render, screen } from "@testing-library/react";
import { CountryNameSuggestionsDropdown } from "@/src/components/CountryNameSuggestionsDropdown";

const countries = ["Germany", "Ghana", "France"];

describe("CountryNameSuggestionsDropdown", () => {
  it("renders nothing when closed or query too short", () => {
    const { rerender } = render(
      <CountryNameSuggestionsDropdown query="" countries={countries} isOpen onSelect={vi.fn()} />,
    );
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();

    rerender(
      <CountryNameSuggestionsDropdown query="   " countries={countries} isOpen onSelect={vi.fn()} />,
    );
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("lists prefix matches and calls onSelect", () => {
    const onSelect = vi.fn();
    render(<CountryNameSuggestionsDropdown query="g" countries={countries} isOpen onSelect={onSelect} />);

    expect(screen.getByRole("listbox", { name: "Country suggestions" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Germany" }));
    expect(onSelect).toHaveBeenCalledWith("Germany");
  });

  it("respects maxItems", () => {
    const many = ["Aa1", "Aa2", "Aa3", "Aa4", "Aa5"];
    render(
      <CountryNameSuggestionsDropdown query="a" countries={many} isOpen maxItems={2} onSelect={vi.fn()} />,
    );
    expect(screen.getAllByRole("option")).toHaveLength(2);
  });
});
