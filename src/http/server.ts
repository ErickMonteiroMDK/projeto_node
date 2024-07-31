import fastify from 'fastify'

const app = fastify()

app.get('/hello', (request, reply) => {
    return 'Hello NLW'
})

app.listen({ port: 3330 }).then(() => {
    console.log('HTTP server running!')
})
