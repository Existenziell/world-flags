import { render, screen } from "@testing-library/react";
import type { ImgHTMLAttributes } from "react";
import { ChallengeSuccessPopup } from "@/src/components/ChallengeSuccessPopup";

vi.mock("next/image", () => ({
  // eslint-disable-next-line @next/next/no-img-element
  default: (props: ImgHTMLAttributes<HTMLImageElement>) => <img {...props} alt={props.alt ?? ""} />,
}));

describe("ChallengeSuccessPopup", () => {
  it("shows score line and optional flag", () => {
    const { rerender } = render(
      <ChallengeSuccessPopup
        score={3}
        completedRounds={2}
        totalRounds={10}
        attemptsForRound={1}
        selectedFlagPath={null}
      />,
    );
    expect(screen.getByText(/Score 3 \| Round 2\/10 \| Tries 1/)).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();

    rerender(
      <ChallengeSuccessPopup
        score={3}
        completedRounds={2}
        totalRounds={10}
        attemptsForRound={1}
        selectedFlagPath="/flags/de.svg"
        selectedFlagName="Germany"
      />,
    );
    expect(screen.getByAltText("Selected flag: Germany")).toBeInTheDocument();
  });
});
