import React, { Component } from "react";
import Node from "./Node/Node";
import "./Home.css";
import Menubar from "./menubar";
import {randomMaze} from "../algorithms/randomMaze";
import {recursiveDivisionMaze} from "../algorithms/recursiveDivision";
import {verticalMaze} from "../algorithms/verticalMaze";
import {horizontalMaze} from "../algorithms/horizontalMaze";
import {astar, getNodesInShortestPathOrder } from "../algorithms/astar";
import {bidirectionalGreedySearch, getNodesInShortestPathOrderBidirectionalGreedySearch} from "../algorithms/bidirectionalGreedySearch";
import {breadthFirstSearch, getNodesInShortestPathOrderBFS} from "../algorithms/breadthFirstSearch";
import {depthFirstSearch, getNodesInShortestPathOrderDFS} from "../algorithms/depthFirstSearch";
import {dijkstra, getNodesInShortestPathOrderDijkstra} from "../algorithms/dijkstra";
import {greedyBFS, getNodesInShortestPathOrderGreedyBFS} from "../algorithms/greedyBestFirstSearch";

const initNum = getInitialRowsCols(window.innerWidth, window.innerHeight);
const initialNumRows = initNum[0];
const initialNumColumns = initNum[1];
const startFinishNode = getStartFinishNode(initialNumRows, initialNumColumns);
const startNodeRow = startFinishNode[0];
const startNodeCol = startFinishNode[1];
const finishNodeRow = startFinishNode[2];
const finishNodeCol = startFinishNode[3];

class Home extends Component {
  state = {
    grid: [],
    mouseIsPressed: false,
    visualizingAlgorithm: false,
    generatingMaze: false,
    width: window.innerWidth,
    height: window.innerHeight,
    numRows: initialNumRows,
    numColumns: initialNumColumns,
    speed: 10,
    mazeSpeed: 10,
  };

  animateAlgorithm = (visitedNodesInOrder, nodesInShortestPathOrder) => {
    let newGrid = this.state.grid.slice();
    for (let row of newGrid) {
      for (let node of row) {
        let newNode = {
          ...node,
          isVisited: false,
        };
        newGrid[node.row][node.col] = newNode;
      }
    }
    this.setState({ grid: newGrid });
    for (let i = 1; i <= visitedNodesInOrder.length; i++) {
      let node = visitedNodesInOrder[i];
      if (i === visitedNodesInOrder.length) {
        setTimeout(() => {
          this.animateShortestPath(
            nodesInShortestPathOrder,
            visitedNodesInOrder
          );
        }, i * this.state.speed);
        return;
      }
      setTimeout(() => {
        //visited node
        document.getElementById(`node-${node.row}-${node.col}`).className =
          "node node-visited";
      }, i * this.state.speed);
    }
  };

  animateBidirectionalAlgorithm(visitedNodesInOrderStart, visitedNodesInOrderFinish, nodesInShortestPathOrder, isShortestPath) {
    let len = Math.max(
      visitedNodesInOrderStart.length,
      visitedNodesInOrderFinish.length
    );

    for (let i = 1; i <= len; i++) {
      let nodeA = visitedNodesInOrderStart[i];
      let nodeB = visitedNodesInOrderFinish[i];
      if (i === visitedNodesInOrderStart.length) {
        setTimeout(() => {
          let visitedNodesInOrder = getVisitedNodesInOrder(
            visitedNodesInOrderStart,
            visitedNodesInOrderFinish
          );
          
          if (isShortestPath) {
            this.animateShortestPath(
              nodesInShortestPathOrder,
              visitedNodesInOrder
            );
          } 
          else this.setState({ visualizingAlgorithm: false });
        }, i * this.state.speed);
        return;
      }
      setTimeout(() => {
        if (nodeA !== undefined)
          document.getElementById(`node-${nodeA.row}-${nodeA.col}`).className =
            "node node-visited";
        if (nodeB !== undefined)
          document.getElementById(`node-${nodeB.row}-${nodeB.col}`).className =
            "node node-visited";
      }, i * this.state.speed);
    }
  }

  animateMaze = (walls) => {
    for (let i = 0; i <= walls.length; i++) {
      if (i === walls.length) {
        setTimeout(() => {
          this.clearGrid();
          let newGrid = getNewGridWithMaze(this.state.grid, walls);
          this.setState({ grid: newGrid, generatingMaze: false });
        }, i * this.state.mazeSpeed);
        return;
      }
      let wall = walls[i];
      let node = this.state.grid[wall[0]][wall[1]];
      setTimeout(() => {
        //Walls
        document.getElementById(`node-${node.row}-${node.col}`).className =
          "node node-wall-animated";
      }, i * this.state.mazeSpeed);
    }
  };

