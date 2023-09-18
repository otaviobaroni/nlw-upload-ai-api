import { FastifyInstance } from "fastify";
import { z } from "zod"
import { prisma } from "../lib/prisma";
import {streamToResponse, OpenAIStream} from 'ai'
import { Transcriptions } from "openai/resources/audio";
import { error } from "console";
import { openai } from "../lib/openai";


export async function generateAICompleteRoutes(app: FastifyInstance) {
  app.post('/ai/complete', async(req, reply) => {

    const BodySchema = z.object({
      videoId: z.string().uuid(),
      prompt: z.string(),
      temperature: z.number().min(0).max(1).default(0.5),
    })

    const { videoId, prompt, temperature } = BodySchema.parse(req.body)

    const video = await prisma.video.findUniqueOrThrow({
      where: {
        id: videoId,
      }
    })   
    
  
    if(!video.transcription){
      return reply.status(400).send({error: 'video transcription was not generation yat.'})
    }

    const promptMessage = prompt.replace('{transcription}', video.transcription)

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo-16k',
      temperature,
      messages: [{ role: 'user', content: promptMessage
      }],
      stream: true,
    })

    const stream = OpenAIStream(response)

    streamToResponse(stream, reply.raw, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, UPDATE, DELETE, PUT, OPTIONS'
      },
    } )
    return 

  })
}