export const api_pokemon = "https://pokeapi.co/api/v2/";

export function getPokemon(param) {
  return fetch(api_pokemon + "pokemon/" + param);
}

export function getPokemonSpecies(param) {
  return fetch(api_pokemon + "pokemon-species/" + param);
}

export function getPokedex(param) {
  return fetch(api_pokemon + "pokedex/" + param);
}

export function getTypes(param) {
  return fetch(api_pokemon + "type/" + param);
}

export function getPokemonForm(param) {
  return fetch(api_pokemon + "pokemon-form/" + param);
}
