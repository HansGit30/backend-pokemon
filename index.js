const express = require("express");
const { v2: cloudinary } = require("cloudinary");
const cors = require('cors');
const app = express();
require("dotenv").config(); // Cargar variables de entorno

app.use(cors());

const port = process.env.PORT || 3000;

// Configurar Cloudinary con tus credenciales
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

// Endpoint para obtener las imágenes de Pokémon
app.get("/pokemones", async (req, res) => {
    try {
      let allImages = [];
      let nextCursor = null;
  
      // Paginación
      do {
        const result = await cloudinary.search
          .expression("folder:pokemones")
          .sort_by("created_at", "desc")
          .max_results(500) // Se puede ajustar, pero Cloudinary recomienda 500 como valor máximo
          .next_cursor(nextCursor) // Paginación con el cursor
          .execute();
  
        // Agregar las URLs a la lista
        allImages = allImages.concat(result.resources.map((img) => img.secure_url));
  
        // Actualizar el cursor para la siguiente consulta
        nextCursor = result.next_cursor;
      } while (nextCursor);  // Continuar mientras haya más resultados
  
      res.json(allImages);
    } catch (error) {
      console.error("Error al obtener imágenes:", error);
      res.status(500).json({ error: "Error al obtener imágenes" });
    }
  });

// Servir en el puerto configurado
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
