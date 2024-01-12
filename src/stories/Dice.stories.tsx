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
      <div className="aspect-square w-full max-w-lg border border-primary">
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof Dice>;

export const Primary: Story = {
  args: {
    size: 0.2,
    count: 6,
    desiredRolls: [1, 2, 3, 4, 5, 6],
    gildedCount: 2,
    seed: 1,
  },
};
