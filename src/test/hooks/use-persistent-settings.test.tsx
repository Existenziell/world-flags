import { act, renderHook, waitFor } from "@testing-library/react";
import { usePersistentSettings } from "@/src/hooks/usePersistentSettings";

describe("usePersistentSettings", () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.className = "";
  });

  it("loads defaults and persists updates", async () => {
    const { result } = renderHook(() => usePersistentSettings());

    await waitFor(() => expect(result.current.isReady).toBe(true));
    expect(result.current.settings.theme).toBe("dark");

    act(() => {
      result.current.setSettings({
        ...result.current.settings,
        projection: "mercator",
        mapStyle: "satellite",
        theme: "light",
      });
    });

    await waitFor(() => {
      const saved = window.localStorage.getItem("mapSettings");
      expect(saved).not.toBeNull();
      expect(saved).toContain("\"theme\":\"light\"");
    });

    expect(document.documentElement.classList.contains("theme-light")).toBe(true);
  });
});
