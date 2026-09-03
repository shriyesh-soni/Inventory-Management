import { prisma } from '../../config/db';

export class UsersService {
  static async getAllUsers() {
    return prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        locationAssignments: {
          select: {
            id: true,
            locationId: true,
            assignedAt: true,
            location: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async assignLocation(userId: string, locationId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      const error = new Error('User not found');
      (error as any).statusCode = 404;
      throw error;
    }

    const location = await prisma.location.findUnique({ where: { id: locationId } });
    if (!location) {
      const error = new Error('Location not found');
      (error as any).statusCode = 404;
      throw error;
    }

    const existingAssignment = await prisma.locationAssignment.findUnique({
      where: {
        userId_locationId: {
          userId,
          locationId,
        },
      },
    });

    if (existingAssignment) {
      const error = new Error('User is already assigned to this location');
      (error as any).statusCode = 409;
      throw error;
    }

    return prisma.locationAssignment.create({
      data: {
        userId,
        locationId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        location: true,
      },
    });
  }

  static async removeLocation(userId: string, locationId: string) {
    const existingAssignment = await prisma.locationAssignment.findUnique({
      where: {
        userId_locationId: {
          userId,
          locationId,
        },
      },
    });

    if (!existingAssignment) {
      const error = new Error('Location assignment not found');
      (error as any).statusCode = 404;
      throw error;
    }

    await prisma.locationAssignment.delete({
      where: {
        userId_locationId: {
          userId,
          locationId,
        },
      },
    });

    return { message: 'Location assignment removed successfully' };
  }

  static async getStaffByLocation(locationId: string) {
    const location = await prisma.location.findUnique({ where: { id: locationId } });
    if (!location) {
      const error = new Error('Location not found');
      (error as any).statusCode = 404;
      throw error;
    }

    const assignments = await prisma.locationAssignment.findMany({
      where: { locationId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            createdAt: true,
          },
        },
      },
      orderBy: { assignedAt: 'desc' },
    });

    return assignments.map((assignment: any) => ({
      assignmentId: assignment.id,
      assignedAt: assignment.assignedAt,
      ...assignment.user,
    }));
  }
}
