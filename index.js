const express = require("express");
const { v2: cloudinary } = require("cloudinary");
const app = express();
require("dotenv").config(); // Cargar variables de entorno

const port = process.env.PORT || 3000;

// Configurar Cloudinary con tus credenciales
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

// Endpoint para obtener las imágenes de Pokémon
app.get("/pokemones", async (req, res) => {
  const { page = 1, limit = 10 } = req.query; // Paginación

  try {
    let allImages = [];
    let nextCursor = null;
    const maxResults = Math.min(limit, 500); // Limitar a 500 como máximo

    // Paginación de imágenes
    do {
      const result = await cloudinary.search
        .expression("folder:pokemones") // Usar la carpeta "pokemones" en Cloudinary
        .sort_by("created_at", "desc")
        .max_results(maxResults)
        .next_cursor(nextCursor)
        .execute();

      // Agregar las URLs de las imágenes a la lista
      allImages = allImages.concat(result.resources.map((img) => img.secure_url));

      // Actualizar el cursor para la siguiente consulta
      nextCursor = result.next_cursor;
    } while (nextCursor && allImages.length < limit); // Continuar hasta que no haya más imágenes o se alcance el límite

    // Paginación de la respuesta
    const start = (page - 1) * limit;
    const end = page * limit;
    const paginatedImages = allImages.slice(start, end);

    res.status(200).json({
      images: paginatedImages,
      page: Number(page),
      totalPages: Math.ceil(allImages.length / limit),
    });
  } catch (error) {
    console.error("Error al obtener imágenes:", error);
    res.status(500).json({ error: "Error al obtener imágenes" });
  }
});

// Servir en el puerto configurado
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
