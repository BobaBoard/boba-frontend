import { Client, getUserSettingsRoute } from "./utils";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";

import { BOBATAN_USER_DATA } from "../server-mocks/data/user";
import UserPage from "pages/users/settings/[[...settingId]]";
import userEvent from "@testing-library/user-event";
import React from "react";

const SETTINGS_ROUTER = getUserSettingsRoute({
  settingSection: "display-data",
});

vi.mock("components/hooks/usePreventPageChange");
vi.mock("components/core/useIsChangingRoute");
vi.mock("lib/image-upload", async () => ({
  ...(await vi.importActual("lib/image-upload")),
  uploadImage: vi.fn(({ baseUrl, extension }) =>
    Promise.resolve(`${baseUrl}image${extension}`)
  ),
}));
describe("UserSettings", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });
  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });
  it("renders username and avatar", async () => {
    render(
      <Client router={SETTINGS_ROUTER}>
        <UserPage />
      </Client>
    );

    await waitFor(() => {
      expect(screen.getByText(BOBATAN_USER_DATA.username)).toBeVisible();
      expect(screen.getByLabelText("Your current avatar")).toHaveStyle(
        `background-image: url(${BOBATAN_USER_DATA.avatar_url})`
      );
      expect(
        within(document.querySelector("header")!)
          .getByLabelText("User menu")
          .querySelector(`[src*="${BOBATAN_USER_DATA.avatar_url}"]`)
      ).toBeVisible();
    });
  });
  it("edits username and avatar", async () => {
    render(
      <Client router={SETTINGS_ROUTER}>
        <UserPage />
      </Client>
    );

    fireEvent.click(screen.getByText("Edit information"));
    await waitFor(() => {
      expect(screen.getByText("Cancel")).toBeVisible();
      expect(screen.getByText("Save")).toBeVisible();
      expect(screen.getByLabelText("Your new username")).toHaveValue(
        BOBATAN_USER_DATA.username
      );
      expect(
        screen
          .getByLabelText("Your new avatar")
          .querySelector(`[src*="${BOBATAN_USER_DATA.avatar_url}"]`)
      ).toBeVisible();
      expect(screen.getByText("Upload new")).toBeVisible();
    });

    fireEvent.change(screen.getByLabelText("Your new username"), {
      target: { value: "Dark Boba-tan" },
    });
    await waitFor(() => {
      expect(screen.getByLabelText("Your new username")).toHaveValue(
        "Dark Boba-tan"
      );
    });

    const input = screen.getByLabelText("Upload new avatar");
    userEvent.upload(
      input,
      new File(["darkBobatanAvatar"], "dark-bobatan.png", { type: "image/png" })
    );

    act(() => {
      // Make upload work
      vi.advanceTimersByTime(1000);
    });

    await waitFor(() => {
      expect(
        screen
          .getByLabelText("Your new avatar")
          .querySelector(
            `[src*="data:image/png;base64,${btoa("darkBobatanAvatar")}"]`
          )
      ).toBeVisible();
    });

    fireEvent.click(screen.getByText("Save"));
    await waitFor(() => {
      expect(screen.getByText("Dark Boba-tan")).toBeVisible();
      expect(screen.getByLabelText("Your current avatar")).toHaveStyle(
        `background-image: url('images/users/avatar/image.jpeg')`
      );
      expect(
        within(document.querySelector("header")!)
          .getByLabelText("User menu")
          .querySelector(`[src*="images/users/avatar/image.jpeg"]`)
      ).toBeVisible();
    });
  });
});
