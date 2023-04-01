function FETCH_CREATED_GAME() {
  return `query {
        gameStarteds(first: 5, orderBy:gameId, orderDirection:desc) {
            id
            gameId
            gameBlock
        }
    }`;
}

function FETCH_PLAYERS_GAME() {
  return `query {
          playerJoineds(first: 5, orderBy:gameId, orderDirection:desc) {
              id
              gameId
              player
              betPlaced
              betAmount
          }
      }`;
}

function FETCH_RESULT_GAME() {
  return `query {
          gameEndeds(first: 5, orderBy:gameId, orderDirection:desc) {
              id
              gameId
              roll
          }
      }`;
}

function FETCH_CARD_GAME() {
  return `query {
        cardsDealts(first: 5, orderBy:gameId, orderDirection:desc) {
            id
            gameId
            p1
            p2
            p3
            b1
            b2
            b3
        }
    }`;
}

export {
  FETCH_CREATED_GAME,
  FETCH_PLAYERS_GAME,
  FETCH_RESULT_GAME,
  FETCH_CARD_GAME,
};
