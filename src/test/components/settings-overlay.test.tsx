import { fireEvent, render, screen } from "@testing-library/react";
import { DEFAULT_MAP_SETTINGS } from "@/src/constants";
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
});
