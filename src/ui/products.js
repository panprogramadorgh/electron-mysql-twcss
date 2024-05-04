/*  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
// Objetos globales

let products = [];

/*  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
// Boton de refresco (boton que empla la funcion refresh)

const productsList = document.getElementById("products-list");
const refreshButton = document.getElementById("refresh-button");

refreshButton.addEventListener("click", async () => {
  try {
    await window["electron"].refreshConnection(); // Refresh the connection
    await refreshProducts();
  } catch {
    // En caso de que falle la re-conexion con la base de datos o bien el refresco
    console.error("No database connection");
  }
});

/*  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
// Al hacer click el cualquier parte cerrar todos los contexts menus
document.addEventListener("click", () => {
  const productContexts = productsList.querySelectorAll(".product-context");
  productContexts.forEach((context) => {
    const hidden = context.classList.contains("hidden");
    if (!hidden) context.classList.add("hidden");
  });
});

/*  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
// Funcion encargada de dibujar los productos
const printProducts = (products) => {
  productsList.innerHTML = ""; // Resetear el contenido de la lista
  if (products.length === 0) {
    const item = `
    <div
      class="max-w-96 block p-5 mb-5 text-sky-950 border-t-2 border-t-sky-300 bg-sky-500 rounded-xl"
      >
      <p class="font-bold text-2xl mb-2"><span>No products</span></p>
      <p class="font-semibold text-xl"><span>There are no any products still.</span></p>
    </div>
  `;
    productsList.innerHTML = item;
    return item;
  }
  const productsItems = products.map(
    ({ id, name, category, description, price }) => {
      const productItem = `
      <div id="product-card-${id}" class="max-w-96 basis-0 grow shrink bg-gray-900 p-5 text-slate-200 font-semibold rounded-2xl border-t-2 border-t-gray-700 border-solid">
        <ul
          class="product-context hidden absolute bg-gray-700 rounded-xl"
        >
        
          <li
            class="edit-button w-32 text-center block p-2 bg-transparent text-slate-200 font-bold"
          >
            Edit
          </li>
          <li
            class="remove-button w-32 text-center block p-2 bg-red-500 text-red-950 rounded-bl-xl rounded-br-xl font-bold"
          >
            Remove
          </li>
        </ul>
        <div class="flex items-center gap-3 my-3 text-xl font-bold">
          <p>
            <span 
              class="product-name focus:border-none focus:outline-none">${name}
            </span>
          </p>
          <div class="h-10 w-0.5 bg-slate-700 rounded-full"></div>
          <p>
            <span
              class="product-cat focus:border-none focus:outline-none">${category}
            </span>
          </p>
        </div>
        
        <p
          class="my-3 text-wrap break-words"><span class="product-desc focus:border-none focus:outline-none">${description}</span>
        </p>
        
        <div class="flex items-center gap-2">
          <p
            class="price text-sky-400 my-3 text-xl font-black focus:border-none focus:outline-none after:content-normal"
            >
              <span>${price}</span>
          </p>
          <span>$</span>
        </div>
        <div class="save-btn-cont flex gap-2"></div>
      </div>
    `;
      productsList.innerHTML += productItem;
      return productItem;
    }
  );

  // Seccion de codigo encargada de proporcionar funcionalidad a los elementos html
  products.forEach(({ id }, index) => {
    const productElement = [...productsList.children][index];

    // Context menu logic
    const productContext = productElement.querySelector(`.product-context`);
    productElement.addEventListener("contextmenu", (e) => {
      e.preventDefault();

      // Hides all the context menus
      productsList.querySelectorAll(".product-context").forEach((prodEl) => {
        const hidden = prodEl.classList.contains("hidden");
        if (!hidden) prodEl.classList.toggle("hidden");
      });

      productContext.classList.toggle("hidden");
      if (productContext.classList.contains("hidden")) return;

      // Get mouse position
      const xMousePos = e.clientX;
      const yMousePos = e.clientY;

      const offset = 5;
      // Moves the window to the mouse position
      productContext.style.setProperty("top", `${yMousePos + offset}px`);
      productContext.style.setProperty("left", `${xMousePos + offset}px`);
    });

    // Remove button logic
    const removeButton = productElement.querySelector(".remove-button");
    removeButton.addEventListener("click", async () => {
      const condition = confirm(
        "Are you sure you want to remove this product?"
      );
      if (!condition) return;
      try {
        await window["electron"].removeProductById(id);
        await refreshProducts();
      } catch (error) {
        console.error(error);
        if (
          error.message === window["electron"].dbErrorMessages.connectionError
        ) {
          return printProductsError({
            title: "Connection error",
            body: error.message,
          });
        } else if (
          error.message === window["electron"].dbErrorMessages.queryError
        ) {
          return printProductsError({
            title: "Internal error",
            body: error.message,
          });
        }

        printProductsError({
          title: "Internal error",
          body: "Seems to be an error.",
        });
      }
    });

    // Edit button logic
    const editButton = productElement.querySelector(".edit-button");
    editButton.addEventListener("click", () => {
      // Product card elements
      const productName = productElement.querySelector(".product-name");
      const productCat = productElement.querySelector(".product-cat");
      const productDesc = productElement.querySelector(".product-desc");
      const productPrice = productElement.querySelector(".price");

      // Editable elements
      productName.contentEditable = true;
      productCat.contentEditable = true;
      productDesc.contentEditable = true;
      productPrice.contentEditable = true;

      const saveButtonCont = productElement.querySelector(".save-btn-cont");
      saveButtonCont.innerHTML = `
        <button
          class="save-button text-center block p-2 bg-sky-500 text-sky-950 rounded-xl font-bold border-t-2 border-t-sky-300">
            Save
        </button>
        <button
          class="cancel-button text-center block p-2 bg-gray-500 text-gray-950 rounded-xl font-bold border-t-2 border-t-gray-400">
            Cancel
        </button>
      `;
      const [saveButton, cancelButton] = saveButtonCont.children;

      // Logica del boton de save
      saveButton.addEventListener("click", async () => {
        const condition = window.confirm("Are you sure you want to save?");
        if (!condition) return;

        const valuesToUpdate = {
          name: productName.innerText,
          category: productCat.innerText,
          description: productDesc.innerText,
          price: productPrice.innerText,
        };
        productName.contentEditable = false;
        productCat.contentEditable = false;
        productDesc.contentEditable = false;
        productPrice.contentEditable = false;

        try {
          await window["electron"].updateProductById(id, valuesToUpdate);
          await refreshProducts();
        } catch (error) {
          console.log(error);
          if (
            error.message === window["electron"].dbErrorMessages.connectionError
          ) {
            return printProductsError({
              title: "Connection error",
              body: error.message,
            });
          } else if (
            error.message === window["electron"].dbErrorMessages.queryError
          ) {
            return printProductsError({
              title: "Internal error",
              body: error.message,
            });
          }

          printProductsError({
            title: "Internal error",
            body: "Seems to be an error.",
          });
        }
      });

      // Logica del boton de cancel
      cancelButton.addEventListener("click", async () => {
        productName.contentEditable = false;
        productCat.contentEditable = false;
        productDesc.contentEditable = false;
        productPrice.contentEditable = false;
        await refreshProducts();
      });
    });
  });

  return productsItems;
};

/*  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
// Funcion encargada de mostrar errores y warns
const printProductsError = ({ title, body }, warning = false) => {
  const textColor = warning ? "text-yellow-400" : "text-red-400";
  const borderColor = warning ? "border-yellow-500" : "border-red-500";
  const backgroundColor = warning ? "bg-yellow-400" : "bg-red-400";
  const errorItem = `
  <div class="min-w-full p-5 ${textColor} rounded-lg font-bold border-2 border-dashed ${borderColor} select-none">
    <p class="${textColor} text-bold text-2xl">
      <span>${title}</span>
    </p>
    <div class="h-0.5 w-full ${backgroundColor} my-3"></div>
    <p class="${textColor} text-bold">
      <span>${body}</span>
    </p>
  </div>
`;
  productsList.innerHTML = errorItem;
  return errorItem;
};

/*  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
// Refresca la pantalla (actualizar los datos y dibujarlos)
const refreshProducts = async () => {
  try {
    products = await window["electron"].getProducts();
    printProducts(products);
  } catch (error) {
    console.error(error);
    if (error.message === window["electron"].dbErrorMessages.connectionError) {
      printProductsError({ title: "Connection error", body: error.message });
    } else {
      printProductsError(
        { title: "Internal error", body: error.message },
        true
      );
    }
  }
};

/*  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
// Funcion de inicializacion

const init = async () => {
  await refreshProducts(); // Refresca por primera vez los productso
};

init(); // Se inicializa la applicacion
