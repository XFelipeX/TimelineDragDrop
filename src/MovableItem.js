import React, { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { COLUMNS } from './constants';
import { calcPercent, secondsToPixels } from './Column';
const { TIMELINE } = COLUMNS;

const MovableItem = ({
  name,
  index,
  currentColumnName,
  moveCardHandler,
  setItems,
  item,
  x,
  id,
  items,
  interval,
}) => {
  // Change item for column timeline or screen
  const changeItemColumn = (currentItem, columnName) => {
    setItems((prevState) => {
      return prevState.map((e) => {
        return {
          ...e,
          column: e.id === item.id ? columnName : e.column,
        };
      });
    });
  };

  const [{ isDragging }, drag] = useDrag({
    item: { index, name, currentColumnName, type: 'Our first type', ...item },
    end: (item, monitor) => {
      const dropResult = monitor.getDropResult();
      if (dropResult) {
        const { name } = dropResult;
        const { TIMELINE, SCREEN } = COLUMNS;

        let canChangeColumn = true;

        let lastItem = { x: 0 };

        items.forEach((itemf) => {
          if (itemf.column === TIMELINE) {
            const positionLastItem = document
              .getElementById(itemf.id)
              .getBoundingClientRect();
            if (positionLastItem.right > lastItem.x) {
              lastItem = itemf;
            }
          }
        });

        if (lastItem && lastItem.id && item.column === SCREEN) {
          const positionLastItem = document
            .getElementById(lastItem.id)
            .getBoundingClientRect();
          const timelineLimit = document
            .getElementById('timeline')
            .getBoundingClientRect().right;
          const timelineWidth = document
            .getElementById('timeline')
            .getBoundingClientRect().width;
          const percentNewItem = calcPercent(item.width, interval);
          const pxNewItem = secondsToPixels(percentNewItem, timelineWidth);

          // Position of new item cant to surpass limit of timeline
          if (
            positionLastItem.right + pxNewItem > timelineLimit &&
            item.id !== lastItem.id
          ) {
            alert('nao pode mover coluna');
            canChangeColumn = false;
          }
        }

        if (canChangeColumn === true) {
          switch (name) {
            case TIMELINE:
              changeItemColumn(item, TIMELINE);
              break;
            case SCREEN:
              changeItemColumn(item, SCREEN);
              break;
            default:
              break;
          }
        }
      }
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const ref = useRef(null);

  const [, drop] = useDrop({
    accept: 'Our first type',
    hover(item, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;
      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }

      // Time to actually perform the action
      moveCardHandler(dragIndex, hoverIndex);
      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex;
    },
  });

  const opacity = isDragging ? 0.4 : 1;

  drag(drop(ref));

  const widthItem = (item.width / interval) * 100;

  return (
    <div
      ref={ref}
      id={id}
      style={
        currentColumnName === TIMELINE
          ? {
              opacity,
              position: ' absolute',
              backgroundColor: item.backColor,
              cursor: 'move',
              color: '#fff',
              width: widthItem + '%',
              height: '100%',
              margin: '0 auto',
              left: `${x}px`,
            }
          : {
              opacity,
              backgroundColor: item.backColor,
              cursor: 'move',
              color: '#fff',
              width: '250px',
              height: '150px',
              margin: '0 auto',
              display: 'flex',
              marginTop: '30px',
            }
      }
    >
      {item.description + ' ' + item.time}
    </div>
  );
};

export default MovableItem;
