const API_URL = 'https://jsonplaceholder.typicode.com'

export const obtenerUsuarios = async () => {
  const respuesta = await fetch(`${API_URL}/users`)

  if (!respuesta.ok) {
    throw new Error('No se pudieron obtener los usuarios')
  }

  return await respuesta.json()
}

export const obtenerTodos = async () => {
  const respuesta = await fetch(`${API_URL}/todos`)

  if (!respuesta.ok) {
    throw new Error('No se pudieron obtener las tareas')
  }

  return await respuesta.json()
}