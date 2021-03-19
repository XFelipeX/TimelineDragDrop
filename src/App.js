import React from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { COLUMNS } from "./constants";
import "./App.css";
import { styles } from "./styles";
import Column from "./Column";
import { screens } from "./screens";
import MovableItem from "./MovableItem";

// main component to render draggable item, area of drag and other area to drop item
function App() {
  const [items, setItems] = React.useState(screens); // screens objects
  const [interval, setInterval] = React.useState(3600); //time of timeline in seconds

  const moveCardHandler = (dragIndex, hoverIndex) => {
    const dragItem = items[dragIndex];

    if (dragItem) {
      setItems((prevState) => {
        const coppiedStateArray = [...prevState];

        // remove item by "hoverIndex" and put "dragItem" instead
        const prevItem = coppiedStateArray.splice(hoverIndex, 1, dragItem);

        // remove item by "dragIndex" and put "prevItem" instead
        coppiedStateArray.splice(dragIndex, 1, prevItem[0]);

        return coppiedStateArray;
      });
    }
  };

  const returnItemsForColumn = (columnName) => {
    return items
      .filter((item) => item.column === columnName)
      .map((item, index) => (
        <MovableItem
          id={item.id}
          styles={styles.card}
          key={item.id}
          name={item.description}
          item={item}
          items={items}
          currentColumnName={item.column}
          setItems={setItems}
          index={index}
          x={item.x}
          interval={interval}
          setInterval={setInterval}
          moveCardHandler={moveCardHandler}
        />
      ));
  };

  const { SCREEN, TIMELINE } = COLUMNS;

  return (
    <div className="App">
      <DndProvider backend={HTML5Backend}>
        <div style={styles.left}>
          <h1 style={styles.title} style={{ margin: "0 auto",position:"relative",bottom:"200px" }}>
            Timeline
          </h1>
          <Column
            title={TIMELINE}
            styles={styles.timeline}
            items={items}
            setItems={setItems}
            id="timeline"
            interval={interval}
            setInterval={setInterval}
          >
            {returnItemsForColumn(TIMELINE)}
          </Column>
          <div id="testime" style={{position:"absolute",bottom:"300px",left:"400px",fontSize:"30px"}}> horas</div>
        </div>

        <div style={styles.right}>
          <h1 style={styles.title} style={{ margin: "0 auto",position:"absolute",top:"20px" }}>Telas</h1>
          <Column
            title={SCREEN}
            styles={styles.screen}
            items={items}
            interval={interval}
            setItems={setItems}
            id="screen"
          >
            {returnItemsForColumn(SCREEN)}
          </Column>
        </div>
      </DndProvider>
    </div>
  );
}

export default App;
