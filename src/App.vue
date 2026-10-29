<script setup lang="ts">
import Login from './components/Login.vue'
import { ref, onMounted } from 'vue'
import { supabase } from './lib/supabase'
import { obtenerClima } from './services/weather'
import { obtenerUsuarios, obtenerTodos } from './services/jsonplaceholder'

const usuario = ref<any>(null)

const nuevoReporte = ref({
  ubicacion: '',
  tipo_riesgo: '',
  descripcion: ''
})

const mensajeReporte = ref('')
const ciudad = ref('')
const reportes = ref<any[]>([])
const servicios = ref<any[]>([])
const usuarios = ref<any[]>([])
const todos = ref<any[]>([])
const errorJSON = ref('')

const cargarUsuarios = async () => { 
    errorJSON.value = ''

     try {
    usuarios.value = await obtenerUsuarios()
  } catch (error) {
    console.error(error)
    errorJSON.value = 'No se pudieron obtener los usuarios'
  }
}

const cargarTodos = async () => {  
  errorJSON.value = ''

  try {
    todos.value = await obtenerTodos()
  } catch (error) {
    console.error(error)
    errorJSON.value = 'No se pudieron obtener las tareas'
  }
}

const categoriaServicio = ref('Todos')

const obtenerServicios = async () => {
  const { data, error } = await supabase
    .from('servicios_cercanos')
    .select('*')
    .order('id', { ascending: true })

  if (error) {
    console.error('Error al obtener servicios:', error)
    return
  }

  servicios.value = data || []
}

const serviciosFiltrados = () => {
  if (categoriaServicio.value === 'Todos') {
    return servicios.value
  }

  return servicios.value.filter(
    servicio => servicio.categoria === categoriaServicio.value
  )
}

const clima = ref<{
  temperatura: number
  descripcion: string
} | null>(null)

const errorClima = ref('')

const pagoExitoso = ref(
  new URLSearchParams(window.location.search).get('pago') === 'exitoso'
)

const crearReporte = async () => {
  mensajeReporte.value = ''

  const { error } = await supabase
    .from('reportes_riesgo')
    .insert({
      ubicacion: nuevoReporte.value.ubicacion,
      tipo_riesgo: nuevoReporte.value.tipo_riesgo,
      descripcion: nuevoReporte.value.descripcion
    })

  if (error) {
    mensajeReporte.value =
      '❌ Error al guardar: ' + error.message
    return
  }

  mensajeReporte.value =
    '✅ Reporte guardado correctamente'

  nuevoReporte.value = {
    ubicacion: '',
    tipo_riesgo: '',
    descripcion: ''
  }
}

const obtenerReportes = async () => {
  const { data, error } = await supabase
    .from('reportes_riesgo')
    .select('*')
    .order('id', { ascending: false })

  if (error) {
    console.error('Error al obtener reportes:', error)
    return
  }

  reportes.value = data || []
}

