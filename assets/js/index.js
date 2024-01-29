class JSONLoader {
  constructor(jsonPokemonFileURL, jsonViewFileURL) {
    this.jsonFileURL = jsonPokemonFileURL;
    this.jsonViewURL = jsonViewFileURL;
    this.jsonData = null;
    this.formIndex = 0;
  }

  async loadJSON() {
    const pokemonDataPromise = fetch(this.jsonFileURL).then((response) =>
      response.json()
    );

    const viewDataPromise = fetch(this.jsonViewURL).then((response) =>
      response.json()
    );

    return Promise.all([pokemonDataPromise, viewDataPromise])
      .then(([pokemonData, viewData]) => {
        this.jsonData = pokemonData.map((pokemon) => {
          const viewInfo = viewData.find(
            (view) => view.entry_number === pokemon.entry_number
          );
          if (viewInfo) {
            // Fusionar los datos de ambos archivos
            return { ...pokemon, view: viewInfo.view };
          }
          return pokemon;
        });
        this.generateList();
      })
      .catch((error) => {
        console.error("Error al leer los archivos JSON:", error);
        throw error; // Rechazar la promesa en caso de error
      });
  }

  getViewLength(data) {
    return data
      ? data.filter((obj) => {
          return obj.view === true;
        }).length
      : 0;
  }

  getNoViewLength(data) {
    return data
      ? data.filter((obj) => {
          return obj.view === false;
        }).length
      : 0;
  }

  generateCountView(data) {
    const viewElement = document.getElementById("pokemonView");
    viewElement.innerHTML = this.getViewLength(data);
    const noViewElement = document.getElementById("pokemonNoView");
    noViewElement.innerHTML = this.getNoViewLength(data);
  }

  generateList(data = this.jsonData) {
    this.generateCountView(data);
    const ulElement = document.getElementById("pokeList");
    ulElement.innerHTML = "";
    data.forEach((obj) => {
      const firstName = obj.name;
      const entryNumber = "N° " + this.generateNumber(obj.entry_number);
      const spriteUrl = obj.sprite;

      // Crear elemento <li> y agregarlo a <ul>
      const liElement = document.createElement("li");
      const buttonElement = document.createElement("button");
      const pokeballElement = document.createElement("img");
      const imageElement = document.createElement("img");
      const textNumberElement = document.createElement("p");
      const textNameElement = document.createElement("p");

      textNumberElement.textContent = entryNumber;
      textNameElement.textContent = firstName;
      if (obj.view) {
        pokeballElement.src = "./assets/img/pokeball_icon.svg";
      } else {
        pokeballElement.src = "./assets/img/gray_icon.svg";
      }
      pokeballElement.id = "img-" + obj.entry_number;
      pokeballElement.height = 25;
      imageElement.src = spriteUrl;
      imageElement.className = "sprites";
      buttonElement.className = "btn btn-primary list-button";
      buttonElement.style = "display: flex;";
      buttonElement.addEventListener("click", () => {
        this.generateImage(obj.entry_number);
      });
      liElement.className = "list-dex";
      buttonElement.appendChild(pokeballElement);
      buttonElement.appendChild(imageElement);
      buttonElement.appendChild(textNumberElement);
      buttonElement.appendChild(textNameElement);
      liElement.appendChild(buttonElement);
      ulElement.appendChild(liElement);
    });

    setTimeout(function () {
      ulElement.classList.add("loaded");
    }, 100);
  }

  generateNumber(n) {
    if (n < 10) {
      return "000" + n;
    } else if (n >= 10 && n < 100) {
      return "00" + n;
    } else if (n >= 100 && n < 1000) {
      return "0" + n;
    } else {
      return n;
    }
  }

  generateImage(entryNumber) {
    const divElement = document.getElementById("containerPreview");
    divElement.innerHTML = "";
    this.formIndex = 0;
    const pokemon = this.jsonData.find((obj) => {
      return obj.entry_number === entryNumber;
    });
    const pokemonForm = pokemon.forms.find((obj) => {
      return parseInt(obj.id, 10) === parseInt(entryNumber, 10);
    });

    const typeElements = [];
    const imageElement = document.createElement("img");
    const pokeballElement = document.createElement("img");
    const textElement = document.createElement("p");
    const divContainerElement = document.createElement("div");
    pokeballElement.setAttribute("data-bs-toggle", "tooltip");
    pokeballElement.setAttribute("data-bs-placement", "top");
    pokeballElement.setAttribute("data-bs-title", "Capturar / Liberar");
    if (pokemon.view) {
      pokeballElement.src = "./assets/img/pokeball_icon.svg";
    } else {
      pokeballElement.src = "./assets/img/gray_icon.svg";
    }
    pokeballElement.height = 40;
    pokeballElement.id = "corner-left";
    pokeballElement.className = "corner-images-left";
    pokeballElement.addEventListener("click", () => {
      this.capture(entryNumber);
    });
    textElement.textContent = pokemon.name;
    textElement.className = "pokemon-name";
    imageElement.className = "pokemon-img";
    imageElement.src = pokemon.art_default;
    divContainerElement.id = "pokemon-types";
    divContainerElement.className = "pokemon-types";
    divElement.appendChild(pokeballElement);
    if (pokemon.forms.length > 1) {
      const switchElement = document.createElement("button");
      const iconElement = document.createElement("i");
      iconElement.className = "fa-solid fa-repeat icon-switch";
      switchElement.id = "corner-right";
      switchElement.className = "corner-images-right btn btn-lg btn-switch";
      switchElement.addEventListener("click", () => {
        this.changeForm(entryNumber);
      });
      switchElement.appendChild(iconElement);
      divElement.appendChild(switchElement);
    }
    divElement.appendChild(imageElement);
    divElement.appendChild(textElement);
    for (let i = 0; i < pokemonForm.types.length; i++) {
      typeElements.push(document.createElement("img"));
      typeElements[i].src =
        "./assets/img/types/Tipo_" +
        pokemonForm.types[i].toLowerCase() +
        ".png";
      divContainerElement.appendChild(typeElements[i]);
    }
    if (pokemonForm.types.length > 1) {
      typeElements[0].style = "margin-right: 10px";
    }
    divElement.appendChild(divContainerElement);
    // Agrega la clase 'loaded' después de un pequeño retraso
    setTimeout(function () {
      imageElement.classList.add("loaded");
    }, 100);
    setTimeout(function () {
      textElement.classList.add("loaded");
    }, 200);
    setTimeout(function () {
      divContainerElement.classList.add("loaded");
    }, 300);
    // Inicializa el tooltip
    new bootstrap.Tooltip(pokeballElement);
  }

  changeForm(entryNumber) {
    const pokemon = this.jsonData.find((obj) => {
      return obj.entry_number === entryNumber;
    });

    if (this.formIndex < pokemon.forms.length - 1) {
      this.formIndex++;
    } else {
      this.formIndex = 0;
    }

    const pokemonForm = pokemon.forms[this.formIndex];
    const imageElement = document.getElementsByClassName("pokemon-img")[0];
    imageElement.src = pokemonForm.art;

    const typeElements = [];
    let typesElement = document.getElementById("pokemon-types"); // Cambiado a 'let'

    // Limpiar contenido previo
    typesElement.innerHTML = "";

    for (let i = 0; i < pokemonForm.types.length; i++) {
      typeElements.push(document.createElement("img"));
      typeElements[i].src =
        "./assets/img/types/Tipo_" + pokemonForm.types[i] + ".png";
      typesElement.appendChild(typeElements[i]);
    }

    if (pokemonForm.types.length > 1) {
      typeElements[0].style = "margin-right: 10px";
    }
  }

  filterRegion(regionId) {
    const filteredData = this.jsonData.filter((obj) => {
      // Filtrar por rango de entry_number según la pokedex seleccionada
      if (regionId === "1") {
        const entryNumber = obj.entry_number;
        return entryNumber >= 1 && entryNumber <= 151;
      } else if (regionId === "2") {
        const entryNumber = obj.entry_number;
        return entryNumber >= 152 && entryNumber <= 251;
      } else if (regionId === "3") {
        const entryNumber = obj.entry_number;
        return entryNumber >= 252 && entryNumber <= 386;
      } else if (regionId === "4") {
        const entryNumber = obj.entry_number;
        return entryNumber >= 387 && entryNumber <= 493;
      } else if (regionId === "5") {
        const entryNumber = obj.entry_number;
        return entryNumber >= 494 && entryNumber <= 649;
      } else if (regionId === "6") {
        const entryNumber = obj.entry_number;
        return entryNumber >= 650 && entryNumber <= 721;
      } else if (regionId === "7") {
        const entryNumber = obj.entry_number;
        return entryNumber >= 722 && entryNumber <= 809;
      } else if (regionId === "8") {
        const entryNumber = obj.entry_number;
        return entryNumber >= 810 && entryNumber <= 898;
      } else if (regionId === "9") {
        const entryNumber = obj.entry_number;
        return entryNumber >= 899 && entryNumber <= 905;
      } else if (regionId === "10") {
        const entryNumber = obj.entry_number;
        return entryNumber >= 906 && entryNumber <= 1025;
      } else {
        return true;
      }
    });
    return filteredData;
  }

  filterRegionList(regionId = 0) {
    this.generateList(this.filterRegion(regionId));
  }

  filterSearch(text) {
    const filteredData = this.jsonData.filter((obj) => {
      return obj.name.toLowerCase().startsWith(text.toLowerCase());
    });
    this.generateList(filteredData);
  }

  generateFilterList(data) {
    const ulElement = document.getElementById("pokeList");

    // Limpiar contenido previo
    ulElement.innerHTML = "";

    // Listar el primer nombre de cada objeto en la propiedad 'names'
    data.forEach((obj) => {
      const primerNombre = obj.name;

      // Crear elemento <li> y agregarlo a <ul>
      const liElement = document.createElement("li");
      liElement.textContent = primerNombre;
      ulElement.appendChild(liElement);
    });
  }

  capture(entryNumber) {
    const pokemon = this.jsonData.find((obj) => {
      return obj.entry_number === entryNumber;
    });
    pokemon.view = !pokemon.view;

    const pokeballElement = document.getElementById("corner-left");
    const pokeballListElement = document.getElementById("img-" + entryNumber);
    const selectElement = document.getElementById("pokedexSelect");
    if (pokemon.view) {
      pokeballElement.src = "./assets/img/pokeball_icon.svg";
      pokeballListElement.src = "./assets/img/pokeball_icon.svg";
    } else {
      pokeballElement.src = "./assets/img/gray_icon.svg";
      pokeballListElement.src = "./assets/img/gray_icon.svg";
    }
    this.generateCountView(this.filterRegion(selectElement.value));
    // Almacena las modificaciones localmente en el navegador
    localStorage.setItem("pokemonData", JSON.stringify(this.jsonData));
  }

  getViewJSON() {
    return this.jsonData.map((obj) => {
      return { entry_number: obj.entry_number, view: obj.view };
    });
  }
}

