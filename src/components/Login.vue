<template>
  <div class="login-container">
    <div class="login-card">
      <div class="logo">🏍️</div>

      <h1>SafeRoute</h1>
      <p class="subtitle">TU RUTA. TU SEGURIDAD.</p>

      <h2>Iniciar sesión</h2>

      <form @submit.prevent="iniciarSesion">
        <input
          v-model="email"
          type="email"
          placeholder="Correo electrónico"
          required
        />

        <input
          v-model="password"
          type="password"
          placeholder="Contraseña"
          required
        />

        <button type="submit" :disabled="cargando">
          {{ cargando ? 'Iniciando sesión...' : 'Iniciar sesión' }}
        </button>
      </form>

      <div class="separador">
        <span>o</span>
      </div>

      <button class="google-button" @click="iniciarConGoogle">
        🔵 Continuar con Google
      </button>

      <p v-if="mensaje" class="mensaje">
        {{ mensaje }}
      </p>

      <p v-if="error" class="error">
        {{ error }}
      </p>

      <p class="registro">
        ¿No tienes cuenta?
        <button class="link-button" @click="registrarse">
          Crear cuenta
        </button>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { supabase } from '../lib/supabase'

const email = ref('')
const password = ref('')
const cargando = ref(false)
const mensaje = ref('')
const error = ref('')

const iniciarSesion = async () => {
  error.value = ''
  mensaje.value = ''
  cargando.value = true

  const { error: loginError } = await supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value
  })

  cargando.value = false

  if (loginError) {
    error.value = loginError.message
    return
  }

  mensaje.value = '¡Inicio de sesión exitoso!'
}

const registrarse = async () => {
  error.value = ''
  mensaje.value = ''

  if (!email.value || !password.value) {
    error.value = 'Ingresa correo y contraseña para registrarte.'
    return
  }

  const { error: signupError } = await supabase.auth.signUp({
    email: email.value,
    password: password.value
  })

  if (signupError) {
    error.value = signupError.message
    return
  }

  mensaje.value = 'Cuenta creada. Revisa tu correo si se solicita confirmación.'
}

const iniciarConGoogle = async () => {
  error.value = ''
  mensaje.value = ''

  const { error: googleError } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin
    }
  })

  if (googleError) {
    error.value = googleError.message
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f4f4f4;
  padding: 20px;
}

.login-card {
  width: 100%;
  max-width: 420px;
  background: white;
  padding: 35px;
  border-radius: 18px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  text-align: center;
}

.logo {
  font-size: 55px;
}

h1 {
  margin: 5px 0;
  color: #111;
}

.subtitle {
  color: #555;
  font-size: 13px;
  margin-bottom: 25px;
}

h2 {
  color: #111;
  margin-bottom: 20px;
}

form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

input {
  padding: 13px;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 15px;
  color: #111;
  background: white;
}

input:focus {
  outline: none;
  border-color: #111;
}

form button {
  padding: 13px;
  border: none;
  border-radius: 8px;
  background: #111;
  color: white;
  font-size: 15px;
  cursor: pointer;
}

form button:disabled {
  opacity: 0.6;
}

.separador {
  margin: 20px 0;
  border-top: 1px solid #ddd;
  position: relative;
}

.separador span {
  position: relative;
  top: -11px;
  background: white;
  padding: 0 10px;
  color: #777;
}

.google-button {
  width: 100%;
  padding: 13px;
  border: 1px solid #ccc;
  border-radius: 8px;
  background: white;
  color: #111;
  font-size: 15px;
  cursor: pointer;
}

.google-button:hover {
  background: #f5f5f5;
}

.mensaje {
  color: green;
  margin-top: 15px;
}

.error {
  color: #d00;
  margin-top: 15px;
}

.registro {
  margin-top: 20px;
  color: #555;
}

.link-button {
  border: none;
  background: none;
  color: #0066cc;
  cursor: pointer;
  font-size: inherit;
}
</style>