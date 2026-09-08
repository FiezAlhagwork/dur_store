import { describe, it, expect } from "vitest";
import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import Textarea from "@/components/ui/Textarea";
import { describeFieldContract } from "../../helpers/fieldContract";

describe("Textarea", () => {
  describeFieldContract({
    role: "textbox",
    renderField: (props) => <Textarea {...props} />,
  });

  it("forwards its ref to the underlying textarea", () => {
    const ref = createRef<HTMLTextAreaElement>();
    render(<Textarea label="Description" ref={ref} />);
    expect(ref.current).toBe(screen.getByLabelText("Description"));
  });

  it("defaults to 4 rows and honors an override", () => {
    const { rerender } = render(<Textarea label="Description" />);
    expect(screen.getByLabelText("Description")).toHaveAttribute("rows", "4");

    rerender(<Textarea label="Description" rows={3} />);
    expect(screen.getByLabelText("Description")).toHaveAttribute("rows", "3");
  });
});