function downloadViewJSON(data) {
  const viewData = data;
  const viewBlob = new Blob([JSON.stringify(viewData)], {
    type: "application/json",
  });
  const viewURL = URL.createObjectURL(viewBlob);

  const a = document.createElement("a");
  a.href = viewURL;
  a.download = "pokedex_view.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  URL.revokeObjectURL(viewURL);
}

const jsonLoader = new JSONLoader(
  "./assets/json/pokedex.json",
  "./assets/json/pokedex_view.json"
);
const tooltipTriggerList = document.querySelectorAll(
  '[data-bs-toggle="tooltip"]'
);
const tooltipList = [...tooltipTriggerList].map(
  (tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl)
);

jsonLoader.loadJSON().then(() => {
  const storedData = localStorage.getItem("pokemonData");
  if (storedData) {
    jsonLoader.jsonData = JSON.parse(storedData);
    jsonLoader.generateList();
  }

  const selectElement = document.getElementById("pokedexSelect");
  selectElement.addEventListener("change", function () {
    const selectedPokedex = this.value;

    jsonLoader.filterRegionList(selectedPokedex);
  });
  const searchElement = document.getElementById("searchInput");
  searchElement.addEventListener("input", function () {
    const searchText = this.value;
    jsonLoader.filterSearch(searchText);
  });
});

document.addEventListener("DOMContentLoaded", function () {
  let content = document.getElementById("pokeList");
  let downloadButton = document.getElementById("donwloadViewJSON");

  content.addEventListener("mouseover", function () {
    document.body.style.overflow = "auto";
  });

  content.addEventListener("mouseout", function () {
    document.body.style.overflow = "hidden";
  });

  downloadButton.addEventListener("click", function () {
    downloadViewJSON(jsonLoader.getViewJSON());
  });
});