  animateShortestPath = (nodesInShortestPathOrder, visitedNodesInOrder) => {
    if (nodesInShortestPathOrder.length === 1) this.setState({ visualizingAlgorithm: false });
    for (let i = 1; i < nodesInShortestPathOrder.length; i++) {
      if (i === nodesInShortestPathOrder.length - 1) {
        setTimeout(() => {
          let newGrid = updateNodesForRender(
            this.state.grid,
            nodesInShortestPathOrder,
            visitedNodesInOrder
          );
          this.setState({ grid: newGrid, visualizingAlgorithm: false });
        }, i * (3 * this.state.speed));
        return;
      }
      let node = nodesInShortestPathOrder[i];
      setTimeout(() => {
        document.getElementById(`node-${node.row}-${node.col}`).className =
          "node node-shortest-path";
      }, i * (3 * this.state.speed));
    }
  };

  clearGrid() {
    if (this.state.visualizingAlgorithm || this.state.generatingMaze) {
      return;
    }
    for (let row = 0; row < this.state.grid.length; row++) {
      for (let col = 0; col < this.state.grid[0].length; col++) {
        if (!((row === startNodeRow && col === startNodeCol) || (row === finishNodeRow && col === finishNodeCol))) {
          document.getElementById(`node-${row}-${col}`).className = "node";
        }
      }
    }
    const newGrid = getInitialGrid(this.state.numRows, this.state.numColumns);
    this.setState({
      grid: newGrid,
      visualizingAlgorithm: false,
      generatingMaze: false,
    });
  }

  clearPath() {
    if (this.state.visualizingAlgorithm || this.state.generatingMaze) {
      return;
    }
    for (let row = 0; row < this.state.grid.length; row++) {
      for (let col = 0; col < this.state.grid[0].length; col++) {
        if (
          document.getElementById(`node-${row}-${col}`).className ===
          "node node-shortest-path"
        ) {
          document.getElementById(`node-${row}-${col}`).className = "node";
        }
      }
    }
    const newGrid = getGridWithoutPath(this.state.grid);
    this.setState({
      grid: newGrid,
      visualizingAlgorithm: false,
      generatingMaze: false,
    });
  }


  componentDidMount() {
    window.addEventListener("resize", this.updateDimensions);
    const grid = getInitialGrid(this.state.numRows, this.state.numColumns);
    this.setState({ grid });
  }


  generateRandomMaze() {
    if (this.state.visualizingAlgorithm || this.state.generatingMaze) {
      return;
    }
    this.setState({ generatingMaze: true });
    setTimeout(() => {
      const { grid } = this.state;
      const startNode = grid[startNodeRow][startNodeCol];
      const finishNode = grid[finishNodeRow][finishNodeCol];
      const walls = randomMaze(grid, startNode, finishNode);
      this.animateMaze(walls);
    }, this.state.mazeSpeed);
  }

  generateRecursiveDivisionMaze() {
    if (this.state.visualizingAlgorithm || this.state.generatingMaze) {
      return;
    }
    this.setState({ generatingMaze: true });
    setTimeout(() => {
      const { grid } = this.state;
      const startNode = grid[startNodeRow][startNodeCol];
      const finishNode = grid[finishNodeRow][finishNodeCol];
      const walls = recursiveDivisionMaze(grid, startNode, finishNode);
      this.animateMaze(walls);
    }, this.state.mazeSpeed);
  }

  generateVerticalMaze() {
    if (this.state.visualizingAlgorithm || this.state.generatingMaze) {
      return;
    }
    this.setState({ generatingMaze: true });
    setTimeout(() => {
      const { grid } = this.state;
      const startNode = grid[startNodeRow][startNodeCol];
      const finishNode = grid[finishNodeRow][finishNodeCol];
      const walls = verticalMaze(grid, startNode, finishNode);
      this.animateMaze(walls);
    }, this.state.mazeSpeed);
  }

  generateHorizontalMaze() {
    if (this.state.visualizingAlgorithm || this.state.generatingMaze) {
      return;
    }
    this.setState({ generatingMaze: true });
    setTimeout(() => {
      const { grid } = this.state;
      const startNode = grid[startNodeRow][startNodeCol];
      const finishNode = grid[finishNodeRow][finishNodeCol];
      const walls = horizontalMaze(grid, startNode, finishNode);
      this.animateMaze(walls);
    }, this.state.mazeSpeed);
  }

