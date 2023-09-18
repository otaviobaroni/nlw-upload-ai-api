import { FastifyInstance } from "fastify";
import { z } from "zod"
import {createReadStream } from "node:fs"
import { prisma } from "../lib/prisma";
import { openai } from "../lib/openai";

export async function createTranscriptionRoutes(app: FastifyInstance) {
  app.post('/videos/:videoId/transcription', async(req) => {
    const ParamsSchema = z.object({
      videoId: z.string().uuid(),
    })
    const { videoId } = ParamsSchema.parse(req.params)

    const BodySchema = z.object({
      prompt: z.string(),
    })

    const { prompt } = BodySchema.parse(req.body)

    const video = await prisma.video.findUniqueOrThrow({
      where: {
        id: videoId,
      }
    })

    const videoPath = video.path

    const audioReadStream = createReadStream(videoPath)

    const response = await openai.audio.transcriptions.create({
      file: audioReadStream,
      model: 'whisper-1',
      language: 'pt',
      response_format: 'json',
      temperature: 0,
      prompt,
    })

    const transcription = response.text

    await prisma.video.update({
      where: {
        id: videoId,
      },
      data: {
        transcription,
      },
    })

    return { transcription }
  })
}