# Electron & MySQL

## De que se trata ?

En este repositorio podemos encontrar una aplicacion de electron construida con tailwindcss en la que podemos realizar operaciones crud con una base de datos MySQL. La idea se basa en el [siguiente video](https://www.youtube.com/watch?v=0h2LBY5M8y4&ab_channel=FaztCode) de FaztCode

## Iniciar

Para iniciar la app instala las dependencias con el comando `npm i`. A continuacion introduce las variables de entorno para la conexion con la base de datos en el fichero `.ENV`.

```python
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=""
DB_NAME=electrondb
```

Por ultimo ejecute la orden `npm run dev`

## Tailwindcss

Tailwind esta implementado en modo desarrollo. Para implementar tailwind en modo produccion ejecute `npm run twcss`