  handleMouseUp() {
    this.setState({ mouseIsPressed: false });
  }

  handleMouseDown(row, col) {
    const newGrid = getNewGridWithWalls(this.state.grid, row, col);
    this.setState({ grid: newGrid, mouseIsPressed: true });
  }

  handleMouseEnter(row, col) {
    if (this.state.mouseIsPressed) {
      const newGrid = getNewGridWithWalls(this.state.grid, row, col);
      this.setState({ grid: newGrid, mouseIsPressed: true });
    }
  }

  updateDimensions = () => {
    this.setState({
      width: window.innerWidth,
      height: window.innerHeight,
    });
  };

  updateSpeed = (path, maze) => {
    this.setState({ speed: path, mazeSpeed: maze });
  };

  visualizeAStar() {
    if (this.state.visualizingAlgorithm || this.state.generatingMaze) {
      return;
    }
    this.setState({ visualizingAlgorithm: true });
    setTimeout(() => {
      const { grid } = this.state;
      const startNode = grid[startNodeRow][startNodeCol];
      const finishNode = grid[finishNodeRow][finishNodeCol];
      const visitedNodesInOrder = astar(grid, startNode, finishNode);
      const nodesInShortestPathOrder =
        getNodesInShortestPathOrder(finishNode);
      this.animateAlgorithm(visitedNodesInOrder, nodesInShortestPathOrder);
    }, this.state.speed);
  }

  visualizeDijkstra() {
    if (this.state.visualizingAlgorithm || this.state.generatingMaze) {
      return;
    }
    this.setState({ visualizingAlgorithm: true });
    setTimeout(() => {
      const { grid } = this.state;
      const startNode = grid[startNodeRow][startNodeCol];
      const finishNode = grid[finishNodeRow][finishNodeCol];
      const visitedNodesInOrder = dijkstra(grid, startNode, finishNode);
      const nodesInShortestPathOrder =
        getNodesInShortestPathOrderDijkstra(finishNode);
      this.animateAlgorithm(visitedNodesInOrder, nodesInShortestPathOrder);
    }, this.state.speed);
  }

  
  visualizeBidirectionalGreedySearch() {
    if (this.state.visualizingAlgorithm || this.state.generatingMaze) {
      return;
    }
    this.setState({ visualizingAlgorithm: true });
    setTimeout(() => {
      const { grid } = this.state;
      const startNode = grid[startNodeRow][startNodeCol];
      const finishNode = grid[finishNodeRow][finishNodeCol];
      const visitedNodesInOrder = bidirectionalGreedySearch(
        grid,
        startNode,
        finishNode
      );
      const visitedNodesInOrderStart = visitedNodesInOrder[0];
      const visitedNodesInOrderFinish = visitedNodesInOrder[1];
      const isShortestPath = visitedNodesInOrder[2];
      const nodesInShortestPathOrder = getNodesInShortestPathOrderBidirectionalGreedySearch(
        visitedNodesInOrderStart[visitedNodesInOrderStart.length - 1],
        visitedNodesInOrderFinish[visitedNodesInOrderFinish.length - 1]
      );
      this.animateBidirectionalAlgorithm(
        visitedNodesInOrderStart,
        visitedNodesInOrderFinish,
        nodesInShortestPathOrder,
        isShortestPath
      );
    }, this.state.speed);
  }

  visualizeBFS() {
    if (this.state.visualizingAlgorithm || this.state.generatingMaze) {
      return;
    }
    this.setState({ visualizingAlgorithm: true });
    setTimeout(() => {
      const { grid } = this.state;
      const startNode = grid[startNodeRow][startNodeCol];
      const finishNode = grid[finishNodeRow][finishNodeCol];
      const visitedNodesInOrder = breadthFirstSearch(
        grid,
        startNode,
        finishNode
      );
      const nodesInShortestPathOrder = getNodesInShortestPathOrderBFS(
        finishNode
      );
      this.animateAlgorithm(visitedNodesInOrder, nodesInShortestPathOrder);
    }, this.state.speed);
  }

  visualizeGreedyBFS() {
    if (this.state.visualizingAlgorithm || this.state.generatingMaze) {
      return;
    }
    this.setState({ visualizingAlgorithm: true });
    setTimeout(() => {
      const { grid } = this.state;
      const startNode = grid[startNodeRow][startNodeCol];
      const finishNode = grid[finishNodeRow][finishNodeCol];
      const visitedNodesInOrder = greedyBFS(grid, startNode, finishNode);
      const nodesInShortestPathOrder = getNodesInShortestPathOrderGreedyBFS(
        finishNode
      );
      this.animateAlgorithm(visitedNodesInOrder, nodesInShortestPathOrder);
    }, this.state.speed);
  }

