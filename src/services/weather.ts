export interface Clima {
  temperatura: number
  descripcion: string
}

const API_KEY = import.meta.env.VITE_WEATHER_API_KEY

export const obtenerClima = async (
  ciudad: string
): Promise<Clima> => {

  if (!ciudad.trim()) {
    throw new Error('Escribe una ciudad')
  }

  const url =
    `https://api.openweathermap.org/data/2.5/weather` +
    `?q=${encodeURIComponent(ciudad)}` +
    `&units=metric` +
    `&appid=${API_KEY}` +
    `&lang=es`

  const res = await fetch(url)

  const data = await res.json()

  console.log('RESPUESTA API CLIMA:', data)

  if (!res.ok) {
    throw new Error(data.message || 'No se pudo obtener el clima')
  }

  return {
    temperatura: data.main.temp,
    descripcion: data.weather[0].description
  }
}