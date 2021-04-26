import React from "react";
import {
  SettingsContainer,
  SettingType,
  toast,
} from "@bobaboard/ui-components";
import debug from "debug";
import { useAuth } from "components/Auth";
import { getUserSettings, updateUserSettings } from "utils/queries/user";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { SettingsType } from "types/Types";
import { useRealmContext } from "contexts/RealmContext";
import { SettingPageIds } from "pages/users/settings/[[...settingId]]";

const log = debug("bobafrontend:settings:Decorations-log");
const error = debug("bobafrontend:settings:Decorations-error");

enum BackgroundSettings {
  FESTIVE_HEADER_BACKGROUND = "FESTIVE_HEADER_BACKGROUND",
  FESTIVE_BOARD_BACKGROUND = "FESTIVE_BOARD_BACKGROUND",
  FESTIVE_THREAD_BACKGROUND = "FESTIVE_THREAD_BACKGROUND",
}

enum CursorSettings {
  FESTIVE_CURSOR = "FESTIVE_CURSOR",
  FESTIVE_CURSOR_TRAIL = "FESTIVE_CURSOR_TRAIL",
}

interface DecorationSettings {
  backgroundSettings: SettingType[];
  cursorSettings: SettingType[];
}

const SETTINGS_QUERY_KEY = "userSettings";

const dataToSettings = (data: SettingsType): DecorationSettings => {
  const { decorations } = data;
  return {
    backgroundSettings: [
      {
        type: "checkbox",
        name: BackgroundSettings.FESTIVE_HEADER_BACKGROUND,
        label: "Festive header background",
        currentValue:
          (decorations.find(
            (setting) =>
              setting.name == BackgroundSettings.FESTIVE_HEADER_BACKGROUND
          )?.value as boolean) || false,
      },
      {
        type: "checkbox",
        name: BackgroundSettings.FESTIVE_BOARD_BACKGROUND,
        label: "Festive board background",
        currentValue:
          (decorations.find(
            (setting) =>
              setting.name == BackgroundSettings.FESTIVE_BOARD_BACKGROUND
          )?.value as boolean) || false,
      },
      {
        type: "checkbox",
        name: BackgroundSettings.FESTIVE_THREAD_BACKGROUND,
        label: "Festive thread background",
        currentValue:
          (decorations.find(
            (setting) =>
              setting.name == BackgroundSettings.FESTIVE_THREAD_BACKGROUND
          )?.value as boolean) || false,
      },
    ],
    cursorSettings: [
      {
        type: "checkbox",
        name: CursorSettings.FESTIVE_CURSOR,
        label: "Festive Cursor",
        currentValue:
          (decorations.find(
            (setting) => setting.name == CursorSettings.FESTIVE_CURSOR
          )?.value as boolean) || false,
      },

      {
        type: "checkbox",
        name: CursorSettings.FESTIVE_CURSOR_TRAIL,
        label: "Festive cursor trail",
        currentValue:
          (decorations.find(
            (setting) => setting.name == CursorSettings.FESTIVE_CURSOR_TRAIL
          )?.value as boolean) || false,
        helperText: "Whether to show the trail following a custom cursor.",
      },
    ],
  };
};

const Decorations = () => {
  const queryClient = useQueryClient();
  const { isLoggedIn } = useAuth();
  const { name: realmId } = useRealmContext();
  const { data } = useQuery<SettingsType, unknown, DecorationSettings>(
    [SETTINGS_QUERY_KEY],
    // @ts-expect-error
    async () => {
      return getUserSettings();
    },
    {
      refetchOnWindowFocus: true,
      enabled: isLoggedIn,
      staleTime: 5 * 60 * 1000,
      select: dataToSettings,
    }
  );

  const { mutate: updateSetting } = useMutation(
    (updatedValue: SettingType) => {
      return updateUserSettings(updatedValue.name, updatedValue.currentValue);
    },
    {
      onMutate: async (updatedValue: SettingType) => {
        await queryClient.cancelQueries("decorationsSettings");
        const previousSettings = queryClient.getQueryData<SettingsType>(
          SETTINGS_QUERY_KEY
        )!;
        const newSettings: SettingsType = {
          decorations: [...previousSettings.decorations],
        };
        const updatedSettingIndex = newSettings.decorations.findIndex(
          (setting) => setting.name == updatedValue.name
        );
        if (updatedSettingIndex === -1) {
          newSettings.decorations.push({
            name: updatedValue.name,
            value: updatedValue.currentValue,
            type: "BOOLEAN",
          });
        } else {
          newSettings.decorations[updatedSettingIndex] = {
            ...newSettings.decorations[updatedSettingIndex],
            value: updatedValue.currentValue,
          };
        }

        queryClient.setQueryData(SETTINGS_QUERY_KEY, () => newSettings);

        return {
          previousSettings,
        };
      },
      onError: (serverError: Error, _, context) => {
        toast.error("Error while updating the settings.");
        error(serverError);
        queryClient.setQueryData(SETTINGS_QUERY_KEY, context?.previousSettings);
      },
      onSuccess: () => {
        toast.success("Setting saved.", {
          autoClose: 1000,
        });
      },
      onSettled: () => {
        queryClient.invalidateQueries(SETTINGS_QUERY_KEY);
        queryClient.invalidateQueries(["realmData", { isLoggedIn, realmId }]);
      },
    }
  );

  if (!data) {
    return null;
  }

  return (
    <>
      <div className="settings-section" id={SettingPageIds.DECORATIONS}>
        <SettingsContainer
          title="Background Settings"
          values={data.backgroundSettings}
          onValueChange={(changedValue) => {
            updateSetting(changedValue);
          }}
        />
      </div>
      <div className="settings-section">
        <SettingsContainer
          title="Cursor Settings"
          values={data.cursorSettings}
          onValueChange={(changedValue) => {
            updateSetting(changedValue);
          }}
        />
      </div>
      <style jsx>{`
        .page {
          width: 80%;
          max-width: 800px;
          color: white;
          margin: 10px auto;
          padding-bottom: 100px;
        }

        h2 {
          margin-top: 50px;
        }

        .user-details {
          width: 100%;
        }

        .description {
          margin-bottom: 30px;
          font-size: large;
        }

        .settings-section + .settings-section {
          margin-top: 20px;
        }
      `}</style>
    </>
  );
};

export default Decorations;
