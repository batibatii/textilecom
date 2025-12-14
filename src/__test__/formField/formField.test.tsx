import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { FormField } from "@/components/form/FormField";
import { FieldError } from "react-hook-form";

describe("FormField Component", () => {
  it("should render label and children", () => {
    render(
      <FormField label="Email">
        <input type="email" placeholder="Enter email" />
      </FormField>
    );

    expect(screen.getByText("Email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter email")).toBeInTheDocument();
  });

  it("should not render error message when error is undefined", () => {
    render(
      <FormField label="Username">
        <input type="text" />
      </FormField>
    );

    const errorMessage = screen.queryByText(/error/i);
    expect(errorMessage).not.toBeInTheDocument();
  });

  it("should render error message when error is provided", () => {
    const error: FieldError = {
      type: "required",
      message: "This field is required",
    };

    render(
      <FormField label="Password" error={error}>
        <input type="password" />
      </FormField>
    );

    expect(screen.getByText("This field is required")).toBeInTheDocument();
  });

  it("should apply custom className to the wrapper div", () => {
    const { container } = render(
      <FormField label="Name" className="custom-wrapper">
        <input type="text" />
      </FormField>
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass("custom-wrapper");
    expect(wrapper).toHaveClass("flex");
    expect(wrapper).toHaveClass("flex-col");
    expect(wrapper).toHaveClass("gap-1");
  });

  it("should render multiple children correctly", () => {
    render(
      <FormField label="Address">
        <input type="text" placeholder="Street" />
        <input type="text" placeholder="City" />
      </FormField>
    );

    expect(screen.getByPlaceholderText("Street")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("City")).toBeInTheDocument();
  });

  it("should have correct structure with label, children, and error", () => {
    const error: FieldError = {
      type: "minLength",
      message: "Must be at least 8 characters",
    };

    const { container } = render(
      <FormField label="Password" error={error}>
        <input type="password" data-testid="password-input" />
      </FormField>
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.tagName).toBe("DIV");
    expect(screen.getByText("Password")).toBeInTheDocument();
    expect(screen.getByTestId("password-input")).toBeInTheDocument();
    expect(
      screen.getByText("Must be at least 8 characters")
    ).toBeInTheDocument();
  });

  it("should apply default empty string className and base classes when not provided", () => {
    const { container } = render(
      <FormField label="Default">
        <input type="text" />
      </FormField>
    );

    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain("flex flex-col gap-1");
  });
});
