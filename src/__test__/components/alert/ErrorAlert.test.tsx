import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { ErrorAlert } from "@/components/alert/ErrorAlert";

describe("ErrorAlert", () => {
  it("should render error message when provided", () => {
    render(<ErrorAlert message="Test error message" />);
    expect(screen.getByText("Test error message")).toBeInTheDocument();
  });

  it("should not render when message is empty", () => {
    const { container } = render(<ErrorAlert message="" />);
    expect(container.firstChild).toBeNull();
  });

  it("should not render when message is undefined", () => {
    const { container } = render(<ErrorAlert />);
    expect(container.firstChild).toBeNull();
  });

  it("should apply custom className", () => {
    const { container } = render(
      <ErrorAlert message="Error" className="custom-class" />
    );
    expect(container.firstChild).toHaveClass("custom-class");
  });
});
