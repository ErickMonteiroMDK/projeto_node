import { prisma } from '../../lib/prisma';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { FastifyInstance } from 'fastify';

export async function voteOnPoll(app: FastifyInstance) {
    app.post('/polls/:pollId/votes', async (request, reply) => {
        const voteOnPollBody = z.object({
            pollOptionId: z.string().uuid()
        });

        const voteOnPollParams = z.object({
            pollId: z.string().uuid()
        });

        const { pollOptionId } = voteOnPollBody.parse(request.body);
        const { pollId } = voteOnPollParams.parse(request.params);

        let sessionId = request.cookies.sessionId;

        if (!sessionId) {
            sessionId = randomUUID();

            reply.setCookie('sessionId', sessionId, {
                path: '/',
                maxAge: 60 * 60 * 24 * 30, // válido na máquina do usuário por 30 dias
                signed: true,
                httpOnly: true,
            });
        }

        const userPreviousVoteOnPoll = await prisma.vote.findUnique({
            where: {
                sessionId_pollId: {
                    sessionId,
                    pollId
                }
            }
        });

        if (userPreviousVoteOnPoll) {
            if (userPreviousVoteOnPoll.pollOptionId !== pollOptionId) {
                await prisma.vote.delete({
                    where: {
                        id: userPreviousVoteOnPoll.id
                    }
                });
            } else {
                return reply.status(400).send({ error: 'You already voted for this option on this poll.' });
            }
        }

        await prisma.vote.create({
            data: {
                sessionId,
                pollId,
                pollOptionId
            }
        });

        return reply.status(201).send({ sessionId });
    });
}
