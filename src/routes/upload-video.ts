import { FastifyInstance } from "fastify";
import {fastifyMultipart} from "@fastify/multipart"
import path from "node:path";
import  fs  from "node:fs"
import  { pipeline }  from "node:stream"
//import { randomUUID } from "node:crypto"
import { promisify } from "node:util";
import { prisma } from "../lib/prisma";

const pump = promisify(pipeline) //transforma a função callback para usar promisses



export async function uploadVideosRoutes(app: FastifyInstance) {
  app.register(fastifyMultipart, {
    limits: {
      fileSize: 1048576 * 25, //25mb
    }
  })

  app.post('/videos', async (request, reply) =>{
    const data = await request.file()

    if (!data) {
      return reply.status(400).send({ error: 'Missing file input.'})
    }

    const extension = path.extname(data.filename)

    if(extension != '.mp3'){
      return reply.status(400).send({ error: 'Invalid input type. Please upload mp3'})
    }
    
    const fileBaseName = path.basename(data.filename, extension)

    const fileUploadName = `${fileBaseName}-${Math.random()}${extension}`// nome arquivo

    const uploadDestination = path.resolve(__dirname, '../../tmp', fileUploadName)

    await pump(data.file, fs.createWriteStream(uploadDestination))

    const video = await prisma.video.create({
      data: {
        name: data.filename,
        path: uploadDestination,
      }
    })
    return {
      video,
    }
  })

}
