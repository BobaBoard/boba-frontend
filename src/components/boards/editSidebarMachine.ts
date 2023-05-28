import { createMachine } from "xstate";

export const sidebarEditState = createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5SQJYBcAEsUTAIwEMAnAOgGMAbMAgOwGIBRAEQEkAVAbQAYBdRUAA4B7bGhRCa-EAA9EAWgDsANhJKALACYFATgVqAzFzVGtAGhABPeWoUk9GgIwAOBQFYAvu-OpM2XIVIIFCI0CzoAYQBBADlwhgAZbj4kEGFRcUkU2QQ5bRV9B2M1VycubQNjfXMrBAc6khcuJSUufX0lcqVXJU9vIN8cfGISIJCwgGVIgDUGJKk09AypbIclWwdlB3KHVzbWhWrEHYauJ1dtfTde8H6sQYDyCQAzYIBbDDJaMjAKCIB5aIAMRYACUALJzFILMQSZaIQxcBoODSuQ4IRyuEgaDQtezOK5eG7oO7+YZkZ5vD5fH50ACq0SYf0hghEi1hWXhahIanUZy4qy2TVcOLRdQcDQUTRabQ6PO61x8JKGpEo1HoUViCWZqVZMMyoGyckFJFcXAUTmRqMsiA0ThNbn0alK+m0JR0XU8hJoQlw8BSir8yvmuqWHJyGn0dtN5staKN+kxGk0WzUNmT7QVt0DD1VtGD6XZBvkzi5GzyLitNTkNjsyYrmeJ2eGo1C+bZ+pkiDU4oUhScBjcosxpTOFwJfUb9zJFKI70+NG+FDberhCExXFa2iaKLRGKxOLNdb02l0DYGpNIsAIADdIMvQ0X0do7R1CtvK0cua4SudLh5CQGU4qtSFBUBA96Fp26IKLYHS7LG1oIAiDRbg47S9vWnpAA */
  // Machine identifier
  id: "edit sidebar",
  states: {
    clean: {
      on: {
        EDIT: "dirty",
        CANCEL: "cancelled",
      },
    },

    dirty: {
      on: {
        CANCEL: "confirm cancel",
        SAVE: "saved",
      },
    },

    "confirm cancel": {
      on: {
        UNDO: "dirty",
        CONFIRM: "cancelled",
      },
    },

    saved: {
      type: "final",
    },
    cancelled: {
      type: "final",
    },
  },

  initial: "clean",
});