  visualizeDFS() {
    if (this.state.visualizingAlgorithm || this.state.generatingMaze) {
      return;
    }
    this.setState({ visualizingAlgorithm: true });
    setTimeout(() => {
      const { grid } = this.state;
      const startNode = grid[startNodeRow][startNodeCol];
      const finishNode = grid[finishNodeRow][finishNodeCol];
      const visitedNodesInOrder = depthFirstSearch(grid, startNode, finishNode);
      const nodesInShortestPathOrder = getNodesInShortestPathOrderDFS(
        finishNode
      );
      this.animateAlgorithm(visitedNodesInOrder, nodesInShortestPathOrder);
    }, this.state.speed);
  }

  render() {
    let { grid } = this.state;
    return (
      <React.Fragment>
        <Menubar
          visualizingAlgorithm={this.state.visualizingAlgorithm}
          generatingMaze={this.state.generatingMaze}
          visualizeAStar={this.visualizeAStar.bind(this)}
          visualizeBidirectionalGreedySearch={this.visualizeBidirectionalGreedySearch.bind(
            this
          )}
          visualizeDijkstra={this.visualizeDijkstra.bind(this)}
          visualizeBFS={this.visualizeBFS.bind(this)}
          visualizeDFS={this.visualizeDFS.bind(this)}
          visualizeGreedyBFS={this.visualizeGreedyBFS.bind(this)}
         
          generateRandomMaze={this.generateRandomMaze.bind(this)}
          generateRecursiveDivisionMaze={this.generateRecursiveDivisionMaze.bind(this)}
          generateVerticalMaze={this.generateVerticalMaze.bind(this)}
          generateHorizontalMaze={this.generateHorizontalMaze.bind(this)}
          clearGrid={this.clearGrid.bind(this)}
          clearPath={this.clearPath.bind(this)}
          updateSpeed={this.updateSpeed.bind(this)}
        />
        <div
          className={
            this.state.visualizingAlgorithm || this.state.generatingMaze
              ? "grid-visualizing"
              : "grid"
          }
        >
          {grid.map((row, rowId) => {
            return (
              <div key={rowId}>
                {row.map((node, nodeId) => {
                  const {
                    row,
                    col,
                    isStart,
                    isFinish,
                    isVisited,
                    isShortest,
                    isWall,
                  } = node;
                  return (
                    <Node
                      key={nodeId}
                      row={row}
                      col={col}
                      isStart={isStart}
                      isFinish={isFinish}
                      isVisited={isVisited}
                      isShortest={isShortest}
                      isWall={isWall}
                      onMouseDown={(row, col) => this.handleMouseDown(row, col)}
                      onMouseEnter={(row, col) =>
                        this.handleMouseEnter(row, col)
                      }
                      onMouseUp={() => this.handleMouseUp()}
                      width={this.state.width}
                      height={this.state.height}
                      numRows={this.state.numRows}
                      numColumns={this.state.numColumns}
                    ></Node>
                  );
                })}
              </div>
            );
          })}
        </div>
      </React.Fragment>
    );
  }
}

function getInitialRowsCols(width, height) {
  let numColumns;
  if (width > 1500) numColumns = Math.floor(width / 25);
  else if (width > 1249) numColumns = Math.floor(width / 22.5);
  else if (width > 999) numColumns = Math.floor(width / 20);
  else if (width > 749) numColumns = Math.floor(width / 17.5);
  else if (width > 499) numColumns = Math.floor(width / 15);
  else if (width > 249) numColumns = Math.floor(width / 12.5);
  else if (width > 0) numColumns = Math.floor(width / 10);
  let cellWidth = Math.floor(width / numColumns);
  let numRows = Math.floor(height / cellWidth);
  return [numRows, numColumns];
}

function getRandNumbers(seed) {
  let randomNumsList = [];
  let randomNumsList1 = [];
  let factor = 2;

  for (let i = 5; i < seed / 2; i += 2) {
    randomNumsList.push(factor);
    factor += 2;
  }
  
  factor = -2;
  for (let i = seed / 2; i < seed - 5; i += 2) {
    randomNumsList1.push(factor);
    factor -= 2;
  }

  return [randomNumsList, randomNumsList1];
}

