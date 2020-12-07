import React from "react";
import {
  CategoryFilter,
  Button,
  ButtonStyle,
  PostQuote,
} from "@bobaboard/ui-components";
import TemporarySegmentedButton from "../thread/TemporarySegmentedButton";
import moment from "moment";
import classnames from "classnames";

const UPDATED_ONLY_DATA = {
  id: "updated_only",
  label: "updated",
};
const ALL_UPDATES_DATA = {
  id: "all_updates",
  label: "all",
};
const OWN_ONLY_DATA = {
  id: "own_only",
  label: "own",
};
const EVERYONE_DATA = {
  id: "everyone",
  label: "everyone",
};

const FeedSidebar: React.FC<FeedSidebarProps> = (props) => {
  return (
    <div className={classnames("feed-sidebar", { open: !!props.open })}>
      <div className="options">
        <h3>Show Threads</h3>
        <div>
          <TemporarySegmentedButton
            options={[
              {
                id: UPDATED_ONLY_DATA.id,
                label: UPDATED_ONLY_DATA.label,
                onClick: () => {
                  props.onOptionsChange({
                    ...props.currentOptions,
                    updatedOnly: true,
                  });
                },
              },
              {
                id: ALL_UPDATES_DATA.id,
                label: ALL_UPDATES_DATA.label,
                onClick: () => {
                  props.onOptionsChange({
                    ...props.currentOptions,
                    updatedOnly: false,
                  });
                },
              },
            ]}
            selected={
              props.currentOptions.updatedOnly
                ? UPDATED_ONLY_DATA.id
                : ALL_UPDATES_DATA.id
            }
          />
        </div>
        <div>
          <TemporarySegmentedButton
            options={[
              {
                id: OWN_ONLY_DATA.id,
                label: OWN_ONLY_DATA.label,
                onClick: () => {
                  props.onOptionsChange({
                    ...props.currentOptions,
                    ownOnly: true,
                  });
                },
              },
              {
                id: EVERYONE_DATA.id,
                label: EVERYONE_DATA.label,
                onClick: () => {
                  props.onOptionsChange({
                    ...props.currentOptions,
                    ownOnly: false,
                  });
                },
              },
            ]}
            selected={
              props.currentOptions.ownOnly ? OWN_ONLY_DATA.id : EVERYONE_DATA.id
            }
          />
        </div>
      </div>
      <style jsx>{`
        .feed-sidebar {
          padding: 10px;
        }
        .options {
          color: white;
          margin-bottom: 10px;
        }
        .views .buttons {
          display: flex;
          justify-content: space-around;
        }
        .category-filters {
          color: white;
        }
        .options div {
          margin-bottom: 15px;
        }
        @media screen and (max-width: 950px) {
          .feed-sidebar:not(.open) {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

export default FeedSidebar;

export interface FeedOptions {
  updatedOnly: boolean;
  ownOnly: boolean;
}
export interface FeedSidebarProps {
  open?: boolean;
  currentOptions: FeedOptions;
  onOptionsChange: (options: FeedOptions) => void;
}
