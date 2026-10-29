<script setup lang="ts">
import { ref } from 'vue'
import { supabase } from './lib/supabase'
import { obtenerClima } from './services/weather'

const nuevoReporte = ref({
  ubicacion: '',
  tipo_riesgo: '',
  descripcion: ''
})

const mensajeReporte = ref('')
const ciudad = ref('')

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
      'Ã¢ÂÅ’ Error al guardar: ' + error.message
    return
  }

  mensajeReporte.value =
    'Ã¢Å“â€¦ Reporte guardado correctamente'

  nuevoReporte.value = {
    ubicacion: '',
    tipo_riesgo: '',
    descripcion: ''
  }
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
    alert('Ã¢ÂÅ’ Error al conectar con Stripe')
  }
}
</script>

<template>
  <div class="app">

    <header class="navbar">
      <div class="logo">
        Ã°Å¸ÂÂÃ¯Â¸Â <span>SafeRoute</span>
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
  Â¡Pago realizado correctamente!
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
              Ã°Å¸â€”ÂºÃ¯Â¸Â Explorar mapa
            </a>

            <a href="#premium" class="secondary">
              Ã¢Â­Â SafeRoute Premium
            </a>
          </div>
        </div>

        <div class="hero-card">
          <div class="bike">Ã°Å¸ÂÂÃ¯Â¸Â</div>

          <h2>Conduce con confianza</h2>

          <p>
            Información útil para tus recorridos en un solo lugar.
          </p>
        </div>

      </section>


      <section class="cards">

        <article id="mapa" class="card mapa-card">

  <div class="icon">Ã°Å¸â€”ÂºÃ¯Â¸Â</div>

  <h2>Mapa de SafeRoute</h2>

  <p>
    Consulta nuestra zona de cobertura y planifica tus recorridos.
  </p>

  <div class="map-container">

    <iframe
      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3771.290513455771!2d-98.17739247502331!3d19.050960482148472!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x85cfc055a9e73013%3A0x1656bb12d5450d7d!2sPuebla%2C%20Heroica%20Puebla%20de%20Zaragoza%2C%20Pue.!5e0!3m2!1ses-419!2smx!4v1787708582151!5m2!1ses-419!2smx"
      width="600"
      height="450"
      style="border:0;"
      allowfullscreen
      loading="lazy"
      referrerpolicy="strict-origin-when-cross-origin">
    </iframe>

  </div>

</article>


        <article id="clima" class="card">

  <div class="icon">Ã°Å¸Å’Â¦Ã¯Â¸Â</div>

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
    Ã°Å¸Å’Â¤Ã¯Â¸Â Consultar clima
  </button>

  <div v-if="clima" class="result">
    <h3>Clima en {{ ciudad }}</h3>

    <p>
      Ã°Å¸Å’Â¡Ã¯Â¸Â Temperatura: {{ clima.temperatura }}Ã‚°C
    </p>

    <p>
      Ã¢ËœÂÃ¯Â¸Â Condición: {{ clima.descripcion }}
    </p>
  </div>

  <p v-if="errorClima" class="error">
    Ã¢ÂÅ’ {{ errorClima }}
  </p>

</article>


       <article class="card">

  <div class="icon">Ã°Å¸Å¡Â¨</div>

  <h2>Reportar riesgo</h2>

  <p>
    Registra un peligro para ayudar a otros conductores.
  </p>

  <form @submit.prevent="crearReporte">

    <input
      v-model="nuevoReporte.ubicacion"
      type="text"
      placeholder="UbicaciÃƒÂ³n"
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
      Ã°Å¸Å¡Â¨ Enviar reporte
    </button>

  </form>

  <p v-if="mensajeReporte">
    {{ mensajeReporte }}
  </p>

</article>

      </section>


      <section id="premium" class="premium">

        <div>

          <p class="tag">
            SAFEROUTE PREMIUM
          </p>

          <h2>
            ObtÃƒ©n más funciones
          </h2>

          <p>
            Accede a funciones adicionales y disfruta
            de una experiencia más completa.
          </p>

        </div>

        <div class="payment-buttons">

          <button @click="pagarConStripe">

            Ã°Å¸â€™Â³ Pagar con Stripe
          </button>

          <button>
            Ã°Å¸â€™Â³ Pagar con Mercado Pago
          </button>

        </div>

      </section>

    </main>


    <footer>

      <p>
        Ã‚© 2026 SafeRoute Ã‚· Proyecto Final de APIs
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
}

.card p {
  color: #667085;
  line-height: 1.5;
}

.card button {
  border: none;
  background: #eef2f6;
  padding: 10px 15px;
  border-radius: 6px;
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
</style>










