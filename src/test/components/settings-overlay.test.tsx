import { fireEvent, render, screen, within } from "@testing-library/react";
import { DEFAULT_COUNTRY_FILTERS, DEFAULT_MAP_SETTINGS } from "@/src/constants";
import { SettingsOverlay } from "@/src/components/SettingsOverlay";

describe("SettingsOverlay", () => {
  it("renders controls and triggers change/close callbacks", () => {
    const onChange = vi.fn();
    const onClose = vi.fn();

    render(
      <SettingsOverlay
        settings={DEFAULT_MAP_SETTINGS}
        onChange={onChange}
        onClose={onClose}
      />,
    );

    const [projectionSelect] = screen.getAllByRole("combobox");
    fireEvent.change(projectionSelect, { target: { value: "mercator" } });
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        projection: "mercator",
      }),
    );

    fireEvent.click(screen.getByRole("button", { name: "light" }));
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        theme: "light",
      }),
    );

    fireEvent.click(screen.getByLabelText("Close settings overlay"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("shows country filters in explore mode and updates countryFilters", () => {
    const onChange = vi.fn();
    const onClose = vi.fn();

    render(
      <SettingsOverlay
        settings={DEFAULT_MAP_SETTINGS}
        onChange={onChange}
        onClose={onClose}
        showCountryFilters
        exploreMarkerCount={12}
      />,
    );

    expect(screen.getByRole("heading", { name: "Filters (12)" })).toBeInTheDocument();
    expect(screen.getByLabelText("Min population")).toHaveAttribute("step", "10000");
    expect(screen.getByLabelText("Max population")).toHaveAttribute("step", "10000");
    expect(screen.getByRole("button", { name: "Clear all filters" })).toBeDisabled();
    const unGroup = screen.getByRole("group", { name: /UN member/i });
    fireEvent.click(within(unGroup).getByRole("radio", { name: "Yes" }));
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        countryFilters: expect.objectContaining({ unMember: "yes" }),
      }),
    );
  });

  it("Clear resets country filters to defaults", () => {
    const onChange = vi.fn();
    const modified = {
      ...DEFAULT_MAP_SETTINGS,
      countryFilters: { ...DEFAULT_COUNTRY_FILTERS, unMember: "yes" as const, brics: "yes" as const },
    };

    render(
      <SettingsOverlay settings={modified} onChange={onChange} onClose={() => {}} showCountryFilters />,
    );

    expect(screen.getByRole("button", { name: "Clear all filters" })).not.toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Clear all filters" }));
    expect(onChange).toHaveBeenCalledWith({
      ...modified,
      countryFilters: { ...DEFAULT_COUNTRY_FILTERS },
    });
  });

  it("hides country filters when showCountryFilters is false", () => {
    render(
      <SettingsOverlay
        settings={DEFAULT_MAP_SETTINGS}
        onChange={() => {}}
        onClose={() => {}}
        showCountryFilters={false}
      />,
    );
    expect(screen.queryByRole("heading", { name: /^Filters/ })).not.toBeInTheDocument();
  });
});
