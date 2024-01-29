import {
  getPokemon,
  getPokedex,
  getPokemonSpecies,
  getTypes,
  getPokemonForm,
} from "./pokeapi.js";
export { Pokedex, downloadPokedex };

async function pokemonSpecies(id, language = "es") {
  const pokemonSpecie = await getPokemonSpecies(id);
  const data = await pokemonSpecie.json();
  const name = getName(data.names, language)[0];
  const genderDifferences = data.has_gender_differences;
  let sprite;
  let img;
  let pokemonList = [];

  // Get entries numbers of the pokemon forms
  const entries = await Promise.all(
    data.varieties.map(async (variety) => {
      return getEntryFromUrl(variety.pokemon);
    })
  );

  for (let entry of entries) {
    const pokemon = await getPokemon(entry);
    const pokemonData = await pokemon.json();
    const form = await getPokemonForm(getEntryFromUrl(pokemonData.forms[0]));
    const formData = await form.json();
    const pokemonName = `${name} ${getName(formData.form_names, language)}`;
    const pokemonArtwork =
      pokemonData.sprites.other["official-artwork"].front_default ??
      pokemonData.sprites.other.home.front_default;

    const typeNamesPromises = formData.types.map(async (type) => {
      let typeId = getEntryFromUrl(type.type);
      let typeInfo = await getTypes(typeId);
      let typeData = await typeInfo.json();
      return getName(typeData.names, language)[0];
    });

    const typeNames = await Promise.all(typeNamesPromises);
    const pokemonSprite = pokemonData.sprites.front_default;

    // First element is default
    if (parseInt(entry, 10) === parseInt(id, 10)) {
      sprite = pokemonSprite;
      img = pokemonArtwork;
    }

    // Pokemon forms information
    pokemonList.push({
      id: entry,
      name: pokemonName,
      art: pokemonArtwork,
      sprite: pokemonSprite,
      types: typeNames,
    });
  }

  return {
    name: name,
    sprite: sprite,
    art: img,
    gender: genderDifferences,
    forms: pokemonList,
  };
}

async function Pokedex() {
  return new Promise(async (resolve) => {
    const pokedex = await getPokedex(1);
    const data = await pokedex.json();

    const pokedexFinal = await Promise.all(
      data.pokemon_entries.map(async (poke) => {
        let entry = poke.entry_number;
        let speciesData = await pokemonSpecies(entry);

        return {
          entry_number: entry,
          name: speciesData.name,
          sprite: speciesData.sprite,
          art_default: speciesData.art,
          gender_differences: speciesData.gender,
          forms: speciesData.forms,
        };
      })
    );

    const pokedexView = data.pokemon_entries.map((poke) => {
      return {
        entry_number: poke.entry_number,
        view: false,
      };
    });

    resolve([pokedexFinal, pokedexView]);
  });
}

function getName(data, language = "es") {
  return data
    .filter((obj) => obj.language.name === language)
    .map((obj) => obj.name);
}

function getEntryFromUrl(data) {
  const url = data.url.split("/");
  return url[url.length - 2];
}

async function downloadPokedex() {
  const downloadBtn = document.getElementById("downloadBtn");
  downloadBtn.innerHTML = "Cargando...";

  const [pokedexFinal, pokedexView] = await Pokedex();

  const pokedexFinalBlob = new Blob([JSON.stringify(pokedexFinal)], {
    type: "application/json",
  });
  const pokedexViewBlob = new Blob([JSON.stringify(pokedexView)], {
    type: "application/json",
  });

  const pokedexFinalURL = URL.createObjectURL(pokedexFinalBlob);
  const pokedexViewURL = URL.createObjectURL(pokedexViewBlob);

  const a = document.createElement("a");
  a.href = pokedexFinalURL;
  a.download = "pokedex.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  const b = document.createElement("a");
  b.href = pokedexViewURL;
  b.download = "pokedex_view.json";
  document.body.appendChild(b);
  b.click();
  document.body.removeChild(b);

  URL.revokeObjectURL(pokedexFinalURL);
  URL.revokeObjectURL(pokedexViewURL);

  downloadBtn.innerHTML = "Volver a Descargar";
}
