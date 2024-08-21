import { prisma } from '../../lib/prisma';
import { z } from 'zod';
import { FastifyInstance } from 'fastify';
import { redis } from '../../lib/redis';

export async function getPoll(app: FastifyInstance) {
    app.get('/polls/:pollId', async (request, reply) => {
        const getPollParams = z.object({
            pollId: z.string().uuid(),
        });

        const { pollId } = getPollParams.parse(request.params);

        const poll = await prisma.poll.findUnique({
            where: { id: pollId },
            include: {
                options: {
                    select: {
                        id: true,
                        title: true,
                    },
                },
            },
        });

        if (!poll) {
            return reply.status(404).send({ message: 'Poll not found' });
        }

        const result = await redis.zrange(pollId, 0, -1, 'WITHSCORES');

        const votes = result.reduce<Record<string, number>>((obj, line, index) => {
            if (index % 2 === 0) {
                const score = parseInt(result[index + 1], 10);
                obj[line] = score;
            }
            return obj;
        }, {});

        return reply.send({
            poll: {
                id: poll.id,
                title: poll.title,
                options: poll.options.map(option => ({
                    id: option.id,
                    title: option.title,
                    score: votes[option.id] || 0,
                })),
            },
        });
    });
}
