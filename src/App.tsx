import { Suspense, useState } from "react";
import { Dice } from "../lib/components/Dice/Dice";
// import { DiceAlignment } from "../lib/components/DiceAlignment";

function App() {
  const [seed, setSeed] = useState(1);
  return (
    <>
      <h1 style={{ fontFamily: "sans-serif", color: "wheat" }}>Dice</h1>
      <div style={{ width: 600, height: 600, background: "#2e262e" }}>
        <Suspense fallback={null}>
          <Dice
            size={0.1}
            count={9}
            gildedCount={3}
            seed={seed}
            disadvantage={false}
            // desiredRolls={[6, 6, 6, 6, 6, 6]}
          />
          {/* <DiceAlignment /> */}
        </Suspense>
      </div>
      <button onClick={() => setSeed((seed) => seed + 1)}>New roll</button>
    </>
  );
}

export default App;
