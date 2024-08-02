import fastify from 'fastify'
import cookie from '@fastify/cookie'
import { createPoll } from './routes/create-polls'
import { getPoll } from './routes/get-polls'
import { voteOnPoll } from './routes/vote-on-poll'

const app = fastify()

app.register(cookie, {
    secret: "polls-app",
    hook: 'onRequest'
})

app.register(createPoll)
app.register(getPoll)
app.register(voteOnPoll)

app.listen({ port: 3333 }).then(() => {
    console.log('HTTP server running!')
})
