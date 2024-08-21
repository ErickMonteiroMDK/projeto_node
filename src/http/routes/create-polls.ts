import { prisma } from '../../lib/prisma';
import { z } from 'zod';
import { FastifyInstance } from 'fastify';

export async function createPoll(app: FastifyInstance) {
    app.post('/polls', async (request, reply) => {
        const createPollBody = z.object({
            title: z.string().min(1, 'Title cannot be empty'),
            options: z.array(z.string().min(1, 'Option cannot be empty')).nonempty('At least one option is required'),
        });

        try {
            const { title, options } = createPollBody.parse(request.body);

            const poll = await prisma.poll.create({
                data: {
                    title,
                    options: {
                        create: options.map(option => ({
                            title: option,
                        })),
                    },
                },
            });

            return reply.status(201).send({ pollId: poll.id });
        } catch (error) {
            console.error('Error creating poll:', error);
            return reply.status(500).send({ error: 'An error occurred while creating the poll' });
        }
    });
}
