import { prisma } from '../../lib/prisma';
import { z } from 'zod';
import { FastifyInstance } from 'fastify';

export async function getPoll(app: FastifyInstance) {
    app.get('/polls/:pollId', async (request, reply) => {
        const getPollParams = z.object({
            pollId: z.string().uuid(),
        });

        const { pollId } = getPollParams.parse(request.params);


        const poll = await prisma.poll.findUnique({
            where: {
                id: pollId,
            },
            include: {
                options: {
                    select: {
                        id: true,
                        title: true
                    }
                }
            }
        });

        if (!poll) {
            return reply.status(404).send({ message: 'Poll not found' });
        }

        return reply.send({poll});
    });
}
