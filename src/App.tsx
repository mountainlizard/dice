import { Dice } from "../lib/components/Dice/Dice";

function App() {
  return (
    <>
      <h1>Dice</h1>
      <div style={{ width: 400, height: 400 }}>
        <Dice
          size={0.2}
          count={6}
          gildedCount={3}
          seed={1}
          disadvantage={false}
          desiredRolls={[6, 6, 6, 6, 6, 6]}
        />
      </div>
    </>
  );
}

export default App;
