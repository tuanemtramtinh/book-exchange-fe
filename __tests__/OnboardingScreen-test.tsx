import React from "react";
import { FlatList } from "react-native";
import {
  render,
  fireEvent,
  waitFor,
  act,
  RenderAPI,
} from "@testing-library/react-native";

import OnboardingScreen from "../src/app/onboarding";
import { storeData } from "../utils/asyncStorage";
import { useRouter } from "expo-router";

jest.mock("../src/app/hooks/useOnboardingGate", () => ({
  useOnboardingGate: () => ({
    markDone: jest.fn(),
  }),
}));

jest.mock("../src/icons/IconOnboarding1", () => () => null);
jest.mock("../src/icons/IconOnboarding2", () => () => null);
jest.mock("../src/icons/IconOnboarding3", () => () => null);

jest.mock("../utils/asyncStorage", () => ({
  storeData: jest.fn(),
}));

jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
}));

const mockRouterReplace = jest.fn();
const mockStoreData = storeData as jest.MockedFunction<typeof storeData>;
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;

const renderOnboarding = () => render(<OnboardingScreen />);

const updateVisibleSlide = (api: RenderAPI, index: number) => {
  const flatList = api.UNSAFE_getByType(FlatList);
  act(() => {
    flatList.props.onViewableItemsChanged?.({
      viewableItems: [{ index }],
    });
  });
};

describe("<OnboardingScreen />", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue({ replace: mockRouterReplace });
    mockStoreData.mockResolvedValue(undefined);
  });

  it("renders the first slide title and description", () => {
    const { getByText } = renderOnboarding();

    expect(getByText("Tìm sách nhanh")).toBeTruthy();
    expect(
      getByText(
        "Tìm và lọc sách theo môn, trạng thái, trường, phạm vi giá,... Hỗ trợ nhanh lẹ trong việc tìm kiếm có kết quả ngay."
      )
    ).toBeTruthy();
  });

  it("navigates and stores onboarding flag when skipping", async () => {
    const { getByText } = renderOnboarding();

    fireEvent.press(getByText("Bỏ qua"));

    await waitFor(() => {
      expect(mockStoreData).toHaveBeenCalledWith("onboarded", "1");
    });
    expect(mockRouterReplace).toHaveBeenCalledWith("/auth/login");
  });

  it("does not touch async storage when going to the next slide", () => {
    const api = renderOnboarding();
    const { getByText } = api;

    fireEvent.press(getByText("Tiếp tục"));
    expect(mockStoreData).not.toHaveBeenCalled();

    updateVisibleSlide(api, 1);
    expect(getByText("Đăng bán trong 1 phút")).toBeTruthy();
  });

  it("stores onboarding flag and navigates when finishing the last slide", async () => {
    const api = renderOnboarding();
    const { getByText } = api;

    updateVisibleSlide(api, 2);

    const doneButton = getByText("Bắt đầu");
    fireEvent.press(doneButton);

    await waitFor(() => {
      expect(mockStoreData).toHaveBeenCalledWith("onboarded", "1");
    });
    expect(mockRouterReplace).toHaveBeenCalledWith("/auth/login");
  });

  it("updates CTA label as slides advance", () => {
    const api = renderOnboarding();
    const { getByText } = api;

    expect(getByText("Tiếp tục")).toBeTruthy();

    updateVisibleSlide(api, 2);
    expect(getByText("Bắt đầu")).toBeTruthy();
  });
});
