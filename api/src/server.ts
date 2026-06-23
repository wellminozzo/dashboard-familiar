import { app } from "./app"
import { config } from "./config"

const start = async () => {
  try {
    app.listen(config.port, () => {
      console.log(`🚀 API rodando em http://localhost:${config.port}`)
    })
  } catch (error) {
    console.error("Erro ao iniciar servidor:", error)
    process.exit(1)
  }
}

start()
