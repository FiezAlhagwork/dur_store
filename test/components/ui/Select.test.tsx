import { describe, it, expect } from "vitest";
import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Select from "@/components/ui/Select";
import { describeFieldContract } from "../../helpers/fieldContract";

describe("Select", () => {
  describeFieldContract({
    role: "combobox",
    renderField: (props) => (
      <Select {...props}>
        <option value="">Choose</option>
      </Select>
    ),
  });

  it("forwards its ref to the underlying select", () => {
    const ref = createRef<HTMLSelectElement>();
    render(
      <Select label="Category" ref={ref}>
        <option value="1">Rings</option>
      </Select>,
    );
    expect(ref.current).toBe(screen.getByLabelText("Category"));
  });

  it("renders the options it is given", () => {
    render(
      <Select label="Category">
        <option value="">Choose a category</option>
        <option value="1">Rings</option>
        <option value="2">Necklaces</option>
      </Select>,
    );

    expect(screen.getAllByRole("option")).toHaveLength(3);
    expect(screen.getByRole("option", { name: "Rings" })).toBeInTheDocument();
  });

  it("selects an option by value", async () => {
    const user = userEvent.setup();
    render(
      <Select label="Category" defaultValue="">
        <option value="">Choose a category</option>
        <option value="1">Rings</option>
      </Select>,
    );

    await user.selectOptions(screen.getByLabelText("Category"), "1");
    expect(screen.getByLabelText("Category")).toHaveValue("1");
  });
});
