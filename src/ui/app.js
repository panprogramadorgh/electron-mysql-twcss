/*  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
// Funcion para imprimir mensajes de alerta/error/info

const printMessage = (
  type = "error",
  { title, body } = {
    title: "Error",
    body: "Seems to be an error",
  },
  { time } = { time: 3000 }
) => {
  const message = document.getElementById("message"); // <-- Elemento contenedor de mensajes
  setTimeout(() => {
    message.innerHTML = ""; // <-- Borra el mensaje
  }, time);

  let textColor = "text-red-950";
  let bgColor = "bg-red-500";
  let borderColor = "border-t-red-300";

  if (type === "info") {
    textColor = "text-sky-950";
    bgColor = "bg-sky-500";
    borderColor = "border-t-sky-500";
  } else if (type === "warn") {
    textColor = "text-yellow-950";
    bgColor = "bg-yellow-500";
    borderColor = "border-t-yellow-200";
  } else if (type !== "error") return printMessage("error");

  const messageItem = `
    <div
      class="animate-bounce absolute top-10 left-5 block w-60 p-5 mb-5 ${bgColor} ${textColor} border-t-2 ${borderColor} rounded-xl"
      >
      <p class="font-bold text-2xl mb-2"><span>${title}</span></p>
      <p class="font-semibold text-xl"><span>${body}</span></p>
    </div>
  `;

  message.innerHTML = messageItem; // <-- Introduce el nuevo mensaje
};

/*  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
// Formulario para crear productos

const appForm = document.getElementById("app-form");
const name = document.getElementById("name");
const category = document.getElementById("category");
const description = document.getElementById("description");
const price = document.getElementById("price");

appForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData(appForm);
  const productData = Object.fromEntries(formData);

  try {
    if (
      productData.name.trim().length < 3 ||
      productData.category.trim().length < 3 ||
      productData.description.trim().length < 3 ||
      productData.price.trim().length < 1
    ) {
      throw new Error(window["electron"].dbErrorMessages.formatError);
    }
    await window["electron"].createProduct(productData);
    printMessage("info", { title: "Success", body: "Product created" }); // <-- Prints info message
    appForm.reset(); // Resets the form
    name.focus(); // Focus the name input
  } catch (error) {
    console.error(error); // En todos los casos printeamos el error

    if (error.message === window["electron"].dbErrorMessages.formatError) {
      return printMessage("warn", {
        title: "Warning",
        body: error.message,
      });
    } else if (
      error.message === window["electron"].dbErrorMessages.queryError
    ) {
      return printMessage("error", {
        title: "Internal error",
        body: error.message,
      });
    } else if (
      error.message === window["electron"].dbErrorMessages.connectionError
    ) {
      return printMessage("error", {
        title: "Connection error",
        body: error.message,
      });
    } else {
      return printMessage(); // <-- Error generico
    }
  }
});

/*  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
// Boton de vista de productos

const viewProducts = document.getElementById("view-products");
viewProducts.addEventListener("click", () => {
  window["electron"].viewProducts();
});
