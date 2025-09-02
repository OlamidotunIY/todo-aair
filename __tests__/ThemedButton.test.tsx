import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { ThemedButton } from "@/components/ThemedButton";

describe("ThemedButton", () => {
  it("renders with title", () => {
    const { getByText } = render(<ThemedButton title="Click Me" onPress={() => {}} />);
    expect(getByText("Click Me")).toBeTruthy();
  });

  it("calls onPress when pressed", () => {
    const onPressMock = jest.fn();
    const { getByText } = render(<ThemedButton title="Press" onPress={onPressMock} />);
    fireEvent.press(getByText("Press"));
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });

  it("applies filled variant styles", () => {
    const { getByText } = render(<ThemedButton title="Filled" variant="filled" onPress={() => {}} />);
    expect(getByText("Filled").props.style).toEqual(expect.arrayContaining([expect.objectContaining({ color: "#fff" })]));
  });
});
