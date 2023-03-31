export function FETCH_CREATED_GAME() {
  return `query {
        gameStarteds(first: 20, orderBy:gameId, orderDirection:desc) {
            id
            gameId
            entryFee
            roll
        }
    }`;
}
