// Pass props to your component by passing an `args` object to your story
//
// ```tsx
// export const Primary: Story = {
//  args: {
//    propName: propValue
//  }
// }
// ```
//
// See https://storybook.js.org/docs/react/writing-stories/args.

import type { Meta, StoryObj } from "@storybook/react";
import { Dice } from "../../lib/components/Dice/Dice";

const meta: Meta<typeof Dice> = {
  component: Dice,
  decorators: [
    (Story) => (
      <div style={{ width: 600, height: 600, background: "#2e262e" }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof Dice>;

export const Primary: Story = {
  args: {
    size: 0.1,
    diceTypes: [
      "D4",
      "D6",
      "D8",
      "D10",
      "D10x10",
      "D12",
      "D20",
      "D4",
      "D6",
      "D8",
      "D10",
      "D10x10",
      "D12",
      "D20",
    ],
    dieVariants: [
      "Advantage",
      "Advantage",
      "Advantage",
      "Advantage",
      "Advantage",
      "Advantage",
      "Advantage",

      "Disadvantage",
      "Disadvantage",
      "Disadvantage",
      "Disadvantage",
      "Disadvantage",
      "Disadvantage",
      "Disadvantage",
    ],
    seed: 1,
    desiredRolls: [1, 2, 3, 4, 50, 6, 7, 4, 6, 8, 9, 90, 12, 20],
  },
};
