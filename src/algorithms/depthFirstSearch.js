// Bikram Chatterjee
// AutoPath
// depthFirstSearch.js

export function depthFirstSearch(grid, startNode, endNode) {
  if (!startNode || !endNode || startNode === endNode) {
    return false;
  }
  let unvisitedNodes = [];
  let visitedNodesInOrder = [];
  unvisitedNodes.push(startNode);
  while (unvisitedNodes.length !== 0) {
    let closestNode = unvisitedNodes.shift();
    if (closestNode.isWall) continue;
    if (closestNode === endNode) return visitedNodesInOrder;
    visitedNodesInOrder.push(closestNode);
    closestNode.isVisited = true;
    let unvisitedNeighbours = getUnvisitedNeighbors(closestNode, grid);
    for (let unvisitedNeighbour of unvisitedNeighbours) {
      unvisitedNeighbour.previousNode = closestNode;
      unvisitedNodes.unshift(unvisitedNeighbour);
    }
  }
  return visitedNodesInOrder;
}

function getUnvisitedNeighbors(node, grid) {
  let neighbors = [];
  let {row, col} = node;
  if (col !== 0) neighbors.push(grid[row][col - 1]);
  if (row !== 0) neighbors.push(grid[row - 1][col]);
  if (col !== grid[0].length - 1) neighbors.push(grid[row][col + 1]);
  if (row !== grid.length - 1) neighbors.push(grid[row + 1][col]);
  return neighbors.filter((neighbor) => !neighbor.isVisited);
}

export function getNodesInShortestPathOrderDFS(finishNode) {
  let nodesInShortestPathOrder = [];
  let currentNode = finishNode;
  while (currentNode !== null) {
    nodesInShortestPathOrder.unshift(currentNode);
    currentNode = currentNode.previousNode;
  }
  return nodesInShortestPathOrder;
}