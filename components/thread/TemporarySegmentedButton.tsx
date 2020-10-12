import {
  Button,
  ButtonStyle,
  // @ts-ignore
} from "@bobaboard/ui-components";
import classnames from "classnames";

const TemporarySegmentedButton = <T extends {}>(
  props: TemporarySegmentedButtonProps<T>
) => {
  return (
    <div className={classnames("segmented-button", {})}>
      {props.options.map((option) => (
        <div className="button" key={"" + option.id}>
          <Button
            theme={
              props.selected == option.id ? ButtonStyle.LIGHT : ButtonStyle.DARK
            }
            onClick={option.onClick}
            updates={option.updates}
          >
            {option.label}
          </Button>
        </div>
      ))}
      <style jsx>{`
        .segmented-button {
          display: flex;
          justify-content: space-evenly;
        }
      `}</style>
    </div>
  );
};

export interface TemporarySegmentedButtonProps<T> {
  options: {
    id: T;
    label: string;
    updates?: number;
    onClick: () => void;
  }[];
  selected: T;
}

export default TemporarySegmentedButton;
