import { prisma } from './lib/prisma'
import { fastify } from 'fastify'
import { fastifyCors } from '@fastify/cors'
import { getAllPromptsRoutes } from './routes/get-all-prompts'
import { uploadVideosRoutes } from './routes/upload-video'
import { createTranscriptionRoutes } from './routes/create-transcription'
import { generateAICompleteRoutes } from './routes/genarete-ai-completion'

const app = fastify()

app.register(fastifyCors, {
  origin: '*', 
})

app.register(getAllPromptsRoutes)
app.register(uploadVideosRoutes)
app.register(createTranscriptionRoutes)
app.register(generateAICompleteRoutes)

app.listen ({
  port: 3333,
}).then(() => {

  console.log("HTTP Server Running...")
})