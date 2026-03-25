import { fireEvent, render, screen } from "@testing-library/react";
import { ChallengeTypeInputBar } from "@/src/components/ChallengeTypeInputBar";

describe("ChallengeTypeInputBar", () => {
  const baseProps = {
    value: "",
    countrySuggestions: ["Germany", "Ghana"],
    roundLabel: "Round 1/10",
    attemptCount: 0,
    isCorrect: false,
    isIncorrect: false,
    onChange: vi.fn(),
    onSelectSuggestion: vi.fn(),
    onSubmit: vi.fn(),
    onSkip: vi.fn(),
  };

  it("submits on form submit", () => {
    const onSubmit = vi.fn();
    render(<ChallengeTypeInputBar {...baseProps} onSubmit={onSubmit} />);
    fireEvent.submit(screen.getByRole("button", { name: "Check" }).closest("form")!);
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("shows suggestions after typing and dismisses after selection", () => {
    const onChange = vi.fn();
    const onSelectSuggestion = vi.fn();
    render(
      <ChallengeTypeInputBar
        {...baseProps}
        value="g"
        onChange={onChange}
        onSelectSuggestion={onSelectSuggestion}
      />,
    );

    expect(screen.getByRole("listbox", { name: "Country suggestions" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Germany" }));
    expect(onSelectSuggestion).toHaveBeenCalledWith("Germany");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("calls onSkip", () => {
    const onSkip = vi.fn();
    render(<ChallengeTypeInputBar {...baseProps} onSkip={onSkip} />);
    fireEvent.click(screen.getByRole("button", { name: "Skip" }));
    expect(onSkip).toHaveBeenCalledTimes(1);
  });
});
