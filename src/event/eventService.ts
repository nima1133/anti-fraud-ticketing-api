import { prisma } from '../../lib/prisma';
import { Prisma } from '../generated/prisma/client';
import { CreateEventDto, UpdateEventDto } from '../schemas/event.schema';
import { ApiFeatures } from '../utils/apiFeatures';
import { AppError } from '../utils/appError';

export class EventService {
  async createEvent(userId: number, data: CreateEventDto) {
    // if (!data.title || data.title.length < 3) {
    //   throw new AppError('Title is too short' , 400);
    // }

    // if (!data.description || data.description.length < 10) {
    //   throw new AppError('Description is too short' , 400);
    // }

    // if (!data.location) {
    //   throw new AppError('Location is required' , 400);
    // }

    // if (!data.date) {
    //   throw new AppError('Date is required' , 400);
    // }

    // const eventDate = new Date(data.date);
    // if (eventDate < new Date()) {
    //   throw new AppError('Date must be in the future' , 400);
    // }

    // if (
    //   typeof data.capacity !== 'number' ||
    //   data.capacity < 1 ||
    //   data.capacity > 500
    // ) {
    //   throw new AppError('Capacity must be between 1 and 500', 400);
    // }

    const newEvent = await prisma.event.create({
      data: {
        title: data.title,
        description: data.description,
        location: data.location,
        date: data.date,
        capacity: data.capacity,
        createdById: userId,
      },
    });
    return newEvent;
  }
// In your controller
async getAllEvents(query: any) {
  const options = new ApiFeatures(query)
    .filter()
    .sort()
    .paginate()
    .build();

  return await prisma.event.findMany(options as Prisma.EventFindManyArgs);
}
  async getEvent(id: number) {
    const event = await prisma.event.findUnique({
      where: {
        id,
      },
    });
    return event;
  }
  async updateEvent(id: number, data: UpdateEventDto) {
    const event = await prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      throw new AppError('Event not found', 404);
    }

    return prisma.event.update({
      where: { id },
      data,
    });
  }
  async deleteEvent(id: number) {
    await prisma.event.delete({
      where: { id },
    });
  }
}
