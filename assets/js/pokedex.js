import { downloadPokedex } from "./generate_pokedex.js";

document.addEventListener("DOMContentLoaded", () => {
  const downloadBtn = document.getElementById("downloadBtn");

  downloadBtn.addEventListener("click", async () => {
    await downloadPokedex();
  });
});
