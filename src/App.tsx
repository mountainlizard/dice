import { useState } from "react";
import { Dice } from "../lib/components/Dice/Dice";

function App() {
  const [seed, setSeed] = useState(1);
  return (
    <>
      <h1 style={{ fontFamily: "sans-serif", color: "wheat" }}>Dice</h1>
      <div style={{ width: 600, height: 600, background: "#2e262e" }}>
        <Dice
          size={0.15}
          count={9}
          gildedCount={3}
          seed={seed}
          disadvantage={false}
          // desiredRolls={[6, 6, 6, 6, 6, 6]}
        />
      </div>
      <button onClick={() => setSeed((seed) => seed + 1)}>New roll</button>
    </>
  );
}

export default App;