const buscarClima = async () => {
  errorClima.value = ''
  clima.value = null

  try {
    clima.value = await obtenerClima(ciudad.value)
  } catch (error) {
    errorClima.value =
      error instanceof Error
        ? error.message
        : 'No se pudo obtener el clima'
  }
}
const pagarConStripe = async () => {
  try {
    const res = await fetch('http://localhost:3000/crear-pago', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    const data = await res.json()

    console.log('RESPUESTA STRIPE:', data)

    if (!res.ok) {
      throw new Error(data.error || 'No se pudo crear el pago')
    }

    window.location.href = data.url

  } catch (error) {
    console.error(error)
    alert('❌ Error al conectar con Stripe')
  }
}
const pagarConMercadoPago = async () => {
  try {
    const res = await fetch('http://localhost:3000/crear-pago-mercadopago', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    const data = await res.json()

    console.log('RESPUESTA MERCADO PAGO:', data)

    if (!res.ok) {
      throw new Error(data.error || 'No se pudo crear el pago con Mercado Pago')
    }

    window.location.href = data.url

  } catch (error) {
    console.error(error)
    alert('No se pudo conectar con Mercado Pago')
  }
  }

  const eliminarReporte = async (id: number) => {
  await supabase
    .from('reportes_riesgo')
    .delete()
    .eq('id', id)

  obtenerReportes()
}

onMounted(async () => {
  const { data } = await supabase.auth.getSession()

  usuario.value = data.session?.user || null

  obtenerReportes()
  obtenerServicios()
  cargarUsuarios()
  cargarTodos()
  supabase.auth.onAuthStateChange((_event, session) => {
    usuario.value = session?.user || null
  })
})

</script>

<template>
  <div v-if="!usuario">
    <Login />
  </div>

  <div v-else class="app">

    <header class="navbar">
      <div class="logo">
        🏍️ <span>SafeRoute</span>
      </div>

      <nav>
        <a href="#inicio">Inicio</a>
        <a href="#mapa">Mapa</a>
        <a href="#clima">Clima</a>
        <a href="#premium">Premium</a>
      </nav>
    </header>

    <main>

<div v-if="pagoExitoso" class="success-message">
  ¡Pago realizado correctamente!
  <span>Ya tienes acceso a SafeRoute Premium.</span>
</div>

      <section id="inicio" class="hero">

        <div>
          <p class="tag">TU RUTA. TU SEGURIDAD.</p>

          <h1>
            Viaja más seguro con
            <span>SafeRoute</span>
          </h1>

          <p class="description">
            Consulta el clima, encuentra servicios cercanos,
            identifica zonas de riesgo y planifica mejor tus recorridos.
          </p>

          <div class="buttons">
            <a href="#mapa" class="primary">
              🗺️ Explorar mapa
            </a>

            <a href="#premium" class="secondary">
              ⭐ SafeRoute Premium
            </a>
          </div>
        </div>

        <div class="hero-card">
          <div class="bike">🏍️</div>

          <h2>Conduce con confianza</h2>

          <p>
            Información útil para tus recorridos en un solo lugar.
          </p>
        </div>

      </section>


      <section class="cards">

        <article id="mapa" class="card mapa-card">

  <div class="icon">🗺️</div>

  <h2>Mapa de SafeRoute</h2>

  <p>
    Consulta nuestra zona de cobertura y planifica tus recorridos.
  </p>

  <div class="map-container">
  <iframe
    src="https://www.google.com/maps?q=Puebla%2C%20Puebla%2C%20Mexico&output=embed"
    width="600"
    height="450"
    style="border:0;"
    allowfullscreen
    loading="lazy"
    referrerpolicy="no-referrer-when-downgrade"
  ></iframe>
</div>

</article>


        <article id="clima" class="card">

  <div class="icon">🌦️</div>

  <h2>Clima</h2>

  <p>
    Consulta las condiciones meteorológicas de tu ubicación.
  </p>

  <input
    v-model="ciudad"
    type="text"
    placeholder="Escribe una ciudad"
  />

  <button @click="buscarClima">
    🌤️ Consultar clima
  </button>

  <div v-if="clima" class="result">
    <h3>Clima en {{ ciudad }}</h3>

    <p>
      🌡️ Temperatura: {{ clima.temperatura }}°C
    </p>

    <p>
      ☁️ Condición: {{ clima.descripcion }}
    </p>
  </div>

  <p v-if="errorClima" class="error">
    ❌ {{ errorClima }}
  </p>

</article>


       <article class="card">

  <div class="icon">🚨</div>

  <h2>Reportar riesgo</h2>

  <p>
    Registra un peligro para ayudar a otros conductores.
  </p>

  <form @submit.prevent="crearReporte">

    <input
      v-model="nuevoReporte.ubicacion"
      type="text"
      placeholder="Ubicación"
      required
    />

    <select
      v-model="nuevoReporte.tipo_riesgo"
      required
    >
      <option value="">
        Selecciona el tipo de riesgo
      </option>

      <option value="Bache">Bache</option>
      <option value="Accidente">Accidente</option>
      <option value="Obra">Obra</option>
      <option value="Inundación">Inundación</option>
      <option value="Zona peligrosa">
        Zona peligrosa
      </option>
      <option value="Otro">Otro</option>
    </select>

    <textarea
      v-model="nuevoReporte.descripcion"
      placeholder="Describe el riesgo"
      rows="3"
    ></textarea>

    <button type="submit">
      🚨 Enviar reporte
    </button>

  </form>

  <p v-if="mensajeReporte">
    {{ mensajeReporte }}
  </p>
<div v-if="reportes.length > 0" class="reportes-lista">

  <h3>🚨 Reportes registrados</h3>

  <div
    v-for="reporte in reportes"
    :key="reporte.id"
    class="reporte-item"
  >
    <strong>{{ reporte.ubicacion }}</strong>

    <span>{{ reporte.tipo_riesgo }}</span>

    <p>{{ reporte.descripcion }}</p>
    <button @click="eliminarReporte(reporte.id)">
  🗑️ Eliminar
</button>
  </div>

</div>
</article>

      </section>

            <section class="servicios">

        <div class="servicios-header">
          <div>
            <p class="tag">SERVICIOS CERCANOS</p>
            <h2>Encuentra ayuda cerca de ti</h2>
            <p>
              Consulta talleres, gasolineras y hospitales disponibles.
            </p>
          </div>

          <select v-model="categoriaServicio">
            <option value="Todos">Todos</option>
            <option value="Taller mecánico">Talleres mecánicos</option>
            <option value="Gasolinera">Gasolineras</option>
            <option value="Hospital">Hospitales</option>
          </select>
        </div>

        <div class="servicios-grid">

          <article
            v-for="servicio in serviciosFiltrados()"
            :key="servicio.id"
            class="servicio-card"
          >

            <div class="servicio-icon">
              📍
            </div>

            <h3>{{ servicio.nombre }}</h3>

            <span>{{ servicio.categoria }}</span>

            <p>
              📍 {{ servicio.direccion }}
            </p>

            <p>
              📞 {{ servicio.telefono }}
            </p>

          </article>

        </div>

      </section>
      <!-- 🟢 JSONPLACEHOLDER -->
      <section class="json-section">

        <div class="json-header">
          <p class="tag">JSONPLACEHOLDER API</p>

          <h2>Datos de prueba externos</h2>

          <p>
            Consulta usuarios y tareas obtenidas mediante la API
            JSONPlaceholder.
          </p>
        </div>

        <div v-if="errorJSON" class="error">
          ❌ {{ errorJSON }}
        </div>

        <div class="json-grid">

          <!-- 🟢 USUARIOS -->
          <article class="json-card">

            <h3>👥 Usuarios</h3>

            <div
              v-for="usuario in usuarios.slice(0, 5)"
              :key="usuario.id"
              class="json-item"
            >
              <strong>{{ usuario.name }}</strong>

              <p>
                📧 {{ usuario.email }}
              </p>

              <p>
                🏙️ {{ usuario.address?.city }}
              </p>
            </div>

          </article>


          <!-- 🟢 TODOS -->
          <article class="json-card">

            <h3>✅ Tareas</h3>

            <div
              v-for="todo in todos.slice(0, 5)"
              :key="todo.id"
              class="json-item"
            >
              <strong>
                {{ todo.title }}
              </strong>

              <p>
                {{ todo.completed ? '✅ Completada' : '⏳ Pendiente' }}
              </p>
            </div>

          </article>

        </div>

      </section>
      <section id="premium" class="premium">

        <div>

          <p class="tag">
            SAFEROUTE PREMIUM
          </p>

          <h2>
            Obtén más funciones
          </h2>

          <p>
            Accede a funciones adicionales y disfruta
            de una experiencia más completa.
          </p>

        </div>

        <div class="payment-buttons">

          <button @click="pagarConStripe">

            💳 Pagar con Stripe
          </button>

          <button @click="pagarConMercadoPago">
            💳 Pagar con Mercado Pago
          </button>

        </div>

      </section>
    </main>


    <footer>

      <p>
        © 2026 SafeRoute · Proyecto Final de APIs
      </p>

    </footer>

  </div>
</template>

<style>
* {
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  margin: 0;
  font-family: Arial, Helvetica, sans-serif;
  background: #f5f7fa;
  color: #172033;
}

.app {
  min-height: 100vh;
}

.navbar {
  height: 70px;
  background: #101828;
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 7%;
  position: sticky;
  top: 0;
  z-index: 10;
}

.logo {
  font-size: 22px;
  font-weight: bold;
}

.navbar nav {
  display: flex;
  gap: 25px;
}

.navbar a {
  color: white;
  text-decoration: none;
  font-size: 14px;
}

.hero {
  min-height: 500px;
  padding: 80px 10%;
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 60px;
  align-items: center;
  background: linear-gradient(135deg, #101828, #243b53);
  color: white;
}

.tag {
  font-size: 13px;
  font-weight: bold;
  letter-spacing: 2px;
  opacity: 0.8;
}

.hero h1 {
  font-size: 52px;
  line-height: 1.05;
  margin: 20px 0;
}

.hero h1 span {
  color: #4fd1c5;
}

.description {
  max-width: 600px;
  font-size: 18px;
  line-height: 1.6;
  opacity: 0.85;
}

.buttons {
  display: flex;
  gap: 15px;
  margin-top: 30px;
}

.primary,
.secondary {
  padding: 14px 22px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: bold;
}

.primary {
  background: #4fd1c5;
  color: #102027;
}

.secondary {
  border: 1px solid white;
  color: white;
}

.hero-card {
  background: rgba(255,255,255,0.1);
  padding: 40px;
  border-radius: 20px;
  text-align: center;
}

.bike {
  font-size: 90px;
  margin-bottom: 20px;
}

.cards {
  padding: 70px 10%;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 25px;
}

.card {
  background: white;
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0 5px 20px rgba(0,0,0,0.06);
}

.mapa-card {
  grid-column: span 2;
}

.map-container {
  width: 100%;
  margin-top: 20px;
  overflow: hidden;
  border-radius: 12px;
}

.map-container iframe {
  width: 100%;
  height: 400px;
  border: 0;
  display: block;
}

.card .icon {
  font-size: 40px;
}

.card h2 {
  margin-bottom: 10px;
  color: #172033;
}

.card h3 {
  color: #172033;
}
.card p {
  color: #667085;
  line-height: 1.5;
}

.card input,
.card select,
.card textarea {
  color: #172033;
  background: white;
}

.card input::placeholder,
.card textarea::placeholder {
  color: #667085;
}

.card button {
  border: none;
  background: #eef2f6;
  color: #172033;
  padding: 10px 15px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
}

.premium {
  margin: 70px 10%;
  padding: 45px;
  border-radius: 20px;
  background: #101828;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 30px;
}

.payment-buttons {
  display: flex;
  gap: 15px;
}

.payment-buttons button {
  padding: 14px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  color: #172033;
  background: white;
}


footer {
  padding: 30px;
  text-align: center;
  background: #0b1220;
  color: white;
}

@media (max-width: 800px) {

  .hero {
    grid-template-columns: 1fr;
  }

  .cards {
    grid-template-columns: 1fr;
  }

  .premium {
    flex-direction: column;
    align-items: flex-start;
  }

  .navbar nav {
    display: none;
  }

}

.success-message {
  margin: 25px 10%;
  padding: 18px 25px;
  background: #d1fae5;
  color: #065f46;
  border-radius: 12px;
  font-weight: bold;
  text-align: center;
}

.success-message span {
  display: block;
  margin-top: 5px;
  font-weight: normal;
}
.servicios {
  margin: 0 10% 70px;
}

.servicios-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 30px;
  margin-bottom: 30px;
}

.servicios-header h2 {
  color: #172033;
  margin-bottom: 10px;
}

.servicios-header p {
  color: #667085;
}

.servicios-header select {
  padding: 12px 15px;
  border: 1px solid #d0d5dd;
  border-radius: 8px;
  background: white;
  color: #172033;
}

.servicios-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.servicio-card {
  background: white;
  padding: 25px;
  border-radius: 15px;
  box-shadow: 0 5px 20px rgba(0,0,0,0.06);
}

.servicio-icon {
  font-size: 35px;
}

.servicio-card h3 {
  color: #172033;
  margin: 10px 0;
}

.servicio-card span {
  display: inline-block;
  background: #eef2f6;
  padding: 5px 10px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: bold;
  color: #172033;
}

.servicio-card p {
  color: #667085;
}

@media (max-width: 800px) {
  .servicios-grid {
    grid-template-columns: 1fr;
  }

  .servicios-header {
    flex-direction: column;
    align-items: flex-start;
  }
}

/* 🟢 JSONPLACEHOLDER */

.json-section {
  margin: 0 10% 70px;
}

.json-header {
  margin-bottom: 30px;
}

.json-header h2 {
  color: #172033;
}

.json-header p {
  color: #667085;
}

.json-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 25px;
}

.json-card {
  background: white;
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0 5px 20px rgba(0,0,0,0.06);
}

.json-card h3 {
  color: #172033;
  margin-top: 0;
}

.json-item {
  padding: 15px 0;
  border-bottom: 1px solid #eaecf0;
}

.json-item:last-child {
  border-bottom: none;
}

.json-item strong {
  color: #172033;
}

.json-item p {
  color: #667085;
  margin: 6px 0;
}

@media (max-width: 800px) {
  .json-grid {
    grid-template-columns: 1fr;
  }
}
</style>






