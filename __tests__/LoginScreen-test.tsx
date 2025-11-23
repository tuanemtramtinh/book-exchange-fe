import React from "react";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import { Alert } from "react-native";

import LoginScreen from "../src/app/auth/login";

const mockPush = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

jest.mock("expo-web-browser", () => ({
  maybeCompleteAuthSession: jest.fn(),
}));

const mockUseAuthRequest = jest.fn();
const mockFetch = jest.fn();

jest.mock("expo-auth-session/providers/google", () => ({
  useAuthRequest: (...args: any[]) => mockUseAuthRequest(...args),
}));

jest.mock("../src/icons/IconGoogle", () => () => null);
jest.mock("../src/icons/IconFacebook", () => () => null);

(global as any).fetch = mockFetch;

describe("<LoginScreen />", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuthRequest.mockReturnValue([{}, null, jest.fn()]);
    mockFetch.mockReset();
  });

  test("hiển thị tiêu đề và mô tả", () => {
    const { getByText } = render(<LoginScreen />);

    expect(getByText("Chào mừng bạn trở lại 👋")).toBeTruthy();
    expect(getByText("Đăng nhập vào tài khoản của bạn")).toBeTruthy();
  });

  test("nhấn các nút mạng xã hội điều hướng đến màn hình phone auth", () => {
    const { getByText } = render(<LoginScreen />);

    fireEvent.press(getByText("Đăng nhập với Google"));
    fireEvent.press(getByText("Đăng nhập với Apple"));
    fireEvent.press(getByText("Đăng nhập với Facebook"));

    expect(mockPush).toHaveBeenCalledTimes(3);
    expect(mockPush).toHaveBeenCalledWith("/auth/phone");
  });

  test("nút google không điều hướng khi chưa có request", () => {
    mockUseAuthRequest.mockReturnValueOnce([null, null, jest.fn()]);

    const { getByText } = render(<LoginScreen />);

    fireEvent.press(getByText("Đăng nhập với Google"));
    expect(mockPush).not.toHaveBeenCalled();
  });

  test("gọi fetch user info và điều hướng khi response thành công", async () => {
    const userPayload = { name: "Tester" };
    mockUseAuthRequest.mockReturnValueOnce([
      {},
      {
        type: "success",
        authentication: { accessToken: "token-123" },
      },
      jest.fn(),
    ]);

    mockFetch.mockResolvedValue({
      json: jest.fn().mockResolvedValue(userPayload),
    });

    render(<LoginScreen />);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        "https://www.googleapis.com/userinfo/v2/me",
        { headers: { Authorization: "Bearer token-123" } }
      );
    });

    expect(mockPush).toHaveBeenCalledWith("/success");
  });

  test("hiển thị alert khi fetch user info thất bại", async () => {
    const alertSpy = jest.spyOn(Alert, "alert").mockImplementation(() => {});
    const consoleSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    mockUseAuthRequest.mockReturnValueOnce([
      {},
      {
        type: "success",
        authentication: { accessToken: "token-error" },
      },
      jest.fn(),
    ]);

    mockFetch.mockRejectedValueOnce(new Error("network"));

    render(<LoginScreen />);

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(
        "Lỗi",
        "Không thể lấy thông tin người dùng"
      );
    });
    expect(consoleSpy).toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalledWith("/success");

    alertSpy.mockRestore();
    consoleSpy.mockRestore();
  });
});
