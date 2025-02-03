const express = require("express");
const app = express();
const { v2: cloudinary } = require("cloudinary");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const port = process.env.PORT || 3000;

app.use(cors()); // Permitir acceso desde React

// Configurar Cloudinary con tus credenciales
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

// Ruta para obtener todas las imágenes de Pokémon desde Cloudinary
app.get("/pokemones", async (req, res) => {
  try {
    let allImages = [];
    let nextCursor = null;

    // Paginación (buscar imágenes en la carpeta 'pokemones')
    do {
      const result = await cloudinary.search
        .expression("folder:pokemones")
        .sort_by("created_at", "desc")
        .max_results(500) // Cloudinary recomienda no más de 500 por búsqueda
        .next_cursor(nextCursor) // Usa el cursor para obtener más resultados si es necesario
        .execute();

      // Agregar las URLs de las imágenes a la lista
      allImages = allImages.concat(result.resources.map((img) => img.secure_url));

      // Actualizar el cursor para la siguiente consulta (si la hay)
      nextCursor = result.next_cursor;

    } while (nextCursor);  // Si hay más resultados, continuará buscando

    // Responder con todas las imágenes
    res.json({
      images: allImages,
      page: 1,
      totalPages: 1
    });
  } catch (error) {
    console.error("Error al obtener imágenes:", error);
    res.status(500).json({ error: "Error al obtener imágenes" });
  }
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Server corriendo en http://localhost:${port}`);
});
