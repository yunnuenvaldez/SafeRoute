import express from 'express'
import cors from 'cors'
import Stripe from 'stripe'
import dotenv from 'dotenv'
import { MercadoPagoConfig, Preference } from 'mercadopago'

dotenv.config({ path: '../.env' })
const app = express()

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

const mercadopago = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN
})

const preference = new Preference(mercadopago)
app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
  res.json({
    mensaje: 'Servidor SafeRoute funcionando ðŸš€'
  })
})

app.post('/crear-pago', async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',

      line_items: [
        {
          price_data: {
            currency: 'mxn',
            product_data: {
              name: 'SafeRoute Premium',
              description: 'Acceso a las funciones premium de SafeRoute'
            },
            unit_amount: 2000
          },
          quantity: 1
        }
      ],

      success_url: 'http://localhost:5173/?pago=exitoso',
      cancel_url: 'http://localhost:5173/?pago=cancelado'
    })

    res.json({
      url: session.url
    })

  } catch (error) {
    console.error(error)

    res.status(500).json({
      error: 'No se pudo crear el pago'
    })
  }
})
app.post('/crear-pago-mercadopago', async (req, res) => {
  try {
    const response = await preference.create({
      body: {
        items: [
          {
            id: 'saferoute-premium',
            title: 'SafeRoute Premium',
            description: 'Acceso a las funciones premium de SafeRoute',
            quantity: 1,
            unit_price: 20,
            currency_id: 'MXN'
          }
        ],
        back_urls: {
          success: 'http://localhost:5173/?pago=exitoso',
          failure: 'http://localhost:5173/?pago=cancelado',
          pending: 'http://localhost:5173/?pago=pendiente'
        },
      }
    })

    res.json({
      url: response.init_point
    })

  } catch (error) {
    console.error('Error Mercado Pago:', error)

    res.status(500).json({
      error: 'No se pudo crear el pago con Mercado Pago'
    })
  }
})

app.listen(3000, () => {
  console.log('Servidor SafeRoute en http://localhost:3000')
})
