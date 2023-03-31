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

export { FETCH_CREATED_GAME, FETCH_PLAYERS_GAME, FETCH_RESULT_GAME };
