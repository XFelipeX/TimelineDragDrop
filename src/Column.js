import React from "react";
import { useDrop } from "react-dnd";
import { COLUMNS } from "./constants";

const { SCREEN, TIMELINE } = COLUMNS;

// Dropable area
const Column = ({
  children,
  title,
  styles,
  items,
  setItems,
  id,
  interval,
}) => {
  const [itemArrowMove, setItemArrowMove] = React.useState("");

  React.useEffect(() => {
    const timeLine = document.getElementById("timeline");
    const timeLinePosition = timeLine.getBoundingClientRect();
    const left = timeLinePosition.left;
    const right = timeLinePosition.right;

    items.map((items) => {
      if (items.id === itemArrowMove.id) {
        let diferenca = items.x - left;
        let result = diferenca * (interval / right);
        let tempohours = Math.floor(result / 3600);
        let tempomin = Math.floor((result - tempohours * 3600) / 60);
        let temposec = Math.trunc(result % 60);
        console.log(interval, right);
        if (items.column == "timeline") {
          document.querySelector(
            "#testime"
          ).innerHTML = `a ${items.description} tem ${tempohours}:${tempomin}:${temposec}`;
        } else {
          document.querySelector("#testime").innerHTML = "horas";
        }
        // if(itemHover.id != itemArrowMove.id){
        // alert(`essa tela começa exatament as 7:${Math.floor(result / 60)}:${Math.floor(result % 60)}`)
        // }
      }
    });

    const ArrowMoveItem = (event) => {
      items.map((items) => {
        console.log(items.id, itemArrowMove);
        if (items.id === itemArrowMove.id) {
          let intervalAndRight = interval / right;
          let espaceSecond = 1 / intervalAndRight;
          if (event.code === "ArrowRight" && items.column == "timeline") {
            let calcPercent = Math.round((items.width / interval) * 100);
            let calcWidthPx = Math.round(
              (calcPercent * timeLinePosition.width) / 100
            );
            console.log("calc", espaceSecond);
            if (items.x + calcWidthPx < right) {
              moveBox(items.id, items.x + espaceSecond);
              document.querySelector("#testime").innerHTML = "horas";
            } else {
              alert("você chegou ao limite");
            }
          }
          if (event.code === "ArrowLeft" && items.column == "timeline") {
            if (items.x > left) {
              moveBox(items.id, items.x - parseFloat(espaceSecond));
              document.querySelector("#testime").innerHTML = "horas";
            } else {
              alert("você chegou ao limite");
            }
          }
        }
      });
    };
    document.addEventListener("keydown", ArrowMoveItem);
    return () => document.removeEventListener("keydown", ArrowMoveItem);
  }, [items]);

  const [{ isOver, canDrop }, drop] = useDrop({
    accept: "Our first type",
    collect: (monitor) => ({
      isOver: !!monitor.isOver({ shallow: true }),
      canDrop: !!monitor.canDrop(),
    }),

    hover(item, monitor) {
      document.querySelector("#testime").innerHTML = "horas";
      const timeLine = document.getElementById("timeline");
      const timeLinePosition = timeLine.getBoundingClientRect();
      const left = timeLinePosition.left;
      const right = timeLinePosition.right;
      let diferenca = monitor.getSourceClientOffset().x - left;
      let result = diferenca * (interval / right);
      let tempohours = Math.floor(result / 3600);
      let tempomin = Math.floor((result - tempohours * 3600) / 60);
      let temposec = Math.trunc(result % 60);

      if (monitor.getSourceClientOffset().x <= right) {
        document.querySelector(
          "#testime"
        ).innerHTML = `a ${item.name} começa ${tempohours}:${tempomin}:${temposec}`;
      }
    },

    drop(item, monitor) {
      setItemArrowMove(item);
      if (item) {
        const delta = monitor.getSourceClientOffset();
        let specifyX = -1;

        let canChangeX = true;

        if (item.column === SCREEN) {
          const { canMove, position } = verifySpace(item);

          canChangeX = canMove;

          if (position !== -1) {
            specifyX = position;
          }
        }

        if (delta && canChangeX) {
          let x = 0;

          if (specifyX !== -1) {
            x = specifyX;
          } else {
            x = Math.round(delta.x);
          }

          const timeLine = document.getElementById("timeline");

          const timeLinePosition = timeLine.getBoundingClientRect();

          const canChangePosition = verifyColision(
            x,
            item,
            timeLinePosition.right
          );

          if (canChangePosition) {
            alert("movendo x");
            const left = timeLinePosition.left;
            const right = timeLinePosition.right;

            const calcPercentItem = calcPercent(item.width, interval);

            const calcWidthPxItem = secondsToPixels(
              calcPercentItem,
              timeLinePosition.width
            );

            if (x > left && x + calcWidthPxItem < right) {
              const copyArray = items.filter(
                (item) => item.column === TIMELINE
              );

              if (copyArray.length === 0) {
                x = 0;
              } else {
                x = x - timeLinePosition.x;
              }

              alert(`alterando eixo x do elemento para ${x}`);
              moveBox(item.id, x);
            } else {
              if (x + calcWidthPxItem > right || x < left) {
                return;
              }

              const copyArray = items.filter(
                (item) => item.column === TIMELINE
              );

              if (copyArray.length === 0) {
                x = 0;
              } else {
                x = x - timeLinePosition.x;
              }

              alert(`alterando eixo x do elemento para ${x}`);
              moveBox(item.id, x);
            }
          }
        } else {
          alert("não pode mover x");
        }
      }

      return { name: title };
    },
  });

  function verifyColision(position, item) {
    let canMove = true;

    const timeLineSpaceTotal = document
      .getElementById("timeline")
      .getBoundingClientRect().width;

    items.map((itemf) => {
      let positionElement = document
        .getElementById(itemf.id)
        .getBoundingClientRect();
      const calcPercentNewItem = calcPercent(item.width, interval);

      const calcWidthPxNewItem = secondsToPixels(
        calcPercentNewItem,
        timeLineSpaceTotal
      );

      if (
        (position > positionElement.left &&
          position < positionElement.right &&
          item.id !== itemf.id) ||
        (position + calcWidthPxNewItem > positionElement.left &&
          position < positionElement.right &&
          item.id !== itemf.id)
      ) {
        canMove = false;
      }
    });

    return canMove;
  }

  function verifySpace(item) {
    let response = { canMove: false, position: -1 };

    const timeLineSpaceTotal = document
      .getElementById("timeline")
      .getBoundingClientRect().width;
    const timeLineLimit = document
      .getElementById("timeline")
      .getBoundingClientRect().right;

    let timeTotalItems = 0;
    items.map((item) => {
      if (item.column) {
        timeTotalItems += item.width;
      }
    });

    const totalItemsPercent = calcPercent(timeTotalItems, interval);

    const totalItemsPx = secondsToPixels(totalItemsPercent, timeLineSpaceTotal);

    const calcPercentNewItem = calcPercent(item.width, interval);

    const calcWidthPxNewItem = secondsToPixels(
      calcPercentNewItem,
      timeLineSpaceTotal
    );

    const spaceAvailable = totalItemsPx - calcWidthPxNewItem;

    if (calcWidthPxNewItem <= spaceAvailable) {
      let lastItem = { x: 0 };

      items.forEach((itemf) => {
        if (itemf.column === TIMELINE) {
          if (itemf.x >= lastItem.x) {
            lastItem = itemf;
          }
        }
      });

      if (lastItem && lastItem.id) {
        const positionLastItem = document
          .getElementById(lastItem.id)
          .getBoundingClientRect();

        if (positionLastItem.right + calcWidthPxNewItem > timeLineLimit) {
          alert("não pode mover, espaco insuficiente");

          response.canMove = false;
          response.position = -1;
          return response;
        } else {
          alert("especifico x");

          response.position = positionLastItem.right;
        }
      }

      response.canMove = true;
      return response;
    }

    response.position = -1;
    response.canMove = false;
    return response;
  }

  const moveBox = (id, left) => {
    const copyArray = [...items];

    copyArray.map((item) => {
      if (+item.id === +id) {
        item.x = left;
      }
    });

    setItems(copyArray);

    return copyArray;
  };

  const getBackgroundColor = () => {
    if (isOver) {
      if (canDrop) {
        return "rgb(188,251,255)";
      } else if (!canDrop) {
        return "#000";
      }
    } else {
      return "#ddd";
    }
  };

  return (
    <div
      ref={drop}
      style={{ ...styles, backgroundColor: getBackgroundColor() }}
      id={id}
    >
      {children}
    </div>
  );
};

export function secondsToPixels(percent, space) {
  return (percent * space) / 100;
}

export function calcPercent(seconds, interval) {
  return Math.round((seconds / interval) * 100);
}

export default Column;
