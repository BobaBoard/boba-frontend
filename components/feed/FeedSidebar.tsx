import { FeedOptions } from "queries/user-feed";
import React from "react";
import { SegmentedButton } from "@bobaboard/ui-components";
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
      <div>
        <h2>Personal Feed</h2>
        <p>A feed of all the threads you joined on BobaBoard.</p>
      </div>
      <div className="options">
        <h3>Show Threads</h3>
        <div className="button">
          <SegmentedButton
            options={[
              {
                id: UPDATED_ONLY_DATA.id,
                label: UPDATED_ONLY_DATA.label,
                link: {
                  onClick: () => {
                    props.onOptionsChange({
                      ...props.currentOptions,
                      showRead: false,
                    });
                  },
                },
              },
              {
                id: ALL_UPDATES_DATA.id,
                label: ALL_UPDATES_DATA.label,
                link: {
                  onClick: () => {
                    props.onOptionsChange({
                      ...props.currentOptions,
                      showRead: true,
                    });
                  },
                },
              },
            ]}
            selected={
              props.currentOptions.showRead
                ? ALL_UPDATES_DATA.id
                : UPDATED_ONLY_DATA.id
            }
          />
        </div>
        <div className="button">
          <SegmentedButton
            options={[
              {
                id: OWN_ONLY_DATA.id,
                label: OWN_ONLY_DATA.label,
                link: {
                  onClick: () => {
                    props.onOptionsChange({
                      ...props.currentOptions,
                      ownOnly: true,
                    });
                  },
                },
              },
              {
                id: EVERYONE_DATA.id,
                label: EVERYONE_DATA.label,
                link: {
                  onClick: () => {
                    props.onOptionsChange({
                      ...props.currentOptions,
                      ownOnly: false,
                    });
                  },
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
          padding: 10px 20px;
          color: white;
        }
        .options {
          margin-top: 40px;
          margin-bottom: 10px;
        }
        .options h3 {
          text-transform: uppercase;
          font-size: var(--font-size-small);
          letter-spacing: 1px;
        }
        .views .buttons {
          display: flex;
          justify-content: space-around;
        }
        .category-filters {
          color: white;
        }
        .button {
          width: 100%;
          margin: 0 auto;
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

export interface FeedSidebarProps {
  open?: boolean;
  currentOptions: FeedOptions;
  onOptionsChange: (options: FeedOptions) => void;
}