function getStartFinishNode(numRows, numCols) {
  let randomNums;
  let rowNode, colNode;
  let startNodeRow, startNodeCol;
  let finishNodeRow, finishNodeCol;

  if (numRows < numCols) {
    randomNums = getRandNumbers(numRows);
    rowNode = Math.floor(numRows / 2);
    colNode = Math.floor(numCols / 4);
    if (rowNode % 2 !== 0) rowNode -= 1;
    if (colNode % 2 !== 0) colNode += 1;
    startNodeRow = rowNode + randomNums[1][Math.floor(Math.random() * randomNums[1].length)];
    startNodeCol = colNode + [-6, -4, -2, 0][Math.floor(Math.random() * 4)];
    finishNodeRow = rowNode + randomNums[0][Math.floor(Math.random() * randomNums[0].length)];
    finishNodeCol = numCols - colNode + [0, 2, 4, 6][Math.floor(Math.random() * 4)];
  } 
  
  else {
    randomNums = getRandNumbers(numCols);
    rowNode = Math.floor(numRows / 4);
    colNode = Math.floor(numCols / 2);
    if (rowNode % 2 !== 0) rowNode -= 1;
    if (colNode % 2 !== 0) colNode += 1;
    startNodeRow = rowNode + [-6, -4, -2, 0][Math.floor(Math.random() * 4)];
    startNodeCol = colNode + randomNums[1][Math.floor(Math.random() * randomNums[1].length)];
    finishNodeRow = numRows - rowNode + [0, 2, 4, 6][Math.floor(Math.random() * 4)];
    finishNodeCol =
      colNode + randomNums[0][Math.floor(Math.random() * randomNums[0].length)];
  }
  return [startNodeRow, startNodeCol, finishNodeRow, finishNodeCol];
}

const getInitialGrid = (numRows, numColumns) => {
  let grid = [];
  for (let row = 0; row < numRows; row++) {
    let currentRow = [];
    for (let col = 0; col < numColumns; col++) {
      currentRow.push(createNode(row, col));
    }
    grid.push(currentRow);
  }
  return grid;
};

const createNode = (row, col) => {
  return {
    row,
    col,
    isStart: row === startNodeRow && col === startNodeCol,
    isFinish: row === finishNodeRow && col === finishNodeCol,
    distance: Infinity,
    totalDistance: Infinity,
    isVisited: false,
    isShortest: false,
    isWall: false,
    previousNode: null,
  };
};

const getNewGridWithWalls = (grid, row, col) => {
  let newGrid = grid.slice();
  let node = grid[row][col];
  let newNode = {
    ...node,
    isWall: !node.isWall,
  };
  newGrid[row][col] = newNode;
  return newGrid;
};

const getNewGridWithMaze = (grid, walls) => {
  let newGrid = grid.slice();
  for (let wall of walls) {
    let node = grid[wall[0]][wall[1]];
    let newNode = {
      ...node,
      isWall: true,
    };
    newGrid[wall[0]][wall[1]] = newNode;
  }
  return newGrid;
};

const getGridWithoutPath = (grid) => {
  let newGrid = grid.slice();
  for (let row of grid) {
    for (let node of row) {
      let newNode = {
        ...node,
        distance: Infinity,
        totalDistance: Infinity,
        isVisited: false,
        isShortest: false,
        previousNode: null,
      };
      newGrid[node.row][node.col] = newNode;
    }
  }
  return newGrid;
};

const getVisitedNodesInOrder = (visitedNodesInOrderStart, visitedNodesInOrderFinish) => {
  let visitedNodesInOrder = [];
  let n = Math.max(visitedNodesInOrderStart.length, visitedNodesInOrderFinish.length);

  for (let i = 0; i < n; i++) {
    if (visitedNodesInOrderStart[i] !== undefined) visitedNodesInOrder.push(visitedNodesInOrderStart[i]);
    if (visitedNodesInOrderFinish[i] !== undefined)  visitedNodesInOrder.push(visitedNodesInOrderFinish[i]);
  }
  return visitedNodesInOrder;
};

const updateNodesForRender = (grid, nodesInShortestPathOrder, visitedNodesInOrder) => {
  let newGrid = grid.slice();

  for (let node of visitedNodesInOrder) {
    if ((node.row === startNodeRow && node.col === startNodeCol) || (node.row === finishNodeRow && node.col === finishNodeCol))
      continue;
    let newNode = {
      ...node,
      isVisited: true,
    };
    newGrid[node.row][node.col] = newNode;
  }

  for (let node of nodesInShortestPathOrder) {
    if (node.row === finishNodeRow && node.col === finishNodeCol) return newGrid;
    let newNode = {
      ...node,
      isVisited: false,
      isShortest: true,
    };
    newGrid[node.row][node.col] = newNode;
  }
};

export default Home;